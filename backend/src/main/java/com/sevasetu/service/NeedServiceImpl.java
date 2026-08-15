// service/NeedServiceImpl.java
package com.sevasetu.service;

import com.sevasetu.dto.request.NeedCreateRequest;
import com.sevasetu.dto.response.NeedResponse;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.Need;
import com.sevasetu.entity.User;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.UrgencyLevel;
import com.sevasetu.enums.VerificationStatus;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.exception.UnauthorizedActionException;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.NeedRepository;
import com.sevasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NeedServiceImpl implements NeedService {

    private static final List<UrgencyLevel> SEVERITY_ORDER =
            List.of(UrgencyLevel.CRITICAL, UrgencyLevel.MODERATE, UrgencyLevel.LOW);

    private final NeedRepository needRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;

    @Override
    public NeedResponse createNeed(String institutionAdminEmail, NeedCreateRequest request) {
        User user = userRepository.findByEmail(institutionAdminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Institution institution = institutionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No institution profile linked to this account"));

        if (institution.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new UnauthorizedActionException("Institution must be verified before posting a need");
        }

        Need need = Need.builder()
                .institution(institution)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .urgencyLevel(request.getUrgencyLevel())
                .quantityRequired(request.getQuantityRequired())
                .quantityFulfilled(0.0)
                .unit(request.getUnit())
                .status(NeedStatus.OPEN)
                .city(request.getCity())
                .build();

        return toResponse(needRepository.save(need));
    }

    @Override
    public List<NeedResponse> browseNeeds(NeedCategory category, String city, UrgencyLevel urgencyLevel) {
        List<NeedStatus> visibleStatuses = List.of(NeedStatus.OPEN, NeedStatus.PARTIALLY_FULFILLED);

        return needRepository.browseNeeds(visibleStatuses, category, city, urgencyLevel).stream()
                .sorted(Comparator
                        .comparingInt((Need n) -> SEVERITY_ORDER.indexOf(n.getUrgencyLevel()))
                        .thenComparing(Need::getCreatedAt))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public NeedResponse getNeedById(Long id) {
        Need need = needRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Need not found"));
        return toResponse(need);
    }

    private NeedResponse toResponse(Need need) {
        return NeedResponse.builder()
                .id(need.getId())
                .title(need.getTitle())
                .description(need.getDescription())
                .category(need.getCategory())
                .urgencyLevel(need.getUrgencyLevel())
                .quantityRequired(need.getQuantityRequired())
                .quantityFulfilled(need.getQuantityFulfilled())
                .unit(need.getUnit())
                .status(need.getStatus())
                .city(need.getCity())
                .institutionName(need.getInstitution().getInstitutionName())
                .createdAt(need.getCreatedAt())
                .build();
    }
}