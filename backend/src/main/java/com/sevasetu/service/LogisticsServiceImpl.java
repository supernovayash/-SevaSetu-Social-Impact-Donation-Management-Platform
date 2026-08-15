package com.sevasetu.service;

import com.sevasetu.dto.request.AssignVolunteerRequest;
import com.sevasetu.dto.request.SubmitProofRequest;
import com.sevasetu.dto.response.LogisticsAssignmentResponse;
import com.sevasetu.dto.response.ProofOfImpactResponse;
import com.sevasetu.entity.Donation;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.LogisticsAssignment;
import com.sevasetu.entity.User;
import com.sevasetu.entity.Volunteer;
import com.sevasetu.enums.AssignmentStatus;
import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.Role;
import com.sevasetu.event.VolunteerAssignedEvent;
import com.sevasetu.exception.InvalidDonationStateException;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.DonationRepository;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.LogisticsAssignmentRepository;
import com.sevasetu.repository.ProofOfImpactRepository;
import com.sevasetu.repository.UserRepository;
import com.sevasetu.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LogisticsServiceImpl implements LogisticsService {

    private final LogisticsAssignmentRepository assignmentRepository;
    private final ProofOfImpactRepository proofRepository;
    private final DonationRepository donationRepository;
    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final DonationService donationService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public LogisticsAssignmentResponse assignVolunteer(
            AssignVolunteerRequest request,
            String actorEmail) {

        User actor = getUser(actorEmail);

        Donation donation = donationRepository.findById(
                        request.getDonationId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Donation not found"
                        )
                );

        /*
         * Only CONFIRMED donations can enter logistics.
         */
        if (donation.getStatus() != DonationStatus.CONFIRMED) {
            throw new InvalidDonationStateException(
                    "Only CONFIRMED donations can be assigned for pickup"
            );
        }

        /*
         * Make sure this donation does not already have
         * a logistics assignment.
         */
        if (assignmentRepository.findByDonationId(
                donation.getId()
        ).isPresent()) {

            throw new InvalidDonationStateException(
                    "This donation already has a volunteer assigned"
            );
        }

        /*
         * Institution admin can assign only donations
         * belonging to his/her institution.
         *
         * SUPER_ADMIN can assign any donation.
         */
        if (actor.getRole() == Role.INSTITUTION_ADMIN) {

            Institution institution = getInstitution(actor);

            validateInstitutionOwnsDonation(
                    donation,
                    institution
            );
        }

        Volunteer volunteer = volunteerRepository.findById(
                        request.getVolunteerId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Volunteer not found"
                        )
                );

        LogisticsAssignment assignment =
                LogisticsAssignment.builder()
                        .donation(donation)
                        .volunteer(volunteer)
                        .notes(request.getNotes())
                        .status(AssignmentStatus.ASSIGNED)
                        .build();

        LogisticsAssignment saved =
                assignmentRepository.save(assignment);

        eventPublisher.publishEvent(
                new VolunteerAssignedEvent(
                        volunteer.getUser().getEmail(),
                        volunteer.getUser().getFullName(),
                        donation.getId()
                )
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public LogisticsAssignmentResponse markPickedUp(
            Long donationId,
            String volunteerEmail) {

        LogisticsAssignment assignment =
                requireOwnedAssignment(
                        donationId,
                        volunteerEmail
                );

        /*
         * Pickup can happen only once.
         */
        if (assignment.getStatus() != AssignmentStatus.ASSIGNED) {

            if (assignment.getStatus()
                    == AssignmentStatus.PICKED_UP) {

                throw new InvalidDonationStateException(
                        "Donation has already been picked up"
                );
            }

            throw new InvalidDonationStateException(
                    "Donation cannot be picked up in its current state"
            );
        }

        assignment.setStatus(
                AssignmentStatus.PICKED_UP
        );

        assignmentRepository.save(assignment);

        donationService.updateStatus(
                donationId,
                DonationStatus.PICKED_UP,
                "Picked up by volunteer",
                volunteerEmail
        );

        return toResponse(assignment);
    }

    @Override
    @Transactional
    public LogisticsAssignmentResponse markDelivered(
            Long donationId,
            String institutionAdminEmail) {

        User actor = getUser(institutionAdminEmail);

        /*
         * SUPER_ADMIN can deliver on behalf of an institution.
         *
         * INSTITUTION_ADMIN must own the donation.
         */
        if (actor.getRole() != Role.INSTITUTION_ADMIN
                && actor.getRole() != Role.SUPER_ADMIN) {

            throw new InvalidDonationStateException(
                    "Only an institution administrator can mark a donation as delivered"
            );
        }

        LogisticsAssignment assignment =
                assignmentRepository.findByDonationId(donationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No assignment found for this donation"
                                )
                        );

        Donation donation = assignment.getDonation();

        /*
         * Make sure the volunteer actually picked it up.
         */
        if (assignment.getStatus()
                != AssignmentStatus.PICKED_UP) {

            throw new InvalidDonationStateException(
                    "Donation must be picked up before it can be delivered"
            );
        }

        /*
         * Institution admin can mark DELIVERED only
         * for his/her own institution.
         */
        if (actor.getRole() == Role.INSTITUTION_ADMIN) {

            Institution institution =
                    getInstitution(actor);

            validateInstitutionOwnsDonation(
                    donation,
                    institution
            );
        }

        /*
         * Update logistics assignment.
         */
        assignment.setStatus(
                AssignmentStatus.DELIVERED
        );

        assignment.setCompletedAt(
                LocalDateTime.now()
        );

        assignmentRepository.save(assignment);

        /*
         * Update donation lifecycle.
         */
        donationService.updateStatus(
                donationId,
                DonationStatus.DELIVERED,
                "Delivered to institution",
                institutionAdminEmail
        );

        return toResponse(assignment);
    }

    @Override
    @Transactional
    public ProofOfImpactResponse submitProof(
            SubmitProofRequest request,
            String actorEmail) {

        User actor = getUser(actorEmail);

        Donation donation = donationRepository.findById(
                        request.getDonationId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Donation not found"
                        )
                );

        /*
         * Proof is possible only after delivery.
         */
        if (donation.getStatus()
                != DonationStatus.DELIVERED) {

            throw new InvalidDonationStateException(
                    "Proof can only be submitted for a DELIVERED donation"
            );
        }

        /*
         * Institution admin can submit proof only
         * for his/her own institution.
         *
         * SUPER_ADMIN can submit proof for any institution.
         */
        if (actor.getRole() == Role.INSTITUTION_ADMIN) {

            Institution institution =
                    getInstitution(actor);

            validateInstitutionOwnsDonation(
                    donation,
                    institution
            );

        } else if (actor.getRole() != Role.SUPER_ADMIN) {

            throw new InvalidDonationStateException(
                    "Only an institution administrator can submit proof"
            );
        }

        /*
         * Prevent duplicate proof.
         */
        if (proofRepository.findByDonationId(
                donation.getId()
        ).isPresent()) {

            throw new InvalidDonationStateException(
                    "Proof of impact already submitted for this donation"
            );
        }

        var proof = com.sevasetu.entity.ProofOfImpact.builder()
                .donation(donation)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        var saved = proofRepository.save(proof);

        /*
         * Proof submission means donation has been utilized.
         */
        donationService.updateStatus(
                donation.getId(),
                DonationStatus.UTILIZED,
                "Proof of impact submitted",
                actorEmail
        );

        return ProofOfImpactResponse.builder()
                .id(saved.getId())
                .donationId(donation.getId())
                .description(saved.getDescription())
                .imageUrl(saved.getImageUrl())
                .submittedAt(saved.getSubmittedAt())
                .build();
    }

    /*
     * -------------------------------------------------------
     * Helper methods
     * -------------------------------------------------------
     */

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }

    private Institution getInstitution(User user) {

        return institutionRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Institution not found for this admin"
                        )
                );
    }

    /**
     * Determines which institution owns the donation.
     *
     * Case 1:
     * Donation linked to a Need
     *
     * Donation -> Need -> Institution
     *
     * Case 2:
     * Open donation claimed by institution
     *
     * Donation -> Institution
     */
    private Institution getDonationInstitution(
            Donation donation) {

        if (donation.getNeed() != null) {

            return donation.getNeed()
                    .getInstitution();
        }

        return donation.getInstitution();
    }

    private void validateInstitutionOwnsDonation(
            Donation donation,
            Institution institution) {

        Institution donationInstitution =
                getDonationInstitution(donation);

        if (donationInstitution == null) {

            throw new InvalidDonationStateException(
                    "This donation is not associated with an institution"
            );
        }

        if (!donationInstitution.getId()
                .equals(institution.getId())) {

            throw new InvalidDonationStateException(
                    "This donation belongs to another institution"
            );
        }
    }

    private LogisticsAssignment requireOwnedAssignment(
            Long donationId,
            String volunteerEmail) {

        LogisticsAssignment assignment =
                assignmentRepository.findByDonationId(donationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No assignment found for this donation"
                                )
                        );

        if (!assignment.getVolunteer()
                .getUser()
                .getEmail()
                .equalsIgnoreCase(volunteerEmail)) {

            throw new InvalidDonationStateException(
                    "This assignment does not belong to you"
            );
        }

        return assignment;
    }

    private LogisticsAssignmentResponse toResponse(
            LogisticsAssignment assignment) {

        return LogisticsAssignmentResponse.builder()
                .id(assignment.getId())
                .donationId(
                        assignment.getDonation().getId()
                )
                .volunteerName(
                        assignment.getVolunteer()
                                .getUser()
                                .getFullName()
                )
                .volunteerCity(
                        assignment.getVolunteer()
                                .getCity()
                )
                .status(
                        assignment.getStatus()
                )
                .notes(
                        assignment.getNotes()
                )
                .assignedAt(
                        assignment.getAssignedAt()
                )
                .completedAt(
                        assignment.getCompletedAt()
                )
                .build();
    }
}