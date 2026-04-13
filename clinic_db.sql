CREATE TABLE `user` (
  `id` int PRIMARY KEY,
  `password` varchar(255) NOT NULL,
  `fullname` nvarchar NOT NULL,
  `email` varchar(255),
  `dob` date,
  `gender` nvarchar,
  `phone` varchar(255),
  `address` nvarchar,
  `role` varchar(255) NOT NULL,
  `created_at` datetime
);

CREATE TABLE `specialty` (
  `id` int PRIMARY KEY,
  `name` nvarchar UNIQUE NOT NULL,
  `description` nvarchar
);

CREATE TABLE `doctor_profile` (
  `user_id` int PRIMARY KEY,
  `specialty_id` int,
  `degree` nvarchar,
  `start_working_date` date
);

CREATE TABLE `medicine` (
  `id` int PRIMARY KEY,
  `name` nvarchar NOT NULL,
  `unit` nvarchar NOT NULL,
  `is_active` bool NOT NULL DEFAULT true
);

CREATE TABLE `prescription` (
  `examination_id` int PRIMARY KEY,
  `created_at` datetime
);

CREATE TABLE `prescription_detail` (
  `prescription_id` int,
  `medicine_id` int,
  `quantity` int,
  `dosage` nvarchar,
  PRIMARY KEY (`prescription_id`, `medicine_id`)
);

CREATE TABLE `notification` (
  `id` int PRIMARY KEY,
  `user_id` int NOT NULL,
  `title` nvarchar NOT NULL,
  `content` nvarchar,
  `is_read` bool NOT NULL,
  `created_at` datetime
);

CREATE TABLE `examination` (
  `appointment_id` int PRIMARY KEY,
  `diagnosis` nvarchar,
  `symptom` nvarchar,
  `created_at` datetime
);

CREATE TABLE `appointment` (
  `id` int PRIMARY KEY,
  `patient_id` int NOT NULL,
  `schedule_id` int NOT NULL,
  `status` ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'),
  `cancel_reason` nvarchar,
  `created_at` datetime
);

CREATE TABLE `schedule` (
  `id` int PRIMARY KEY,
  `doctor_id` int NOT NULL,
  `work_date` date,
  `start_time` time,
  `end_time` time,
  `slot` int,
  `room` nvarchar
);

ALTER TABLE `doctor_profile` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `doctor_profile` ADD FOREIGN KEY (`specialty_id`) REFERENCES `specialty` (`id`);

ALTER TABLE `notification` ADD FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

ALTER TABLE `prescription_detail` ADD FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`);

ALTER TABLE `prescription_detail` ADD FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`examination_id`);

ALTER TABLE `schedule` ADD FOREIGN KEY (`doctor_id`) REFERENCES `doctor_profile` (`user_id`);

ALTER TABLE `appointment` ADD FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`id`);

ALTER TABLE `examination` ADD FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`);

ALTER TABLE `prescription` ADD FOREIGN KEY (`examination_id`) REFERENCES `examination` (`appointment_id`);

ALTER TABLE `appointment` ADD FOREIGN KEY (`patient_id`) REFERENCES `user` (`id`);
