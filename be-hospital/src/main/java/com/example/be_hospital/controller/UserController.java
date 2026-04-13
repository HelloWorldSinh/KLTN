package com.example.be_hospital.controller;

import com.example.be_hospital.dto.account.UserProfileRequest;
import com.example.be_hospital.dto.account.UserProfileResponse;
import com.example.be_hospital.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/profile")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'STAFF')")
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        String phone = principal.getName();
        UserProfileResponse profile = userService.getUserProfile(phone);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'STAFF')")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Principal principal,
            @RequestBody UserProfileRequest request) {
        String phone = principal.getName();
        UserProfileResponse updatedProfile = userService.updateUserProfile(phone, request);
        return ResponseEntity.ok(updatedProfile);
    }
}
