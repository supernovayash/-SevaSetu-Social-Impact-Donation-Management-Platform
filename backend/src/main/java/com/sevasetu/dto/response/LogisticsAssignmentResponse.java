package com.sevasetu.dto.response;

import com.sevasetu.enums.AssignmentStatus;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @Builder
public class LogisticsAssignmentResponse {
    private Long id;
    private Long donationId;
    private String volunteerName;
    private String volunteerCity;
    private AssignmentStatus status;
    private String notes;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
}