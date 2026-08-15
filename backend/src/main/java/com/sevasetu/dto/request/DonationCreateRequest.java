package com.sevasetu.dto.request;

import com.sevasetu.enums.DonationType;
import com.sevasetu.enums.NeedCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DonationCreateRequest {
    // CHANGED: was @NotNull — null now means "open donation, no linked need"
    private Long needId;

    @NotNull private DonationType type;
    @Positive private Double amount;
    @Positive private Double quantity;
    private String unit;

    // NEW: required only when needId is null — see DonationServiceImpl.createDonation
    private NeedCategory category;
    private String description;
}