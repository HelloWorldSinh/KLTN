package com.example.be_hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BeHospitalApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeHospitalApplication.class, args);
	}
}