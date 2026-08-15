package com.sevasetu.controller;

import com.sevasetu.dto.request.AssignVolunteerRequest;
import com.sevasetu.dto.request.SubmitProofRequest;
import com.sevasetu.dto.response.LogisticsAssignmentResponse;
import com.sevasetu.dto.response.ProofOfImpactResponse;
import com.sevasetu.service.LogisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsService logisticsService;

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public LogisticsAssignmentResponse assignVolunteer(
            @Valid @RequestBody AssignVolunteerRequest request,
            Authentication authentication) {

        return logisticsService.assignVolunteer(
                request,
                authentication.getName()
        );
    }

    @PatchMapping("/{donationId}/picked-up")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public LogisticsAssignmentResponse markPickedUp(
            @PathVariable Long donationId,
            Authentication authentication) {

        return logisticsService.markPickedUp(
                donationId,
                authentication.getName()
        );
    }

    @PatchMapping("/{donationId}/delivered")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public LogisticsAssignmentResponse markDelivered(
            @PathVariable Long donationId,
            Authentication authentication) {

        return logisticsService.markDelivered(
                donationId,
                authentication.getName()
        );
    }

    @PostMapping("/proof")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public ProofOfImpactResponse submitProof(
            @Valid @RequestBody SubmitProofRequest request,
            Authentication authentication) {

        return logisticsService.submitProof(
                request,
                authentication.getName()
        );
    }
}