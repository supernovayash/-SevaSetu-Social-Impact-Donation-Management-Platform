package com.sevasetu.controller;

import com.sevasetu.dto.request.LoginRequest;
import com.sevasetu.dto.request.RegisterDonorRequest;
import com.sevasetu.dto.request.RegisterInstitutionRequest;
import com.sevasetu.dto.request.RegisterVolunteerRequest;
import com.sevasetu.dto.response.AuthResponse;
import com.sevasetu.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/donor")
    public ResponseEntity<AuthResponse> registerDonor(@Valid @RequestBody RegisterDonorRequest request) {
        AuthResponse response = authService.registerDonor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/institution")
    public ResponseEntity<AuthResponse> registerInstitution(@Valid @RequestBody RegisterInstitutionRequest request) {
        AuthResponse response = authService.registerInstitution(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/register/volunteer")
    public ResponseEntity<AuthResponse> registerVolunteer(@Valid @RequestBody RegisterVolunteerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerVolunteer(request));
    }
}