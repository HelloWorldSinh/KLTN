package com.example.be_hospital.dto.auth;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SignupRequest {
    private String fullName;
    private String phone;
    private LocalDate dob; // yyyy-mm-dd
    private String email;
    private String password;
    private String gender;
    private String address;
}
