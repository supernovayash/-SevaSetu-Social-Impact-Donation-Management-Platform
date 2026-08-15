package com.sevasetu.dto.response;

import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.DonationType;
import com.sevasetu.enums.NeedCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class DonationResponse {
    private Long id;
    private Long needId;            // CHANGED: null for open donations
    private String needTitle;       // CHANGED: null for open donations
    private String donorName;
    private String institutionName; // CHANGED: null until an open donation is claimed
    private DonationType type;
    private Double amount;
    private Double quantity;
    private String unit;
    private DonationStatus status;
    private LocalDateTime createdAt;

    // NEW
    private boolean openDonation;
    private NeedCategory category;
    private String description;
}