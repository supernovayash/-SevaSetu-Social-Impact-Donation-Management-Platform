package com.sevasetu.event;

import lombok.Getter;

@Getter
public class PaymentVerifiedEvent {
    private final String donorEmail;
    private final String donorName;
    private final Double amount;
    private final String razorpayPaymentId;

    public PaymentVerifiedEvent(String donorEmail, String donorName, Double amount, String razorpayPaymentId) {
        this.donorEmail = donorEmail;
        this.donorName = donorName;
        this.amount = amount;
        this.razorpayPaymentId = razorpayPaymentId;
    }
}