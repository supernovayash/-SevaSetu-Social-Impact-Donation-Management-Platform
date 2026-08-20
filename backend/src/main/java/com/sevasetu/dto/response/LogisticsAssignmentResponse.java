package com.sevasetu.dto.response;

import com.sevasetu.enums.AssignmentStatus;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @Builder
public class LogisticsAssignmentResponse {
    private Long id;
    private Long donationId;
    private String donationType;
    private Double amount;
    private Double quantity;
    private String unit;
    private String category;
    private String description;
    private String needTitle;
    private String donorName;
    private String donorPhone;
    private String pickupAddress;
    private String institutionName;
    private String dropAddress;
    private String volunteerName;
    private String volunteerCity;
    private AssignmentStatus status;
    private String notes;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
}