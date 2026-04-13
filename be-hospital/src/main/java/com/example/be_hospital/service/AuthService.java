package com.example.be_hospital.service;

import com.example.be_hospital.dto.auth.JwtResponse;
import com.example.be_hospital.dto.auth.LoginRequest;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.auth.SignupRequest;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    ResponseObject registerPatient(SignupRequest signUpRequest);
}
