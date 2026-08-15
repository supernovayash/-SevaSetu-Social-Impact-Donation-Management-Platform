package com.sevasetu.dto.response;

import com.sevasetu.enums.VerificationStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InstitutionResponse {
    private Long id;
    private String institutionName;
    private String registrationNumber;
    private String address;
    private String city;
    private String description;
    private VerificationStatus verificationStatus;
    private String adminEmail;
    private String adminFullName;
}