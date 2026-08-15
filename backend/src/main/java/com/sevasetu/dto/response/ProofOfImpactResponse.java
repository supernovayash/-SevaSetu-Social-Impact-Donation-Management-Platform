package com.sevasetu.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @Builder
public class ProofOfImpactResponse {
    private Long id;
    private Long donationId;
    private String description;
    private String imageUrl;
    private LocalDateTime submittedAt;
}