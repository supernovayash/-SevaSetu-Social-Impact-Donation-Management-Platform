package com.sevasetu.controller;

import com.sevasetu.dto.request.DonationCreateRequest;
import com.sevasetu.dto.response.DonationResponse;
import com.sevasetu.dto.response.DonationTimelineResponse;
import com.sevasetu.enums.DonationStatus;
import com.sevasetu.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonationResponse> createDonation(@Valid @RequestBody DonationCreateRequest request,
                                                           Authentication authentication) {
        // Unchanged endpoint — leaving needId null in the body now makes this an open donation,
        // since createDonation() branches on it. The /open route below is just a clearer alias.
        DonationResponse response = donationService.createDonation(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // NEW
    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public List<DonationResponse> getOpenDonations() {
        return donationService.getOpenDonations();
    }

    // NEW
    @PatchMapping("/{id}/claim")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    public DonationResponse claimOpenDonation(@PathVariable Long id, Authentication authentication) {
        return donationService.claimOpenDonation(id, authentication.getName());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DONOR', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public DonationResponse updateStatus(@PathVariable Long id,
                                         @RequestParam DonationStatus status,
                                         @RequestParam(required = false, defaultValue = "") String note,
                                         Authentication authentication) {
        return donationService.updateStatus(id, status, note, authentication.getName());
    }

    @GetMapping("/{id}/timeline")
    public DonationTimelineResponse getTimeline(@PathVariable Long id) {
        return donationService.getTimeline(id);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('DONOR')")
    public List<DonationResponse> getMyDonations(Authentication authentication) {
        return donationService.getMyDonations(authentication.getName());
    }

    @GetMapping("/institution")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    public List<DonationResponse> getInstitutionDonations(Authentication authentication) {
        return donationService.getInstitutionDonations(authentication.getName());
    }
}