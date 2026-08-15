package com.sevasetu.service;

import com.sevasetu.dto.response.InstitutionResponse;

import java.util.List;

public interface InstitutionService {
    InstitutionResponse getMyInstitution(String email);
    List<InstitutionResponse> getPendingInstitutions();
    InstitutionResponse verifyInstitution(Long institutionId, boolean approve);
}