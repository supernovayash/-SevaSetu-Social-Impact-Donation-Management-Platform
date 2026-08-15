package com.sevasetu.service;

import com.sevasetu.dto.request.VerifyPaymentRequest;
import com.sevasetu.dto.response.CreateOrderResponse;

public interface PaymentService {
    CreateOrderResponse createOrder(Long donationId, String donorEmail);
    void verifyPayment(VerifyPaymentRequest request);
}