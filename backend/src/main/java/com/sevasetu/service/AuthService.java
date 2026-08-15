package com.sevasetu.service;

import com.sevasetu.dto.request.LoginRequest;
import com.sevasetu.dto.request.RegisterDonorRequest;
import com.sevasetu.dto.request.RegisterInstitutionRequest;
import com.sevasetu.dto.request.RegisterVolunteerRequest;
import com.sevasetu.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse registerDonor(RegisterDonorRequest request);
    AuthResponse registerInstitution(RegisterInstitutionRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse registerVolunteer(RegisterVolunteerRequest request);
}