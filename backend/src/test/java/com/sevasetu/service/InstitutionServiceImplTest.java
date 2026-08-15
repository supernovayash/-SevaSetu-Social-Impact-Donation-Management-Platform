package com.sevasetu.service;

import com.sevasetu.dto.response.InstitutionResponse;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.User;
import com.sevasetu.enums.VerificationStatus;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InstitutionServiceImplTest {

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InstitutionServiceImpl institutionService;

    private User adminUser;
    private Institution institution;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .email("admin@hope.org")
                .fullName("Hope Admin")
                .build();

        institution = Institution.builder()
                .id(10L)
                .institutionName("Hope Organization")
                .registrationNumber("REG999")
                .address("10 Hope St")
                .city("Pune")
                .description("Charity organization")
                .verificationStatus(VerificationStatus.PENDING)
                .user(adminUser)
                .build();
    }

    @Test
    void getMyInstitution_Success() {
        when(userRepository.findByEmail("admin@hope.org")).thenReturn(Optional.of(adminUser));
        when(institutionRepository.findByUserId(1L)).thenReturn(Optional.of(institution));

        InstitutionResponse response = institutionService.getMyInstitution("admin@hope.org");

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getInstitutionName()).isEqualTo("Hope Organization");
        assertThat(response.getAdminEmail()).isEqualTo("admin@hope.org");
    }

    @Test
    void getMyInstitution_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("unknown@hope.org")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> institutionService.getMyInstitution("unknown@hope.org"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getPendingInstitutions_Success() {
        when(institutionRepository.findByVerificationStatus(VerificationStatus.PENDING))
                .thenReturn(List.of(institution));

        List<InstitutionResponse> results = institutionService.getPendingInstitutions();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getVerificationStatus()).isEqualTo(VerificationStatus.PENDING);
    }

    @Test
    void verifyInstitution_Approve_Success() {
        when(institutionRepository.findById(10L)).thenReturn(Optional.of(institution));
        when(institutionRepository.save(any(Institution.class))).thenAnswer(i -> i.getArgument(0));

        InstitutionResponse response = institutionService.verifyInstitution(10L, true);

        assertThat(response.getVerificationStatus()).isEqualTo(VerificationStatus.VERIFIED);
        verify(institutionRepository).save(institution);
    }

    @Test
    void verifyInstitution_Reject_Success() {
        when(institutionRepository.findById(10L)).thenReturn(Optional.of(institution));
        when(institutionRepository.save(any(Institution.class))).thenAnswer(i -> i.getArgument(0));

        InstitutionResponse response = institutionService.verifyInstitution(10L, false);

        assertThat(response.getVerificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        verify(institutionRepository).save(institution);
    }
}
