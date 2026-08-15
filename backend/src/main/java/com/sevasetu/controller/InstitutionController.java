package com.sevasetu.controller;

import com.sevasetu.dto.response.InstitutionResponse;
import com.sevasetu.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    public InstitutionResponse getMyInstitution(Authentication authentication) {
        return institutionService.getMyInstitution(authentication.getName());
    }
}