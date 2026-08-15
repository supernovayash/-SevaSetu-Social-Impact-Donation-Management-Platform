package com.sevasetu.service;

import com.sevasetu.dto.request.NeedCreateRequest;
import com.sevasetu.dto.response.NeedResponse;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.Need;
import com.sevasetu.entity.User;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.UrgencyLevel;
import com.sevasetu.enums.VerificationStatus;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.exception.UnauthorizedActionException;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.NeedRepository;
import com.sevasetu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NeedServiceImplTest {

    @Mock
    private NeedRepository needRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NeedServiceImpl needService;

    private User instAdmin;
    private Institution institution;
    private Need need;

    @BeforeEach
    void setUp() {
        instAdmin = User.builder()
                .id(1L)
                .email("admin@inst.org")
                .fullName("Admin User")
                .build();

        institution = Institution.builder()
                .id(10L)
                .institutionName("Test Orphanage")
                .user(instAdmin)
                .verificationStatus(VerificationStatus.VERIFIED)
                .build();

        need = Need.builder()
                .id(100L)
                .institution(institution)
                .title("Winter Clothes")
                .description("Need 50 jackets")
                .category(NeedCategory.CLOTHES)
                .urgencyLevel(UrgencyLevel.CRITICAL)
                .quantityRequired(50.0)
                .quantityFulfilled(0.0)
                .unit("jackets")
                .status(NeedStatus.OPEN)
                .city("Delhi")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createNeed_Success() {
        NeedCreateRequest request = new NeedCreateRequest();
        request.setTitle("Winter Clothes");
        request.setDescription("Need 50 jackets");
        request.setCategory(NeedCategory.CLOTHES);
        request.setUrgencyLevel(UrgencyLevel.CRITICAL);
        request.setQuantityRequired(50.0);
        request.setUnit("jackets");
        request.setCity("Delhi");

        when(userRepository.findByEmail("admin@inst.org")).thenReturn(Optional.of(instAdmin));
        when(institutionRepository.findByUserId(1L)).thenReturn(Optional.of(institution));
        when(needRepository.save(any(Need.class))).thenReturn(need);

        NeedResponse response = needService.createNeed("admin@inst.org", request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Winter Clothes");
        assertThat(response.getInstitutionName()).isEqualTo("Test Orphanage");
        assertThat(response.getStatus()).isEqualTo(NeedStatus.OPEN);
        verify(needRepository).save(any(Need.class));
    }

    @Test
    void createNeed_UnverifiedInstitution_ThrowsException() {
        institution.setVerificationStatus(VerificationStatus.PENDING);

        NeedCreateRequest request = new NeedCreateRequest();
        request.setTitle("Winter Clothes");

        when(userRepository.findByEmail("admin@inst.org")).thenReturn(Optional.of(instAdmin));
        when(institutionRepository.findByUserId(1L)).thenReturn(Optional.of(institution));

        assertThatThrownBy(() -> needService.createNeed("admin@inst.org", request))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("Institution must be verified before posting a need");
    }

    @Test
    void createNeed_UserNotFound_ThrowsException() {
        NeedCreateRequest request = new NeedCreateRequest();

        when(userRepository.findByEmail("unknown@inst.org")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> needService.createNeed("unknown@inst.org", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void browseNeeds_Success() {
        Need need2 = Need.builder()
                .id(101L)
                .institution(institution)
                .title("Food Supplies")
                .urgencyLevel(UrgencyLevel.LOW)
                .quantityRequired(100.0)
                .quantityFulfilled(0.0)
                .status(NeedStatus.OPEN)
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        when(needRepository.browseNeeds(any(), eq(NeedCategory.CLOTHES), eq("Delhi"), eq(UrgencyLevel.CRITICAL)))
                .thenReturn(List.of(need2, need));

        List<NeedResponse> results = needService.browseNeeds(NeedCategory.CLOTHES, "Delhi", UrgencyLevel.CRITICAL);

        assertThat(results).hasSize(2);
        // Sorted by UrgencyLevel (CRITICAL before LOW)
        assertThat(results.get(0).getUrgencyLevel()).isEqualTo(UrgencyLevel.CRITICAL);
        assertThat(results.get(1).getUrgencyLevel()).isEqualTo(UrgencyLevel.LOW);
    }

    @Test
    void getNeedById_Success() {
        when(needRepository.findById(100L)).thenReturn(Optional.of(need));

        NeedResponse response = needService.getNeedById(100L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Winter Clothes");
    }

    @Test
    void getNeedById_NotFound_ThrowsException() {
        when(needRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> needService.getNeedById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Need not found");
    }
}
