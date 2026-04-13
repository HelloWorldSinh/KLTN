package com.example.be_hospital.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "prescription_detail")
@IdClass(PrescriptionDetailId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDetail {

    @Id
    @Column(name = "prescription_id")
    private int prescriptionId;

    @Id
    @Column(name = "medicine_id")
    private int medicineId;

    private int quantity;
    private String dosage;
}