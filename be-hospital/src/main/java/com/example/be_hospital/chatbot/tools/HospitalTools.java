package com.example.be_hospital.chatbot.tools;

import com.example.be_hospital.dto.account.AccountResponse;
import com.example.be_hospital.dto.schedule.ScheduleDTO;
import com.example.be_hospital.dto.specialty.SpecialtyDTO;
import com.example.be_hospital.service.AdminService;
import com.example.be_hospital.service.ScheduleService;
import com.example.be_hospital.service.SpecialtyService;
import dev.langchain4j.agent.tool.Tool;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class HospitalTools {

    private final SpecialtyService specialtyService;
    private final AdminService adminService;
    private final ScheduleService scheduleService;

    @Tool("Lấy danh sách tất cả các chuyên khoa hiện có của bệnh viện/phòng khám.")
    public List<SpecialtyDTO> getSpecialties() {
        return specialtyService.getAllSpecialties();
    }

    @Tool("Lấy danh sách thông tin các bác sĩ, bao gồm ID bác sĩ (id), tên bác sĩ (fullName), chuyên khoa (specialtyId) và bằng cấp (degree).")
    public List<AccountResponse> getDoctors() {
        // Lọc ra các account có role là DOCTOR
        return adminService.getAllAccounts().stream()
                .filter(acc -> "DOCTOR".equalsIgnoreCase(acc.getRole()))
                .collect(Collectors.toList());
    }

    @Tool("Tra cứu lịch khám trống của một bác sĩ hoặc chuyên khoa. Cần truyền vào ID chuyên khoa (specialtyId), ID bác sĩ (doctorId), và ngày muốn khám (date định dạng YYYY-MM-DD). Nếu không biết chính xác, hãy truyền null.")
    public List<ScheduleDTO> getAvailableSchedules(Integer specialtyId, Integer doctorId, String dateString) {
        LocalDate date = (dateString != null && !dateString.isEmpty()) ? LocalDate.parse(dateString) : LocalDate.now();
        return scheduleService.getAvailableSchedules(specialtyId, doctorId, date);
    }
}