package com.sevasetu.service;

import com.sevasetu.dto.request.DonationCreateRequest;
import com.sevasetu.dto.response.DonationResponse;
import com.sevasetu.dto.response.DonationTimelineResponse;
import com.sevasetu.entity.Donation;
import com.sevasetu.entity.DonationEvent;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.Need;
import com.sevasetu.entity.User;
import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.DonationType;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.Role;
import com.sevasetu.event.DonationStatusChangedEvent;
import com.sevasetu.exception.InvalidDonationStateException;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.DonationEventRepository;
import com.sevasetu.repository.DonationRepository;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.NeedRepository;
import com.sevasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final DonationEventRepository donationEventRepository;
    private final NeedRepository needRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final ApplicationEventPublisher eventPublisher; // NEW

    @Override
    @Transactional
    public DonationResponse createDonation(String donorEmail, DonationCreateRequest request) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getType() == DonationType.MONEY && request.getAmount() == null) {
            throw new InvalidDonationStateException("Amount is required for a MONEY donation");
        }
        if (request.getType() == DonationType.GOODS && request.getQuantity() == null) {
            throw new InvalidDonationStateException("Quantity is required for a GOODS donation");
        }

        Donation.DonationBuilder builder = Donation.builder()
                .donor(donor)
                .type(request.getType())
                .amount(request.getAmount())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .pickupAddress(request.getPickupAddress())
                .status(DonationStatus.PLEDGED);

        if (request.getNeedId() != null) {
            Need need = needRepository.findById(request.getNeedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Need not found"));
            if (need.getStatus() == NeedStatus.FULFILLED) {
                throw new InvalidDonationStateException("This need is already fully fulfilled");
            }
            builder.need(need);
        } else {
            if (request.getCategory() == null || request.getDescription() == null) {
                throw new InvalidDonationStateException(
                        "Open donations (no linked need) require a category and description");
            }
            builder.category(request.getCategory()).description(request.getDescription());
        }

        Donation saved = donationRepository.save(builder.build());
        logEvent(saved, DonationStatus.PLEDGED, "Donation pledged by donor", donor.getFullName(), donor.getRole());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public DonationResponse updateStatus(Long donationId, DonationStatus newStatus, String note, String actorEmail) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (actor.getRole() == Role.DONOR) {
            if (!donation.getDonor().getId().equals(actor.getId())) {
                throw new com.sevasetu.exception.UnauthorizedActionException("You can only modify your own donations");
            }
            if (donation.getStatus() != DonationStatus.PLEDGED) {
                throw new InvalidDonationStateException("Donations can only be cancelled while in PLEDGED status");
            }
        }

        if (newStatus == DonationStatus.CONFIRMED) {
            applyFulfillment(donation);
        }

        donation.setStatus(newStatus);
        Donation saved = donationRepository.save(donation);
        logEvent(saved, newStatus, note, actor.getFullName(), actor.getRole());

        // NEW — donor gets notified on CONFIRMED and UTILIZED (handled in the listener)
        eventPublisher.publishEvent(new DonationStatusChangedEvent(
                saved.getId(), saved.getDonor().getEmail(), saved.getDonor().getFullName(), newStatus));

        return toResponse(saved);
    }

    @Override
    @Transactional
    public List<DonationResponse> getOpenDonations() {
        return donationRepository
                .findByNeedIsNullAndInstitutionIsNullAndStatusOrderByCreatedAtDesc(DonationStatus.PLEDGED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public DonationResponse claimOpenDonation(Long donationId, String institutionAdminEmail) {
        User actor = userRepository.findByEmail(institutionAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Institution institution = institutionRepository.findByUserId(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found for this admin"));

        int updated = donationRepository.claimOpenDonation(donationId, institution);
        if (updated == 0) {
            throw new InvalidDonationStateException(
                    "This donation is no longer available — it may already be claimed, or it isn't an open donation");
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        logEvent(donation, DonationStatus.CONFIRMED,
                "Claimed as open donation by " + institution.getInstitutionName(),
                actor.getFullName(), actor.getRole());

        // NEW — donor should hear their open donation got claimed, same as a need-linked CONFIRMED
        eventPublisher.publishEvent(new DonationStatusChangedEvent(
                donation.getId(), donation.getDonor().getEmail(), donation.getDonor().getFullName(),
                DonationStatus.CONFIRMED));

        return toResponse(donation);
    }

    private void applyFulfillment(Donation donation) {
        if (donation.getNeed() == null) {
            return;
        }

        Need need = donation.getNeed();
        if (need.getQuantityFulfilled() >= need.getQuantityRequired()) {
            throw new InvalidDonationStateException("This need is already fulfilled");
        }

        double fulfillAmount = donation.getType() == DonationType.MONEY
                ? donation.getAmount()
                : donation.getQuantity();

        double newFulfilled = need.getQuantityFulfilled() + fulfillAmount;
        need.setQuantityFulfilled(newFulfilled);
        need.setStatus(newFulfilled >= need.getQuantityRequired()
                ? NeedStatus.FULFILLED
                : NeedStatus.PARTIALLY_FULFILLED);

        needRepository.save(need);
    }

    private void logEvent(Donation donation, DonationStatus status, String note, String actorName, Role actorRole) {
        DonationEvent event = DonationEvent.builder()
                .donation(donation)
                .status(status)
                .note(note)
                .actorName(actorName)
                .actorRole(actorRole)
                .build();
        donationEventRepository.save(event);
    }

    @Override
    public DonationTimelineResponse getTimeline(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        List<DonationTimelineResponse.EventEntry> entries =
                donationEventRepository.findByDonationIdOrderByTimestampAsc(donationId)
                        .stream()
                        .map(e -> DonationTimelineResponse.EventEntry.builder()
                                .status(e.getStatus())
                                .note(e.getNote())
                                .actorName(e.getActorName())
                                .actorRole(e.getActorRole().name())
                                .timestamp(e.getTimestamp())
                                .build())
                        .toList();

        return DonationTimelineResponse.builder()
                .donationId(donation.getId())
                .needTitle(donation.getNeed() != null ? donation.getNeed().getTitle() : "Open donation (no linked need)")
                .currentStatus(donation.getStatus())
                .events(entries)
                .build();
    }

    @Override
    public List<DonationResponse> getMyDonations(String donorEmail) {
        User donor = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return donationRepository.findByDonorIdOrderByCreatedAtDesc(donor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationResponse> getInstitutionDonations(String institutionAdminEmail) {
        User actor = userRepository.findByEmail(institutionAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Institution institution = institutionRepository.findByUserId(actor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found for this admin"));

        return donationRepository.findByInstitutionId(institution.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private DonationResponse toResponse(Donation donation) {
        boolean isOpen = donation.getNeed() == null;
        Institution inst = isOpen ? donation.getInstitution() : (donation.getNeed() != null ? donation.getNeed().getInstitution() : null);
        String dropAddr = inst != null ? (inst.getInstitutionName() + ", " + inst.getAddress() + ", " + inst.getCity()) : null;

        return DonationResponse.builder()
                .id(donation.getId())
                .needId(isOpen ? null : (donation.getNeed() != null ? donation.getNeed().getId() : null))
                .needTitle(isOpen ? null : (donation.getNeed() != null ? donation.getNeed().getTitle() : null))
                .donorName(donation.getDonor().getFullName())
                .donorPhone(donation.getDonor().getPhone())
                .institutionName(inst != null ? inst.getInstitutionName() : null)
                .dropAddress(dropAddr)
                .type(donation.getType())
                .amount(donation.getAmount())
                .quantity(donation.getQuantity())
                .unit(donation.getUnit())
                .status(donation.getStatus())
                .createdAt(donation.getCreatedAt())
                .openDonation(isOpen)
                .category(donation.getCategory())
                .description(donation.getDescription())
                .pickupAddress(donation.getPickupAddress())
                .build();
    }
}