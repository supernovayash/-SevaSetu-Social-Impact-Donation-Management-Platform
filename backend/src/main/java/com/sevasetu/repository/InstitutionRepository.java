package com.sevasetu.repository;

import com.sevasetu.entity.Institution;
import com.sevasetu.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    Optional<Institution> findByUserId(Long userId);
    List<Institution> findByVerificationStatus(VerificationStatus status);
    boolean existsByRegistrationNumber(String registrationNumber);
}