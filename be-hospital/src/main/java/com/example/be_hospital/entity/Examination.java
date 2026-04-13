package com.example.be_hospital.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "examination")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Examination {

    @Id
    @Column(name = "appointment_id")
    private int appointmentId;

    private String diagnosis;
    private String symptom;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
