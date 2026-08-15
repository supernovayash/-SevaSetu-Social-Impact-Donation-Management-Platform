package com.sevasetu.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AssignVolunteerRequest {
    @NotNull private Long donationId;
    @NotNull private Long volunteerId;
    private String notes;
}