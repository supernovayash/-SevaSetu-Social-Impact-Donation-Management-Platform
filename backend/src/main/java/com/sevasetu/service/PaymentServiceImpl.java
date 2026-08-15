package com.sevasetu.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.sevasetu.dto.request.VerifyPaymentRequest;
import com.sevasetu.dto.response.CreateOrderResponse;
import com.sevasetu.entity.Donation;
import com.sevasetu.entity.Payment;
import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.DonationType;
import com.sevasetu.enums.PaymentStatus;
import com.sevasetu.event.PaymentVerifiedEvent;
import com.sevasetu.exception.InvalidDonationStateException;
import com.sevasetu.exception.PaymentVerificationException;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.DonationRepository;
import com.sevasetu.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final DonationRepository donationRepository;
    private final DonationService donationService;
    private final RazorpayClient razorpayClient;
    private final String razorpayKeyId;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public CreateOrderResponse createOrder(Long donationId, String donorEmail) {

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Donation not found"));

        if (!donation.getDonor().getEmail().equalsIgnoreCase(donorEmail)) {
            throw new InvalidDonationStateException(
                    "This donation does not belong to you");
        }

        if (donation.getType() != DonationType.MONEY) {
            throw new InvalidDonationStateException(
                    "Only MONEY donations can be paid through Razorpay");
        }

        if (donation.getStatus() != DonationStatus.PLEDGED) {
            throw new InvalidDonationStateException(
                    "This donation is not awaiting payment");
        }

        if (donation.getAmount() == null || donation.getAmount() <= 0) {
            throw new InvalidDonationStateException(
                    "Donation amount must be greater than zero");
        }

        if (paymentRepository.findByDonationId(donationId).isPresent()) {
            throw new InvalidDonationStateException(
                    "A payment order already exists for this donation");
        }

        try {

            long amountInPaise = Math.round(donation.getAmount() * 100);

            if (amountInPaise < 1000) {
                throw new InvalidDonationStateException(
                        "Razorpay minimum order amount is ₹10");
            }

            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "donation_" + donationId);

            JSONObject notes = new JSONObject();
            notes.put("donation_id", donationId);
            notes.put("donor_email", donorEmail);

            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);

            String razorpayOrderId = order.get("id");

            Payment payment = Payment.builder()
                    .donation(donation)
                    .razorpayOrderId(razorpayOrderId)
                    .amount(donation.getAmount())
                    .status(PaymentStatus.CREATED)
                    .build();

            paymentRepository.save(payment);

            return CreateOrderResponse.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(donation.getAmount())
                    .currency("INR")
                    .keyId(razorpayKeyId)
                    .donationId(donationId)
                    .build();

        } catch (InvalidDonationStateException ex) {
            throw ex;

        } catch (Exception ex) {

            throw new PaymentVerificationException(
                    "Could not create Razorpay order");
        }
    }

    @Override
    @Transactional
    public void verifyPayment(VerifyPaymentRequest request) {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No payment found for this Razorpay order"));

        /*
         * Idempotency:
         * If this payment has already been successfully processed,
         * don't process it again.
         */
        if (payment.getStatus() == PaymentStatus.PAID) {
            return;
        }

        /*
         * Make sure this payment ID has not already been used
         * for another payment record.
         */
        if (request.getRazorpayPaymentId() == null ||
                request.getRazorpayPaymentId().isBlank()) {

            throw new PaymentVerificationException(
                    "Razorpay payment ID is missing");
        }

        if (paymentRepository.existsByRazorpayPaymentId(
                request.getRazorpayPaymentId())) {

            throw new PaymentVerificationException(
                    "This Razorpay payment has already been recorded");
        }

        /*
         * IMPORTANT:
         * Use the order ID stored in OUR database.
         * Do not trust a different order ID from the browser.
         */
        String storedOrderId = payment.getRazorpayOrderId();

        JSONObject params = new JSONObject();

        params.put(
                "razorpay_order_id",
                storedOrderId
        );

        params.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId()
        );

        params.put(
                "razorpay_signature",
                request.getRazorpaySignature()
        );

        boolean validSignature;

        try {

            validSignature =
                    Utils.verifyPaymentSignature(
                            params,
                            razorpayKeySecret
                    );

        } catch (Exception ex) {

            validSignature = false;
        }

        if (!validSignature) {

            payment.setStatus(PaymentStatus.FAILED);

            paymentRepository.save(payment);

            throw new PaymentVerificationException(
                    "Razorpay payment signature verification failed");
        }

        /*
         * Payment is genuine.
         */
        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId());

        payment.setRazorpaySignature(
                request.getRazorpaySignature());

        payment.setStatus(PaymentStatus.PAID);

        payment.setVerifiedAt(LocalDateTime.now());

        paymentRepository.save(payment);

        /*
         * Only after successful signature verification
         * do we confirm the donation.
         */
        donationService.updateStatus(
                payment.getDonation().getId(),
                DonationStatus.CONFIRMED,
                "Payment verified successfully via Razorpay",
                payment.getDonation().getDonor().getEmail()
        );

        /*
         * Email / notification event.
         */
        eventPublisher.publishEvent(
                new PaymentVerifiedEvent(
                        payment.getDonation().getDonor().getEmail(),
                        payment.getDonation().getDonor().getFullName(),
                        payment.getAmount(),
                        payment.getRazorpayPaymentId()
                )
        );
    }
}