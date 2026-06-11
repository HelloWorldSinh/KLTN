package com.example.be_hospital.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class CurrentTimeProvider {

    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private static final Map<DayOfWeek, String> VIETNAMESE_DAYS = Map.of(
            DayOfWeek.MONDAY, "Thứ Hai",
            DayOfWeek.TUESDAY, "Thứ Ba",
            DayOfWeek.WEDNESDAY, "Thứ Tư",
            DayOfWeek.THURSDAY, "Thứ Năm",
            DayOfWeek.FRIDAY, "Thứ Sáu",
            DayOfWeek.SATURDAY, "Thứ Bảy",
            DayOfWeek.SUNDAY, "Chủ Nhật");

    private final Clock clock;

    @Autowired
    public CurrentTimeProvider(@Value("${app.time-zone:Asia/Ho_Chi_Minh}") String timeZone) {
        this.clock = Clock.system(ZoneId.of(timeZone));
    }

    CurrentTimeProvider(Clock clock) {
        this.clock = clock;
    }

    public String currentContext() {
        ZonedDateTime now = ZonedDateTime.now(clock);
        return "%s, %s (%s)".formatted(
                VIETNAMESE_DAYS.get(now.getDayOfWeek()),
                DATE_TIME_FORMAT.format(now),
                now.getZone().getId());
    }

    public LocalDate currentDate() {
        return LocalDate.now(clock);
    }
}
