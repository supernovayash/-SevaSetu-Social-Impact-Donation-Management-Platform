// dto/response/NeedResponse.java
package com.sevasetu.dto.response;

import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.UrgencyLevel;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter @Builder
public class NeedResponse {
    private Long id;
    private String title;
    private String description;
    private NeedCategory category;
    private UrgencyLevel urgencyLevel;
    private Double quantityRequired;
    private Double quantityFulfilled;
    private String unit;
    private NeedStatus status;
    private String city;
    private String institutionName;
    private LocalDateTime createdAt;
}