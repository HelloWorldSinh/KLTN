package com.example.be_hospital.dto.specialty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SpecialtyDTO {
    private Integer id;
    private String name;
    private String description;
}
