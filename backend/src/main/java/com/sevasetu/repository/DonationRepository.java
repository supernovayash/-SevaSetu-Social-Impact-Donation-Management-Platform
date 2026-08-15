package com.sevasetu.repository;

import com.sevasetu.entity.Donation;
import com.sevasetu.entity.Institution;
import com.sevasetu.enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorIdOrderByCreatedAtDesc(Long donorId);

    // NEW: what institutions browse
    List<Donation> findByNeedIsNullAndInstitutionIsNullAndStatusOrderByCreatedAtDesc(DonationStatus status);

    // NEW: atomic claim — WHERE clause makes a double-claim race physically impossible,
    // no @Version/retry needed. Returns 0 if someone else claimed it first.
    @Modifying
    @Query("UPDATE Donation d SET d.institution = :institution, d.status = 'CONFIRMED' " +
            "WHERE d.id = :donationId AND d.need IS NULL AND d.institution IS NULL")
    int claimOpenDonation(@Param("donationId") Long donationId, @Param("institution") Institution institution);
}