package com.sevasetu.event;

import lombok.Getter;

@Getter
public class VolunteerAssignedEvent {
    private final String volunteerEmail;
    private final String volunteerName;
    private final Long donationId;

    public VolunteerAssignedEvent(String volunteerEmail, String volunteerName, Long donationId) {
        this.volunteerEmail = volunteerEmail;
        this.volunteerName = volunteerName;
        this.donationId = donationId;
    }
}