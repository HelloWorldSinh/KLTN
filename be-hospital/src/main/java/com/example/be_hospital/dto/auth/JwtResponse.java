package com.example.be_hospital.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String phone;
    private String role;
    private String fullName;

    public JwtResponse(String token, String phone, String role, String fullName) {
        this.token = token;
        this.phone = phone;
        this.role = role;
        this.fullName = fullName;
    }
}
