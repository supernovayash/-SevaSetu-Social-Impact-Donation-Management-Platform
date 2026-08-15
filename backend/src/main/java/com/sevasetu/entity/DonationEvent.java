package com.sevasetu.entity;

import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "donation_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role actorRole;

    @Column(updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}