package com.example.be_hospital.repository;

import com.example.be_hospital.entity.PrescriptionDetail;
import com.example.be_hospital.entity.PrescriptionDetailId;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, PrescriptionDetailId> {

    void deleteByPrescriptionId(int prescriptionId);

    List<PrescriptionDetail> findByPrescriptionId(int prescriptionId);
}