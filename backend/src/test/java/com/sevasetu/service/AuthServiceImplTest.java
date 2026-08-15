package com.sevasetu.service;

import com.sevasetu.dto.request.LoginRequest;
import com.sevasetu.dto.request.RegisterDonorRequest;
import com.sevasetu.dto.request.RegisterInstitutionRequest;
import com.sevasetu.dto.request.RegisterVolunteerRequest;
import com.sevasetu.dto.response.AuthResponse;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.User;
import com.sevasetu.entity.Volunteer;
import com.sevasetu.enums.Role;
import com.sevasetu.event.UserRegisteredEvent;
import com.sevasetu.exception.DuplicateResourceException;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.UserRepository;
import com.sevasetu.repository.VolunteerRepository;
import com.sevasetu.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("John Donor")
                .email("john@example.com")
                .passwordHash("encodedPassword")
                .phone("1234567890")
                .role(Role.DONOR)
                .enabled(true)
                .build();
    }

    @Test
    void registerDonor_Success() {
        RegisterDonorRequest request = new RegisterDonorRequest();
        request.setFullName("John Donor");
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setPhone("1234567890");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtil.generateAccessToken(eq("john@example.com"), eq("DONOR"))).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(eq("john@example.com"), eq("DONOR"))).thenReturn("refresh_token");

        AuthResponse response = authService.registerDonor(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access_token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh_token");
        assertThat(response.getRole()).isEqualTo("DONOR");
        assertThat(response.getFullName()).isEqualTo("John Donor");

        verify(eventPublisher).publishEvent(any(UserRegisteredEvent.class));
    }

    @Test
    void registerDonor_DuplicateEmail_ThrowsException() {
        RegisterDonorRequest request = new RegisterDonorRequest();
        request.setEmail("john@example.com");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerDonor(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    void registerInstitution_Success() {
        RegisterInstitutionRequest request = new RegisterInstitutionRequest();
        request.setFullName("Admin Name");
        request.setEmail("admin@inst.org");
        request.setPassword("password123");
        request.setPhone("9876543210");
        request.setInstitutionName("Hope Foundation");
        request.setRegistrationNumber("REG12345");
        request.setAddress("123 Main St");
        request.setCity("Mumbai");
        request.setDescription("Helping children");

        User instUser = User.builder()
                .id(2L)
                .fullName("Admin Name")
                .email("admin@inst.org")
                .passwordHash("encodedPassword")
                .role(Role.INSTITUTION_ADMIN)
                .enabled(true)
                .build();

        when(userRepository.existsByEmail("admin@inst.org")).thenReturn(false);
        when(institutionRepository.existsByRegistrationNumber("REG12345")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(instUser);
        when(jwtUtil.generateAccessToken(eq("admin@inst.org"), eq("INSTITUTION_ADMIN"))).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(eq("admin@inst.org"), eq("INSTITUTION_ADMIN"))).thenReturn("refresh_token");

        AuthResponse response = authService.registerInstitution(request);

        assertThat(response).isNotNull();
        assertThat(response.getRole()).isEqualTo("INSTITUTION_ADMIN");
        verify(institutionRepository).save(any(Institution.class));
        verify(eventPublisher).publishEvent(any(UserRegisteredEvent.class));
    }

    @Test
    void registerInstitution_DuplicateRegNum_ThrowsException() {
        RegisterInstitutionRequest request = new RegisterInstitutionRequest();
        request.setEmail("admin@inst.org");
        request.setRegistrationNumber("REG12345");

        when(userRepository.existsByEmail("admin@inst.org")).thenReturn(false);
        when(institutionRepository.existsByRegistrationNumber("REG12345")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerInstitution(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Registration number already in use");
    }

    @Test
    void registerVolunteer_Success() {
        RegisterVolunteerRequest request = new RegisterVolunteerRequest();
        request.setFullName("Vol Volunteer");
        request.setEmail("vol@example.com");
        request.setPassword("password123");
        request.setCity("Delhi");
        request.setVehicleAvailable(true);

        User volUser = User.builder()
                .id(3L)
                .fullName("Vol Volunteer")
                .email("vol@example.com")
                .role(Role.VOLUNTEER)
                .enabled(true)
                .build();

        when(userRepository.existsByEmail("vol@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(volUser);
        when(jwtUtil.generateAccessToken(eq("vol@example.com"), eq("VOLUNTEER"))).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(eq("vol@example.com"), eq("VOLUNTEER"))).thenReturn("refresh_token");

        AuthResponse response = authService.registerVolunteer(request);

        assertThat(response).isNotNull();
        assertThat(response.getRole()).isEqualTo("VOLUNTEER");
        verify(volunteerRepository).save(any(Volunteer.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(jwtUtil.generateAccessToken("john@example.com", "DONOR")).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken("john@example.com", "DONOR")).thenReturn("refresh_token");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access_token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
