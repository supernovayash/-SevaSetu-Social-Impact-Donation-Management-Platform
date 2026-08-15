package com.sevasetu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sevasetu.dto.request.DonationCreateRequest;
import com.sevasetu.dto.response.DonationResponse;
import com.sevasetu.dto.response.DonationTimelineResponse;
import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.DonationType;
import com.sevasetu.security.JwtAuthFilter;
import com.sevasetu.service.DonationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DonationController.class)
@AutoConfigureMockMvc(addFilters = false)
class DonationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DonationService donationService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "donor@example.com", roles = "DONOR")
    void createDonation_Returns201() throws Exception {
        DonationCreateRequest request = new DonationCreateRequest();
        request.setNeedId(10L);
        request.setType(DonationType.MONEY);
        request.setAmount(500.0);

        DonationResponse response = DonationResponse.builder()
                .id(100L)
                .needId(10L)
                .donorName("Jane Donor")
                .type(DonationType.MONEY)
                .amount(500.0)
                .status(DonationStatus.PLEDGED)
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "donor@example.com", "password", Collections.emptyList());

        when(donationService.createDonation(eq("donor@example.com"), any(DonationCreateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/donations")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.amount").value(500.0))
                .andExpect(jsonPath("$.status").value("PLEDGED"));
    }

    @Test
    void getOpenDonations_ReturnsList() throws Exception {
        DonationResponse response = DonationResponse.builder()
                .id(101L)
                .openDonation(true)
                .amount(1000.0)
                .build();

        when(donationService.getOpenDonations()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/donations/open"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(101L))
                .andExpect(jsonPath("$[0].openDonation").value(true));
    }

    @Test
    @WithMockUser(username = "admin@inst.org", roles = "INSTITUTION_ADMIN")
    void claimOpenDonation_ReturnsDonation() throws Exception {
        DonationResponse response = DonationResponse.builder()
                .id(101L)
                .status(DonationStatus.CONFIRMED)
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "admin@inst.org", "password", Collections.emptyList());

        when(donationService.claimOpenDonation(101L, "admin@inst.org")).thenReturn(response);

        mockMvc.perform(patch("/api/donations/101/claim")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101L))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void getTimeline_ReturnsTimeline() throws Exception {
        DonationTimelineResponse timeline = DonationTimelineResponse.builder()
                .donationId(100L)
                .needTitle("Medical Need")
                .currentStatus(DonationStatus.CONFIRMED)
                .events(List.of())
                .build();

        when(donationService.getTimeline(100L)).thenReturn(timeline);

        mockMvc.perform(get("/api/donations/100/timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.donationId").value(100L))
                .andExpect(jsonPath("$.needTitle").value("Medical Need"));
    }
}
