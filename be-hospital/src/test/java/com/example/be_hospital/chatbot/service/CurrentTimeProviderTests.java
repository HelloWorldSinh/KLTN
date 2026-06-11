package com.example.be_hospital.chatbot.service;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CurrentTimeProviderTests {

    @Test
    void providesCurrentVietnameseDateTimeWithConfiguredZone() {
        Clock clock = Clock.fixed(
                Instant.parse("2026-06-10T08:49:12Z"),
                ZoneId.of("Asia/Ho_Chi_Minh"));

        CurrentTimeProvider provider = new CurrentTimeProvider(clock);

        assertEquals(
                "Thứ Tư, 10/06/2026 15:49:12 (Asia/Ho_Chi_Minh)",
                provider.currentContext());
        assertEquals(java.time.LocalDate.of(2026, 6, 10), provider.currentDate());
    }
}
