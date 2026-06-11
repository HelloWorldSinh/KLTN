package com.example.be_hospital.chatbot.tools;

import com.example.be_hospital.chatbot.dto.DoctorToolDto;
import com.example.be_hospital.chatbot.dto.ScheduleToolDto;
import com.example.be_hospital.chatbot.dto.SpecialtyToolDto;
import com.example.be_hospital.chatbot.service.CurrentTimeProvider;
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
    private final CurrentTimeProvider currentTimeProvider;

    @Tool("Danh sách chuyên khoa: id, name.")
    public List<SpecialtyToolDto> getSpecialties() {
        return specialtyService.getAllSpecialties().stream()
                .map(item -> new SpecialtyToolDto(item.getId(), item.getName()))
                .toList();
    }

    @Tool("Danh sách bác sĩ: id, name, specialtyId, degree.")
    public List<DoctorToolDto> getDoctors() {
        return adminService.getAllAccounts().stream()
                .filter(acc -> "DOCTOR".equalsIgnoreCase(acc.getRole()))
                .map(acc -> new DoctorToolDto(acc.getId(), acc.getFullName(), acc.getSpecialtyId(), acc.getDegree()))
                .collect(Collectors.toList());
    }

    @Tool("Lịch khám trống theo specialtyId, doctorId và dateString YYYY-MM-DD; tham số không dùng truyền null.")
    public List<ScheduleToolDto> getAvailableSchedules(Integer specialtyId, Integer doctorId, String dateString) {
        LocalDate date = (dateString != null && !dateString.isEmpty())
                ? LocalDate.parse(dateString)
                : currentTimeProvider.currentDate();
        return scheduleService.getAvailableSchedules(specialtyId, doctorId, date).stream()
                .limit(30)
                .map(schedule -> {
                    int appointmentCount = schedule.getAppointmentCount() == null ? 0 : schedule.getAppointmentCount();
                    return new ScheduleToolDto(
                            schedule.getDoctorId(),
                            schedule.getDoctorName(),
                            schedule.getWorkDate(),
                            schedule.getStartTime(),
                            schedule.getEndTime(),
                            schedule.getRoom(),
                            Math.max(0, schedule.getSlot() - appointmentCount));
                })
                .toList();
    }
}
