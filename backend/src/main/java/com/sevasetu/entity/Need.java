package com.sevasetu.entity;

import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.UrgencyLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "needs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Need {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NeedCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UrgencyLevel urgencyLevel;

    @Column(nullable = false)
    private Double quantityRequired;

    @Column(nullable = false)
    private Double quantityFulfilled;

    @Column(nullable = false)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NeedStatus status;

    @Column(nullable = false)
    private String city;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Version
    private Long version;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (quantityFulfilled == null) quantityFulfilled = 0.0;
        if (status == null) status = NeedStatus.OPEN;
    }
}