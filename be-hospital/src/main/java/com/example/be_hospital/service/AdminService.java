package com.example.be_hospital.service;

import com.example.be_hospital.dto.account.AccountRequest;
import com.example.be_hospital.dto.account.AccountResponse;
import com.example.be_hospital.dto.ResponseObject;
import com.example.be_hospital.dto.admin.DashboardStatsResponse;

import java.util.List;

public interface AdminService {
    List<AccountResponse> getAllAccounts();
    ResponseObject createAccount(AccountRequest request);
    ResponseObject updateAccount(int id, AccountRequest request);
    ResponseObject deleteAccount(int id);
    DashboardStatsResponse getDashboardStats();
}
