package com.sevasetu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sevasetu.dto.request.LoginRequest;
import com.sevasetu.dto.request.RegisterDonorRequest;
import com.sevasetu.dto.response.AuthResponse;
import com.sevasetu.security.JwtAuthFilter;
import com.sevasetu.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @Test
    void registerDonor_Returns201() throws Exception {
        RegisterDonorRequest request = new RegisterDonorRequest();
        request.setFullName("Jane Donor");
        request.setEmail("jane@example.com");
        request.setPassword("password123");
        request.setPhone("1234567890");

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("access_token")
                .refreshToken("refresh_token")
                .role("DONOR")
                .fullName("Jane Donor")
                .build();

        when(authService.registerDonor(any(RegisterDonorRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register/donor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("access_token"))
                .andExpect(jsonPath("$.role").value("DONOR"));
    }

    @Test
    void login_Returns200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("password123");

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("access_token")
                .refreshToken("refresh_token")
                .role("DONOR")
                .fullName("Jane Donor")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access_token"))
                .andExpect(jsonPath("$.fullName").value("Jane Donor"));
    }
}
