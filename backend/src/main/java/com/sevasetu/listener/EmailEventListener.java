package com.sevasetu.listener;

import com.sevasetu.enums.DonationStatus;
import com.sevasetu.event.*;
import com.sevasetu.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class EmailEventListener {

    private final EmailService emailService;

    // AFTER_COMMIT is the whole point of using events here: if the surrounding
    // @Transactional method rolls back, this listener simply never runs.
    @Async("emailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserRegistered(UserRegisteredEvent event) {
        emailService.sendWelcomeEmail(event.getEmail(), event.getFullName(), event.getRole());
    }

    @Async("emailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onInstitutionVerified(InstitutionVerifiedEvent event) {
        emailService.sendInstitutionVerificationEmail(event.getEmail(), event.getInstitutionName(), event.isApproved());
    }

    @Async("emailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDonationStatusChanged(DonationStatusChangedEvent event) {
        if (event.getNewStatus() == DonationStatus.CONFIRMED) {
            emailService.sendDonationConfirmedEmail(event.getDonorEmail(), event.getDonorName(), event.getDonationId());
        } else if (event.getNewStatus() == DonationStatus.UTILIZED) {
            emailService.sendProofOfImpactEmail(event.getDonorEmail(), event.getDonorName(), event.getDonationId());
        }
    }

    @Async("emailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentVerified(PaymentVerifiedEvent event) {
        emailService.sendPaymentReceiptEmail(event.getDonorEmail(), event.getDonorName(), event.getAmount(), event.getRazorpayPaymentId());
    }

    @Async("emailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onVolunteerAssigned(VolunteerAssignedEvent event) {
        emailService.sendVolunteerAssignmentEmail(event.getVolunteerEmail(), event.getVolunteerName(), event.getDonationId());
    }
}