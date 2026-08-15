package com.sevasetu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sevasetu.dto.request.NeedCreateRequest;
import com.sevasetu.dto.response.NeedResponse;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.UrgencyLevel;
import com.sevasetu.security.JwtAuthFilter;
import com.sevasetu.service.NeedService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NeedController.class)
@AutoConfigureMockMvc(addFilters = false)
class NeedControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NeedService needService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    @WithMockUser(username = "admin@inst.org", roles = "INSTITUTION_ADMIN")
    void createNeed_Returns201() throws Exception {
        NeedCreateRequest request = new NeedCreateRequest();
        request.setTitle("Blankets");
        request.setDescription("Warm blankets for winter");
        request.setCategory(NeedCategory.CLOTHES);
        request.setUrgencyLevel(UrgencyLevel.CRITICAL);
        request.setQuantityRequired(100.0);
        request.setUnit("pieces");
        request.setCity("Delhi");

        NeedResponse response = NeedResponse.builder()
                .id(1L)
                .title("Blankets")
                .description("Warm blankets for winter")
                .category(NeedCategory.CLOTHES)
                .urgencyLevel(UrgencyLevel.CRITICAL)
                .quantityRequired(100.0)
                .quantityFulfilled(0.0)
                .unit("pieces")
                .status(NeedStatus.OPEN)
                .city("Delhi")
                .institutionName("Hope Org")
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "admin@inst.org", "password", Collections.emptyList());

        when(needService.createNeed(eq("admin@inst.org"), any(NeedCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/needs")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Blankets"))
                .andExpect(jsonPath("$.institutionName").value("Hope Org"));
    }

    @Test
    void browseNeeds_ReturnsList() throws Exception {
        NeedResponse response = NeedResponse.builder()
                .id(1L)
                .title("Blankets")
                .category(NeedCategory.CLOTHES)
                .status(NeedStatus.OPEN)
                .build();

        when(needService.browseNeeds(eq(NeedCategory.CLOTHES), eq("Delhi"), eq(UrgencyLevel.CRITICAL)))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/needs")
                        .param("category", "CLOTHES")
                        .param("city", "Delhi")
                        .param("urgencyLevel", "CRITICAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Blankets"));
    }

    @Test
    void getNeed_ReturnsNeed() throws Exception {
        NeedResponse response = NeedResponse.builder()
                .id(10L)
                .title("Food Packets")
                .build();

        when(needService.getNeedById(10L)).thenReturn(response);

        mockMvc.perform(get("/api/needs/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.title").value("Food Packets"));
    }
}
