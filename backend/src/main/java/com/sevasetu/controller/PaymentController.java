package com.sevasetu.controller;

import com.sevasetu.dto.request.VerifyPaymentRequest;
import com.sevasetu.dto.response.CreateOrderResponse;
import com.sevasetu.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/order/{donationId}")
    @PreAuthorize("hasRole('DONOR')")
    public CreateOrderResponse createOrder(@PathVariable Long donationId, Authentication authentication) {
        return paymentService.createOrder(donationId, authentication.getName());
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<Void> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        paymentService.verifyPayment(request);
        return ResponseEntity.ok().build();
    }
}