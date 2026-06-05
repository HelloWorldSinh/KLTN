package com.example.be_hospital.controller;

import com.example.be_hospital.dto.account.AccountRequest;
import com.example.be_hospital.dto.account.AccountResponse;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.admin.DashboardStatsResponse;
import com.example.be_hospital.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        return ResponseEntity.ok(adminService.getAllAccounts());
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseObject> createAccount(@RequestBody AccountRequest request) {
        ResponseObject response = adminService.createAccount(request);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseObject> updateAccount(@PathVariable int id, @RequestBody AccountRequest request) {
        ResponseObject response = adminService.updateAccount(id, request);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseObject> deleteAccount(@PathVariable int id) {
        ResponseObject response = adminService.deleteAccount(id);
        if (!response.isStatus()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
