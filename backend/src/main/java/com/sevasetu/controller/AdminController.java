package com.sevasetu.controller;

import com.sevasetu.dto.response.InstitutionResponse;
import com.sevasetu.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final InstitutionService institutionService;

    @GetMapping("/institutions/pending")
    public List<InstitutionResponse> getPendingInstitutions() {
        return institutionService.getPendingInstitutions();
    }

    @PatchMapping("/institutions/{id}/verify")
    public InstitutionResponse verifyInstitution(@PathVariable Long id, @RequestParam boolean approve) {
        return institutionService.verifyInstitution(id, approve);
    }
}