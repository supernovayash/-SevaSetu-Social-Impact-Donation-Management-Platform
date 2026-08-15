package com.sevasetu.repository;

import com.sevasetu.entity.LogisticsAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LogisticsAssignmentRepository extends JpaRepository<LogisticsAssignment, Long> {
    Optional<LogisticsAssignment> findByDonationId(Long donationId);
    List<LogisticsAssignment> findByVolunteerIdOrderByAssignedAtDesc(Long volunteerId);
}