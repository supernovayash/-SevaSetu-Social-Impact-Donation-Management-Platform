package com.sevasetu.repository;

import com.sevasetu.entity.ProofOfImpact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProofOfImpactRepository extends JpaRepository<ProofOfImpact, Long> {
    Optional<ProofOfImpact> findByDonationId(Long donationId);
}