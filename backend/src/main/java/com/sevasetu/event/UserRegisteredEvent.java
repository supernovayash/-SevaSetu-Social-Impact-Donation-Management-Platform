package com.sevasetu.event;

import lombok.Getter;

@Getter
public class UserRegisteredEvent {
    private final String email;
    private final String fullName;
    private final String role;

    public UserRegisteredEvent(String email, String fullName, String role) {
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}