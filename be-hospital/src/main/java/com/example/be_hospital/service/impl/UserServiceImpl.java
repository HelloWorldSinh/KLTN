package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.account.UserProfileRequest;
import com.example.be_hospital.dto.account.UserProfileResponse;
import com.example.be_hospital.entity.DoctorProfile;
import com.example.be_hospital.entity.User;
import com.example.be_hospital.repository.DoctorProfileRepository;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Override
    public UserProfileResponse getUserProfile(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setDob(user.getDob());
        response.setGender(user.getGender());
        response.setAddress(user.getAddress());

        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Optional<DoctorProfile> doctorProfileOpt = doctorProfileRepository.findById(user.getId());
            if (doctorProfileOpt.isPresent()) {
                DoctorProfile doctorProfile = doctorProfileOpt.get();
                response.setSpecialtyId(doctorProfile.getSpecialtyId());
                response.setDegree(doctorProfile.getDegree());
                response.setStartWorkingDate(doctorProfile.getStartWorkingDate());
            }
        }

        return response;
    }

    @Override
    public UserProfileResponse updateUserProfile(String phone, UserProfileRequest request) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setDob(request.getDob());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        userRepository.save(user);

        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            DoctorProfile doctorProfile = doctorProfileRepository.findById(user.getId())
                    .orElse(new DoctorProfile());
            
            doctorProfile.setUserId(user.getId()); // In case it's a new profile
            if (request.getSpecialtyId() != null) {
                doctorProfile.setSpecialtyId(request.getSpecialtyId());
            }
            doctorProfile.setDegree(request.getDegree());
            doctorProfile.setStartWorkingDate(request.getStartWorkingDate());
            
            doctorProfileRepository.save(doctorProfile);
        }

        return getUserProfile(phone);
    }
}
