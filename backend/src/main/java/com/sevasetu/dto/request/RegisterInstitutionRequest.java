package com.sevasetu.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegisterInstitutionRequest {

    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank
    private String phone;

    @NotBlank
    private String institutionName;

    @NotBlank
    private String registrationNumber;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    private String description;
}