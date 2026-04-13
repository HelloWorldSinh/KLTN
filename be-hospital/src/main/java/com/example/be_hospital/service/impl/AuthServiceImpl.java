package com.example.be_hospital.service.impl;

import com.example.be_hospital.dto.auth.JwtResponse;
import com.example.be_hospital.dto.auth.LoginRequest;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.auth.SignupRequest;
import com.example.be_hospital.entity.User;
import com.example.be_hospital.repository.UserRepository;
import com.example.be_hospital.security.JwtUtils;
import com.example.be_hospital.security.UserDetailsImpl;
import com.example.be_hospital.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getPhone(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(authentication);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.startsWith("ROLE_") ? auth.substring(5) : auth)
                .orElse("PATIENT");

        return new JwtResponse(jwt, loginRequest.getPhone(), role, userDetails.getFullName());
    }

    @Override
    public ResponseObject registerPatient(SignupRequest signUpRequest) {
        if (userRepository.existsByPhone(signUpRequest.getPhone())) {
            return new ResponseObject(false, "Lỗi: Số điện thoại đã được sử dụng!");
        }

        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setDob(signUpRequest.getDob());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        user.setRole("PATIENT");

        userRepository.save(user);

        return new ResponseObject(true, "Đăng ký tài khoản Bệnh nhân thành công!");
    }
}
