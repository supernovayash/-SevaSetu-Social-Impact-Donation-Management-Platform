package com.sevasetu.event;

import lombok.Getter;

@Getter
public class InstitutionVerifiedEvent {
    private final String email;
    private final String institutionName;
    private final boolean approved;

    public InstitutionVerifiedEvent(String email, String institutionName, boolean approved) {
        this.email = email;
        this.institutionName = institutionName;
        this.approved = approved;
    }
}