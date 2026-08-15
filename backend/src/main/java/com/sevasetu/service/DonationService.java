package com.sevasetu.service;

import com.sevasetu.dto.request.DonationCreateRequest;
import com.sevasetu.dto.response.DonationResponse;
import com.sevasetu.dto.response.DonationTimelineResponse;
import com.sevasetu.enums.DonationStatus;

import java.util.List;

public interface DonationService {
    DonationResponse createDonation(String donorEmail, DonationCreateRequest request);
    DonationResponse updateStatus(Long donationId, DonationStatus newStatus, String note, String actorEmail);
    DonationTimelineResponse getTimeline(Long donationId);
    List<DonationResponse> getMyDonations(String donorEmail);

    // NEW
    List<DonationResponse> getOpenDonations();
    DonationResponse claimOpenDonation(Long donationId, String institutionAdminEmail);
}