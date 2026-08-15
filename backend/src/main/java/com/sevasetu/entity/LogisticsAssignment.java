package com.sevasetu.entity;

import com.sevasetu.enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "logistics_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogisticsAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One assignment per donation — unique = true is the DB backstop,
    // same pattern as Payment.donation.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private Volunteer volunteer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(updatable = false)
    private LocalDateTime assignedAt;

    private LocalDateTime completedAt;

    @PrePersist
    void onCreate() {
        this.assignedAt = LocalDateTime.now();
        if (status == null) status = AssignmentStatus.ASSIGNED;
    }
}