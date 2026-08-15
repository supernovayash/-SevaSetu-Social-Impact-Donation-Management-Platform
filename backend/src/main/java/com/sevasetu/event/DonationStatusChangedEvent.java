package com.sevasetu.event;

import com.sevasetu.enums.DonationStatus;
import lombok.Getter;

@Getter
public class DonationStatusChangedEvent {
    private final Long donationId;
    private final String donorEmail;
    private final String donorName;
    private final DonationStatus newStatus;

    public DonationStatusChangedEvent(Long donationId, String donorEmail, String donorName, DonationStatus newStatus) {
        this.donationId = donationId;
        this.donorEmail = donorEmail;
        this.donorName = donorName;
        this.newStatus = newStatus;
    }
}