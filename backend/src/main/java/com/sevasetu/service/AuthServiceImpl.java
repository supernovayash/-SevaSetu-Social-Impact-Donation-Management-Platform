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
import com.sevasetu.enums.VerificationStatus;
import com.sevasetu.event.UserRegisteredEvent;
import com.sevasetu.exception.DuplicateResourceException;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.UserRepository;
import com.sevasetu.repository.VolunteerRepository;
import com.sevasetu.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final VolunteerRepository volunteerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ApplicationEventPublisher eventPublisher; // NEW

    @Override
    public AuthResponse registerDonor(RegisterDonorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.DONOR)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // NEW
        eventPublisher.publishEvent(new UserRegisteredEvent(
                savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name()));

        return buildAuthResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse registerInstitution(RegisterInstitutionRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (institutionRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Registration number already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.INSTITUTION_ADMIN)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        Institution institution = Institution.builder()
                .user(savedUser)
                .institutionName(request.getInstitutionName())
                .registrationNumber(request.getRegistrationNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .description(request.getDescription())
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        institutionRepository.save(institution);

        // NEW
        eventPublisher.publishEvent(new UserRegisteredEvent(
                savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name()));

        return buildAuthResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse registerVolunteer(RegisterVolunteerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.VOLUNTEER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        Volunteer volunteer = Volunteer.builder()
                .user(savedUser)
                .city(request.getCity())
                .vehicleAvailable(request.isVehicleAvailable())
                .build();

        volunteerRepository.save(volunteer);

        // NEW
        eventPublisher.publishEvent(new UserRegisteredEvent(
                savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name()));

        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .build();
    }
}