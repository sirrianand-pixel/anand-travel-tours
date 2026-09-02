CREATE DATABASE  IF NOT EXISTS `traveltours` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `traveltours`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: traveltours
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `package_id` int NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `travel_date` date NOT NULL,
  `persons` int NOT NULL,
  `message` text,
  `status` varchar(30) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `package_id` (`package_id`),
  KEY `fk_bookings_user` (`user_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,NULL,1,'Sirri Anand','sirrianand@gmail.com','6304503644','2026-08-26',2,'we need a best hotel','Confirmed','2026-08-08 20:53:49'),(2,NULL,1,'ravi','ravi@gmail.com','5468974133','2026-08-14',2,'','Cancelled','2026-08-08 21:36:52'),(3,5,4,'aravind','aravind@gmail.com','9182448645','2026-08-22',2,NULL,'Confirmed','2026-08-12 11:03:57'),(4,5,4,'veerendra','aravind@gmail.com','9182448645','2026-08-29',2,NULL,'Pending','2026-08-12 18:23:00'),(5,5,3,'ravi','ravi@gmail.com','6304503644','2026-08-29',2,NULL,'Confirmed','2026-08-12 19:50:42'),(6,9,1,'raju','raju@gmail.com','5468974133','2026-08-27',2,NULL,'Pending','2026-08-12 20:53:36');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `description` text,
  `duration` varchar(50) DEFAULT NULL,
  `persons` int DEFAULT '2',
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `tag` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Goa Beach Escape','Goa, India','Relax on beautiful beaches, explore Portuguese heritage and enjoy Goa nightlife.','3 Days / 2 Nights',2,8999.00,'goa.jpg','Popular','2026-08-08 14:14:23'),(2,'Kashmir Paradise','Kashmir, India','Experience Dal Lake, snow-covered mountains, valleys and breathtaking landscapes.','5 Days / 4 Nights',2,14999.00,'kashmir.jpg','Bestseller','2026-08-08 14:14:23'),(3,'Kerala Backwaters','Kerala, India','Discover peaceful backwaters, lush greenery, beaches and traditional Kerala culture.','4 Days / 3 Nights',2,11999.00,'kerala.jpg','Trending','2026-08-08 14:14:23'),(4,'Manali Mountain Escape','Manali, India','Explore snow-capped mountains, scenic valleys and exciting Himalayan adventures.','5 Days / 4 Nights',2,13999.00,'manali.jpg','Adventure','2026-08-08 14:14:23'),(7,'tirupathi gods place','tirupathi ap','enters 10000 of people in to this place to take loard vishnu blessings','2days /2nights',2,2999.00,'tirupathi.jpg','popular','2026-08-09 19:14:27');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(20) DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sirri Anand','sirrianand@gmail.com','6304503644','$2b$10$quaUmPmGeBYlTHGDGnSVxOzAwDWtwXs23xdGOOTJSb7ThYbwsWqgi','2026-08-06 18:37:51','admin'),(2,'shannu','shannu@gmail.com','5468974133','$2b$10$Anil3oO4bcSpU9cj0PP0t.ImKWeEAM8HRjRvoqJVOfe9/JBcR.0OC','2026-08-07 11:21:02','user'),(3,'mahendra','mahendra@gmail.com','45679913','$2b$10$F5fXN1S4wul2qRzwtcW92ezYYKRZEIyiabh27dG6SsC1EAvGL2jcK','2026-08-07 11:21:26','user'),(4,'ravi','ravi@gmail.com','789456621','$2b$10$AyI0apUmVDaTfXCQhbLsaOm0jnBg7D2JxgWP.eosuGOilFQoM6AdO','2026-08-07 11:58:03','user'),(5,'aravind','aravind@gmail.com','9182448645','$2b$10$kRHh7Vp/88oLegN6cX/ZXuUT7ZzziQMvCQcqasVHflyw4nt9UTPo6','2026-08-12 10:34:21','user'),(6,'shiva','shiva@gmail.com','456789133','$2b$10$QSci.kh5LLUyZQhQbI1KMOpdReR15siX0qmcRl7ZbzHV0dKZ024jm','2026-08-12 20:16:32','user'),(7,'prathap','prathap@gmail.com','78945621334','$2b$10$q3wUX/r/0G.axvta4AW8u.xpDU2QFeCzzZZXQSrek4WMMgBW786b6','2026-08-12 20:18:27','user'),(8,'pavan','pavan@gmail.com','78945664','$2b$10$m7kkKW9P4uNX1YJ9Zc7ly.TjYL9Mhki.Tn17NfNRgM3KXTLZ7ETLS','2026-08-12 20:20:21','user'),(9,'raju','raju@gmail.com','7894616466','$2b$10$U7q9nned0OEQcU3G1WsZh.qBwBIcvHP7onzFKyiHcyaDGRym4oTMW','2026-08-12 20:22:33','user'),(10,'vishnu','vishnu@gmail.com','7894566631','$2b$10$uPOQorzPAjnUmzl.IPqeAOiycQieMjxAZvkoUF.RMj4Cy4k1I5si6','2026-08-12 20:24:40','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-13  3:24:22
