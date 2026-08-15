package com.sevasetu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "proof_of_impact")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProofOfImpact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    private Donation donation;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String imageUrl;

    @Column(updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}