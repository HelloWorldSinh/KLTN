package com.example.be_hospital.repository;

import com.example.be_hospital.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Integer> {
    boolean existsByName(String name);
    Optional<Specialty> findByName(String name);
}
