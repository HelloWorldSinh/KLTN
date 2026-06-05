package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.doctor.DoctorResponse;
import com.example.be_hospital.entity.User;
import com.example.be_hospital.entity.DoctorProfile;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.repository.DoctorProfileRepository;
import com.example.be_hospital.repository.SpecialtyRepository;
import com.example.be_hospital.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    public List<DoctorResponse> getAllDoctors() {
        List<User> doctors = userRepository.findByRoleIn(List.of("DOCTOR"));

        return doctors.stream().map(this::mapToDoctorResponse).collect(Collectors.toList());
    }

    @Override
    public DoctorResponse getDoctorById(int id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null || !"DOCTOR".equalsIgnoreCase(user.getRole())) {
            return null;
        }
        return mapToDoctorResponse(user);
    }

    private DoctorResponse mapToDoctorResponse(User user) {
        DoctorResponse response = new DoctorResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setEmail(user.getEmail());
        response.setDob(user.getDob());
        response.setGender(user.getGender());
        response.setAddress(user.getAddress());

        Optional<DoctorProfile> profileOpt = doctorProfileRepository.findById(user.getId());
        if (profileOpt.isPresent()) {
            DoctorProfile profile = profileOpt.get();
            response.setSpecialtyId(profile.getSpecialtyId());
            response.setDegree(profile.getDegree());
            response.setStartWorkingDate(profile.getStartWorkingDate());

            specialtyRepository.findById(profile.getSpecialtyId()).ifPresent(specialty -> {
                response.setSpecialtyName(specialty.getName());
            });
        }

        return response;
    }
}
