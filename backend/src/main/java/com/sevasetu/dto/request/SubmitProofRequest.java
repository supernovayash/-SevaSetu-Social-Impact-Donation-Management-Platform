package com.sevasetu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SubmitProofRequest {
    @NotNull private Long donationId;
    @NotBlank private String description;
    private String imageUrl;
}