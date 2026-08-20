package com.sevasetu.config;

import com.sevasetu.entity.*;
import com.sevasetu.enums.*;
import com.sevasetu.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final NeedRepository needRepository;
    private final DonationRepository donationRepository;
    private final VolunteerRepository volunteerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsersAndInstitutions();
        seedNeeds();
        seedDonations();
    }

    private void seedUsersAndInstitutions() {
        // 1. Super Admin
        if (!userRepository.existsByEmail("superadmin@sevasetu.org")) {
            User admin = User.builder()
                    .fullName("Seva Setu Super Admin")
                    .email("superadmin@sevasetu.org")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .phone("9876543210")
                    .role(Role.SUPER_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded Super Admin user: superadmin@sevasetu.org");
        }

        // 2. NGO Admin 1 & Institution 1
        if (!userRepository.existsByEmail("sunshine@ngo.org")) {
            User ngoUser1 = User.builder()
                    .fullName("Sunshine Foundation Admin")
                    .email("sunshine@ngo.org")
                    .passwordHash(passwordEncoder.encode("Ngo@12345"))
                    .phone("9811122233")
                    .role(Role.INSTITUTION_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(ngoUser1);

            Institution inst1 = Institution.builder()
                    .user(ngoUser1)
                    .institutionName("Sunshine Children Home & Orphanage")
                    .registrationNumber("REG-IND-2024-001")
                    .address("12 Gandhi Marg, Bandra West")
                    .city("Mumbai")
                    .description("Providing shelter, education, and nutrition to underprivileged orphans and street children.")
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .build();
            institutionRepository.save(inst1);
            log.info("Seeded Verified Institution: Sunshine Children Home");
        }

        // 3. NGO Admin 2 & Institution 2
        if (!userRepository.existsByEmail("carenet@ngo.org")) {
            User ngoUser2 = User.builder()
                    .fullName("CareNet Health Admin")
                    .email("carenet@ngo.org")
                    .passwordHash(passwordEncoder.encode("Ngo@12345"))
                    .phone("9822233344")
                    .role(Role.INSTITUTION_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(ngoUser2);

            Institution inst2 = Institution.builder()
                    .user(ngoUser2)
                    .institutionName("CareNet Community Health Society")
                    .registrationNumber("REG-IND-2024-002")
                    .address("45 Healthcare Enclave, Connaught Place")
                    .city("Delhi")
                    .description("Delivering free healthcare, emergency medical kits, and medical aid to vulnerable communities.")
                    .verificationStatus(VerificationStatus.VERIFIED)
                    .build();
            institutionRepository.save(inst2);
            log.info("Seeded Verified Institution: CareNet Community Health Society");
        }

        // 4. NGO Admin 3 & Institution 3 (Pending Verification)
        if (!userRepository.existsByEmail("hopelearning@ngo.org")) {
            User ngoUser3 = User.builder()
                    .fullName("Hope Learning Admin")
                    .email("hopelearning@ngo.org")
                    .passwordHash(passwordEncoder.encode("Ngo@12345"))
                    .phone("9833344455")
                    .role(Role.INSTITUTION_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(ngoUser3);

            Institution inst3 = Institution.builder()
                    .user(ngoUser3)
                    .institutionName("Hope Learning & Youth Center")
                    .registrationNumber("REG-IND-2024-003")
                    .address("78 Vidya Layout, Indiranagar")
                    .city("Bangalore")
                    .description("Empowering rural youth through digital literacy, computer skills, and mentorship programs.")
                    .verificationStatus(VerificationStatus.PENDING)
                    .build();
            institutionRepository.save(inst3);
            log.info("Seeded Pending Institution: Hope Learning & Youth Center");
        }

        // 5. Donor 1
        if (!userRepository.existsByEmail("aarav.sharma@gmail.com")) {
            User donor1 = User.builder()
                    .fullName("Aarav Sharma")
                    .email("aarav.sharma@gmail.com")
                    .passwordHash(passwordEncoder.encode("Donor@12345"))
                    .phone("9988776655")
                    .role(Role.DONOR)
                    .enabled(true)
                    .build();
            userRepository.save(donor1);
            log.info("Seeded Donor: aarav.sharma@gmail.com");
        }

        // 6. Donor 2
        if (!userRepository.existsByEmail("ananya.patel@gmail.com")) {
            User donor2 = User.builder()
                    .fullName("Ananya Patel")
                    .email("ananya.patel@gmail.com")
                    .passwordHash(passwordEncoder.encode("Donor@12345"))
                    .phone("9977665544")
                    .role(Role.DONOR)
                    .enabled(true)
                    .build();
            userRepository.save(donor2);
            log.info("Seeded Donor: ananya.patel@gmail.com");
        }

        // 7. Volunteer 1
        if (!userRepository.existsByEmail("rohit.kumar@gmail.com")) {
            User volUser = User.builder()
                    .fullName("Rohit Kumar")
                    .email("rohit.kumar@gmail.com")
                    .passwordHash(passwordEncoder.encode("Volunteer@12345"))
                    .phone("9966554433")
                    .role(Role.VOLUNTEER)
                    .enabled(true)
                    .build();
            userRepository.save(volUser);

            Volunteer volunteer = Volunteer.builder()
                    .user(volUser)
                    .city("Mumbai")
                    .vehicleAvailable(true)
                    .build();
            volunteerRepository.save(volunteer);
            log.info("Seeded Volunteer: rohit.kumar@gmail.com");
        }
    }

    private void seedNeeds() {
        if (needRepository.count() > 0) {
            return;
        }

        userRepository.findByEmail("sunshine@ngo.org").ifPresent(ngoUser1 -> {
            institutionRepository.findByUserId(ngoUser1.getId()).ifPresent(inst1 -> {
                Need need1 = Need.builder()
                        .institution(inst1)
                        .title("Educational Textbooks & Stationery for 50 Kids")
                        .description("Support children in continuing their school education with complete textbook sets, notebooks, pens, and school bags.")
                        .category(NeedCategory.BOOKS)
                        .urgencyLevel(UrgencyLevel.MODERATE)
                        .quantityRequired(50000.0)
                        .quantityFulfilled(15000.0)
                        .unit("INR")
                        .status(NeedStatus.PARTIALLY_FULFILLED)
                        .city("Mumbai")
                        .build();
                needRepository.save(need1);

                Need need2 = Need.builder()
                        .institution(inst1)
                        .title("Nutritious Monthly Ration & Food Supplies")
                        .description("Funding needed to procure rice, pulses, cooking oil, and fresh vegetables for 80 resident orphans for one month.")
                        .category(NeedCategory.FOOD)
                        .urgencyLevel(UrgencyLevel.CRITICAL)
                        .quantityRequired(30000.0)
                        .quantityFulfilled(0.0)
                        .unit("INR")
                        .status(NeedStatus.OPEN)
                        .city("Mumbai")
                        .build();
                needRepository.save(need2);
            });
        });

        userRepository.findByEmail("carenet@ngo.org").ifPresent(ngoUser2 -> {
            institutionRepository.findByUserId(ngoUser2.getId()).ifPresent(inst2 -> {
                Need need3 = Need.builder()
                        .institution(inst2)
                        .title("Emergency Medical Kits & Dialysis Assistance Fund")
                        .description("Help cover emergency medication and essential health support for low-income patients suffering from critical conditions.")
                        .category(NeedCategory.MEDICAL)
                        .urgencyLevel(UrgencyLevel.CRITICAL)
                        .quantityRequired(120000.0)
                        .quantityFulfilled(60000.0)
                        .unit("INR")
                        .status(NeedStatus.PARTIALLY_FULFILLED)
                        .city("Delhi")
                        .build();
                needRepository.save(need3);

                Need need4 = Need.builder()
                        .institution(inst2)
                        .title("Warm Blankets Drive for Homeless Elderly")
                        .description("Distributing heavy wool blankets and warm winter clothing sets to elderly citizens living on street shelters.")
                        .category(NeedCategory.CLOTHES)
                        .urgencyLevel(UrgencyLevel.MODERATE)
                        .quantityRequired(200.0)
                        .quantityFulfilled(50.0)
                        .unit("Pieces")
                        .status(NeedStatus.PARTIALLY_FULFILLED)
                        .city("Delhi")
                        .build();
                needRepository.save(need4);
            });
        });

        userRepository.findByEmail("hopelearning@ngo.org").ifPresent(ngoUser3 -> {
            institutionRepository.findByUserId(ngoUser3.getId()).ifPresent(inst3 -> {
                Need need5 = Need.builder()
                        .institution(inst3)
                        .title("Desktop Computers for Rural Student Lab")
                        .description("Setting up a basic computer lab with refurbished desktop computers for high school students in rural learning centers.")
                        .category(NeedCategory.OTHER)
                        .urgencyLevel(UrgencyLevel.LOW)
                        .quantityRequired(80000.0)
                        .quantityFulfilled(0.0)
                        .unit("INR")
                        .status(NeedStatus.OPEN)
                        .city("Bangalore")
                        .build();
                needRepository.save(need5);
            });
        });

        log.info("Seeded 5 sample needs across institutions.");
    }

    private void seedDonations() {
        if (donationRepository.count() > 0) {
            return;
        }

        User donor1 = userRepository.findByEmail("aarav.sharma@gmail.com").orElse(null);
        User donor2 = userRepository.findByEmail("ananya.patel@gmail.com").orElse(null);

        if (donor1 != null) {
            needRepository.findAll().stream()
                    .filter(n -> n.getCategory() == NeedCategory.BOOKS)
                    .findFirst()
                    .ifPresent(needBooks -> {
                        Donation donation1 = Donation.builder()
                                .donor(donor1)
                                .need(needBooks)
                                .type(DonationType.MONEY)
                                .amount(15000.0)
                                .quantity(15000.0)
                                .unit("INR")
                                .status(DonationStatus.CONFIRMED)
                                .description("Donated for educational books and stationery.")
                                .build();
                        donationRepository.save(donation1);
                    });
        }

        if (donor2 != null) {
            needRepository.findAll().stream()
                    .filter(n -> n.getCategory() == NeedCategory.MEDICAL)
                    .findFirst()
                    .ifPresent(needMedical -> {
                        Donation donation2 = Donation.builder()
                                .donor(donor2)
                                .need(needMedical)
                                .type(DonationType.MONEY)
                                .amount(60000.0)
                                .quantity(60000.0)
                                .unit("INR")
                                .status(DonationStatus.CONFIRMED)
                                .description("Medical aid contribution.")
                                .build();
                        donationRepository.save(donation2);
                    });
        }

        log.info("Seeded initial sample donations.");
    }
}