package com.sevasetu.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class CreateOrderResponse {
    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String keyId;     // frontend checkout needs this to open the widget
    private Long donationId;
}