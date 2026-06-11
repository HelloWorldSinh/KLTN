package com.example.be_hospital.chatbot.tools;

import com.example.be_hospital.chatbot.dto.DoctorToolDto;
import com.example.be_hospital.chatbot.dto.ScheduleToolDto;
import com.example.be_hospital.chatbot.dto.SpecialtyToolDto;
import com.example.be_hospital.chatbot.service.CurrentTimeProvider;
import com.example.be_hospital.service.AdminService;
import com.example.be_hospital.service.ScheduleService;
import com.example.be_hospital.service.SpecialtyService;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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

    @Tool("Danh sách bác sĩ: id, name, specialtyId, specialtyName, degree.")
    public List<DoctorToolDto> getDoctors() {
        Map<Integer, String> specialtyNames = specialtyNames();
        return adminService.getAllAccounts().stream()
                .filter(acc -> "DOCTOR".equalsIgnoreCase(acc.getRole()))
                .map(acc -> toDoctorToolDto(acc, specialtyNames))
                .collect(Collectors.toList());
    }

    @Tool("Tìm bác sĩ theo tên để biết id, specialtyId, specialtyName và degree. Trả danh sách rỗng nếu không tìm thấy.")
    public List<DoctorToolDto> findDoctorsByName(@P("Họ tên bác sĩ cần tìm") String doctorName) {
        String query = normalizedDoctorName(doctorName);
        if (query.isBlank()) {
            return List.of();
        }

        Map<Integer, String> specialtyNames = specialtyNames();
        return adminService.getAllAccounts().stream()
                .filter(acc -> "DOCTOR".equalsIgnoreCase(acc.getRole()))
                .filter(acc -> {
                    String candidate = normalizedDoctorName(acc.getFullName());
                    return candidate.contains(query) || query.contains(candidate);
                })
                .map(acc -> toDoctorToolDto(acc, specialtyNames))
                .toList();
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

    private Map<Integer, String> specialtyNames() {
        return specialtyService.getAllSpecialties().stream()
                .collect(Collectors.toMap(item -> item.getId(), item -> item.getName(), (first, second) -> first));
    }

    private DoctorToolDto toDoctorToolDto(
            com.example.be_hospital.dto.account.AccountResponse account,
            Map<Integer, String> specialtyNames) {
        return new DoctorToolDto(
                account.getId(),
                account.getFullName(),
                account.getSpecialtyId(),
                specialtyNames.get(account.getSpecialtyId()),
                account.getDegree());
    }

    private String normalizedDoctorName(String name) {
        if (name == null) {
            return "";
        }
        return Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .replaceFirst("^bac si\\s+", "")
                .trim();
    }
}
