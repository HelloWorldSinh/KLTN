package com.example.be_hospital.service;

import com.example.be_hospital.dto.account.UserProfileRequest;
import com.example.be_hospital.dto.account.UserProfileResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String phone);
    UserProfileResponse updateUserProfile(String phone, UserProfileRequest request);
}
