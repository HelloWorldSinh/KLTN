package com.example.be_hospital.dto.account;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private int id;
    private String phone;
    private String role;
    
    // User fields
    private String fullName;
    private String email;
    private LocalDate dob;
    private String gender;
    private String address;

    // Doctor specific fields
    private Integer specialtyId;
    private String degree;
    private LocalDate startWorkingDate;
}
