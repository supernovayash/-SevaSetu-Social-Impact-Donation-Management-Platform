package com.sevasetu.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class VolunteerResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String city;
    private boolean vehicleAvailable;
}
