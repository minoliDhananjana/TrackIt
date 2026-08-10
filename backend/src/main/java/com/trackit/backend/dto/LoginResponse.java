package com.trackit.backend.dto;

import com.trackit.backend.enums.Role;

public class LoginResponse {

    private String token;
    private String userId;
    private String fullName;
    private String email;
    private Role role;

    public LoginResponse(
            String token,
            String userId,
            String fullName,
            String email,
            Role role
    ) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}