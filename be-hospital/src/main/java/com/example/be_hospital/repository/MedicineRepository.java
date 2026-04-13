package com.example.be_hospital.repository;

import com.example.be_hospital.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Integer> {
    boolean existsByName(String name);
}
