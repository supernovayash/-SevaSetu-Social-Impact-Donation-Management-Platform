package com.sevasetu.service;

import com.sevasetu.dto.request.AssignVolunteerRequest;
import com.sevasetu.dto.request.SubmitProofRequest;
import com.sevasetu.dto.response.LogisticsAssignmentResponse;
import com.sevasetu.dto.response.ProofOfImpactResponse;

public interface LogisticsService {

    LogisticsAssignmentResponse assignVolunteer(
            AssignVolunteerRequest request,
            String actorEmail
    );

    LogisticsAssignmentResponse markPickedUp(
            Long donationId,
            String volunteerEmail
    );

    LogisticsAssignmentResponse markDelivered(
            Long donationId,
            String institutionAdminEmail
    );

    ProofOfImpactResponse submitProof(
            SubmitProofRequest request,
            String actorEmail
    );

    java.util.List<LogisticsAssignmentResponse> getMyAssignments(
            String volunteerEmail
    );

    java.util.List<com.sevasetu.entity.Volunteer> getAvailableVolunteers();
}