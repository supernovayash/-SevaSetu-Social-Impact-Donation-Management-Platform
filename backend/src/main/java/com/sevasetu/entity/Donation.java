package com.sevasetu.entity;

import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.DonationType;
import com.sevasetu.enums.NeedCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    // CHANGED: nullable = false -> true. An open donation has no Need behind it.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "need_id", nullable = true)
    private Need need;

    // NEW: only ever populated for open donations, and only once claimed.
    // For need-linked donations, keep deriving institution via need.getInstitution() —
    // do NOT set this field for those, or you reintroduce the denormalization
    // you deliberately avoided the first time around.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = true)
    private Institution institution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationType type;

    private Double amount;
    private Double quantity;
    private String unit;

    // NEW: only populated when need == null. A need-linked donation still gets
    // its category/description from need.getCategory() / need.getDescription().
    @Enumerated(EnumType.STRING)
    private NeedCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (status == null) status = DonationStatus.PLEDGED;
    }

    // NEW: convenience check used by the service layer to decide validation
    // rules (open donations need category/description; need-linked ones don't).
    @Transient
    public boolean isOpenDonation() {
        return need == null;
    }
}