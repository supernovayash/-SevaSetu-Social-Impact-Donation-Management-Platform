// service/NeedService.java
package com.sevasetu.service;

import com.sevasetu.dto.request.NeedCreateRequest;
import com.sevasetu.dto.response.NeedResponse;
import com.sevasetu.enums.NeedCategory;
import com.sevasetu.enums.UrgencyLevel;

import java.util.List;

public interface NeedService {
    NeedResponse createNeed(String institutionAdminEmail, NeedCreateRequest request);
    List<NeedResponse> browseNeeds(NeedCategory category, String city, UrgencyLevel urgencyLevel);
    NeedResponse getNeedById(Long id);
}