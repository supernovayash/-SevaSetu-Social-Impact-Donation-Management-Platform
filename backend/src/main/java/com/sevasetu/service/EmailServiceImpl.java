package com.sevasetu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Override
    public void sendWelcomeEmail(String to, String fullName, String role) {
        send(to, "Welcome to SevaSetu",
                "Hi " + fullName + ",\n\nYour " + role.toLowerCase().replace("_", " ") +
                        " account has been created successfully.\n\n— Team SevaSetu");
    }

    @Override
    public void sendInstitutionVerificationEmail(String to, String institutionName, boolean approved) {
        String subject = approved ? "Your institution has been verified" : "Institution verification update";
        String body = approved
                ? "Hi,\n\n" + institutionName + " has been verified. You can now raise needs and receive donations.\n\n— Team SevaSetu"
                : "Hi,\n\n" + institutionName + "'s verification was not approved. Please contact support for details.\n\n— Team SevaSetu";
        send(to, subject, body);
    }

    @Override
    public void sendDonationConfirmedEmail(String to, String donorName, Long donationId) {
        send(to, "Your donation has been confirmed",
                "Hi " + donorName + ",\n\nYour donation (#" + donationId +
                        ") has been confirmed by the receiving institution. Thank you!\n\n— Team SevaSetu");
    }

    @Override
    public void sendPaymentReceiptEmail(String to, String donorName, Double amount, String razorpayPaymentId) {
        send(to, "Payment receipt — SevaSetu",
                "Hi " + donorName + ",\n\nWe've received your payment of Rs. " + amount +
                        " (Payment ID: " + razorpayPaymentId + ").\n\nThank you for your contribution.\n\n— Team SevaSetu");
    }

    @Override
    public void sendVolunteerAssignmentEmail(String to, String volunteerName, Long donationId) {
        send(to, "You've been assigned a pickup",
                "Hi " + volunteerName + ",\n\nYou've been assigned to pick up donation #" + donationId +
                        ". Please check the app for details.\n\n— Team SevaSetu");
    }

    @Override
    public void sendProofOfImpactEmail(String to, String donorName, Long donationId) {
        send(to, "See the impact of your donation!",
                "Hi " + donorName + ",\n\nYour donation (#" + donationId +
                        ") has been delivered and put to use. Log in to SevaSetu to see the proof of impact.\n\n— Team SevaSetu");
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Deliberately swallowed — a broken SMTP config must never roll back
            // a registration, donation, or payment. Log and move on.
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}