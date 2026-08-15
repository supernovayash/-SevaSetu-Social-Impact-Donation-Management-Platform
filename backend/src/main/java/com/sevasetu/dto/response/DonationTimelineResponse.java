// dto/response/DonationTimelineResponse.java
package com.sevasetu.dto.response;

import com.sevasetu.enums.DonationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class DonationTimelineResponse {
    private Long donationId;
    private String needTitle;
    private DonationStatus currentStatus;
    private List<EventEntry> events;

    @Getter @Builder
    public static class EventEntry {
        private DonationStatus status;
        private String note;
        private String actorName;
        private String actorRole;
        private LocalDateTime timestamp;
    }
}