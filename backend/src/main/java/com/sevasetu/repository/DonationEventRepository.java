// repository/DonationEventRepository.java
package com.sevasetu.repository;

import com.sevasetu.entity.DonationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationEventRepository extends JpaRepository<DonationEvent, Long> {
    List<DonationEvent> findByDonationIdOrderByTimestampAsc(Long donationId);
}