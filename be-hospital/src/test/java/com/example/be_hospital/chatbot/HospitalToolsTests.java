package com.example.be_hospital.chatbot;

import com.example.be_hospital.chatbot.dto.DoctorToolDto;
import com.example.be_hospital.chatbot.dto.ScheduleToolDto;
import com.example.be_hospital.chatbot.dto.SpecialtyToolDto;
import com.example.be_hospital.chatbot.service.CurrentTimeProvider;
import com.example.be_hospital.chatbot.tools.HospitalTools;
import com.example.be_hospital.dto.account.AccountResponse;
import com.example.be_hospital.dto.schedule.ScheduleDTO;
import com.example.be_hospital.dto.specialty.SpecialtyDTO;
import com.example.be_hospital.service.AdminService;
import com.example.be_hospital.service.ScheduleService;
import com.example.be_hospital.service.SpecialtyService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HospitalToolsTests {

    private final SpecialtyService specialtyService = mock(SpecialtyService.class);
    private final AdminService adminService = mock(AdminService.class);
    private final ScheduleService scheduleService = mock(ScheduleService.class);
    private final CurrentTimeProvider currentTimeProvider = mock(CurrentTimeProvider.class);
    private final HospitalTools hospitalTools =
            new HospitalTools(specialtyService, adminService, scheduleService, currentTimeProvider);

    @Test
    void specialtiesExcludeLongDescription() {
        when(specialtyService.getAllSpecialties())
                .thenReturn(List.of(new SpecialtyDTO(4, "Nội khoa", "Mô tả rất dài không cần gửi cho LLM")));

        List<SpecialtyToolDto> result = hospitalTools.getSpecialties();

        assertEquals(new SpecialtyToolDto(4, "Nội khoa"), result.getFirst());
    }

    @Test
    void doctorsExcludeSensitiveAndUnusedAccountFields() {
        AccountResponse doctor = new AccountResponse(
                9, "Bác sĩ A", "0900000000", "DOCTOR", "secret-password", 4, "CKI", LocalDate.of(2020, 1, 1));
        when(adminService.getAllAccounts()).thenReturn(List.of(doctor));

        List<DoctorToolDto> result = hospitalTools.getDoctors();

        assertEquals(new DoctorToolDto(9, "Bác sĩ A", 4, "CKI"), result.getFirst());
        assertFalse(result.getFirst().toString().contains("secret-password"));
        assertFalse(result.getFirst().toString().contains("0900000000"));
    }

    @Test
    void schedulesOnlyExposeInformationNeededByPatient() {
        LocalDate date = LocalDate.now();
        ScheduleDTO schedule = new ScheduleDTO(
                12, 9, "Bác sĩ A", date, LocalTime.of(8, 0), LocalTime.of(9, 0),
                10, "P101", 3, "ACTIVE", "internal reason");
        when(scheduleService.getAvailableSchedules(isNull(), isNull(), any(LocalDate.class)))
                .thenReturn(List.of(schedule));

        List<ScheduleToolDto> result = hospitalTools.getAvailableSchedules(null, null, date.toString());

        assertEquals(new ScheduleToolDto(
                9, "Bác sĩ A", date, LocalTime.of(8, 0), LocalTime.of(9, 0), "P101", 7), result.getFirst());
        assertFalse(result.getFirst().toString().contains("internal reason"));
    }

    @Test
    void schedulesUseConfiguredCurrentDateWhenDateIsMissing() {
        LocalDate configuredToday = LocalDate.of(2026, 6, 10);
        when(currentTimeProvider.currentDate()).thenReturn(configuredToday);
        when(scheduleService.getAvailableSchedules(null, null, configuredToday)).thenReturn(List.of());

        hospitalTools.getAvailableSchedules(null, null, null);

        org.mockito.Mockito.verify(scheduleService)
                .getAvailableSchedules(null, null, configuredToday);
    }
}
