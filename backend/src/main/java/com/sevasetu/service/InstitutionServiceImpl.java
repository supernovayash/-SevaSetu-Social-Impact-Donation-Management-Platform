package com.sevasetu.service;

import com.sevasetu.dto.response.InstitutionResponse;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.User;
import com.sevasetu.enums.VerificationStatus;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    @Override
    public InstitutionResponse getMyInstitution(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Institution institution = institutionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No institution profile linked to this account"));

        return toResponse(institution);
    }

    @Override
    public List<InstitutionResponse> getPendingInstitutions() {
        return institutionRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public InstitutionResponse verifyInstitution(Long institutionId, boolean approve) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        institution.setVerificationStatus(approve ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED);
        Institution saved = institutionRepository.save(institution);

        return toResponse(saved);
    }

    private InstitutionResponse toResponse(Institution institution) {
        return InstitutionResponse.builder()
                .id(institution.getId())
                .institutionName(institution.getInstitutionName())
                .registrationNumber(institution.getRegistrationNumber())
                .address(institution.getAddress())
                .city(institution.getCity())
                .description(institution.getDescription())
                .verificationStatus(institution.getVerificationStatus())
                .adminEmail(institution.getUser().getEmail())
                .adminFullName(institution.getUser().getFullName())
                .build();
    }
}