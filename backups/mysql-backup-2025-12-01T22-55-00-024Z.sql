-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: complaints_system
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('242af89d-29a0-404c-9258-e46d6b9675c2','1dff2e17752083b37b40410695c5b84d19a6faebab5fb9e0e9c578fb043b43b9','2025-11-30 19:06:37.666','20251130190637_init',NULL,NULL,'2025-11-30 19:06:37.495',1),('33065516-7b65-436f-903a-ccd970801b0d','17241113bd8d5d7d00f1e37a8c0ea162927fe6bf151d1e48a86e35505e45b9e1','2025-12-01 20:49:39.197','20251201204939_add_backup_log',NULL,NULL,'2025-12-01 20:49:39.171',1),('5e0df148-321a-415a-b979-5530d29e3160','466701188e74c2add0d9251ee1bea1e7e3230ff87bdcf3460cf4875433eb29e2','2025-12-01 08:09:26.478','20251201080926_add_audit_log',NULL,NULL,'2025-12-01 08:09:26.455',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `refreshTokenHash` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'System Administrator','admin@complaints.gov.ly','$2b$10$YBADdgL87l1CzeI76MZx8OxjUk3/JcByVar5SD9rw1aVsv9bGGvr.','$2b$10$SpJnZzmEC4iCyj2Y1ohoXeJt9GtRU2BUbFqyfgbKYswEB3Z.Cl1Bi','2025-11-30 19:08:11.599','2025-12-01 07:25:02.278');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `role` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `endpoint` varchar(191) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `status` enum('SUCCESS','FAILED') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
INSERT INTO `auditlog` VALUES (1,1,'admin','GET','GET /government/2/showEmployee','{\"params\":{\"id\":\"2\"},\"query\":{}}','SUCCESS','2025-12-01 08:16:28.094'),(2,0,'anonymous','POST','POST /auth/login-user','{\"body\":{\"email\":\"sara@example.com\",\"password\":\"[REDACTED]\"},\"params\":{},\"query\":{}}','SUCCESS','2025-12-01 08:19:25.211'),(3,0,'anonymous','POST','POST /auth/login-user','{\"body\":{\"email\":\"sara@example.com\",\"password\":\"[REDACTED]\"},\"params\":{},\"query\":{}}','SUCCESS','2025-12-01 08:22:56.157'),(4,0,'anonymous','POST','POST /auth/login-user','{\"body\":{\"email\":\"sara@example.com\",\"password\":\"[REDACTED]\"},\"params\":{},\"query\":{}}','FAILED','2025-12-01 08:23:05.008'),(5,1,'admin','GET','GET /government/1/showEmployee','{\"params\":{\"id\":\"1\"},\"query\":{}}','SUCCESS','2025-12-01 08:23:39.489'),(6,1,'admin','GET','GET /government/1/showEmployee','{\"params\":{\"id\":\"1\"},\"query\":{}}','SUCCESS','2025-12-01 08:34:30.826'),(7,1,'admin','GET','GET /government/100/showEmployee','{\"params\":{\"id\":\"100\"},\"query\":{},\"error\":\"government with ID 100 does not exist\"}','FAILED','2025-12-01 08:34:49.854'),(8,0,'anonymous','POST','POST /auth/login-user','{\"body\":{\"email\":\"sara@example.com\",\"password\":\"[REDACTED]\"},\"params\":{},\"query\":{},\"error\":\"incorrect password try again\"}','FAILED','2025-12-01 08:35:00.381'),(9,0,'anonymous','POST','POST /auth/login-user','{\"body\":{\"email\":\"sara@example.com\",\"password\":\"[REDACTED]\"},\"params\":{},\"query\":{},\"error\":\"incorrect password try again\"}','FAILED','2025-12-01 08:35:00.432'),(10,0,'anonymous','POST','POST /auth/login-user','{\"body\":{\"email\":\"sara@example.com\",\"password\":\"[REDACTED]\"},\"params\":{},\"query\":{}}','SUCCESS','2025-12-01 08:35:11.079'),(11,1,'admin','GET','GET /government/1/showEmployee','{\"params\":{\"id\":\"1\"},\"query\":{}}','SUCCESS','2025-12-01 09:20:21.348'),(12,0,'anonymous','POST','POST /backup','{\"params\":{},\"query\":{},\"error\":\"Command failed: mysqldump -h localhost -u root -p complaints_system > \\\"D:\\\\Nest js\\\\Government-Complaints-System\\\\backups\\\\mysql-backup-2025-12-01T21-22-58-189Z.sql\\\"\\n\'mysqldump\' is not recognized as an internal or external command,\\r\\noperable program or batch file.\\r\\n\"}','FAILED','2025-12-01 21:22:58.369'),(13,0,'anonymous','POST','POST /backup','{\"params\":{},\"query\":{},\"error\":\"Command failed: mysqldump -h localhost -u root -p complaints_system > \\\"D:\\\\Nest js\\\\Government-Complaints-System\\\\backups\\\\mysql-backup-2025-12-01T21-22-58-189Z.sql\\\"\\n\'mysqldump\' is not recognized as an internal or external command,\\r\\noperable program or batch file.\\r\\n\"}','FAILED','2025-12-01 21:22:58.603'),(14,0,'anonymous','POST','POST /backup','{\"params\":{},\"query\":{}}','SUCCESS','2025-12-01 21:26:27.509'),(15,0,'anonymous','POST','POST /backup','{\"params\":{},\"query\":{}}','SUCCESS','2025-12-01 21:27:02.139');
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backuplog`
--

DROP TABLE IF EXISTS `backuplog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `backuplog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backuplog`
--

LOCK TABLES `backuplog` WRITE;
/*!40000 ALTER TABLE `backuplog` DISABLE KEYS */;
INSERT INTO `backuplog` VALUES (1,'mysql-backup-2025-12-01T21-26-27-006Z.sql','2025-12-01 21:26:27.492'),(2,'mysql-backup-2025-12-01T21-27-01-763Z.sql','2025-12-01 21:27:02.084'),(3,'mysql-backup-2025-12-01T22-48-00-039Z.sql','2025-12-01 22:48:00.354'),(4,'mysql-backup-2025-12-01T22-50-00-037Z.sql','2025-12-01 22:50:00.373');
/*!40000 ALTER TABLE `backuplog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(191) NOT NULL,
  `fatherName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `governmentId` int(11) NOT NULL,
  `refreshTokenHash` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Employee_email_key` (`email`),
  KEY `Employee_governmentId_fkey` (`governmentId`),
  CONSTRAINT `Employee_governmentId_fkey` FOREIGN KEY (`governmentId`) REFERENCES `government` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'aya','ahmed','ssaa','ayass@gmil.com','$2b$10$d8hcYy3AoPmStebgW42wjeKDzrL695Motcl3HRj4C7.PNipx90DQS',0,2,NULL,'2025-11-30 19:08:11.682','2025-11-30 22:06:14.365'),(2,'Mona','Yousef','Faraj','mona.faraj@health.gov.ly','$2b$10$d8hcYy3AoPmStebgW42wjeKDzrL695Motcl3HRj4C7.PNipx90DQS',1,2,NULL,'2025-11-30 19:08:11.709','2025-11-30 19:08:11.709'),(3,'aya','ahmed','aaaa','aya@gmail.com','$2b$10$ckTctv7v6epCpSclU634F.gzQsP/0kzr3/RiyNAMeA.smkIPuFauS',1,1,NULL,'2025-11-30 20:23:46.947','2025-11-30 20:23:46.947'),(18,'aya','ahmed','aa','aya@gmil.com','$2b$10$S2rv93D/kKXtaeTS9Oq1NOhyJCMIuxwBeEwBwhtm0Bg7mOvOis5AO',1,2,NULL,'2025-11-30 21:11:17.746','2025-11-30 21:11:17.746');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `government`
--

DROP TABLE IF EXISTS `government`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `government` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `contactEmail` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `governorate` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Government_contactEmail_key` (`contactEmail`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `government`
--

LOCK TABLES `government` WRITE;
/*!40000 ALTER TABLE `government` DISABLE KEYS */;
INSERT INTO `government` VALUES (1,'Ministry of Interior','interior@gov.ly','Oversees public security and safety initiatives.','Tripoli'),(2,'Ministry of Health','health@gov.ly','Responsible for national health services.','Benghazi'),(3,'وزارة التعلم العالي','teset@example.com','ترباية الطلاب و تعليمهم','دمشق');
/*!40000 ALTER TABLE `government` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `otpCode` varchar(191) DEFAULT NULL,
  `otpExpiresAt` datetime(3) DEFAULT NULL,
  `otpAttempts` int(11) NOT NULL DEFAULT 0,
  `refreshTokenHash` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Abdallah Salem','abdallah@example.com','+218910000001','$2b$10$fmXCDIHUWREtLeW.n3GOAOBrHl6AzMRI2xagoBFbdDb8sGh09p0le',1,NULL,NULL,0,NULL,'2025-11-30 19:08:11.792','2025-11-30 19:08:11.792'),(2,'Sara Khaled','sara@example.com','+218910000002','$2b$10$fmXCDIHUWREtLeW.n3GOAOBrHl6AzMRI2xagoBFbdDb8sGh09p0le',1,NULL,NULL,0,'$2b$10$KUVP4EFOgOZaO6cDWF83recEz6cC5npnsVMG9g7uxeFuMKcmJ5LaS','2025-11-30 19:08:11.798','2025-12-01 08:35:11.046'),(3,'meme','memeahmed22004@gmail.com','167897490','$2b$10$TbIDt6rPobbFSAUyjmtElOFxB/bGGMcUJ92/acTr6.oIPeleC7bxS',0,'841481','2025-11-30 20:12:14.757',0,NULL,'2025-11-30 20:02:14.786','2025-11-30 20:02:14.786'),(4,'aya','aya@gmail.com','0940759183','$2b$10$SAO3/lY2oSI8iUq5xscG1.hO8lfPTGRg8sFtucBeyIl/bneC0mgBC',0,'735216','2025-11-30 20:12:45.137',0,NULL,'2025-11-30 20:02:45.139','2025-11-30 20:02:45.139');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-02  1:55:00
