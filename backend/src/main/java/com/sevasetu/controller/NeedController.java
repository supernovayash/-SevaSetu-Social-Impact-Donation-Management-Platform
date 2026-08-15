package com.sevasetu.controller;

import com.sevasetu.dto.request.NeedCreateRequest;
import com.sevasetu.dto.response.NeedResponse;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.UrgencyLevel;
import com.sevasetu.service.NeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/needs")
@RequiredArgsConstructor
public class NeedController {

    private final NeedService needService;

    @PostMapping
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<NeedResponse> createNeed(@Valid @RequestBody NeedCreateRequest request,
                                                   Authentication authentication) {
        NeedResponse response = needService.createNeed(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<NeedResponse> browseNeeds(
            @RequestParam(required = false) NeedCategory category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) UrgencyLevel urgencyLevel) {
        return needService.browseNeeds(category, city, urgencyLevel);
    }

    @GetMapping("/{id}")
    public NeedResponse getNeed(@PathVariable Long id) {
        return needService.getNeedById(id);
    }
}