SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timetable_id` int NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late') NOT NULL,
  `marked_by` int NOT NULL,
  `mo_lat` double DEFAULT NULL,
  `mo_lng` double DEFAULT NULL,
  `location_verified` tinyint(1) DEFAULT '0',
  `time_verified` tinyint(1) DEFAULT '0',
  `marked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `substitute_teacher_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `timetable_id` (`timetable_id`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`timetable_id`) REFERENCES `timetable` (`id`),
  CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `attendance` VALUES 
(2, 2, '2026-09-28 00:00:00', 'present', 16, 31.7121343, 73.9617137, 1, 1, '2026-09-28 12:12:45', NULL),
(3, 1, '2026-09-28 00:00:00', 'present', 16, 31.7121288, 73.9617105, 1, 1, '2026-09-28 12:12:53', NULL),
(7, 5, '2026-09-28 00:00:00', 'present', 16, 31.7127928, 73.9615459, 1, 1, '2026-09-28 12:13:58', NULL),
(8, 4, '2026-09-28 00:00:00', 'present', 16, 31.7129202, 73.9617543, 1, 1, '2026-09-28 12:15:31', NULL),
(9, 3, '2026-09-28 00:00:00', 'present', 16, 31.7130905, 73.9616045, 1, 1, '2026-09-28 12:16:33', NULL);

DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int NOT NULL,
  `complaint_text` text NOT NULL,
  `status` enum('pending','resolved','rejected') DEFAULT 'pending',
  `created_date` date DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `complaints` VALUES 
(2, 25, 'Hhh', 'resolved', '2026-09-28 00:00:00', '2026-09-28 00:00:00'),
(3, 25, 'hi \nm Haffsa\nma present thi \neman na jan boojh ka absent kiya\nbadla liya us na', 'rejected', '2026-09-28 00:00:00', '2026-09-28 00:00:00');

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dept_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dept_name` (`dept_name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `departments` VALUES 
(26, 'Arabic'),
(2, 'BSCS'),
(17, 'Chemistry'),
(10, 'Economics'),
(21, 'Education'),
(6, 'English'),
(18, 'Geography'),
(20, 'Health and Physical Education'),
(27, 'History'),
(8, 'Islamic Studies'),
(1, 'IT'),
(3, 'Math'),
(28, 'Pakistan studies'),
(23, 'Persian'),
(19, 'Philphospy'),
(4, 'Physics'),
(11, 'Political Science'),
(22, 'Psychology'),
(25, 'Sociology'),
(24, 'Statistics'),
(7, 'Urdu'),
(15, 'Zoology');

DROP TABLE IF EXISTS `duty_assignments`;
CREATE TABLE `duty_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `official_id` int NOT NULL,
  `department_id` int NOT NULL,
  `shift` varchar(20) NOT NULL,
  `duty_date` date NOT NULL,
  `assigned_by` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `official_id` (`official_id`),
  KEY `department_id` (`department_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `duty_assignments_ibfk_1` FOREIGN KEY (`official_id`) REFERENCES `users` (`id`),
  CONSTRAINT `duty_assignments_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `duty_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=285 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `duty_assignments` VALUES 
(172, 16, 1, '1st Shift', '2026-09-09 00:00:00', 1),
(173, 16, 3, '1st Shift', '2026-09-09 00:00:00', 1),
(174, 16, 4, '1st Shift', '2026-09-09 00:00:00', 1),
(175, 16, 1, '2nd Shift', '2026-09-09 00:00:00', 1),
(176, 16, 3, '2nd Shift', '2026-09-09 00:00:00', 1),
(177, 16, 4, '2nd Shift', '2026-09-09 00:00:00', 1),
(191, 16, 3, '1st Shift', '2026-09-11 00:00:00', 1),
(192, 16, 2, '1st Shift', '2026-09-11 00:00:00', 1),
(199, 16, 2, '1st Shift', '2026-09-12 00:00:00', 1),
(200, 16, 17, '1st Shift', '2026-09-12 00:00:00', 1),
(201, 16, 10, '1st Shift', '2026-09-12 00:00:00', 1),
(232, 16, 3, '1st Shift', '2026-09-14 00:00:00', 1),
(233, 16, 1, '1st Shift', '2026-09-14 00:00:00', 1),
(234, 16, 3, '2nd Shift', '2026-09-14 00:00:00', 1),
(235, 16, 1, '2nd Shift', '2026-09-14 00:00:00', 1),
(240, 16, 1, '1st Shift', '2026-09-15 00:00:00', 1),
(241, 16, 2, '1st Shift', '2026-09-15 00:00:00', 1),
(242, 16, 6, '1st Shift', '2026-09-15 00:00:00', 1),
(243, 16, 3, '1st Shift', '2026-09-15 00:00:00', 1),
(253, 16, 1, '1st Shift', '2026-09-19 00:00:00', 1),
(254, 16, 3, '1st Shift', '2026-09-19 00:00:00', 1),
(255, 16, 4, '1st Shift', '2026-09-19 00:00:00', 1),
(256, 16, 17, '1st Shift', '2026-09-19 00:00:00', 1),
(257, 16, 1, '2nd Shift', '2026-09-19 00:00:00', 1),
(258, 16, 3, '2nd Shift', '2026-09-19 00:00:00', 1),
(259, 16, 4, '2nd Shift', '2026-09-19 00:00:00', 1),
(260, 16, 17, '2nd Shift', '2026-09-19 00:00:00', 1),
(269, 16, 1, '1st Shift', '2026-09-23 00:00:00', 1),
(270, 16, 3, '1st Shift', '2026-09-23 00:00:00', 1),
(271, 16, 1, '2nd Shift', '2026-09-23 00:00:00', 1),
(272, 16, 3, '2nd Shift', '2026-09-23 00:00:00', 1),
(273, 16, 1, '1st Shift', '2026-09-25 00:00:00', 1),
(274, 16, 3, '1st Shift', '2026-09-25 00:00:00', 1),
(275, 16, 1, '2nd Shift', '2026-09-25 00:00:00', 1),
(276, 16, 3, '2nd Shift', '2026-09-25 00:00:00', 1),
(277, 16, 1, '1st Shift', '2026-09-28 00:00:00', 1),
(278, 16, 3, '1st Shift', '2026-09-28 00:00:00', 1),
(279, 16, 1, '2nd Shift', '2026-09-28 00:00:00', 1),
(280, 16, 3, '2nd Shift', '2026-09-28 00:00:00', 1),
(281, 16, 1, '1st Shift', '2026-09-29 00:00:00', 1),
(282, 16, 3, '1st Shift', '2026-09-29 00:00:00', 1),
(283, 16, 1, '2nd Shift', '2026-09-29 00:00:00', 1),
(284, 16, 3, '2nd Shift', '2026-09-29 00:00:00', 1);

DROP TABLE IF EXISTS `live_locations`;
CREATE TABLE `live_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `live_locations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `live_locations` VALUES 
(1, 1, 31.5204, 74.3587, '2026-08-23 18:03:47');

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `password_resets` VALUES 
(1, 'test@example.com', 'fa8d409c57b2cd4d255f94e0bd65d774a01d6057cdd7cc3e84c8492493fac375', '2026-08-26 16:38:00', 1, '2026-08-26 15:37:59');

DROP TABLE IF EXISTS `periods`;
CREATE TABLE `periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `period_number` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `shift` varchar(20) NOT NULL,
  `day` varchar(20) DEFAULT 'Regular',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `periods` VALUES 
(1, 1, '08:30:00', '09:00:00', '1st Shift', 'Friday'),
(2, 1, '08:30:00', '09:15:00', '1st Shift', 'Regular'),
(3, 2, '09:15:00', '10:00:00', '1st Shift', 'Regular'),
(7, 3, '10:00:00', '10:45:00', '1st Shift', 'Regular'),
(8, 4, '10:45:00', '11:30:00', '1st Shift', 'Regular'),
(9, 5, '11:30:00', '12:15:00', '1st Shift', 'Regular'),
(12, 1, '13:00:00', '13:45:00', '2nd Shift', 'Regular'),
(13, 2, '13:45:00', '14:30:00', '2nd Shift', 'Regular'),
(14, 3, '14:30:00', '15:15:00', '2nd Shift', 'Regular'),
(15, 4, '15:15:00', '16:00:00', '2nd Shift', 'Regular'),
(16, 5, '16:00:00', '16:45:00', '2nd Shift', 'Regular'),
(17, 6, '16:45:00', '17:30:00', '2nd Shift', 'Regular'),
(27, 6, '12:15:00', '13:00:00', '1st Shift', 'Regular'),
(32, 7, '17:30:00', '18:15:00', '2nd Shift', 'Regular'),
(33, 7, '13:00:00', '13:45:00', '1st Shift', 'Regular'),
(34, 2, '09:00:00', '09:30:00', '1st Shift', 'Friday'),
(35, 3, '09:30:00', '10:00:00', '1st Shift', 'Friday'),
(36, 4, '10:00:00', '10:30:00', '1st Shift', 'Friday'),
(37, 5, '10:30:00', '11:00:00', '1st Shift', 'Friday'),
(38, 6, '11:00:00', '12:00:00', '1st Shift', 'Friday'),
(39, 7, '12:00:00', '12:30:00', '1st Shift', 'Friday');

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_no` varchar(20) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `radius_meters` int DEFAULT '50',
  `block_name` varchar(50) DEFAULT NULL,
  `floor_number` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_no` (`room_no`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `rooms` VALUES 
(1, '6', 31.7131239, 73.9616341, 10, '1', 0),
(2, '7', 31.7130729, 73.9619522, 10, '1', 0),
(3, '9', 31.7129183, 73.9617491, 10, '1', 0),
(4, '10', 31.7129153, 73.9617483, 10, '1', 0),
(5, '21', 31.7129153, 73.9617483, 10, '1', 0),
(6, '22', 31.7131221, 73.9616235, 10, '1', 0),
(7, '24', 31.7129384, 73.9617326, 10, '1', 0),
(8, '26', 31.7126327, 73.9615626, 10, '2', 0),
(9, '28', 31.7126188, 73.9615445, 10, '2', 0),
(10, '29', 31.7127029, 73.9615027, 10, '2', 0),
(11, '30', 31.7127316, 73.9614829, 10, '2', 0),
(19, 'Computer lab', 31.7121646, 73.9617116, 15, '5', 0),
(21, '58', 31.7121256, 73.9617832, 10, '5', 0),
(22, '59', 31.7121055, 73.9616804, 10, '5', 0),
(23, '60', 31.7121259, 73.9617506, 10, '5', 0),
(24, '61', 31.7120889, 73.9616623, 10, '5', 0),
(30, 'Biology lab', 31.7121125, 73.9614067, 15, '4', 0),
(31, '51', 31.7121127, 73.9614054, 10, '4', 0),
(32, '52', 31.7121106, 73.9614228, 10, '4', 0),
(33, '53', 31.7121133, 73.9614165, 10, '4', 0),
(34, '54', 31.7121118, 73.9614053, 10, '4', 0),
(35, '55', 31.7121176, 73.9614118, 10, '4', 0),
(37, '126', 31.7121004, 73.9614342, 10, '4', 1),
(38, '127', 31.7121167, 73.9614123, 10, '4', 1),
(39, '128', 31.7121074, 73.9614051, 10, '4', 1),
(41, '129', 31.7121232, 73.9614703, 10, '4', 1),
(42, '130', 31.7120973, 73.961415, 10, '4', 1),
(43, '130A', 31.7121029, 73.9614137, 10, '4', 1),
(45, '131', 31.712123, 73.9614181, 10, '4', 1),
(46, '132', 31.7121138, 73.9614267, 10, '4', 1);

DROP TABLE IF EXISTS `timetable`;
CREATE TABLE `timetable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `semester` varchar(10) NOT NULL,
  `day` varchar(20) NOT NULL,
  `period_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `subject_code` varchar(50) NOT NULL,
  `room_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  KEY `period_id` (`period_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`period_id`) REFERENCES `periods` (`id`),
  CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `timetable_ibfk_4` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `timetable` VALUES 
(1, 1, '2nd', 'Monday', 27, 15, 'Df', 24),
(2, 1, '4th', 'Monday', 27, 19, 'Dt', 21),
(3, 1, '6th', 'Monday', 27, 25, 'Ey', 1),
(4, 1, '8th', 'Monday', 27, 22, 'Dt', 7),
(5, 3, '2nd', 'Monday', 27, 21, 'Et', 11),
(13, 1, '2nd', 'Tuesday', 2, 25, 'T7h', 23),
(14, 1, '4th', 'Tuesday', 7, 25, 'Gueh', 21);

DROP TABLE IF EXISTS `timetable_config`;
CREATE TABLE `timetable_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_type` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `timetable_config` VALUES 
(10, 'semester', '2nd'),
(11, 'semester', '4th'),
(12, 'semester', '8th'),
(13, 'semester', '6th');

DROP TABLE IF EXISTS `user_otps`;
CREATE TABLE `user_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_otp` (`otp`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user_otps` VALUES 
(2, 'haffs@gmail.com', '744748', '2026-09-02 13:08:09', 1, '2026-09-02 12:58:08'),
(10, 'ef3681375@gmail.com', '673023', '2026-09-09 14:11:00', 0, '2026-09-09 14:00:59'),
(11, 'mairarizwan129@gmail.com', '560108', '2026-09-09 14:13:26', 0, '2026-09-09 14:03:25'),
(12, 'hamza@gmail.com', '851811', '2026-09-09 20:30:56', 1, '2026-09-09 20:20:56'),
(13, 'ib7883791@gmail.com', '6998', '2026-09-12 11:01:54', 0, '2026-09-12 10:51:53'),
(14, 'ib7883791@gmail.com', '3574', '2026-09-12 11:40:19', 1, '2026-09-12 11:30:18'),
(15, 'emanarif@gmail.com', '7622', '2026-09-25 10:58:01', 0, '2026-09-25 10:48:01'),
(16, 'emanarif700@gmail.com', '6008', '2026-09-25 11:00:37', 0, '2026-09-25 10:50:37'),
(17, 'rabiabano00143@gmail.com', '4623', '2026-09-25 11:03:33', 0, '2026-09-25 10:53:32'),
(18, 'emanarif700@gmail.com', '8239', '2026-09-25 11:09:15', 0, '2026-09-25 10:59:14'),
(19, 'emanarif700@gmail.com', '7640', '2026-09-25 11:31:14', 0, '2026-09-25 11:21:14'),
(20, 'emanarif700@gmail.com', '8481', '2026-09-25 11:33:04', 0, '2026-09-25 11:23:03'),
(21, 'emanarif700@gmail.com', '7160', '2026-09-25 11:41:31', 1, '2026-09-25 11:31:31'),
(22, 'ra465054@gmail.com', '6241', '2026-09-25 11:47:22', 1, '2026-09-25 11:37:21'),
(24, 'emanfatima700@gmail.com', '9475', '2026-09-25 13:44:27', 0, '2026-09-25 13:34:27'),
(25, 'emanfatima700@gmail.com', '6266', '2026-09-25 13:47:30', 0, '2026-09-25 13:37:30'),
(26, 'emanarif700@gmail.com', '3812', '2026-09-25 13:49:22', 1, '2026-09-25 13:39:21'),
(27, 'rabiabano00143@gmail.com', '9266', '2026-09-25 20:05:50', 1, '2026-09-25 19:55:49'),
(28, 'ra465054@gmail.com', '3162', '2026-09-26 10:53:36', 1, '2026-09-26 10:43:35'),
(29, 'ra465056@gmail.com', '1364', '2026-09-26 22:20:54', 0, '2026-09-26 22:10:53'),
(30, 'haffsa16ppc@gmail.com', '9172', '2026-09-27 15:50:42', 1, '2026-09-27 15:40:41'),
(31, 'haffsappc@gmail.com', '4099', '2026-09-27 15:54:56', 1, '2026-09-27 15:44:55');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','teacher','monitoring') NOT NULL,
  `department_id` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `email_verified` tinyint(1) DEFAULT '0',
  `join_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` VALUES 
(1, 'Admin CMS', 'admingcb@ClassMonitoringSystem.com', '$2b$10$RxrOozMzqWpQkmAauvCh5uYB0uqVv1TJQJtTFv9xByeJonWiygyUm', 'admin', NULL, 'approved', 1, '2026-08-23 00:00:00'),
(15, 'Maira', 'mairarizwan129@gmail.com', '$2b$10$5fnxWsOvyzuNbqVIUMJu/..R6BUlCb5EtpwfJPVvDnzKj3GUi/F5m', 'teacher', 1, 'approved', 0, '2026-09-09 00:00:00'),
(16, 'Hamza', 'hamza@gmail.com', '$2b$10$uCmJR10.BYARUC/Y6EGCseOqcWQBZAQhmWClk9K06olQRpoHUcIB2', 'monitoring', NULL, 'approved', 1, '2026-09-09 00:00:00'),
(19, 'Maria', 'ib7883791@gmail.com', '$2b$10$d6g4GaAdq/v3ueinlNRg3.7WCE0MxkWVcpl1hAaPADRcy3.nsvvia', 'teacher', 1, 'approved', 1, '2026-09-12 00:00:00'),
(21, 'Fatima', 'emanarif700@gmail.com', '$2b$10$b6O4cZRdPEX6ix2sl3qtYuktL1ESKMRPBCnCxMVKpkZE2j39PtgAe', 'teacher', 3, 'approved', 1, '2026-09-25 00:00:00'),
(22, 'Rabia', 'rabiabano00143@gmail.com', '$2b$10$yhU9.vwyNsp8KJTH6m4ad.YCR6Iv8YEJDCHHqWr.nHEO/DnGpFtBO', 'teacher', 1, 'approved', 1, '2026-09-25 00:00:00'),
(23, 'Ali', 'ra465054@gmail.com', '$2b$10$dE8uPwKrRSTGSmQfTkuLT.Q1/OX.ZqDK3esRymfLQ7nqsFqsniJue', 'teacher', 3, 'rejected', 1, '2026-09-26 00:00:00'),
(25, 'Haffsa', 'haffsa16ppc@gmail.com', '$2b$10$161cBoJiXN6ClZ6cYy1Zs.zHtVWi8BLUstuS/mVDVAwEJ8lNUIJF2', 'teacher', 1, 'approved', 1, '2026-09-27 00:00:00'),
(26, 'Ahmad', 'haffsappc@gmail.com', '$2b$10$B02Wk6YMlnUQRYl/nDhXFudcsk4T14fuekA1mJ0LLpmJ6iVXbzfvy', 'monitoring', NULL, 'pending', 1, '2026-09-27 00:00:00');

SET FOREIGN_KEY_CHECKS = 1;
