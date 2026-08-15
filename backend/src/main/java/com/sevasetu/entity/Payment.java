package com.sevasetu.entity;

import com.sevasetu.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One donation gets at most one payment attempt record that succeeds.
    // unique = true is the DB-level backstop for "don't create two orders for one donation."
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    private Donation donation;

    @Column(nullable = false, unique = true)
    private String razorpayOrderId;

    // Null until the donor actually pays — this is what makes idempotency checking possible.
    @Column(unique = true)
    private String razorpayPaymentId;

    private String razorpaySignature;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime verifiedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (status == null) status = PaymentStatus.CREATED;
    }
}