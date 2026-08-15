package com.sevasetu.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/ping")
    public String ping() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return "Authenticated as: " + auth.getName() + " | Authorities: " + auth.getAuthorities();
    }

    @GetMapping("/api/test/institution-only")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    public String institutionOnly() {
        return "You are verified as INSTITUTION_ADMIN";
    }
}