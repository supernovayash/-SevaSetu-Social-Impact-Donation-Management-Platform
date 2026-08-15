package com.sevasetu.service;

import com.sevasetu.dto.request.DonationCreateRequest;
import com.sevasetu.dto.response.DonationResponse;
import com.sevasetu.dto.response.DonationTimelineResponse;
import com.sevasetu.entity.Donation;
import com.sevasetu.entity.DonationEvent;
import com.sevasetu.entity.Institution;
import com.sevasetu.entity.Need;
import com.sevasetu.entity.User;
import com.sevasetu.enums.DonationStatus;
import com.sevasetu.enums.DonationType;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.NeedStatus;
import com.sevasetu.enums.Role;
import com.sevasetu.event.DonationStatusChangedEvent;
import com.sevasetu.exception.InvalidDonationStateException;
import com.sevasetu.exception.ResourceNotFoundException;
import com.sevasetu.repository.DonationEventRepository;
import com.sevasetu.repository.DonationRepository;
import com.sevasetu.repository.InstitutionRepository;
import com.sevasetu.repository.NeedRepository;
import com.sevasetu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationServiceImplTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationEventRepository donationEventRepository;

    @Mock
    private NeedRepository needRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DonationServiceImpl donationService;

    private User donor;
    private User admin;
    private Institution institution;
    private Need need;
    private Donation donation;

    @BeforeEach
    void setUp() {
        donor = User.builder()
                .id(1L)
                .email("donor@example.com")
                .fullName("John Donor")
                .role(Role.DONOR)
                .build();

        admin = User.builder()
                .id(2L)
                .email("admin@inst.org")
                .fullName("Admin User")
                .role(Role.INSTITUTION_ADMIN)
                .build();

        institution = Institution.builder()
                .id(10L)
                .institutionName("Hope NGO")
                .user(admin)
                .build();

        need = Need.builder()
                .id(100L)
                .institution(institution)
                .title("Medical Supplies")
                .quantityRequired(1000.0)
                .quantityFulfilled(0.0)
                .status(NeedStatus.OPEN)
                .build();

        donation = Donation.builder()
                .id(500L)
                .donor(donor)
                .need(need)
                .type(DonationType.MONEY)
                .amount(500.0)
                .status(DonationStatus.PLEDGED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createDonation_Money_Success() {
        DonationCreateRequest request = new DonationCreateRequest();
        request.setNeedId(100L);
        request.setType(DonationType.MONEY);
        request.setAmount(500.0);

        when(userRepository.findByEmail("donor@example.com")).thenReturn(Optional.of(donor));
        when(needRepository.findById(100L)).thenReturn(Optional.of(need));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);

        DonationResponse response = donationService.createDonation("donor@example.com", request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(500L);
        assertThat(response.getAmount()).isEqualTo(500.0);
        assertThat(response.getStatus()).isEqualTo(DonationStatus.PLEDGED);
        verify(donationEventRepository).save(any(DonationEvent.class));
    }

    @Test
    void createDonation_Goods_MissingQuantity_ThrowsException() {
        DonationCreateRequest request = new DonationCreateRequest();
        request.setType(DonationType.GOODS);
        request.setQuantity(null);

        when(userRepository.findByEmail("donor@example.com")).thenReturn(Optional.of(donor));

        assertThatThrownBy(() -> donationService.createDonation("donor@example.com", request))
                .isInstanceOf(InvalidDonationStateException.class)
                .hasMessageContaining("Quantity is required for a GOODS donation");
    }

    @Test
    void createDonation_OpenDonation_MissingCategory_ThrowsException() {
        DonationCreateRequest request = new DonationCreateRequest();
        request.setNeedId(null);
        request.setType(DonationType.MONEY);
        request.setAmount(100.0);
        // category & description not set

        when(userRepository.findByEmail("donor@example.com")).thenReturn(Optional.of(donor));

        assertThatThrownBy(() -> donationService.createDonation("donor@example.com", request))
                .isInstanceOf(InvalidDonationStateException.class)
                .hasMessageContaining("Open donations (no linked need) require a category and description");
    }

    @Test
    void updateStatus_Confirmed_FulfillsNeedPartially() {
        when(userRepository.findByEmail("admin@inst.org")).thenReturn(Optional.of(admin));
        when(donationRepository.findById(500L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);

        DonationResponse response = donationService.updateStatus(500L, DonationStatus.CONFIRMED, "Payment confirmed", "admin@inst.org");

        assertThat(response).isNotNull();
        assertThat(need.getQuantityFulfilled()).isEqualTo(500.0);
        assertThat(need.getStatus()).isEqualTo(NeedStatus.PARTIALLY_FULFILLED);
        verify(needRepository).save(need);
        verify(eventPublisher).publishEvent(any(DonationStatusChangedEvent.class));
    }

    @Test
    void updateStatus_Confirmed_FulfillsNeedCompletely() {
        need.setQuantityRequired(500.0);
        need.setQuantityFulfilled(0.0);

        when(userRepository.findByEmail("admin@inst.org")).thenReturn(Optional.of(admin));
        when(donationRepository.findById(500L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);

        donationService.updateStatus(500L, DonationStatus.CONFIRMED, "Full payment", "admin@inst.org");

        assertThat(need.getQuantityFulfilled()).isEqualTo(500.0);
        assertThat(need.getStatus()).isEqualTo(NeedStatus.FULFILLED);
    }

    @Test
    void claimOpenDonation_Success() {
        Donation openDonation = Donation.builder()
                .id(600L)
                .donor(donor)
                .need(null)
                .institution(institution)
                .type(DonationType.MONEY)
                .amount(1000.0)
                .category(NeedCategory.OTHER)
                .description("Open fund")
                .status(DonationStatus.CONFIRMED)
                .build();

        when(userRepository.findByEmail("admin@inst.org")).thenReturn(Optional.of(admin));
        when(institutionRepository.findByUserId(2L)).thenReturn(Optional.of(institution));
        when(donationRepository.claimOpenDonation(600L, institution)).thenReturn(1);
        when(donationRepository.findById(600L)).thenReturn(Optional.of(openDonation));

        DonationResponse response = donationService.claimOpenDonation(600L, "admin@inst.org");

        assertThat(response).isNotNull();
        verify(eventPublisher).publishEvent(any(DonationStatusChangedEvent.class));
    }

    @Test
    void claimOpenDonation_NotAvailable_ThrowsException() {
        when(userRepository.findByEmail("admin@inst.org")).thenReturn(Optional.of(admin));
        when(institutionRepository.findByUserId(2L)).thenReturn(Optional.of(institution));
        when(donationRepository.claimOpenDonation(600L, institution)).thenReturn(0);

        assertThatThrownBy(() -> donationService.claimOpenDonation(600L, "admin@inst.org"))
                .isInstanceOf(InvalidDonationStateException.class)
                .hasMessageContaining("This donation is no longer available");
    }

    @Test
    void getTimeline_Success() {
        DonationEvent event1 = DonationEvent.builder()
                .donation(donation)
                .status(DonationStatus.PLEDGED)
                .note("Pledged by donor")
                .actorName("John Donor")
                .actorRole(Role.DONOR)
                .timestamp(LocalDateTime.now().minusDays(1))
                .build();

        when(donationRepository.findById(500L)).thenReturn(Optional.of(donation));
        when(donationEventRepository.findByDonationIdOrderByTimestampAsc(500L)).thenReturn(List.of(event1));

        DonationTimelineResponse timeline = donationService.getTimeline(500L);

        assertThat(timeline).isNotNull();
        assertThat(timeline.getDonationId()).isEqualTo(500L);
        assertThat(timeline.getEvents()).hasSize(1);
        assertThat(timeline.getEvents().get(0).getNote()).isEqualTo("Pledged by donor");
    }
}
