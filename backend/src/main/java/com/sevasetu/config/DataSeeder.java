package com.sevasetu.config;

import com.sevasetu.entity.User;
import com.sevasetu.enums.Role;
import com.sevasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("superadmin@sevasetu.org")) {
            User admin = User.builder()
                    .fullName("Seva Setu Super Admin")
                    .email("superadmin@sevasetu.org")
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .phone("0000000000")
                    .role(Role.SUPER_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }
    }
}