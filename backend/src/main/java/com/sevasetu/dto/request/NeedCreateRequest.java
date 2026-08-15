// dto/request/NeedCreateRequest.java
package com.sevasetu.dto.request;

import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NeedCreateRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    @NotNull private NeedCategory category;
    @NotNull private UrgencyLevel urgencyLevel;
    @NotNull @Positive private Double quantityRequired;
    @NotBlank private String unit;
    @NotBlank private String city;
}