package com.sevasetu.service;

public interface EmailService {
    void sendWelcomeEmail(String to, String fullName, String role);
    void sendInstitutionVerificationEmail(String to, String institutionName, boolean approved);
    void sendDonationConfirmedEmail(String to, String donorName, Long donationId);
    void sendPaymentReceiptEmail(String to, String donorName, Double amount, String razorpayPaymentId);
    void sendVolunteerAssignmentEmail(String to, String volunteerName, Long donationId);
    void sendProofOfImpactEmail(String to, String donorName, Long donationId);
}