package com.sevasetu.repository;

import com.sevasetu.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByUserId(Long userId);
}