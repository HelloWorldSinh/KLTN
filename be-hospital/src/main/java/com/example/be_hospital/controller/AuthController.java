package com.example.be_hospital.controller;

import com.example.be_hospital.dto.auth.JwtResponse;
import com.example.be_hospital.dto.auth.LoginRequest;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.auth.SignupRequest;
import com.example.be_hospital.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseObject> registerPatient(@RequestBody SignupRequest signUpRequest) {
        ResponseObject response = authService.registerPatient(signUpRequest);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
