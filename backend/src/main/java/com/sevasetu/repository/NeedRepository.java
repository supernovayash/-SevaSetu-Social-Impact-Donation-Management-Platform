package com.sevasetu.repository;

import com.sevasetu.entity.Need;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.UrgencyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NeedRepository extends JpaRepository<Need, Long> {

    @Query("SELECT n FROM Need n WHERE " +
            "n.status IN :statuses AND " +
            "(:category IS NULL OR n.category = :category) AND " +
            "(:city IS NULL OR LOWER(n.city) = LOWER(:city)) AND " +
            "(:urgencyLevel IS NULL OR n.urgencyLevel = :urgencyLevel)")
    List<Need> browseNeeds(List<NeedStatus> statuses, NeedCategory category, String city, UrgencyLevel urgencyLevel);

    List<Need> findByInstitutionId(Long institutionId);
}