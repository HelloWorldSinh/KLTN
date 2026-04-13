package com.example.be_hospital.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDetailId implements Serializable {
    private int prescriptionId;
    private int medicineId;
}
