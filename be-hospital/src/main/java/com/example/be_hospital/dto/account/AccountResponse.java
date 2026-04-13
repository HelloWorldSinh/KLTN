package com.example.be_hospital.dto.account;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private int id;
    private String fullName;
    private String phone;
    private String role;
    private String password;
    private Integer specialtyId;
    private String degree;
    private LocalDate startWorkingDate;
}
