package com.example.be_hospital.security;

import com.example.be_hospital.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {
    private final String phone;
    private final String password;
    private final String fullName;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String phone, String password, String fullName,
            Collection<? extends GrantedAuthority> authorities) {
        this.phone = phone;
        this.password = password;
        this.fullName = fullName;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        String roleStr = user.getRole().toUpperCase().trim();
        if (!roleStr.startsWith("ROLE_")) {
            roleStr = "ROLE_" + roleStr;
        }
        GrantedAuthority authority = new SimpleGrantedAuthority(roleStr);

        return new UserDetailsImpl(
                user.getPhone(),
                user.getPassword(),
                user.getFullName(),
                Collections.singletonList(authority));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return phone;
    }

    public String getFullName() {
        return fullName;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
