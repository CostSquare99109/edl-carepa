CREATE DATABASE IF NOT EXISTS `edl_carepa` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `edl_carepa`;

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Android (aarch64)
--
-- Host: localhost    Database: edl_carepa
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `entidad` varchar(50) NOT NULL,
  `registro_id` bigint(20) unsigned DEFAULT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_accion` (`accion`),
  KEY `idx_entidad_registro` (`entidad`,`registro_id`),
  KEY `idx_fecha` (`creado_en`)
) ENGINE=InnoDB AUTO_INCREMENT=610 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
INSERT INTO `auditoria` VALUES
(1,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 08:50:35'),
(2,NULL,'login','usuarios',11,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 08:50:35'),
(3,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 08:52:47'),
(4,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 08:54:56'),
(5,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 08:55:54'),
(6,NULL,'login','usuarios',2,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 08:55:54'),
(7,6,'actualizar','usuarios',6,'{\"primer_nombre\": \"Juan\", \"primer_apellido\": \"Gomez Ramirez\", \"estado\": \"activo\", \"email\": \"juan.gomez@carepa.gov.co\"}','{\"primer_nombre\": \"Juan\", \"primer_apellido\": \"Gomez Ramirez\", \"estado\": \"activo\", \"email\": \"juan.gomez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 08:57:00'),
(8,6,'actualizar','usuarios',6,'{\"primer_nombre\": \"Juan\", \"primer_apellido\": \"Gomez Ramirez\", \"estado\": \"activo\", \"email\": \"juan.gomez@carepa.gov.co\"}','{\"primer_nombre\": \"Juan\", \"primer_apellido\": \"Gomez Ramirez\", \"estado\": \"activo\", \"email\": \"juan.gomez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 08:58:15'),
(9,NULL,'login','usuarios',6,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 08:58:15'),
(10,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:05:22'),
(11,NULL,'login','usuarios',2,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 09:05:22'),
(12,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:07:46'),
(13,NULL,'login','usuarios',2,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 09:07:46'),
(14,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:10:32'),
(15,NULL,'login','usuarios',2,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 09:10:32'),
(16,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:18:18'),
(17,NULL,'login','usuarios',2,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 09:18:18'),
(18,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:20:28'),
(19,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:20:33'),
(20,NULL,'login','usuarios',2,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 09:20:33'),
(21,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:25:58'),
(22,NULL,'login','usuarios',11,NULL,NULL,'127.0.0.1','Python-urllib/3.13','2026-06-26 09:25:58'),
(23,11,'logout','usuarios',11,NULL,NULL,'127.0.0.1','Python-urllib/3.13','2026-06-26 09:26:00'),
(24,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:28:35'),
(25,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:28:58'),
(26,NULL,'login','usuarios',11,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 09:28:58'),
(27,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:29:55'),
(28,11,'actualizar','usuarios',11,'{\"id\":11,\"documento\":\"admin\",\"tipo_documento\":\"CC\",\"genero\":null,\"primer_nombre\":\"Admin\",\"segundo_nombre\":null,\"primer_apellido\":\"Principal\",\"segundo_apellido\":null,\"email\":\"admin@carepa.gov.co\",\"email_confirmado\":0,\"telefono1\":null,\"telefono2\":null,\"password_hash\":\"$2y$12$2RFPsGRV\\/FF4EiuLmTCF6ebD77gAhDfLQ6WIMY7HpKoIrBRJ6HZ6W\",\"estado\":\"activo\",\"intentos_fallidos\":0,\"ultimo_acceso\":\"2026-06-26 09:28:58\",\"entidad_id\":1,\"dependencia_id\":1,\"es_contratista\":0,\"nivel\":null,\"naturaleza\":null,\"tipo_nombramiento\":\"hecho_en_carrera\",\"denominacion_empleo\":\"Administrador\",\"codigo_empleo\":null,\"grado_empleo\":\"25\",\"es_evaluador_y_evaluado\":0,\"dependencia_evaluacion_id\":null,\"en_periodo_prueba\":0,\"fecha_posesion\":null,\"proposito_principal_empleo\":null,\"evaluacion_inicio_febrero\":1,\"debe_cambiar_password\":0,\"fecha_inicio_evaluacion\":null,\"motivo_fecha_inicio_diferente\":null,\"creado_en\":\"2026-06-26 08:49:40\",\"actualizado_en\":\"2026-06-26 09:28:58\",\"eliminado_en\":null}','{\"tipo_documento\":\"CC\",\"email\":\"admin@carepa.gov.co\",\"estado\":\"activo\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 09:29:55'),
(29,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:30:12'),
(30,11,'actualizar','usuarios',11,'{\"id\":11,\"documento\":\"admin\",\"tipo_documento\":\"CC\",\"genero\":null,\"primer_nombre\":\"Admin\",\"segundo_nombre\":null,\"primer_apellido\":\"Principal\",\"segundo_apellido\":null,\"email\":\"admin@carepa.gov.co\",\"email_confirmado\":0,\"telefono1\":null,\"telefono2\":null,\"password_hash\":\"$2y$12$2RFPsGRV\\/FF4EiuLmTCF6ebD77gAhDfLQ6WIMY7HpKoIrBRJ6HZ6W\",\"estado\":\"activo\",\"intentos_fallidos\":0,\"ultimo_acceso\":\"2026-06-26 09:28:58\",\"entidad_id\":1,\"dependencia_id\":1,\"es_contratista\":0,\"nivel\":null,\"naturaleza\":null,\"tipo_nombramiento\":\"hecho_en_carrera\",\"denominacion_empleo\":\"Administrador\",\"codigo_empleo\":null,\"grado_empleo\":\"25\",\"es_evaluador_y_evaluado\":0,\"dependencia_evaluacion_id\":null,\"en_periodo_prueba\":0,\"fecha_posesion\":null,\"proposito_principal_empleo\":null,\"evaluacion_inicio_febrero\":1,\"debe_cambiar_password\":0,\"fecha_inicio_evaluacion\":null,\"motivo_fecha_inicio_diferente\":null,\"creado_en\":\"2026-06-26 08:49:40\",\"actualizado_en\":\"2026-06-26 09:28:58\",\"eliminado_en\":null}','{\"tipo_documento\":\"CC\",\"email\":\"admin@carepa.gov.co\",\"estado\":\"activo\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 09:30:12'),
(31,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 09:31:30'),
(32,11,'actualizar','usuarios',11,'{\"id\":11,\"documento\":\"admin\",\"tipo_documento\":\"CC\",\"genero\":null,\"primer_nombre\":\"Admin\",\"segundo_nombre\":null,\"primer_apellido\":\"Principal\",\"segundo_apellido\":null,\"email\":\"admin@carepa.gov.co\",\"email_confirmado\":0,\"telefono1\":null,\"telefono2\":null,\"password_hash\":\"$2y$12$2RFPsGRV\\/FF4EiuLmTCF6ebD77gAhDfLQ6WIMY7HpKoIrBRJ6HZ6W\",\"estado\":\"activo\",\"intentos_fallidos\":0,\"ultimo_acceso\":\"2026-06-26 09:28:58\",\"entidad_id\":1,\"dependencia_id\":1,\"es_contratista\":0,\"nivel\":null,\"naturaleza\":null,\"tipo_nombramiento\":\"hecho_en_carrera\",\"denominacion_empleo\":\"Administrador\",\"codigo_empleo\":null,\"grado_empleo\":\"25\",\"es_evaluador_y_evaluado\":0,\"dependencia_evaluacion_id\":null,\"en_periodo_prueba\":0,\"fecha_posesion\":null,\"proposito_principal_empleo\":null,\"evaluacion_inicio_febrero\":1,\"debe_cambiar_password\":0,\"fecha_inicio_evaluacion\":null,\"motivo_fecha_inicio_diferente\":null,\"creado_en\":\"2026-06-26 08:49:40\",\"actualizado_en\":\"2026-06-26 09:28:58\",\"eliminado_en\":null}','{\"tipo_documento\":\"CC\",\"email\":\"admin@carepa.gov.co\",\"estado\":\"activo\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0','2026-06-26 09:31:30'),
(33,11,'logout','usuarios',11,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0','2026-06-26 10:05:36'),
(34,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:09:02'),
(35,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:09:12'),
(36,2,'actualizar','usuarios',2,'{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}','{\"primer_nombre\": \"Maria\", \"primer_apellido\": \"Rodriguez Perez\", \"estado\": \"activo\", \"email\": \"maria.rodriguez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(37,3,'actualizar','usuarios',3,'{\"primer_nombre\": \"Carlos\", \"primer_apellido\": \"Martinez Lopez\", \"estado\": \"activo\", \"email\": \"carlos.martinez@carepa.gov.co\"}','{\"primer_nombre\": \"Carlos\", \"primer_apellido\": \"Martinez Lopez\", \"estado\": \"activo\", \"email\": \"carlos.martinez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(38,4,'actualizar','usuarios',4,'{\"primer_nombre\": \"Andrea\", \"primer_apellido\": \"Sanchez Vega\", \"estado\": \"activo\", \"email\": \"andrea.sanchez@carepa.gov.co\"}','{\"primer_nombre\": \"Andrea\", \"primer_apellido\": \"Sanchez Vega\", \"estado\": \"activo\", \"email\": \"andrea.sanchez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(39,5,'actualizar','usuarios',5,'{\"primer_nombre\": \"Luis\", \"primer_apellido\": \"Hernandez Torres\", \"estado\": \"activo\", \"email\": \"luis.hernandez@carepa.gov.co\"}','{\"primer_nombre\": \"Luis\", \"primer_apellido\": \"Hernandez Torres\", \"estado\": \"activo\", \"email\": \"luis.hernandez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(40,6,'actualizar','usuarios',6,'{\"primer_nombre\": \"Juan\", \"primer_apellido\": \"Gomez Ramirez\", \"estado\": \"activo\", \"email\": \"juan.gomez@carepa.gov.co\"}','{\"primer_nombre\": \"Juan\", \"primer_apellido\": \"Gomez Ramirez\", \"estado\": \"activo\", \"email\": \"juan.gomez@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(41,7,'actualizar','usuarios',7,'{\"primer_nombre\": \"Patricia\", \"primer_apellido\": \"Diaz Morales\", \"estado\": \"activo\", \"email\": \"patricia.diaz@carepa.gov.co\"}','{\"primer_nombre\": \"Patricia\", \"primer_apellido\": \"Diaz Morales\", \"estado\": \"activo\", \"email\": \"patricia.diaz@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(42,8,'actualizar','usuarios',8,'{\"primer_nombre\": \"Fernando\", \"primer_apellido\": \"Torres Nino\", \"estado\": \"activo\", \"email\": \"fernando.torres@carepa.gov.co\"}','{\"primer_nombre\": \"Fernando\", \"primer_apellido\": \"Torres Nino\", \"estado\": \"activo\", \"email\": \"fernando.torres@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(43,9,'actualizar','usuarios',9,'{\"primer_nombre\": \"Lucia\", \"primer_apellido\": \"Castro Rojas\", \"estado\": \"activo\", \"email\": \"lucia.castro@carepa.gov.co\"}','{\"primer_nombre\": \"Lucia\", \"primer_apellido\": \"Castro Rojas\", \"estado\": \"activo\", \"email\": \"lucia.castro@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(44,10,'actualizar','usuarios',10,'{\"primer_nombre\": \"Roberto\", \"primer_apellido\": \"Munoz Silva\", \"estado\": \"activo\", \"email\": \"roberto.munoz@carepa.gov.co\"}','{\"primer_nombre\": \"Roberto\", \"primer_apellido\": \"Munoz Silva\", \"estado\": \"activo\", \"email\": \"roberto.munoz@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(45,11,'actualizar','usuarios',11,'{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}','{\"primer_nombre\": \"Admin\", \"primer_apellido\": \"Principal\", \"estado\": \"activo\", \"email\": \"admin@carepa.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(46,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(47,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"lusely.orejuela@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"lusely.orejuela@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(48,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:09:37'),
(49,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:11:29'),
(50,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0','2026-06-26 10:11:29'),
(51,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0','2026-06-26 10:11:33'),
(52,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"lusely.orejuela@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"LUSELY OREJUELA\", \"estado\": \"inactivo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(53,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"user105@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(54,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"yeison.romana@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \" ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:13:26'),
(55,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \" ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:13:26'),
(56,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:13:26'),
(57,66,'actualizar','usuarios',66,'{\"primer_nombre\": \"JAIRO\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user52@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAIRO\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user52@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(58,136,'actualizar','usuarios',136,'{\"primer_nombre\": \"GARLANT\", \"primer_apellido\": \"LEDEZMA\", \"estado\": \"activo\", \"email\": \"user154@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GARLANT\", \"primer_apellido\": \"LEDEZMA\", \"estado\": \"activo\", \"email\": \"user154@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(59,137,'actualizar','usuarios',137,'{\"primer_nombre\": \"PITERSON\", \"primer_apellido\": \"TRELLEZ\", \"estado\": \"activo\", \"email\": \"user156@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"PITERSON\", \"primer_apellido\": \"TRELLEZ\", \"estado\": \"activo\", \"email\": \"user156@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(60,138,'actualizar','usuarios',138,'{\"primer_nombre\": \"JIMMY\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user157@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JIMMY\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user157@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(61,139,'actualizar','usuarios',139,'{\"primer_nombre\": \"RAMIRO\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user158@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RAMIRO\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user158@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(62,140,'actualizar','usuarios',140,'{\"primer_nombre\": \"AGAPÍTO\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user159@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"AGAPÍTO\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user159@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(63,141,'actualizar','usuarios',141,'{\"primer_nombre\": \"EISON\", \"primer_apellido\": \"LIZCANO\", \"estado\": \"activo\", \"email\": \"user160@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EISON\", \"primer_apellido\": \"LIZCANO\", \"estado\": \"activo\", \"email\": \"user160@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(64,142,'actualizar','usuarios',142,'{\"primer_nombre\": \"ANIS\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user161@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANIS\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user161@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(65,144,'actualizar','usuarios',144,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ELVIN\", \"estado\": \"activo\", \"email\": \"user168@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ELVIN\", \"estado\": \"activo\", \"email\": \"user168@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(66,146,'actualizar','usuarios',146,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(67,147,'actualizar','usuarios',147,'{\"primer_nombre\": \"HARILSON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user177@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HARILSON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user177@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(68,148,'actualizar','usuarios',148,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"LONGA\", \"estado\": \"activo\", \"email\": \"user178@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"LONGA\", \"estado\": \"activo\", \"email\": \"user178@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(69,149,'actualizar','usuarios',149,'{\"primer_nombre\": \"YORLEIDY\", \"primer_apellido\": \"CUESTA\", \"estado\": \"activo\", \"email\": \"user179@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YORLEIDY\", \"primer_apellido\": \"CUESTA\", \"estado\": \"activo\", \"email\": \"user179@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(70,150,'actualizar','usuarios',150,'{\"primer_nombre\": \"SANDY\", \"primer_apellido\": \"AYAZO\", \"estado\": \"activo\", \"email\": \"user180@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDY\", \"primer_apellido\": \"AYAZO\", \"estado\": \"activo\", \"email\": \"user180@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(71,151,'actualizar','usuarios',151,'{\"primer_nombre\": \"ANGIE\", \"primer_apellido\": \"ROSERO\", \"estado\": \"activo\", \"email\": \"user181@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANGIE\", \"primer_apellido\": \"ROSERO\", \"estado\": \"activo\", \"email\": \"user181@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(72,152,'actualizar','usuarios',152,'{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PASTRANA\", \"estado\": \"activo\", \"email\": \"user182@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PASTRANA\", \"estado\": \"activo\", \"email\": \"user182@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(73,153,'actualizar','usuarios',153,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user183@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user183@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(74,154,'actualizar','usuarios',154,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ZAYA\", \"estado\": \"activo\", \"email\": \"user184@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ZAYA\", \"estado\": \"activo\", \"email\": \"user184@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(75,155,'actualizar','usuarios',155,'{\"primer_nombre\": \"EDIS\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user185@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EDIS\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user185@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(76,156,'actualizar','usuarios',156,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user186@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user186@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(77,157,'actualizar','usuarios',157,'{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user188@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user188@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(78,158,'actualizar','usuarios',158,'{\"primer_nombre\": \"DORA\", \"primer_apellido\": \"BENITEZ\", \"estado\": \"activo\", \"email\": \"user189@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DORA\", \"primer_apellido\": \"BENITEZ\", \"estado\": \"activo\", \"email\": \"user189@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(79,159,'actualizar','usuarios',159,'{\"primer_nombre\": \"MARTHA\", \"primer_apellido\": \"ORTIZ\", \"estado\": \"activo\", \"email\": \"user190@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARTHA\", \"primer_apellido\": \"ORTIZ\", \"estado\": \"activo\", \"email\": \"user190@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(80,160,'actualizar','usuarios',160,'{\"primer_nombre\": \"CRISTINA\", \"primer_apellido\": \"GORDON\", \"estado\": \"activo\", \"email\": \"user191@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CRISTINA\", \"primer_apellido\": \"GORDON\", \"estado\": \"activo\", \"email\": \"user191@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(81,161,'actualizar','usuarios',161,'{\"primer_nombre\": \"ARGENIDES\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user193@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ARGENIDES\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user193@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(82,162,'actualizar','usuarios',162,'{\"primer_nombre\": \"GILDA\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user195@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GILDA\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user195@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(83,163,'actualizar','usuarios',163,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"PALACIO\", \"estado\": \"activo\", \"email\": \"user196@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"PALACIO\", \"estado\": \"activo\", \"email\": \"user196@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(84,164,'actualizar','usuarios',164,'{\"primer_nombre\": \"DUBAN\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user197@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DUBAN\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user197@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(85,165,'actualizar','usuarios',165,'{\"primer_nombre\": \"YULY\", \"primer_apellido\": \"RENTERÍA\", \"estado\": \"activo\", \"email\": \"user198@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YULY\", \"primer_apellido\": \"RENTERÍA\", \"estado\": \"activo\", \"email\": \"user198@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(86,166,'actualizar','usuarios',166,'{\"primer_nombre\": \"YIRLEY\", \"primer_apellido\": \"ROJAS\", \"estado\": \"activo\", \"email\": \"user201@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YIRLEY\", \"primer_apellido\": \"ROJAS\", \"estado\": \"activo\", \"email\": \"user201@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(87,167,'actualizar','usuarios',167,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"BARRAZA\", \"estado\": \"activo\", \"email\": \"user202@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"BARRAZA\", \"estado\": \"activo\", \"email\": \"user202@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(88,168,'actualizar','usuarios',168,'{\"primer_nombre\": \"DELKIN\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"user203@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DELKIN\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"user203@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(89,169,'actualizar','usuarios',169,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"OSORIO\", \"estado\": \"activo\", \"email\": \"user205@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"OSORIO\", \"estado\": \"activo\", \"email\": \"user205@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(90,170,'actualizar','usuarios',170,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"GUISAO\", \"estado\": \"activo\", \"email\": \"user206@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"GUISAO\", \"estado\": \"activo\", \"email\": \"user206@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(91,171,'actualizar','usuarios',171,'{\"primer_nombre\": \"ROSA\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user207@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROSA\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user207@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(92,172,'actualizar','usuarios',172,'{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"PATIÑO\", \"estado\": \"activo\", \"email\": \"user213@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"PATIÑO\", \"estado\": \"activo\", \"email\": \"user213@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(93,173,'actualizar','usuarios',173,'{\"primer_nombre\": \"ESTEFFANI\", \"primer_apellido\": \"MANCO\", \"estado\": \"activo\", \"email\": \"user214@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ESTEFFANI\", \"primer_apellido\": \"MANCO\", \"estado\": \"activo\", \"email\": \"user214@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(94,174,'actualizar','usuarios',174,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"REYES\", \"estado\": \"activo\", \"email\": \"user215@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"REYES\", \"estado\": \"activo\", \"email\": \"user215@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(95,175,'actualizar','usuarios',175,'{\"primer_nombre\": \"DARY\", \"primer_apellido\": \"JULIO\", \"estado\": \"activo\", \"email\": \"user216@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DARY\", \"primer_apellido\": \"JULIO\", \"estado\": \"activo\", \"email\": \"user216@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(96,176,'actualizar','usuarios',176,'{\"primer_nombre\": \"JULIAN\", \"primer_apellido\": \"DAVID\", \"estado\": \"activo\", \"email\": \"user217@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JULIAN\", \"primer_apellido\": \"DAVID\", \"estado\": \"activo\", \"email\": \"user217@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(97,177,'actualizar','usuarios',177,'{\"primer_nombre\": \"DIEGO\", \"primer_apellido\": \"ALBORNOZ\", \"estado\": \"activo\", \"email\": \"user218@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DIEGO\", \"primer_apellido\": \"ALBORNOZ\", \"estado\": \"activo\", \"email\": \"user218@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(98,178,'actualizar','usuarios',178,'{\"primer_nombre\": \"ELVIA\", \"primer_apellido\": \"JARAVA\", \"estado\": \"activo\", \"email\": \"user219@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELVIA\", \"primer_apellido\": \"JARAVA\", \"estado\": \"activo\", \"email\": \"user219@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(99,179,'actualizar','usuarios',179,'{\"primer_nombre\": \"VICTOR\", \"primer_apellido\": \"VARGAS\", \"estado\": \"activo\", \"email\": \"user220@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"VICTOR\", \"primer_apellido\": \"VARGAS\", \"estado\": \"activo\", \"email\": \"user220@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(100,180,'actualizar','usuarios',180,'{\"primer_nombre\": \"MARYELIS\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user221@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARYELIS\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user221@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(101,181,'actualizar','usuarios',181,'{\"primer_nombre\": \"JHOSELIN\", \"primer_apellido\": \"GUERRERO\", \"estado\": \"activo\", \"email\": \"user223@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JHOSELIN\", \"primer_apellido\": \"GUERRERO\", \"estado\": \"activo\", \"email\": \"user223@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(102,182,'actualizar','usuarios',182,'{\"primer_nombre\": \"ROSALBA\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user224@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROSALBA\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user224@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(103,183,'actualizar','usuarios',183,'{\"primer_nombre\": \"SEBASTIAN\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user225@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SEBASTIAN\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user225@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(104,184,'actualizar','usuarios',184,'{\"primer_nombre\": \"ARISTOBULO\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user226@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ARISTOBULO\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user226@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(105,185,'actualizar','usuarios',185,'{\"primer_nombre\": \"YADERLIS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user227@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YADERLIS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user227@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(106,186,'actualizar','usuarios',186,'{\"primer_nombre\": \"ROBINSON\", \"primer_apellido\": \"TABORDA\", \"estado\": \"activo\", \"email\": \"user228@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROBINSON\", \"primer_apellido\": \"TABORDA\", \"estado\": \"activo\", \"email\": \"user228@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(107,187,'actualizar','usuarios',187,'{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CAICEDO\", \"estado\": \"activo\", \"email\": \"user229@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CAICEDO\", \"estado\": \"activo\", \"email\": \"user229@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(108,188,'actualizar','usuarios',188,'{\"primer_nombre\": \"MAGDY\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user230@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MAGDY\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user230@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(109,189,'actualizar','usuarios',189,'{\"primer_nombre\": \"KAROLL\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user231@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"KAROLL\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user231@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(110,190,'actualizar','usuarios',190,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"ALEGRIA\", \"estado\": \"activo\", \"email\": \"user232@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"ALEGRIA\", \"estado\": \"activo\", \"email\": \"user232@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(111,191,'actualizar','usuarios',191,'{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"MEJIA\", \"estado\": \"activo\", \"email\": \"user233@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"MEJIA\", \"estado\": \"activo\", \"email\": \"user233@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(112,192,'actualizar','usuarios',192,'{\"primer_nombre\": \"ALEJANDRO\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"activo\", \"email\": \"user234@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALEJANDRO\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"activo\", \"email\": \"user234@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(113,193,'actualizar','usuarios',193,'{\"primer_nombre\": \"WILFER\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user235@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"WILFER\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user235@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(114,194,'actualizar','usuarios',194,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user236@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user236@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(115,195,'actualizar','usuarios',195,'{\"primer_nombre\": \"GERSON\", \"primer_apellido\": \"GOEZ\", \"estado\": \"activo\", \"email\": \"user237@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GERSON\", \"primer_apellido\": \"GOEZ\", \"estado\": \"activo\", \"email\": \"user237@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(116,196,'actualizar','usuarios',196,'{\"primer_nombre\": \"LUISA\", \"primer_apellido\": \"OVIEDO\", \"estado\": \"activo\", \"email\": \"user238@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUISA\", \"primer_apellido\": \"OVIEDO\", \"estado\": \"activo\", \"email\": \"user238@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(117,197,'actualizar','usuarios',197,'{\"primer_nombre\": \"ERVIN\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user239@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ERVIN\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user239@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(118,198,'actualizar','usuarios',198,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user240@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user240@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(119,199,'actualizar','usuarios',199,'{\"primer_nombre\": \"NATALIT\", \"primer_apellido\": \"PUENTES\", \"estado\": \"activo\", \"email\": \"user241@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"NATALIT\", \"primer_apellido\": \"PUENTES\", \"estado\": \"activo\", \"email\": \"user241@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(120,200,'actualizar','usuarios',200,'{\"primer_nombre\": \"DISNEY\", \"primer_apellido\": \"SEPULVEDA\", \"estado\": \"activo\", \"email\": \"user242@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DISNEY\", \"primer_apellido\": \"SEPULVEDA\", \"estado\": \"activo\", \"email\": \"user242@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(121,201,'actualizar','usuarios',201,'{\"primer_nombre\": \"HELENA\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user243@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HELENA\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user243@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(122,202,'actualizar','usuarios',202,'{\"primer_nombre\": \"MILTON\", \"primer_apellido\": \"ARBOLEDA\", \"estado\": \"activo\", \"email\": \"user244@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MILTON\", \"primer_apellido\": \"ARBOLEDA\", \"estado\": \"activo\", \"email\": \"user244@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(123,203,'actualizar','usuarios',203,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"JARAMILLO\", \"estado\": \"activo\", \"email\": \"user245@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"JARAMILLO\", \"estado\": \"activo\", \"email\": \"user245@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(124,204,'actualizar','usuarios',204,'{\"primer_nombre\": \"SANTIAGO\", \"primer_apellido\": \"PEÑA\", \"estado\": \"activo\", \"email\": \"user246@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANTIAGO\", \"primer_apellido\": \"PEÑA\", \"estado\": \"activo\", \"email\": \"user246@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(125,205,'actualizar','usuarios',205,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user247@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user247@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(126,206,'actualizar','usuarios',206,'{\"primer_nombre\": \"JHON\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user248@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JHON\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user248@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(127,207,'actualizar','usuarios',207,'{\"primer_nombre\": \"OFRACINO\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user249@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OFRACINO\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user249@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(128,208,'actualizar','usuarios',208,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user250@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user250@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(129,209,'actualizar','usuarios',209,'{\"primer_nombre\": \"NEIDYS\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user251@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"NEIDYS\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user251@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(130,210,'actualizar','usuarios',210,'{\"primer_nombre\": \"YUDNE\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user252@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YUDNE\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user252@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(131,211,'actualizar','usuarios',211,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"activo\", \"email\": \"user253@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"activo\", \"email\": \"user253@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(132,212,'actualizar','usuarios',212,'{\"primer_nombre\": \"ELIZABETH\", \"primer_apellido\": \"ESTRADA\", \"estado\": \"activo\", \"email\": \"user254@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELIZABETH\", \"primer_apellido\": \"ESTRADA\", \"estado\": \"activo\", \"email\": \"user254@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(133,213,'actualizar','usuarios',213,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"HERRERA\", \"estado\": \"activo\", \"email\": \"user255@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"HERRERA\", \"estado\": \"activo\", \"email\": \"user255@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(134,214,'actualizar','usuarios',214,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ASPRILLA\", \"estado\": \"activo\", \"email\": \"user256@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ASPRILLA\", \"estado\": \"activo\", \"email\": \"user256@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(135,215,'actualizar','usuarios',215,'{\"primer_nombre\": \"JAVIER\", \"primer_apellido\": \"PEREZ\", \"estado\": \"activo\", \"email\": \"user257@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAVIER\", \"primer_apellido\": \"PEREZ\", \"estado\": \"activo\", \"email\": \"user257@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(136,216,'actualizar','usuarios',216,'{\"primer_nombre\": \"GLENYS\", \"primer_apellido\": \"VALENCIA\", \"estado\": \"activo\", \"email\": \"user258@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GLENYS\", \"primer_apellido\": \"VALENCIA\", \"estado\": \"activo\", \"email\": \"user258@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(137,217,'actualizar','usuarios',217,'{\"primer_nombre\": \"VALENTINA\", \"primer_apellido\": \"ZUÑIGA\", \"estado\": \"activo\", \"email\": \"user259@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"VALENTINA\", \"primer_apellido\": \"ZUÑIGA\", \"estado\": \"activo\", \"email\": \"user259@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(138,218,'actualizar','usuarios',218,'{\"primer_nombre\": \"HAMIGTON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user260@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HAMIGTON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user260@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(139,219,'actualizar','usuarios',219,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"VELASQUEZ\", \"estado\": \"activo\", \"email\": \"user261@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"VELASQUEZ\", \"estado\": \"activo\", \"email\": \"user261@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(140,220,'actualizar','usuarios',220,'{\"primer_nombre\": \"AIDA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user262@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"AIDA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user262@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(141,222,'actualizar','usuarios',222,'{\"primer_nombre\": \"CORONCORO\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"elmismodesiempre@carepa-antioquia\"}','{\"primer_nombre\": \"CORONCORO\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"elmismodesiempre@carepa-antioquia\"}',NULL,NULL,'2026-06-26 10:13:26'),
(142,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:13:26'),
(143,66,'actualizar','usuarios',66,'{\"primer_nombre\": \"JAIRO\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user52@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAIRO\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user52@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(144,145,'actualizar','usuarios',145,'{\"primer_nombre\": \"UBER\", \"primer_apellido\": \"BORJA\", \"estado\": \"inactivo\", \"email\": \"user172@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"UBER\", \"primer_apellido\": \"BORJA\", \"estado\": \"inactivo\", \"email\": \"user172@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(145,146,'actualizar','usuarios',146,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(146,147,'actualizar','usuarios',147,'{\"primer_nombre\": \"HARILSON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user177@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HARILSON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user177@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(147,148,'actualizar','usuarios',148,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"LONGA\", \"estado\": \"activo\", \"email\": \"user178@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"LONGA\", \"estado\": \"activo\", \"email\": \"user178@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(148,149,'actualizar','usuarios',149,'{\"primer_nombre\": \"YORLEIDY\", \"primer_apellido\": \"CUESTA\", \"estado\": \"activo\", \"email\": \"user179@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YORLEIDY\", \"primer_apellido\": \"CUESTA\", \"estado\": \"activo\", \"email\": \"user179@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(149,150,'actualizar','usuarios',150,'{\"primer_nombre\": \"SANDY\", \"primer_apellido\": \"AYAZO\", \"estado\": \"activo\", \"email\": \"user180@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDY\", \"primer_apellido\": \"AYAZO\", \"estado\": \"activo\", \"email\": \"user180@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(150,151,'actualizar','usuarios',151,'{\"primer_nombre\": \"ANGIE\", \"primer_apellido\": \"ROSERO\", \"estado\": \"activo\", \"email\": \"user181@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANGIE\", \"primer_apellido\": \"ROSERO\", \"estado\": \"activo\", \"email\": \"user181@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(151,152,'actualizar','usuarios',152,'{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PASTRANA\", \"estado\": \"activo\", \"email\": \"user182@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PASTRANA\", \"estado\": \"activo\", \"email\": \"user182@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(152,153,'actualizar','usuarios',153,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user183@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user183@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(153,154,'actualizar','usuarios',154,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ZAYA\", \"estado\": \"activo\", \"email\": \"user184@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ZAYA\", \"estado\": \"activo\", \"email\": \"user184@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(154,184,'actualizar','usuarios',184,'{\"primer_nombre\": \"ARISTOBULO\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user226@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ARISTOBULO\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user226@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(155,185,'actualizar','usuarios',185,'{\"primer_nombre\": \"YADERLIS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user227@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YADERLIS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user227@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(156,186,'actualizar','usuarios',186,'{\"primer_nombre\": \"ROBINSON\", \"primer_apellido\": \"TABORDA\", \"estado\": \"activo\", \"email\": \"user228@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROBINSON\", \"primer_apellido\": \"TABORDA\", \"estado\": \"activo\", \"email\": \"user228@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(157,187,'actualizar','usuarios',187,'{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CAICEDO\", \"estado\": \"activo\", \"email\": \"user229@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CAICEDO\", \"estado\": \"activo\", \"email\": \"user229@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(158,188,'actualizar','usuarios',188,'{\"primer_nombre\": \"MAGDY\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user230@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MAGDY\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user230@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(159,189,'actualizar','usuarios',189,'{\"primer_nombre\": \"KAROLL\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user231@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"KAROLL\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user231@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(160,190,'actualizar','usuarios',190,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"ALEGRIA\", \"estado\": \"activo\", \"email\": \"user232@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"ALEGRIA\", \"estado\": \"activo\", \"email\": \"user232@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(161,191,'actualizar','usuarios',191,'{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"MEJIA\", \"estado\": \"activo\", \"email\": \"user233@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"MEJIA\", \"estado\": \"activo\", \"email\": \"user233@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(162,192,'actualizar','usuarios',192,'{\"primer_nombre\": \"ALEJANDRO\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"activo\", \"email\": \"user234@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALEJANDRO\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"activo\", \"email\": \"user234@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(163,193,'actualizar','usuarios',193,'{\"primer_nombre\": \"WILFER\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user235@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"WILFER\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user235@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(164,194,'actualizar','usuarios',194,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user236@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user236@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(165,195,'actualizar','usuarios',195,'{\"primer_nombre\": \"GERSON\", \"primer_apellido\": \"GOEZ\", \"estado\": \"activo\", \"email\": \"user237@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GERSON\", \"primer_apellido\": \"GOEZ\", \"estado\": \"activo\", \"email\": \"user237@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(166,196,'actualizar','usuarios',196,'{\"primer_nombre\": \"LUISA\", \"primer_apellido\": \"OVIEDO\", \"estado\": \"activo\", \"email\": \"user238@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUISA\", \"primer_apellido\": \"OVIEDO\", \"estado\": \"activo\", \"email\": \"user238@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(167,197,'actualizar','usuarios',197,'{\"primer_nombre\": \"ERVIN\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user239@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ERVIN\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user239@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(168,198,'actualizar','usuarios',198,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user240@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user240@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(169,199,'actualizar','usuarios',199,'{\"primer_nombre\": \"NATALIT\", \"primer_apellido\": \"PUENTES\", \"estado\": \"activo\", \"email\": \"user241@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"NATALIT\", \"primer_apellido\": \"PUENTES\", \"estado\": \"activo\", \"email\": \"user241@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(170,200,'actualizar','usuarios',200,'{\"primer_nombre\": \"DISNEY\", \"primer_apellido\": \"SEPULVEDA\", \"estado\": \"activo\", \"email\": \"user242@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DISNEY\", \"primer_apellido\": \"SEPULVEDA\", \"estado\": \"activo\", \"email\": \"user242@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(171,201,'actualizar','usuarios',201,'{\"primer_nombre\": \"HELENA\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user243@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HELENA\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user243@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(172,202,'actualizar','usuarios',202,'{\"primer_nombre\": \"MILTON\", \"primer_apellido\": \"ARBOLEDA\", \"estado\": \"activo\", \"email\": \"user244@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MILTON\", \"primer_apellido\": \"ARBOLEDA\", \"estado\": \"activo\", \"email\": \"user244@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(173,203,'actualizar','usuarios',203,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"JARAMILLO\", \"estado\": \"activo\", \"email\": \"user245@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"JARAMILLO\", \"estado\": \"activo\", \"email\": \"user245@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(174,204,'actualizar','usuarios',204,'{\"primer_nombre\": \"SANTIAGO\", \"primer_apellido\": \"PEÑA\", \"estado\": \"activo\", \"email\": \"user246@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANTIAGO\", \"primer_apellido\": \"PEÑA\", \"estado\": \"activo\", \"email\": \"user246@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(175,205,'actualizar','usuarios',205,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user247@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user247@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(176,206,'actualizar','usuarios',206,'{\"primer_nombre\": \"JHON\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user248@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JHON\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user248@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(177,207,'actualizar','usuarios',207,'{\"primer_nombre\": \"OFRACINO\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user249@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OFRACINO\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user249@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(178,208,'actualizar','usuarios',208,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user250@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user250@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(179,209,'actualizar','usuarios',209,'{\"primer_nombre\": \"NEIDYS\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user251@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"NEIDYS\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user251@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(180,210,'actualizar','usuarios',210,'{\"primer_nombre\": \"YUDNE\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user252@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YUDNE\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user252@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(181,211,'actualizar','usuarios',211,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"activo\", \"email\": \"user253@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"activo\", \"email\": \"user253@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(182,212,'actualizar','usuarios',212,'{\"primer_nombre\": \"ELIZABETH\", \"primer_apellido\": \"ESTRADA\", \"estado\": \"activo\", \"email\": \"user254@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELIZABETH\", \"primer_apellido\": \"ESTRADA\", \"estado\": \"activo\", \"email\": \"user254@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(183,213,'actualizar','usuarios',213,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"HERRERA\", \"estado\": \"activo\", \"email\": \"user255@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"HERRERA\", \"estado\": \"activo\", \"email\": \"user255@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(184,214,'actualizar','usuarios',214,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ASPRILLA\", \"estado\": \"activo\", \"email\": \"user256@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ASPRILLA\", \"estado\": \"activo\", \"email\": \"user256@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(185,215,'actualizar','usuarios',215,'{\"primer_nombre\": \"JAVIER\", \"primer_apellido\": \"PEREZ\", \"estado\": \"activo\", \"email\": \"user257@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAVIER\", \"primer_apellido\": \"PEREZ\", \"estado\": \"activo\", \"email\": \"user257@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(186,216,'actualizar','usuarios',216,'{\"primer_nombre\": \"GLENYS\", \"primer_apellido\": \"VALENCIA\", \"estado\": \"activo\", \"email\": \"user258@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GLENYS\", \"primer_apellido\": \"VALENCIA\", \"estado\": \"activo\", \"email\": \"user258@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(187,217,'actualizar','usuarios',217,'{\"primer_nombre\": \"VALENTINA\", \"primer_apellido\": \"ZUÑIGA\", \"estado\": \"activo\", \"email\": \"user259@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"VALENTINA\", \"primer_apellido\": \"ZUÑIGA\", \"estado\": \"activo\", \"email\": \"user259@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(188,218,'actualizar','usuarios',218,'{\"primer_nombre\": \"HAMIGTON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user260@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HAMIGTON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user260@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(189,219,'actualizar','usuarios',219,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"VELASQUEZ\", \"estado\": \"activo\", \"email\": \"user261@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"VELASQUEZ\", \"estado\": \"activo\", \"email\": \"user261@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(190,220,'actualizar','usuarios',220,'{\"primer_nombre\": \"AIDA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user262@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"AIDA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user262@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(191,221,'actualizar','usuarios',221,'{\"primer_nombre\": \"OTRO\", \"primer_apellido\": \"DE\", \"estado\": \"activo\", \"email\": \"otrosistemas@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OTRO\", \"primer_apellido\": \"DE\", \"estado\": \"activo\", \"email\": \"otrosistemas@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:13:26'),
(192,222,'actualizar','usuarios',222,'{\"primer_nombre\": \"CORONCORO\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"elmismodesiempre@carepa-antioquia\"}','{\"primer_nombre\": \"CORONCORO\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"elmismodesiempre@carepa-antioquia\"}',NULL,NULL,'2026-06-26 10:13:26'),
(193,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:13:56'),
(194,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:14:08'),
(195,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:14:08'),
(196,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:14:09'),
(197,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"ANASTASIA\", \"primer_apellido\": \"ANASTASIA KOLUVOV\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:14:46'),
(198,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"LUSELY OREJUELA\", \"estado\": \"inactivo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:14:46'),
(199,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"user105@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:14:46'),
(200,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:30:22'),
(201,12,'actualizar','usuarios',13,'{\"id\":13,\"documento\":\"43141896\",\"tipo_documento\":\"CC\",\"genero\":null,\"primer_nombre\":\"LUSELY\",\"segundo_nombre\":null,\"primer_apellido\":\"OREJUELA\",\"segundo_apellido\":null,\"email\":\"user80@carepa-antioquia.gov.co\",\"email_confirmado\":0,\"telefono1\":null,\"telefono2\":null,\"password_hash\":\"$2y$12$eOad\\/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG\",\"estado\":\"activo\",\"intentos_fallidos\":0,\"ultimo_acceso\":null,\"entidad_id\":1,\"dependencia_id\":null,\"es_contratista\":0,\"nivel\":null,\"naturaleza\":null,\"tipo_nombramiento\":null,\"denominacion_empleo\":\"Funcionario\",\"codigo_empleo\":null,\"grado_empleo\":null,\"es_evaluador_y_evaluado\":0,\"dependencia_evaluacion_id\":null,\"en_periodo_prueba\":0,\"fecha_posesion\":null,\"proposito_principal_empleo\":null,\"evaluacion_inicio_febrero\":1,\"debe_cambiar_password\":0,\"fecha_inicio_evaluacion\":null,\"motivo_fecha_inicio_diferente\":null,\"creado_en\":\"2026-06-26 10:08:17\",\"actualizado_en\":\"2026-06-26 10:14:46\",\"eliminado_en\":null}','{\"tipo_documento\":\"CC\",\"primer_nombre\":\"LUSELY\",\"segundo_nombre\":null,\"primer_apellido\":\"OREJUELA\",\"segundo_apellido\":null,\"email\":\"user80@carepa-antioquia.gov.co\",\"genero\":\"femenino\",\"telefono1\":null,\"telefono2\":null,\"estado\":\"activo\",\"es_contratista\":0,\"nivel\":\"directivo\",\"naturaleza\":\"libre_nombramiento_gerencia_publica\",\"tipo_nombramiento\":\"hecho_en_carrera\",\"dependencia_id\":14,\"denominacion_empleo\":\"Jefe de Dependencia\",\"codigo_empleo\":null,\"grado_empleo\":null,\"es_evaluador_y_evaluado\":0,\"en_periodo_prueba\":0,\"fecha_posesion\":null,\"proposito_principal_empleo\":null}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:30:22'),
(202,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:30:46'),
(203,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:30:54'),
(204,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:30:54'),
(205,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:33:24'),
(206,98,'actualizar','usuarios',98,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"CASTAÑO\", \"estado\": \"activo\", \"email\": \"user85@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"CASTAÑO\", \"estado\": \"activo\", \"email\": \"user85@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(207,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(208,87,'actualizar','usuarios',87,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"IBARGUEN\", \"estado\": \"activo\", \"email\": \"user73@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"IBARGUEN\", \"estado\": \"activo\", \"email\": \"user73@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(209,88,'actualizar','usuarios',88,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"ANGULO\", \"estado\": \"inactivo\", \"email\": \"user74@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"ANGULO\", \"estado\": \"inactivo\", \"email\": \"user74@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(210,167,'actualizar','usuarios',167,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"BARRAZA\", \"estado\": \"activo\", \"email\": \"user202@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"BARRAZA\", \"estado\": \"activo\", \"email\": \"user202@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(211,174,'actualizar','usuarios',174,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"REYES\", \"estado\": \"activo\", \"email\": \"user215@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"REYES\", \"estado\": \"activo\", \"email\": \"user215@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(212,146,'actualizar','usuarios',146,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(213,156,'actualizar','usuarios',156,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user186@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user186@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:33:24'),
(214,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:36:52'),
(215,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:37:03'),
(216,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:37:14'),
(217,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:37:14'),
(218,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:37:25'),
(219,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:37:42'),
(220,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:37:42'),
(221,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:38:03'),
(222,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:38:10'),
(223,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:38:10'),
(224,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:38:11'),
(225,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:41:26'),
(226,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(227,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(228,15,'actualizar','usuarios',15,'{\"primer_nombre\": \"ALBA\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user1@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALBA\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user1@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(229,16,'actualizar','usuarios',16,'{\"primer_nombre\": \"ALDAIR\", \"primer_apellido\": \"ROMERO\", \"estado\": \"activo\", \"email\": \"user2@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALDAIR\", \"primer_apellido\": \"ROMERO\", \"estado\": \"activo\", \"email\": \"user2@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(230,17,'actualizar','usuarios',17,'{\"primer_nombre\": \"ALEXANDER\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"inactivo\", \"email\": \"user3@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALEXANDER\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"inactivo\", \"email\": \"user3@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(231,18,'actualizar','usuarios',18,'{\"primer_nombre\": \"ALEXANDRA\", \"primer_apellido\": \"SILVA\", \"estado\": \"inactivo\", \"email\": \"user4@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALEXANDRA\", \"primer_apellido\": \"SILVA\", \"estado\": \"inactivo\", \"email\": \"user4@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(232,19,'actualizar','usuarios',19,'{\"primer_nombre\": \"JONNAN\", \"primer_apellido\": \"ALEXIS\", \"estado\": \"inactivo\", \"email\": \"user5@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JONNAN\", \"primer_apellido\": \"ALEXIS\", \"estado\": \"inactivo\", \"email\": \"user5@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(233,20,'actualizar','usuarios',20,'{\"primer_nombre\": \"ALVARO\", \"primer_apellido\": \"HINCAPIE\", \"estado\": \"inactivo\", \"email\": \"user6@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALVARO\", \"primer_apellido\": \"HINCAPIE\", \"estado\": \"inactivo\", \"email\": \"user6@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(234,21,'actualizar','usuarios',21,'{\"primer_nombre\": \"ALVARO\", \"primer_apellido\": \"CERPA\", \"estado\": \"inactivo\", \"email\": \"user7@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALVARO\", \"primer_apellido\": \"CERPA\", \"estado\": \"inactivo\", \"email\": \"user7@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(235,22,'actualizar','usuarios',22,'{\"primer_nombre\": \"ANA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"inactivo\", \"email\": \"user8@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"inactivo\", \"email\": \"user8@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(236,23,'actualizar','usuarios',23,'{\"primer_nombre\": \"ANA\", \"primer_apellido\": \"RESTREPO\", \"estado\": \"inactivo\", \"email\": \"user9@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANA\", \"primer_apellido\": \"RESTREPO\", \"estado\": \"inactivo\", \"email\": \"user9@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(237,24,'actualizar','usuarios',24,'{\"primer_nombre\": \"ANDERSON\", \"primer_apellido\": \" PATIÑO\", \"estado\": \"activo\", \"email\": \"user10@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANDERSON\", \"primer_apellido\": \" PATIÑO\", \"estado\": \"activo\", \"email\": \"user10@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(238,25,'actualizar','usuarios',25,'{\"primer_nombre\": \"ANDRY\", \"primer_apellido\": \"FUENTES\", \"estado\": \"activo\", \"email\": \"user11@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANDRY\", \"primer_apellido\": \"FUENTES\", \"estado\": \"activo\", \"email\": \"user11@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(239,26,'actualizar','usuarios',26,'{\"primer_nombre\": \"ANYIBED\", \"primer_apellido\": \"MÁRQUEZ\", \"estado\": \"inactivo\", \"email\": \"user12@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANYIBED\", \"primer_apellido\": \"MÁRQUEZ\", \"estado\": \"inactivo\", \"email\": \"user12@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(240,27,'actualizar','usuarios',27,'{\"primer_nombre\": \"ARLEY\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user13@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ARLEY\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user13@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(241,28,'actualizar','usuarios',28,'{\"primer_nombre\": \"BERLIDIS\", \"primer_apellido\": \"VARGAS\", \"estado\": \"inactivo\", \"email\": \"user14@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"BERLIDIS\", \"primer_apellido\": \"VARGAS\", \"estado\": \"inactivo\", \"email\": \"user14@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(242,29,'actualizar','usuarios',29,'{\"primer_nombre\": \"BERTHA\", \"primer_apellido\": \"HIGUITA\", \"estado\": \"activo\", \"email\": \"user15@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"BERTHA\", \"primer_apellido\": \"HIGUITA\", \"estado\": \"activo\", \"email\": \"user15@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(243,30,'actualizar','usuarios',30,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"activo\", \"email\": \"user16@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"activo\", \"email\": \"user16@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(244,31,'actualizar','usuarios',31,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"QUEJADA\", \"estado\": \"inactivo\", \"email\": \"user17@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"QUEJADA\", \"estado\": \"inactivo\", \"email\": \"user17@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(245,32,'actualizar','usuarios',32,'{\"primer_nombre\": \"CAROLINA\", \"primer_apellido\": \"HENAO\", \"estado\": \"inactivo\", \"email\": \"user18@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CAROLINA\", \"primer_apellido\": \"HENAO\", \"estado\": \"inactivo\", \"email\": \"user18@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(246,33,'actualizar','usuarios',33,'{\"primer_nombre\": \"CINDY\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user19@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CINDY\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user19@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(247,34,'actualizar','usuarios',34,'{\"primer_nombre\": \"CLAUDIA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"inactivo\", \"email\": \"user20@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CLAUDIA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"inactivo\", \"email\": \"user20@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(248,35,'actualizar','usuarios',35,'{\"primer_nombre\": \"CLAUDIA\", \"primer_apellido\": \"RODRIGUEZ\", \"estado\": \"activo\", \"email\": \"user21@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CLAUDIA\", \"primer_apellido\": \"RODRIGUEZ\", \"estado\": \"activo\", \"email\": \"user21@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(249,36,'actualizar','usuarios',36,'{\"primer_nombre\": \"CLAUDIA\", \"primer_apellido\": \"GARCES\", \"estado\": \"inactivo\", \"email\": \"user22@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CLAUDIA\", \"primer_apellido\": \"GARCES\", \"estado\": \"inactivo\", \"email\": \"user22@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(250,37,'actualizar','usuarios',37,'{\"primer_nombre\": \"CLEOFE\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user23@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CLEOFE\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user23@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(251,38,'actualizar','usuarios',38,'{\"primer_nombre\": \"CRISTIAN\", \"primer_apellido\": \"HURTADO\", \"estado\": \"activo\", \"email\": \"user24@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CRISTIAN\", \"primer_apellido\": \"HURTADO\", \"estado\": \"activo\", \"email\": \"user24@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(252,39,'actualizar','usuarios',39,'{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CORONADO\", \"estado\": \"activo\", \"email\": \"user25@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CORONADO\", \"estado\": \"activo\", \"email\": \"user25@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(253,40,'actualizar','usuarios',40,'{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CASTRILLON\", \"estado\": \"activo\", \"email\": \"user26@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CASTRILLON\", \"estado\": \"activo\", \"email\": \"user26@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(254,41,'actualizar','usuarios',41,'{\"primer_nombre\": \"DANNY\", \"primer_apellido\": \"CAUSIL\", \"estado\": \"activo\", \"email\": \"user27@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANNY\", \"primer_apellido\": \"CAUSIL\", \"estado\": \"activo\", \"email\": \"user27@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(255,42,'actualizar','usuarios',42,'{\"primer_nombre\": \"DANNY\", \"primer_apellido\": \"NARVAEZ\", \"estado\": \"inactivo\", \"email\": \"user28@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANNY\", \"primer_apellido\": \"NARVAEZ\", \"estado\": \"inactivo\", \"email\": \"user28@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(256,43,'actualizar','usuarios',43,'{\"primer_nombre\": \"DEIVIS\", \"primer_apellido\": \"NORIEGA\", \"estado\": \"inactivo\", \"email\": \"user29@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DEIVIS\", \"primer_apellido\": \"NORIEGA\", \"estado\": \"inactivo\", \"email\": \"user29@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(257,44,'actualizar','usuarios',44,'{\"primer_nombre\": \"EDILSON\", \"primer_apellido\": \"CORONADO\", \"estado\": \"inactivo\", \"email\": \"user30@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EDILSON\", \"primer_apellido\": \"CORONADO\", \"estado\": \"inactivo\", \"email\": \"user30@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(258,45,'actualizar','usuarios',45,'{\"primer_nombre\": \"EIDY\", \"primer_apellido\": \"OCHOA\", \"estado\": \"activo\", \"email\": \"user31@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EIDY\", \"primer_apellido\": \"OCHOA\", \"estado\": \"activo\", \"email\": \"user31@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(259,46,'actualizar','usuarios',46,'{\"primer_nombre\": \"ELISSAUD\", \"primer_apellido\": \"GOMEZ\", \"estado\": \"activo\", \"email\": \"user32@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELISSAUD\", \"primer_apellido\": \"GOMEZ\", \"estado\": \"activo\", \"email\": \"user32@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(260,47,'actualizar','usuarios',47,'{\"primer_nombre\": \"ELIZA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user33@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELIZA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user33@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(261,48,'actualizar','usuarios',48,'{\"primer_nombre\": \"ELKIN\", \"primer_apellido\": \"DAVID\", \"estado\": \"activo\", \"email\": \"user34@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELKIN\", \"primer_apellido\": \"DAVID\", \"estado\": \"activo\", \"email\": \"user34@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(262,49,'actualizar','usuarios',49,'{\"primer_nombre\": \"ERIKA\", \"primer_apellido\": \"PULGARIN\", \"estado\": \"activo\", \"email\": \"user35@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ERIKA\", \"primer_apellido\": \"PULGARIN\", \"estado\": \"activo\", \"email\": \"user35@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(263,50,'actualizar','usuarios',50,'{\"primer_nombre\": \"ESTEFANIA\", \"primer_apellido\": \"DUQUE\", \"estado\": \"inactivo\", \"email\": \"user36@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ESTEFANIA\", \"primer_apellido\": \"DUQUE\", \"estado\": \"inactivo\", \"email\": \"user36@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(264,51,'actualizar','usuarios',51,'{\"primer_nombre\": \"EUCLIDES\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user37@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EUCLIDES\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user37@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(265,52,'actualizar','usuarios',52,'{\"primer_nombre\": \"EUGENIA\", \"primer_apellido\": \"DE\", \"estado\": \"inactivo\", \"email\": \"user38@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EUGENIA\", \"primer_apellido\": \"DE\", \"estado\": \"inactivo\", \"email\": \"user38@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(266,53,'actualizar','usuarios',53,'{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"ROLDAN\", \"estado\": \"activo\", \"email\": \"user39@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"ROLDAN\", \"estado\": \"activo\", \"email\": \"user39@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(267,54,'actualizar','usuarios',54,'{\"primer_nombre\": \"FERNANDO\", \"primer_apellido\": \"ALONSO\", \"estado\": \"activo\", \"email\": \"user40@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FERNANDO\", \"primer_apellido\": \"ALONSO\", \"estado\": \"activo\", \"email\": \"user40@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(268,55,'actualizar','usuarios',55,'{\"primer_nombre\": \"FRANCISCO\", \"primer_apellido\": \"CASTAÑO\", \"estado\": \"inactivo\", \"email\": \"user41@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FRANCISCO\", \"primer_apellido\": \"CASTAÑO\", \"estado\": \"inactivo\", \"email\": \"user41@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(269,56,'actualizar','usuarios',56,'{\"primer_nombre\": \"GLORIA\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"inactivo\", \"email\": \"user42@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GLORIA\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"inactivo\", \"email\": \"user42@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(270,57,'actualizar','usuarios',57,'{\"primer_nombre\": \"GLORIA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user43@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GLORIA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user43@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(271,58,'actualizar','usuarios',58,'{\"primer_nombre\": \"GUSTAVO\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user44@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GUSTAVO\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user44@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(272,59,'actualizar','usuarios',59,'{\"primer_nombre\": \"GUSTAVO\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user45@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GUSTAVO\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user45@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(273,60,'actualizar','usuarios',60,'{\"primer_nombre\": \"HAROL\", \"primer_apellido\": \"CAVADIA\", \"estado\": \"inactivo\", \"email\": \"user46@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HAROL\", \"primer_apellido\": \"CAVADIA\", \"estado\": \"inactivo\", \"email\": \"user46@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(274,61,'actualizar','usuarios',61,'{\"primer_nombre\": \"HENDER\", \"primer_apellido\": \" MANCO\", \"estado\": \"inactivo\", \"email\": \"user47@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HENDER\", \"primer_apellido\": \" MANCO\", \"estado\": \"inactivo\", \"email\": \"user47@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(275,62,'actualizar','usuarios',62,'{\"primer_nombre\": \"ISABELLA\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"activo\", \"email\": \"user48@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ISABELLA\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"activo\", \"email\": \"user48@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(276,63,'actualizar','usuarios',63,'{\"primer_nombre\": \"JADER\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user49@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JADER\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user49@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(277,64,'actualizar','usuarios',64,'{\"primer_nombre\": \"JAILER\", \"primer_apellido\": \"BARRIOS\", \"estado\": \"inactivo\", \"email\": \"user50@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAILER\", \"primer_apellido\": \"BARRIOS\", \"estado\": \"inactivo\", \"email\": \"user50@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(278,65,'actualizar','usuarios',65,'{\"primer_nombre\": \"JAIME\", \"primer_apellido\": \"QUINTERO\", \"estado\": \"inactivo\", \"email\": \"user51@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAIME\", \"primer_apellido\": \"QUINTERO\", \"estado\": \"inactivo\", \"email\": \"user51@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(279,66,'actualizar','usuarios',66,'{\"primer_nombre\": \"JAIRO\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user52@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAIRO\", \"primer_apellido\": \"GUERRA\", \"estado\": \"activo\", \"email\": \"user52@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(280,67,'actualizar','usuarios',67,'{\"primer_nombre\": \"JESUS\", \"primer_apellido\": \"HURTADO\", \"estado\": \"activo\", \"email\": \"user53@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JESUS\", \"primer_apellido\": \"HURTADO\", \"estado\": \"activo\", \"email\": \"user53@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(281,68,'actualizar','usuarios',68,'{\"primer_nombre\": \"JESÚS\", \"primer_apellido\": \"EVELIO\", \"estado\": \"activo\", \"email\": \"user54@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JESÚS\", \"primer_apellido\": \"EVELIO\", \"estado\": \"activo\", \"email\": \"user54@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(282,69,'actualizar','usuarios',69,'{\"primer_nombre\": \"JHONATAN\", \"primer_apellido\": \"HERNANDEZ\", \"estado\": \"activo\", \"email\": \"user55@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JHONATAN\", \"primer_apellido\": \"HERNANDEZ\", \"estado\": \"activo\", \"email\": \"user55@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(283,70,'actualizar','usuarios',70,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"MENDOZA\", \"estado\": \"activo\", \"email\": \"user56@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"MENDOZA\", \"estado\": \"activo\", \"email\": \"user56@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(284,71,'actualizar','usuarios',71,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"USQUIANO\", \"estado\": \"activo\", \"email\": \"user57@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"USQUIANO\", \"estado\": \"activo\", \"email\": \"user57@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(285,72,'actualizar','usuarios',72,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BETANCOURT\", \"estado\": \"activo\", \"email\": \"user58@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BETANCOURT\", \"estado\": \"activo\", \"email\": \"user58@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(286,73,'actualizar','usuarios',73,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BLANDON\", \"estado\": \"activo\", \"email\": \"user59@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BLANDON\", \"estado\": \"activo\", \"email\": \"user59@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(287,74,'actualizar','usuarios',74,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user60@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user60@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(288,75,'actualizar','usuarios',75,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ALFONSO\", \"estado\": \"inactivo\", \"email\": \"user61@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ALFONSO\", \"estado\": \"inactivo\", \"email\": \"user61@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(289,76,'actualizar','usuarios',76,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"QUINCHIA\", \"estado\": \"activo\", \"email\": \"user62@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"QUINCHIA\", \"estado\": \"activo\", \"email\": \"user62@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(290,77,'actualizar','usuarios',77,'{\"primer_nombre\": \"KAREN\", \"primer_apellido\": \"SUAREZ\", \"estado\": \"inactivo\", \"email\": \"user63@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"KAREN\", \"primer_apellido\": \"SUAREZ\", \"estado\": \"inactivo\", \"email\": \"user63@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(291,78,'actualizar','usuarios',78,'{\"primer_nombre\": \"KATHERIN\", \"primer_apellido\": \"LOZANO\", \"estado\": \"activo\", \"email\": \"user64@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"KATHERIN\", \"primer_apellido\": \"LOZANO\", \"estado\": \"activo\", \"email\": \"user64@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(292,79,'actualizar','usuarios',79,'{\"primer_nombre\": \"KATHERINE\", \"primer_apellido\": \"QUINTERO\", \"estado\": \"activo\", \"email\": \"user65@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"KATHERINE\", \"primer_apellido\": \"QUINTERO\", \"estado\": \"activo\", \"email\": \"user65@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(293,80,'actualizar','usuarios',80,'{\"primer_nombre\": \"LADY\", \"primer_apellido\": \"CASAS\", \"estado\": \"activo\", \"email\": \"user66@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LADY\", \"primer_apellido\": \"CASAS\", \"estado\": \"activo\", \"email\": \"user66@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(294,81,'actualizar','usuarios',81,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GIRON\", \"estado\": \"inactivo\", \"email\": \"user67@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GIRON\", \"estado\": \"inactivo\", \"email\": \"user67@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(295,82,'actualizar','usuarios',82,'{\"primer_nombre\": \"LEDYS\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user68@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LEDYS\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user68@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(296,83,'actualizar','usuarios',83,'{\"primer_nombre\": \"LETICIA\", \"primer_apellido\": \"TAPIA\", \"estado\": \"inactivo\", \"email\": \"user69@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LETICIA\", \"primer_apellido\": \"TAPIA\", \"estado\": \"inactivo\", \"email\": \"user69@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(297,84,'actualizar','usuarios',84,'{\"primer_nombre\": \"LIGIA\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user70@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LIGIA\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user70@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(298,85,'actualizar','usuarios',85,'{\"primer_nombre\": \"LILIANA\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user71@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LILIANA\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user71@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(299,86,'actualizar','usuarios',86,'{\"primer_nombre\": \"LILIANA\", \"primer_apellido\": \"MUÑOZ\", \"estado\": \"activo\", \"email\": \"user72@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LILIANA\", \"primer_apellido\": \"MUÑOZ\", \"estado\": \"activo\", \"email\": \"user72@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(300,87,'actualizar','usuarios',87,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"IBARGUEN\", \"estado\": \"activo\", \"email\": \"user73@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"IBARGUEN\", \"estado\": \"activo\", \"email\": \"user73@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(301,88,'actualizar','usuarios',88,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"ANGULO\", \"estado\": \"inactivo\", \"email\": \"user74@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"ANGULO\", \"estado\": \"inactivo\", \"email\": \"user74@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(302,89,'actualizar','usuarios',89,'{\"primer_nombre\": \"LISBEN\", \"primer_apellido\": \"MORENO\", \"estado\": \"inactivo\", \"email\": \"user75@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LISBEN\", \"primer_apellido\": \"MORENO\", \"estado\": \"inactivo\", \"email\": \"user75@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(303,90,'actualizar','usuarios',90,'{\"primer_nombre\": \"LORENA\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"inactivo\", \"email\": \"user76@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LORENA\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"inactivo\", \"email\": \"user76@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(304,91,'actualizar','usuarios',91,'{\"primer_nombre\": \"LUBY\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"inactivo\", \"email\": \"user77@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUBY\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"inactivo\", \"email\": \"user77@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(305,92,'actualizar','usuarios',92,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"LOPEZ\", \"estado\": \"activo\", \"email\": \"user78@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"LOPEZ\", \"estado\": \"activo\", \"email\": \"user78@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(306,93,'actualizar','usuarios',93,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"CARLOS\", \"estado\": \"inactivo\", \"email\": \"user79@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"CARLOS\", \"estado\": \"inactivo\", \"email\": \"user79@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(307,94,'actualizar','usuarios',94,'{\"primer_nombre\": \"LUZMILA\", \"primer_apellido\": \"CASTRO\", \"estado\": \"activo\", \"email\": \"user81@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUZMILA\", \"primer_apellido\": \"CASTRO\", \"estado\": \"activo\", \"email\": \"user81@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(308,95,'actualizar','usuarios',95,'{\"primer_nombre\": \"MANUEL\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"inactivo\", \"email\": \"user82@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MANUEL\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"inactivo\", \"email\": \"user82@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(309,96,'actualizar','usuarios',96,'{\"primer_nombre\": \"MARÍA\", \"primer_apellido\": \"MUÑOZ\", \"estado\": \"activo\", \"email\": \"user83@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARÍA\", \"primer_apellido\": \"MUÑOZ\", \"estado\": \"activo\", \"email\": \"user83@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(310,97,'actualizar','usuarios',97,'{\"primer_nombre\": \"MARÍA\", \"primer_apellido\": \"GUISAO\", \"estado\": \"activo\", \"email\": \"user84@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARÍA\", \"primer_apellido\": \"GUISAO\", \"estado\": \"activo\", \"email\": \"user84@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(311,98,'actualizar','usuarios',98,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"CASTAÑO\", \"estado\": \"activo\", \"email\": \"user85@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"CASTAÑO\", \"estado\": \"activo\", \"email\": \"user85@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(312,99,'actualizar','usuarios',99,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user86@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user86@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(313,100,'actualizar','usuarios',100,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"TAMAYO\", \"estado\": \"activo\", \"email\": \"user87@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"TAMAYO\", \"estado\": \"activo\", \"email\": \"user87@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(314,101,'actualizar','usuarios',101,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"HIGUITA\", \"estado\": \"activo\", \"email\": \"user88@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"HIGUITA\", \"estado\": \"activo\", \"email\": \"user88@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(315,102,'actualizar','usuarios',102,'{\"primer_nombre\": \"MARIO\", \"primer_apellido\": \"CARDENAS\", \"estado\": \"activo\", \"email\": \"user89@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIO\", \"primer_apellido\": \"CARDENAS\", \"estado\": \"activo\", \"email\": \"user89@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(316,103,'actualizar','usuarios',103,'{\"primer_nombre\": \"MARITZA\", \"primer_apellido\": \"SANTOS\", \"estado\": \"activo\", \"email\": \"user90@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARITZA\", \"primer_apellido\": \"SANTOS\", \"estado\": \"activo\", \"email\": \"user90@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(317,104,'actualizar','usuarios',104,'{\"primer_nombre\": \"MARLA\", \"primer_apellido\": \"YABRUDY\", \"estado\": \"inactivo\", \"email\": \"user91@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARLA\", \"primer_apellido\": \"YABRUDY\", \"estado\": \"inactivo\", \"email\": \"user91@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(318,105,'actualizar','usuarios',105,'{\"primer_nombre\": \"MARTINA\", \"primer_apellido\": \"QUIÑONES\", \"estado\": \"activo\", \"email\": \"user92@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARTINA\", \"primer_apellido\": \"QUIÑONES\", \"estado\": \"activo\", \"email\": \"user92@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(319,106,'actualizar','usuarios',106,'{\"primer_nombre\": \"MAYRA\", \"primer_apellido\": \"CORREA\", \"estado\": \"activo\", \"email\": \"user93@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MAYRA\", \"primer_apellido\": \"CORREA\", \"estado\": \"activo\", \"email\": \"user93@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(320,107,'actualizar','usuarios',107,'{\"primer_nombre\": \"MIGUEL\", \"primer_apellido\": \"RUIZ\", \"estado\": \"activo\", \"email\": \"user94@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MIGUEL\", \"primer_apellido\": \"RUIZ\", \"estado\": \"activo\", \"email\": \"user94@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(321,108,'actualizar','usuarios',108,'{\"primer_nombre\": \"MILADY\", \"primer_apellido\": \"SOTO\", \"estado\": \"inactivo\", \"email\": \"user95@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MILADY\", \"primer_apellido\": \"SOTO\", \"estado\": \"inactivo\", \"email\": \"user95@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(322,109,'actualizar','usuarios',109,'{\"primer_nombre\": \"MONICA\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"inactivo\", \"email\": \"user96@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MONICA\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"inactivo\", \"email\": \"user96@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(323,110,'actualizar','usuarios',110,'{\"primer_nombre\": \"MYLADYS\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"activo\", \"email\": \"user97@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MYLADYS\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"activo\", \"email\": \"user97@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(324,111,'actualizar','usuarios',111,'{\"primer_nombre\": \"OMAIRA\", \"primer_apellido\": \"RUEDA\", \"estado\": \"activo\", \"email\": \"user98@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OMAIRA\", \"primer_apellido\": \"RUEDA\", \"estado\": \"activo\", \"email\": \"user98@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(325,112,'actualizar','usuarios',112,'{\"primer_nombre\": \"OSIRYS\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user99@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OSIRYS\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user99@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(326,113,'actualizar','usuarios',113,'{\"primer_nombre\": \"OTTY\", \"primer_apellido\": \"ROMERO\", \"estado\": \"activo\", \"email\": \"user100@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OTTY\", \"primer_apellido\": \"ROMERO\", \"estado\": \"activo\", \"email\": \"user100@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(327,114,'actualizar','usuarios',114,'{\"primer_nombre\": \"PAULO\", \"primer_apellido\": \"CAVADIA\", \"estado\": \"activo\", \"email\": \"user101@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"PAULO\", \"primer_apellido\": \"CAVADIA\", \"estado\": \"activo\", \"email\": \"user101@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(328,115,'actualizar','usuarios',115,'{\"primer_nombre\": \"REYKLER\", \"primer_apellido\": \"RAMIREZ\", \"estado\": \"inactivo\", \"email\": \"user102@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"REYKLER\", \"primer_apellido\": \"RAMIREZ\", \"estado\": \"inactivo\", \"email\": \"user102@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(329,116,'actualizar','usuarios',116,'{\"primer_nombre\": \"RIKELME\", \"primer_apellido\": \" ROBLEDO\", \"estado\": \"activo\", \"email\": \"user103@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RIKELME\", \"primer_apellido\": \" ROBLEDO\", \"estado\": \"activo\", \"email\": \"user103@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(330,117,'actualizar','usuarios',117,'{\"primer_nombre\": \"ROSMIRA\", \"primer_apellido\": \"PUERTA\", \"estado\": \"activo\", \"email\": \"user104@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROSMIRA\", \"primer_apellido\": \"PUERTA\", \"estado\": \"activo\", \"email\": \"user104@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(331,118,'actualizar','usuarios',118,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"inactivo\", \"email\": \"user106@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"inactivo\", \"email\": \"user106@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(332,119,'actualizar','usuarios',119,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user107@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user107@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(333,120,'actualizar','usuarios',120,'{\"primer_nombre\": \"SINDY\", \"primer_apellido\": \"HERNANDEZ\", \"estado\": \"inactivo\", \"email\": \"user108@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SINDY\", \"primer_apellido\": \"HERNANDEZ\", \"estado\": \"inactivo\", \"email\": \"user108@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(334,121,'actualizar','usuarios',121,'{\"primer_nombre\": \"TRINIDAD\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user109@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"TRINIDAD\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user109@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(335,122,'actualizar','usuarios',122,'{\"primer_nombre\": \"WENDY\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user110@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"WENDY\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user110@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(336,123,'actualizar','usuarios',123,'{\"primer_nombre\": \"WILMAR\", \"primer_apellido\": \"PAZ\", \"estado\": \"inactivo\", \"email\": \"user111@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"WILMAR\", \"primer_apellido\": \"PAZ\", \"estado\": \"inactivo\", \"email\": \"user111@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(337,124,'actualizar','usuarios',124,'{\"primer_nombre\": \"YAMILE\", \"primer_apellido\": \"YAMILE URREGO\", \"estado\": \"activo\", \"email\": \"user112@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YAMILE\", \"primer_apellido\": \"YAMILE URREGO\", \"estado\": \"activo\", \"email\": \"user112@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(338,125,'actualizar','usuarios',125,'{\"primer_nombre\": \"YANIRIS\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"inactivo\", \"email\": \"user113@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YANIRIS\", \"primer_apellido\": \"MARTINEZ\", \"estado\": \"inactivo\", \"email\": \"user113@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(339,126,'actualizar','usuarios',126,'{\"primer_nombre\": \"YEIMER\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user114@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEIMER\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user114@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(340,127,'actualizar','usuarios',127,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"BENITE\", \"estado\": \"activo\", \"email\": \"user116@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"BENITE\", \"estado\": \"activo\", \"email\": \"user116@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(341,128,'actualizar','usuarios',128,'{\"primer_nombre\": \"YESSICA\", \"primer_apellido\": \"HENAO\", \"estado\": \"activo\", \"email\": \"user117@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YESSICA\", \"primer_apellido\": \"HENAO\", \"estado\": \"activo\", \"email\": \"user117@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(342,129,'actualizar','usuarios',129,'{\"primer_nombre\": \"YILIS\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"inactivo\", \"email\": \"user118@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YILIS\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"inactivo\", \"email\": \"user118@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(343,130,'actualizar','usuarios',130,'{\"primer_nombre\": \"YISETH\", \"primer_apellido\": \"CERON\", \"estado\": \"activo\", \"email\": \"user119@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YISETH\", \"primer_apellido\": \"CERON\", \"estado\": \"activo\", \"email\": \"user119@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(344,131,'actualizar','usuarios',131,'{\"primer_nombre\": \"YOLIMA\", \"primer_apellido\": \"ZAPATA\", \"estado\": \"inactivo\", \"email\": \"user120@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YOLIMA\", \"primer_apellido\": \"ZAPATA\", \"estado\": \"inactivo\", \"email\": \"user120@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(345,132,'actualizar','usuarios',132,'{\"primer_nombre\": \"YULISA\", \"primer_apellido\": \"DUARTE\", \"estado\": \"activo\", \"email\": \"user121@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YULISA\", \"primer_apellido\": \"DUARTE\", \"estado\": \"activo\", \"email\": \"user121@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(346,133,'actualizar','usuarios',133,'{\"primer_nombre\": \"YURY\", \"primer_apellido\": \"VALOYES\", \"estado\": \"inactivo\", \"email\": \"user122@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YURY\", \"primer_apellido\": \"VALOYES\", \"estado\": \"inactivo\", \"email\": \"user122@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(347,134,'actualizar','usuarios',134,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"VELEZ\", \"estado\": \"inactivo\", \"email\": \"user125@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"VELEZ\", \"estado\": \"inactivo\", \"email\": \"user125@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(348,135,'actualizar','usuarios',135,'{\"primer_nombre\": \"XIOMARA\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"inactivo\", \"email\": \"user146@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"XIOMARA\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"inactivo\", \"email\": \"user146@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(349,136,'actualizar','usuarios',136,'{\"primer_nombre\": \"GARLANT\", \"primer_apellido\": \"LEDEZMA\", \"estado\": \"activo\", \"email\": \"user154@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GARLANT\", \"primer_apellido\": \"LEDEZMA\", \"estado\": \"activo\", \"email\": \"user154@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(350,137,'actualizar','usuarios',137,'{\"primer_nombre\": \"PITERSON\", \"primer_apellido\": \"TRELLEZ\", \"estado\": \"activo\", \"email\": \"user156@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"PITERSON\", \"primer_apellido\": \"TRELLEZ\", \"estado\": \"activo\", \"email\": \"user156@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(351,138,'actualizar','usuarios',138,'{\"primer_nombre\": \"JIMMY\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user157@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JIMMY\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user157@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(352,139,'actualizar','usuarios',139,'{\"primer_nombre\": \"RAMIRO\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user158@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RAMIRO\", \"primer_apellido\": \"ALVAREZ\", \"estado\": \"activo\", \"email\": \"user158@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(353,140,'actualizar','usuarios',140,'{\"primer_nombre\": \"AGAPÍTO\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user159@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"AGAPÍTO\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user159@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(354,141,'actualizar','usuarios',141,'{\"primer_nombre\": \"EISON\", \"primer_apellido\": \"LIZCANO\", \"estado\": \"activo\", \"email\": \"user160@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EISON\", \"primer_apellido\": \"LIZCANO\", \"estado\": \"activo\", \"email\": \"user160@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(355,142,'actualizar','usuarios',142,'{\"primer_nombre\": \"ANIS\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user161@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANIS\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user161@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(356,143,'actualizar','usuarios',143,'{\"primer_nombre\": \"YAMILETH\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user166@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YAMILETH\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user166@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(357,144,'actualizar','usuarios',144,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ELVIN\", \"estado\": \"activo\", \"email\": \"user168@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ELVIN\", \"estado\": \"activo\", \"email\": \"user168@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(358,145,'actualizar','usuarios',145,'{\"primer_nombre\": \"UBER\", \"primer_apellido\": \"BORJA\", \"estado\": \"inactivo\", \"email\": \"user172@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"UBER\", \"primer_apellido\": \"BORJA\", \"estado\": \"inactivo\", \"email\": \"user172@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(359,146,'actualizar','usuarios',146,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"ESPITIA\", \"estado\": \"inactivo\", \"email\": \"user176@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(360,147,'actualizar','usuarios',147,'{\"primer_nombre\": \"HARILSON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user177@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HARILSON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user177@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(361,148,'actualizar','usuarios',148,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"LONGA\", \"estado\": \"activo\", \"email\": \"user178@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"LONGA\", \"estado\": \"activo\", \"email\": \"user178@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(362,149,'actualizar','usuarios',149,'{\"primer_nombre\": \"YORLEIDY\", \"primer_apellido\": \"CUESTA\", \"estado\": \"activo\", \"email\": \"user179@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YORLEIDY\", \"primer_apellido\": \"CUESTA\", \"estado\": \"activo\", \"email\": \"user179@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(363,150,'actualizar','usuarios',150,'{\"primer_nombre\": \"SANDY\", \"primer_apellido\": \"AYAZO\", \"estado\": \"activo\", \"email\": \"user180@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDY\", \"primer_apellido\": \"AYAZO\", \"estado\": \"activo\", \"email\": \"user180@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(364,151,'actualizar','usuarios',151,'{\"primer_nombre\": \"ANGIE\", \"primer_apellido\": \"ROSERO\", \"estado\": \"activo\", \"email\": \"user181@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ANGIE\", \"primer_apellido\": \"ROSERO\", \"estado\": \"activo\", \"email\": \"user181@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(365,152,'actualizar','usuarios',152,'{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PASTRANA\", \"estado\": \"activo\", \"email\": \"user182@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PASTRANA\", \"estado\": \"activo\", \"email\": \"user182@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(366,153,'actualizar','usuarios',153,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user183@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ECHAVARRIA\", \"estado\": \"activo\", \"email\": \"user183@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(367,154,'actualizar','usuarios',154,'{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ZAYA\", \"estado\": \"activo\", \"email\": \"user184@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JUAN\", \"primer_apellido\": \"ZAYA\", \"estado\": \"activo\", \"email\": \"user184@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(368,155,'actualizar','usuarios',155,'{\"primer_nombre\": \"EDIS\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user185@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"EDIS\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user185@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(369,156,'actualizar','usuarios',156,'{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user186@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SHIRLEY\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user186@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(370,157,'actualizar','usuarios',157,'{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user188@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUZ\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user188@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(371,158,'actualizar','usuarios',158,'{\"primer_nombre\": \"DORA\", \"primer_apellido\": \"BENITEZ\", \"estado\": \"activo\", \"email\": \"user189@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DORA\", \"primer_apellido\": \"BENITEZ\", \"estado\": \"activo\", \"email\": \"user189@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(372,159,'actualizar','usuarios',159,'{\"primer_nombre\": \"MARTHA\", \"primer_apellido\": \"ORTIZ\", \"estado\": \"activo\", \"email\": \"user190@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARTHA\", \"primer_apellido\": \"ORTIZ\", \"estado\": \"activo\", \"email\": \"user190@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(373,160,'actualizar','usuarios',160,'{\"primer_nombre\": \"CRISTINA\", \"primer_apellido\": \"GORDON\", \"estado\": \"activo\", \"email\": \"user191@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CRISTINA\", \"primer_apellido\": \"GORDON\", \"estado\": \"activo\", \"email\": \"user191@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(374,161,'actualizar','usuarios',161,'{\"primer_nombre\": \"ARGENIDES\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user193@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ARGENIDES\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user193@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(375,162,'actualizar','usuarios',162,'{\"primer_nombre\": \"GILDA\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user195@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GILDA\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user195@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(376,163,'actualizar','usuarios',163,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"PALACIO\", \"estado\": \"activo\", \"email\": \"user196@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"PALACIO\", \"estado\": \"activo\", \"email\": \"user196@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(377,164,'actualizar','usuarios',164,'{\"primer_nombre\": \"DUBAN\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user197@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DUBAN\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user197@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(378,165,'actualizar','usuarios',165,'{\"primer_nombre\": \"YULY\", \"primer_apellido\": \"RENTERÍA\", \"estado\": \"activo\", \"email\": \"user198@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YULY\", \"primer_apellido\": \"RENTERÍA\", \"estado\": \"activo\", \"email\": \"user198@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(379,166,'actualizar','usuarios',166,'{\"primer_nombre\": \"YIRLEY\", \"primer_apellido\": \"ROJAS\", \"estado\": \"activo\", \"email\": \"user201@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YIRLEY\", \"primer_apellido\": \"ROJAS\", \"estado\": \"activo\", \"email\": \"user201@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(380,167,'actualizar','usuarios',167,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"BARRAZA\", \"estado\": \"activo\", \"email\": \"user202@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"BARRAZA\", \"estado\": \"activo\", \"email\": \"user202@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(381,168,'actualizar','usuarios',168,'{\"primer_nombre\": \"DELKIN\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"user203@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DELKIN\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"user203@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(382,169,'actualizar','usuarios',169,'{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"OSORIO\", \"estado\": \"activo\", \"email\": \"user205@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARIA\", \"primer_apellido\": \"OSORIO\", \"estado\": \"activo\", \"email\": \"user205@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(383,170,'actualizar','usuarios',170,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"GUISAO\", \"estado\": \"activo\", \"email\": \"user206@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"GUISAO\", \"estado\": \"activo\", \"email\": \"user206@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(384,171,'actualizar','usuarios',171,'{\"primer_nombre\": \"ROSA\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user207@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROSA\", \"primer_apellido\": \"RIVAS\", \"estado\": \"activo\", \"email\": \"user207@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(385,172,'actualizar','usuarios',172,'{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"PATIÑO\", \"estado\": \"activo\", \"email\": \"user213@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"PATIÑO\", \"estado\": \"activo\", \"email\": \"user213@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(386,173,'actualizar','usuarios',173,'{\"primer_nombre\": \"ESTEFFANI\", \"primer_apellido\": \"MANCO\", \"estado\": \"activo\", \"email\": \"user214@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ESTEFFANI\", \"primer_apellido\": \"MANCO\", \"estado\": \"activo\", \"email\": \"user214@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(387,174,'actualizar','usuarios',174,'{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"REYES\", \"estado\": \"activo\", \"email\": \"user215@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LINA\", \"primer_apellido\": \"REYES\", \"estado\": \"activo\", \"email\": \"user215@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(388,175,'actualizar','usuarios',175,'{\"primer_nombre\": \"DARY\", \"primer_apellido\": \"JULIO\", \"estado\": \"activo\", \"email\": \"user216@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DARY\", \"primer_apellido\": \"JULIO\", \"estado\": \"activo\", \"email\": \"user216@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(389,176,'actualizar','usuarios',176,'{\"primer_nombre\": \"JULIAN\", \"primer_apellido\": \"DAVID\", \"estado\": \"activo\", \"email\": \"user217@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JULIAN\", \"primer_apellido\": \"DAVID\", \"estado\": \"activo\", \"email\": \"user217@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(390,177,'actualizar','usuarios',177,'{\"primer_nombre\": \"DIEGO\", \"primer_apellido\": \"ALBORNOZ\", \"estado\": \"activo\", \"email\": \"user218@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DIEGO\", \"primer_apellido\": \"ALBORNOZ\", \"estado\": \"activo\", \"email\": \"user218@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(391,178,'actualizar','usuarios',178,'{\"primer_nombre\": \"ELVIA\", \"primer_apellido\": \"JARAVA\", \"estado\": \"activo\", \"email\": \"user219@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELVIA\", \"primer_apellido\": \"JARAVA\", \"estado\": \"activo\", \"email\": \"user219@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(392,179,'actualizar','usuarios',179,'{\"primer_nombre\": \"VICTOR\", \"primer_apellido\": \"VARGAS\", \"estado\": \"activo\", \"email\": \"user220@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"VICTOR\", \"primer_apellido\": \"VARGAS\", \"estado\": \"activo\", \"email\": \"user220@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(393,180,'actualizar','usuarios',180,'{\"primer_nombre\": \"MARYELIS\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user221@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MARYELIS\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user221@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(394,181,'actualizar','usuarios',181,'{\"primer_nombre\": \"JHOSELIN\", \"primer_apellido\": \"GUERRERO\", \"estado\": \"activo\", \"email\": \"user223@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JHOSELIN\", \"primer_apellido\": \"GUERRERO\", \"estado\": \"activo\", \"email\": \"user223@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(395,182,'actualizar','usuarios',182,'{\"primer_nombre\": \"ROSALBA\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user224@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROSALBA\", \"primer_apellido\": \"SERNA\", \"estado\": \"activo\", \"email\": \"user224@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(396,183,'actualizar','usuarios',183,'{\"primer_nombre\": \"SEBASTIAN\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user225@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SEBASTIAN\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user225@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(397,184,'actualizar','usuarios',184,'{\"primer_nombre\": \"ARISTOBULO\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user226@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ARISTOBULO\", \"primer_apellido\": \"TAPIAS\", \"estado\": \"activo\", \"email\": \"user226@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(398,185,'actualizar','usuarios',185,'{\"primer_nombre\": \"YADERLIS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user227@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YADERLIS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user227@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(399,186,'actualizar','usuarios',186,'{\"primer_nombre\": \"ROBINSON\", \"primer_apellido\": \"TABORDA\", \"estado\": \"activo\", \"email\": \"user228@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ROBINSON\", \"primer_apellido\": \"TABORDA\", \"estado\": \"activo\", \"email\": \"user228@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(400,187,'actualizar','usuarios',187,'{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CAICEDO\", \"estado\": \"activo\", \"email\": \"user229@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DANIEL\", \"primer_apellido\": \"CAICEDO\", \"estado\": \"activo\", \"email\": \"user229@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(401,188,'actualizar','usuarios',188,'{\"primer_nombre\": \"MAGDY\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user230@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MAGDY\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"user230@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(402,189,'actualizar','usuarios',189,'{\"primer_nombre\": \"KAROLL\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user231@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"KAROLL\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user231@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(403,190,'actualizar','usuarios',190,'{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"ALEGRIA\", \"estado\": \"activo\", \"email\": \"user232@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANDRA\", \"primer_apellido\": \"ALEGRIA\", \"estado\": \"activo\", \"email\": \"user232@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(404,191,'actualizar','usuarios',191,'{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"MEJIA\", \"estado\": \"activo\", \"email\": \"user233@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"FABIAN\", \"primer_apellido\": \"MEJIA\", \"estado\": \"activo\", \"email\": \"user233@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(405,192,'actualizar','usuarios',192,'{\"primer_nombre\": \"ALEJANDRO\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"activo\", \"email\": \"user234@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ALEJANDRO\", \"primer_apellido\": \"RENTERIA\", \"estado\": \"activo\", \"email\": \"user234@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(406,193,'actualizar','usuarios',193,'{\"primer_nombre\": \"WILFER\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user235@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"WILFER\", \"primer_apellido\": \"MURILLO\", \"estado\": \"activo\", \"email\": \"user235@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(407,194,'actualizar','usuarios',194,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user236@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"BARRERA\", \"estado\": \"activo\", \"email\": \"user236@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(408,195,'actualizar','usuarios',195,'{\"primer_nombre\": \"GERSON\", \"primer_apellido\": \"GOEZ\", \"estado\": \"activo\", \"email\": \"user237@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GERSON\", \"primer_apellido\": \"GOEZ\", \"estado\": \"activo\", \"email\": \"user237@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(409,196,'actualizar','usuarios',196,'{\"primer_nombre\": \"LUISA\", \"primer_apellido\": \"OVIEDO\", \"estado\": \"activo\", \"email\": \"user238@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUISA\", \"primer_apellido\": \"OVIEDO\", \"estado\": \"activo\", \"email\": \"user238@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(410,197,'actualizar','usuarios',197,'{\"primer_nombre\": \"ERVIN\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user239@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ERVIN\", \"primer_apellido\": \"MENA\", \"estado\": \"activo\", \"email\": \"user239@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(411,198,'actualizar','usuarios',198,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user240@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GULFO\", \"estado\": \"activo\", \"email\": \"user240@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(412,199,'actualizar','usuarios',199,'{\"primer_nombre\": \"NATALIT\", \"primer_apellido\": \"PUENTES\", \"estado\": \"activo\", \"email\": \"user241@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"NATALIT\", \"primer_apellido\": \"PUENTES\", \"estado\": \"activo\", \"email\": \"user241@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(413,200,'actualizar','usuarios',200,'{\"primer_nombre\": \"DISNEY\", \"primer_apellido\": \"SEPULVEDA\", \"estado\": \"activo\", \"email\": \"user242@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"DISNEY\", \"primer_apellido\": \"SEPULVEDA\", \"estado\": \"activo\", \"email\": \"user242@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(414,201,'actualizar','usuarios',201,'{\"primer_nombre\": \"HELENA\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user243@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HELENA\", \"primer_apellido\": \"BRAVO\", \"estado\": \"activo\", \"email\": \"user243@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(415,202,'actualizar','usuarios',202,'{\"primer_nombre\": \"MILTON\", \"primer_apellido\": \"ARBOLEDA\", \"estado\": \"activo\", \"email\": \"user244@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"MILTON\", \"primer_apellido\": \"ARBOLEDA\", \"estado\": \"activo\", \"email\": \"user244@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(416,203,'actualizar','usuarios',203,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"JARAMILLO\", \"estado\": \"activo\", \"email\": \"user245@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"JARAMILLO\", \"estado\": \"activo\", \"email\": \"user245@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(417,204,'actualizar','usuarios',204,'{\"primer_nombre\": \"SANTIAGO\", \"primer_apellido\": \"PEÑA\", \"estado\": \"activo\", \"email\": \"user246@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"SANTIAGO\", \"primer_apellido\": \"PEÑA\", \"estado\": \"activo\", \"email\": \"user246@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(418,205,'actualizar','usuarios',205,'{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user247@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"CARLOS\", \"primer_apellido\": \"ESCOBAR\", \"estado\": \"activo\", \"email\": \"user247@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(419,206,'actualizar','usuarios',206,'{\"primer_nombre\": \"JHON\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user248@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JHON\", \"primer_apellido\": \"ACOSTA\", \"estado\": \"activo\", \"email\": \"user248@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(420,207,'actualizar','usuarios',207,'{\"primer_nombre\": \"OFRACINO\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user249@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OFRACINO\", \"primer_apellido\": \"PALACIOS\", \"estado\": \"activo\", \"email\": \"user249@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(421,208,'actualizar','usuarios',208,'{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user250@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LAURA\", \"primer_apellido\": \"GARCIA\", \"estado\": \"activo\", \"email\": \"user250@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(422,209,'actualizar','usuarios',209,'{\"primer_nombre\": \"NEIDYS\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user251@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"NEIDYS\", \"primer_apellido\": \"PETRO\", \"estado\": \"activo\", \"email\": \"user251@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(423,210,'actualizar','usuarios',210,'{\"primer_nombre\": \"YUDNE\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user252@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"YUDNE\", \"primer_apellido\": \"DIAZ\", \"estado\": \"activo\", \"email\": \"user252@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(424,211,'actualizar','usuarios',211,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"activo\", \"email\": \"user253@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"GONZALEZ\", \"estado\": \"activo\", \"email\": \"user253@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(425,212,'actualizar','usuarios',212,'{\"primer_nombre\": \"ELIZABETH\", \"primer_apellido\": \"ESTRADA\", \"estado\": \"activo\", \"email\": \"user254@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"ELIZABETH\", \"primer_apellido\": \"ESTRADA\", \"estado\": \"activo\", \"email\": \"user254@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(426,213,'actualizar','usuarios',213,'{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"HERRERA\", \"estado\": \"activo\", \"email\": \"user255@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JORGE\", \"primer_apellido\": \"HERRERA\", \"estado\": \"activo\", \"email\": \"user255@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(427,214,'actualizar','usuarios',214,'{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ASPRILLA\", \"estado\": \"activo\", \"email\": \"user256@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JOSE\", \"primer_apellido\": \"ASPRILLA\", \"estado\": \"activo\", \"email\": \"user256@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(428,215,'actualizar','usuarios',215,'{\"primer_nombre\": \"JAVIER\", \"primer_apellido\": \"PEREZ\", \"estado\": \"activo\", \"email\": \"user257@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"JAVIER\", \"primer_apellido\": \"PEREZ\", \"estado\": \"activo\", \"email\": \"user257@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(429,216,'actualizar','usuarios',216,'{\"primer_nombre\": \"GLENYS\", \"primer_apellido\": \"VALENCIA\", \"estado\": \"activo\", \"email\": \"user258@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"GLENYS\", \"primer_apellido\": \"VALENCIA\", \"estado\": \"activo\", \"email\": \"user258@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(430,217,'actualizar','usuarios',217,'{\"primer_nombre\": \"VALENTINA\", \"primer_apellido\": \"ZUÑIGA\", \"estado\": \"activo\", \"email\": \"user259@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"VALENTINA\", \"primer_apellido\": \"ZUÑIGA\", \"estado\": \"activo\", \"email\": \"user259@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(431,218,'actualizar','usuarios',218,'{\"primer_nombre\": \"HAMIGTON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user260@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"HAMIGTON\", \"primer_apellido\": \"MOSQUERA\", \"estado\": \"activo\", \"email\": \"user260@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(432,219,'actualizar','usuarios',219,'{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"VELASQUEZ\", \"estado\": \"activo\", \"email\": \"user261@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUIS\", \"primer_apellido\": \"VELASQUEZ\", \"estado\": \"activo\", \"email\": \"user261@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(433,220,'actualizar','usuarios',220,'{\"primer_nombre\": \"AIDA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user262@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"AIDA\", \"primer_apellido\": \"BEDOYA\", \"estado\": \"activo\", \"email\": \"user262@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(434,221,'actualizar','usuarios',221,'{\"primer_nombre\": \"OTRO\", \"primer_apellido\": \"DE\", \"estado\": \"activo\", \"email\": \"otrosistemas@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"OTRO\", \"primer_apellido\": \"DE\", \"estado\": \"activo\", \"email\": \"otrosistemas@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:41:26'),
(435,222,'actualizar','usuarios',222,'{\"primer_nombre\": \"CORONCORO\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"elmismodesiempre@carepa-antioquia\"}','{\"primer_nombre\": \"CORONCORO\", \"primer_apellido\": \"PEREA\", \"estado\": \"activo\", \"email\": \"elmismodesiempre@carepa-antioquia\"}',NULL,NULL,'2026-06-26 10:41:26'),
(436,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:48:48'),
(437,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:48:56'),
(438,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:48:56'),
(439,13,'cambiar_rol','usuarios',13,NULL,'{\"rol_activo\":\"jefe_dependencia\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:48:59'),
(440,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:49:26'),
(441,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:49:34'),
(442,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:49:34'),
(443,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:49:36'),
(444,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:49:52'),
(445,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:50:05'),
(446,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:05'),
(447,13,'cambiar_rol','usuarios',13,NULL,'{\"rol_activo\":\"jefe_dependencia\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:06'),
(448,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:12'),
(449,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 10:50:20'),
(450,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:20'),
(451,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:35'),
(452,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 10:50:47'),
(453,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:47'),
(454,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 10:50:50'),
(455,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:20:32'),
(456,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:32:32'),
(457,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:32:47'),
(458,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 11:32:47'),
(459,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 11:32:48'),
(460,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 11:33:07'),
(461,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 11:39:10'),
(462,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 11:39:10'),
(463,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 11:39:23'),
(464,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:39:23'),
(465,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:39:26'),
(466,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:39:38'),
(467,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:39:48'),
(468,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:39:48'),
(469,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:39:50'),
(470,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:40:23'),
(471,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:40:23'),
(472,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:40:24'),
(473,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:40:42'),
(474,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:40:42'),
(475,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:40:43'),
(476,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:48:32'),
(477,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:48:32'),
(478,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:48:33'),
(479,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:53:18'),
(480,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 11:53:29'),
(481,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:53:29'),
(482,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 11:53:30'),
(483,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:03:38'),
(484,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 12:03:51'),
(485,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:03:51'),
(486,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:03:53'),
(487,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:04:03'),
(488,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:04:25'),
(489,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:04:25'),
(490,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:04:28'),
(491,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:05:49'),
(492,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 12:05:58'),
(493,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:05:58'),
(494,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:06:02'),
(495,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:06:13'),
(496,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:06:19'),
(497,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:06:19'),
(498,13,'cambiar_rol','usuarios',13,NULL,'{\"rol_activo\":\"jefe_dependencia\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:06:21'),
(499,13,'crear','metas',6,NULL,'{\"periodo_id\":1,\"dependencia_id\":14,\"funcionario_id\":13,\"evaluador_id\":13,\"descripcion\":\"Cumplir con todos los deberes\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:23:14'),
(500,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:23:57'),
(501,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:24:08'),
(502,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:24:08'),
(503,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:24:14'),
(504,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:24:23'),
(505,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:24:23'),
(506,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:24:24'),
(507,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:29:57'),
(508,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:30:08'),
(509,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:08'),
(510,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:14'),
(511,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:30:23'),
(512,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:23'),
(513,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:24'),
(514,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:40'),
(515,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:30:53'),
(516,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:53'),
(517,13,'cambiar_rol','usuarios',13,NULL,'{\"rol_activo\":\"jefe_dependencia\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:30:56'),
(518,13,'actualizar','metas',6,'{\"id\":6,\"periodo_id\":1,\"dependencia_id\":14,\"funcionario_id\":13,\"evaluador_id\":13,\"tipo\":\"cuantitativa\",\"descripcion\":\"Cumplir con todos los deberes\",\"peso\":null,\"indicador\":null,\"meta_numerica\":null,\"unidad_medida\":null,\"estado\":\"pendiente\",\"creado_en\":\"2026-06-26 12:23:14\",\"actualizado_en\":\"2026-06-26 12:23:14\",\"eliminado_en\":null}','{\"dependencia_id\":14,\"descripcion\":\"Cumplir con todos los deberes\",\"estado\":\"concertada\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:31:04'),
(519,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:31:19'),
(520,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:31:29'),
(521,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:31:29'),
(522,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:31:32'),
(523,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:32:12'),
(524,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:32:20'),
(525,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:32:20'),
(526,13,'cambiar_rol','usuarios',13,NULL,'{\"rol_activo\":\"jefe_dependencia\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:32:22'),
(527,13,'logout','usuarios',13,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:34:31'),
(528,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:34:41'),
(529,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:34:41'),
(530,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:34:42'),
(531,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:42:41'),
(532,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 12:42:44'),
(533,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:42:44'),
(534,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"admin_carepa\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:42:45'),
(535,13,'actualizar','usuarios',13,'{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"LUSELY\", \"primer_apellido\": \"OREJUELA\", \"estado\": \"activo\", \"email\": \"user80@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:44:02'),
(536,NULL,'login','usuarios',13,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:44:02'),
(537,13,'crear','metas',7,NULL,'{\"periodo_id\":1,\"dependencia_id\":14,\"funcionario_id\":13,\"evaluador_id\":13,\"descripcion\":\"Cumplir con todos los deberes de manera eficiente\"}','127.0.0.1','curl/8.20.0','2026-06-26 12:44:10'),
(538,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:44:16'),
(539,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:44:16'),
(540,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','curl/8.20.0','2026-06-26 12:44:43'),
(541,14,'crear_evaluacion','evaluaciones',6,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:45:01'),
(542,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:45:36'),
(543,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:45:36'),
(544,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:45:46'),
(545,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:45:46'),
(546,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:45:56'),
(547,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:45:56'),
(548,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:46:09'),
(549,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:46:09'),
(550,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:50:10'),
(551,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:50:10'),
(552,14,'crear_concertacion','concertaciones',1,NULL,NULL,'127.0.0.1','Python-urllib/3.13','2026-06-26 12:50:10'),
(553,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:50:22'),
(554,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:50:22'),
(555,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:50:27'),
(556,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:50:27'),
(557,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:50:55'),
(558,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:50:55'),
(559,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:51:11'),
(560,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:51:11'),
(561,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:51:19'),
(562,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 12:51:19'),
(563,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:52:02'),
(564,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 12:52:12'),
(565,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:52:12'),
(566,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:52:13'),
(567,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 12:52:57'),
(568,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:52:57'),
(569,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"evaluado\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:53:01'),
(570,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 12:53:18'),
(571,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:53:18'),
(572,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"evaluado\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 12:53:19'),
(573,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:02:44'),
(574,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:02:44'),
(575,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:03:23'),
(576,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:03:23'),
(577,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:03:34'),
(578,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:03:34'),
(579,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:03:43'),
(580,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:03:43'),
(581,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 13:12:51'),
(582,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 13:12:54'),
(583,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 13:12:54'),
(584,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"evaluado\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 13:12:56'),
(585,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 13:13:49'),
(586,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 13:13:52'),
(587,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 13:13:52'),
(588,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"evaluado\"}','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 13:13:54'),
(589,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:15:47'),
(590,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:15:47'),
(591,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:18:41'),
(592,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:18:41'),
(593,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:19:02'),
(594,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:19:02'),
(595,14,'crear_concertacion','concertaciones',3,NULL,NULL,'127.0.0.1','Python-urllib/3.13','2026-06-26 13:19:02'),
(596,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 13:19:10'),
(597,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:19:10'),
(598,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 13:19:20'),
(599,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:19:20'),
(600,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 13:20:12'),
(601,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','curl/8.20.0','2026-06-26 13:20:12'),
(602,12,'logout','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 13:21:04'),
(603,14,'actualizar','usuarios',14,'{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}','{\"primer_nombre\": \"RUBITH\", \"primer_apellido\": \"CARVAJAL\", \"estado\": \"activo\", \"email\": \"rubith.carvajal@carepa-antioquia.gov.co\"}',NULL,NULL,'2026-06-26 13:21:16'),
(604,NULL,'login','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 13:21:16'),
(605,14,'cambiar_rol','usuarios',14,NULL,'{\"rol_activo\":\"evaluador\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 13:21:18'),
(606,14,'logout','usuarios',14,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 13:51:37'),
(607,12,'actualizar','usuarios',12,'{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}','{\"primer_nombre\": \"YEISON\", \"primer_apellido\": \"ROMAÑA\", \"estado\": \"activo\", \"email\": \"maiayevir@hotmail.com\"}',NULL,NULL,'2026-06-26 13:51:40'),
(608,NULL,'login','usuarios',12,NULL,NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 13:51:40'),
(609,12,'cambiar_rol','usuarios',12,NULL,'{\"rol_activo\":\"evaluado\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 13:51:46');
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ausentismos`
--

DROP TABLE IF EXISTS `ausentismos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ausentismos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `motivo` enum('incapacidad','comision','encargo','suspension','licencias','vacaciones','otro') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias` int(10) unsigned NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `estado` enum('vigente','finalizado','anulado') NOT NULL DEFAULT 'vigente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_motivo` (`motivo`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_aus_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ausentismos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ausentismos` WRITE;
/*!40000 ALTER TABLE `ausentismos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ausentismos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cargas_masivas`
--

DROP TABLE IF EXISTS `cargas_masivas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargas_masivas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('usuarios','concertaciones','evaluaciones') NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `registros_total` int(10) unsigned DEFAULT 0,
  `registros_exitosos` int(10) unsigned DEFAULT 0,
  `registros_fallidos` int(10) unsigned DEFAULT 0,
  `estado` enum('pendiente','procesando','completado','error') NOT NULL DEFAULT 'pendiente',
  `resultado_detalle` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resultado_detalle`)),
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_carga_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargas_masivas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cargas_masivas` WRITE;
/*!40000 ALTER TABLE `cargas_masivas` DISABLE KEYS */;
/*!40000 ALTER TABLE `cargas_masivas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `competencias`
--

DROP TABLE IF EXISTS `competencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `competencias` (
  `codigo` varchar(60) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `decreto` varchar(20) NOT NULL DEFAULT '815',
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competencias`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `competencias` WRITE;
/*!40000 ALTER TABLE `competencias` DISABLE KEYS */;
INSERT INTO `competencias` VALUES
('ADP_CAM','Adaptacion al cambio','Capacidad para ajustarse a nuevas condiciones y transformaciones','815'),
('APR_CONT','Aprendizaje continuo','Capacidad para adquirir y aplicar nuevos conocimientos de forma permanente','815'),
('APR_TEC','Aporte tecnico profesional','Contribucion especializada al desarrollo de los procesos de la entidad','815'),
('CMP_ORG','Compromiso con la organización','Identificacion y alineacion con los objetivos institucionales','815'),
('ORI_RES','Orientacion a resultados','Capacidad para alcanzar los objetivos propuestos con calidad y oportunidad','815'),
('ORI_USU','Orientacion al usuario y al ciudadano','Compromiso con la satisfaccion de las necesidades de usuarios y ciudadanos','815'),
('TRB_EQP','Trabajo en equipo','Capacidad para colaborar y coordinar con otros para el logro de metas comunes','815');
/*!40000 ALTER TABLE `competencias` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `compromisos`
--

DROP TABLE IF EXISTS `compromisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `compromisos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `concertacion_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('funcional','comportamental') NOT NULL DEFAULT 'funcional',
  `meta_id` bigint(20) unsigned DEFAULT NULL,
  `descripcion` text NOT NULL,
  `peso` decimal(5,2) NOT NULL DEFAULT 0.00,
  `competencia_codigo` varchar(60) DEFAULT NULL,
  `propuesto_por_jefe_entidad` tinyint(1) NOT NULL DEFAULT 0,
  `propuesto_por_secretario_educacion` tinyint(1) NOT NULL DEFAULT 0,
  `es_propuesto_evaluado` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('propuesto','pendiente_aprobacion','aprobado','devuelto','rechazado','en_progreso','cumplido','incumplido') NOT NULL DEFAULT 'propuesto',
  `calificacion` decimal(5,2) DEFAULT NULL,
  `frecuencia` enum('nunca','algunas_veces','frecuentemente','siempre') DEFAULT NULL,
  `nivel_comportamental` enum('bajo','aceptable','alto','muy_alto') DEFAULT NULL,
  `puntaje_comportamental` decimal(5,2) DEFAULT NULL,
  `impacto_aporta_compromisos` enum('si','moderadamente','no') DEFAULT NULL,
  `impacto_excede_estipulado` enum('si','no') DEFAULT NULL,
  `justificacion_excede` text DEFAULT NULL,
  `observaciones_evaluador` text DEFAULT NULL,
  `observaciones_evaluado` text DEFAULT NULL,
  `conductas_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conductas_json`)),
  `motivo_ajuste` enum('cambios_planes_metas','separacion_temporal_30_dias','asignacion_funciones','cambio_empleo_traslado_reubicacion','decision_comision_personal') DEFAULT NULL,
  `fecha_ajuste` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_concertacion` (`concertacion_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_meta` (`meta_id`),
  KEY `idx_competencia` (`competencia_codigo`),
  KEY `idx_comp_motivo_ajuste` (`motivo_ajuste`),
  CONSTRAINT `fk_comp_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_meta` FOREIGN KEY (`meta_id`) REFERENCES `metas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compromisos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `compromisos` WRITE;
/*!40000 ALTER TABLE `compromisos` DISABLE KEYS */;
INSERT INTO `compromisos` VALUES
(5,3,'funcional',1,'Cumplir con todos los deberes de manera eficiente',100.00,NULL,0,0,0,'aprobado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-26 13:19:02','2026-06-26 13:20:54',NULL),
(6,3,'comportamental',NULL,'Adaptacion al cambio',0.00,'ADP_CAM',1,0,0,'aprobado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-26 13:19:02','2026-06-26 13:20:54',NULL),
(7,3,'comportamental',NULL,'Aporte tecnico profesional',0.00,'APR_TEC',1,0,0,'aprobado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-26 13:19:02','2026-06-26 13:20:54',NULL),
(8,3,'comportamental',NULL,'Aprendizaje continuo',0.00,'APR_CONT',1,0,0,'aprobado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-26 13:19:02','2026-06-26 13:20:54',NULL);
/*!40000 ALTER TABLE `compromisos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `compromisos_mejoramiento`
--

DROP TABLE IF EXISTS `compromisos_mejoramiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `compromisos_mejoramiento` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `concertacion_id` bigint(20) unsigned NOT NULL,
  `compromiso_id` bigint(20) unsigned DEFAULT NULL,
  `registrado_por` bigint(20) unsigned NOT NULL,
  `motivo` enum('nivel_no_satisfactorio','nivel_satisfactorio','solicitud_evaluado') NOT NULL,
  `aspecto_corregir` text NOT NULL,
  `acciones_mejoramiento` text NOT NULL,
  `observacion` text DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_concertacion` (`concertacion_id`),
  KEY `idx_compromiso` (`compromiso_id`),
  KEY `idx_registrado_por` (`registrado_por`),
  CONSTRAINT `fk_mej_compromiso` FOREIGN KEY (`compromiso_id`) REFERENCES `compromisos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mej_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mej_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compromisos_mejoramiento`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `compromisos_mejoramiento` WRITE;
/*!40000 ALTER TABLE `compromisos_mejoramiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `compromisos_mejoramiento` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `concertaciones`
--

DROP TABLE IF EXISTS `concertaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `concertaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `periodo_id` bigint(20) unsigned NOT NULL,
  `evaluador_id` bigint(20) unsigned NOT NULL,
  `evaluado_id` bigint(20) unsigned NOT NULL,
  `tipo_concertacion` enum('concertacion_bilateral','fijados_evaluador') NOT NULL DEFAULT 'concertacion_bilateral',
  `conformar_comision_evaluadora` tinyint(1) NOT NULL DEFAULT 0,
  `comision_evaluador_id` bigint(20) unsigned DEFAULT NULL,
  `testigo_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_testigo` datetime DEFAULT NULL,
  `evaluador_no_jefe` tinyint(1) NOT NULL DEFAULT 0,
  `motivo_no_jefe` enum('retiro_empleado_responsable','impedimento','recusacion') DEFAULT NULL,
  `motivo_fijacion_unilateral` enum('no_conformidad_evaluado','vencimiento_plazo_sin_firma','negativa_concertar','omision_evaluador','otro') DEFAULT NULL,
  `estado` enum('pendiente','concertada','propuesta_evaluado','aprobada_evaluado','rechazada_evaluado','fijada') NOT NULL DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `fecha_concertacion` datetime DEFAULT NULL,
  `fecha_limite_concertacion` date DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_periodo_evaluado` (`periodo_id`,`evaluado_id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_evaluador` (`evaluador_id`),
  KEY `idx_evaluado` (`evaluado_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_conc_testigo` (`testigo_id`),
  KEY `fk_conc_comision` (`comision_evaluador_id`),
  CONSTRAINT `fk_conc_comision` FOREIGN KEY (`comision_evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_conc_evaluado` FOREIGN KEY (`evaluado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conc_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conc_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conc_testigo` FOREIGN KEY (`testigo_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concertaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `concertaciones` WRITE;
/*!40000 ALTER TABLE `concertaciones` DISABLE KEYS */;
INSERT INTO `concertaciones` VALUES
(3,1,14,12,'concertacion_bilateral',0,NULL,NULL,NULL,0,NULL,NULL,'pendiente',NULL,NULL,NULL,'2026-06-26 13:19:02','2026-06-26 13:19:02',NULL);
/*!40000 ALTER TABLE `concertaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `conductas`
--

DROP TABLE IF EXISTS `conductas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conductas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `competencia_codigo` varchar(60) NOT NULL,
  `texto` text NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_competencia` (`competencia_codigo`),
  KEY `idx_orden` (`orden`),
  CONSTRAINT `fk_conducta_competencia` FOREIGN KEY (`competencia_codigo`) REFERENCES `competencias` (`codigo`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conductas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `conductas` WRITE;
/*!40000 ALTER TABLE `conductas` DISABLE KEYS */;
INSERT INTO `conductas` VALUES
(1,'ORI_USU','Atiende con respeto, cortesía y diligencia a los usuarios y ciudadanos',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(2,'ORI_USU','Responde oportunamente las solicitudes, peticiones, quejas y reclamos',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(3,'ORI_USU','Brinda información clara, precisa y completa sobre trámites y servicios',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(4,'ORI_USU','Identifica necesidades de los usuarios y propone mejoras en la atención',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(5,'ORI_USU','Mantiene canales de comunicación accesibles y efectivos',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(6,'CMP_ORG','Cumple con los objetivos, metas y valores institucionales',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(7,'CMP_ORG','Participa activamente en la construcción de la cultura organizacional',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(8,'CMP_ORG','Defiende la imagen y reputación de la entidad',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(9,'CMP_ORG','Alinea su desempeño individual con el plan estratégico institucional',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(10,'CMP_ORG','Promueve el sentido de pertenencia entre sus compañeros',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(11,'TRB_EQP','Colabora eficazmente con sus compañeros para alcanzar metas comunes',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(12,'TRB_EQP','Comparte información y conocimientos de forma proactiva',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(13,'TRB_EQP','Resuelve conflictos de manera constructiva y respetuosa',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(14,'TRB_EQP','Apoya a sus compañeros en situaciones de alta carga laboral',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(15,'TRB_EQP','Fomenta un ambiente de confianza y respeto mutuo',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(16,'ORI_RES','Alcanza los objetivos propuestos con calidad y en los tiempos establecidos',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(17,'ORI_RES','Prioriza actividades según su impacto en los resultados institucionales',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(18,'ORI_RES','Monitorea el avance de sus compromisos y toma acciones correctivas',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(19,'ORI_RES','Busca la mejora continua en los procesos de su responsabilidad',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(20,'ORI_RES','Entrega productos y servicios que superan las expectativas mínimas',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(21,'ADP_CAM','Se ajusta rápidamente a nuevas condiciones, normas o procedimientos',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(22,'ADP_CAM','Propone soluciones innovadoras ante situaciones imprevistas',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(23,'ADP_CAM','Mantiene la productividad durante períodos de transición organizacional',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(24,'ADP_CAM','Asume nuevos roles y responsabilidades con actitud positiva',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(25,'ADP_CAM','Aprende y aplica nuevas herramientas tecnológicas con agilidad',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(26,'APR_CONT','Actualiza permanentemente sus conocimientos técnicos y normativos',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(27,'APR_CONT','Aplica nuevos conocimientos para mejorar su desempeño laboral',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(28,'APR_CONT','Participa activamente en actividades de capacitación y formación',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(29,'APR_CONT','Comparte aprendizajes con el equipo de trabajo',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(30,'APR_CONT','Identifica sus brechas de competencias y busca cerrarlas',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(31,'APR_TEC','Aplica conocimientos especializados para resolver problemas complejos',1,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(32,'APR_TEC','Genera aportes técnicos que mejoran los procesos de la entidad',2,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(33,'APR_TEC','Asesora a sus compañeros en temas de su especialidad',3,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(34,'APR_TEC','Mantiene rigor técnico en la elaboración de documentos e informes',4,1,'2026-06-26 09:15:48','2026-06-26 09:15:48'),
(35,'APR_TEC','Innova en metodologías y herramientas de su área profesional',5,1,'2026-06-26 09:15:48','2026-06-26 09:15:48');
/*!40000 ALTER TABLE `conductas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `csrf_tokens`
--

DROP TABLE IF EXISTS `csrf_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `csrf_tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `expiracion` datetime NOT NULL,
  `utilizado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `utilizado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`token`),
  KEY `idx_expiracion` (`expiracion`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `csrf_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `csrf_tokens` WRITE;
/*!40000 ALTER TABLE `csrf_tokens` DISABLE KEYS */;
INSERT INTO `csrf_tokens` VALUES
(1,'23efc71434413ca2fcea51da1a6b0af1424c1a154bc636c8fbf3807e41fbd21f','2026-06-26 15:25:59',0,'2026-06-26 09:25:59',NULL);
/*!40000 ALTER TABLE `csrf_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dependencias`
--

DROP TABLE IF EXISTS `dependencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dependencias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entidad_id` bigint(20) unsigned NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `jefe_id` bigint(20) unsigned DEFAULT NULL,
  `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_entidad_codigo` (`entidad_id`,`codigo`),
  KEY `idx_jefe` (`jefe_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_dep_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `entidades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dep_jefe` FOREIGN KEY (`jefe_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dependencias`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dependencias` WRITE;
/*!40000 ALTER TABLE `dependencias` DISABLE KEYS */;
INSERT INTO `dependencias` VALUES
(1,1,'DEP-001','Direccion de Evaluacion del Desempeno',NULL,'activa','2026-06-26 08:43:37','2026-06-26 08:44:10',NULL),
(2,1,'DEP-002','Oficina de Control Interno',NULL,'activa','2026-06-26 08:43:37','2026-06-26 08:44:10',NULL),
(3,1,'DEP-003','Subdireccion de Talento Humano',NULL,'activa','2026-06-26 08:43:37','2026-06-26 08:44:10',NULL),
(4,1,'DEP-004','Secretaria de Educacion',NULL,'activa','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(5,1,'DEP-005','Oficina de Informatica',NULL,'activa','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(6,1,'GEST-10','Comisaria',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(7,1,'GEST-17','Comunicaciones',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(8,1,'GEST-18','Control Interno',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(9,1,'GEST-12','Despacho del Alcalde',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(10,1,'GEST-9','Inspección',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(11,1,'GEST-13','Oficina de Juridica',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(12,1,'GEST-1','Secretaría de Agricultura y Medio Ambiente',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(13,1,'GEST-2','Secretaría de Educación',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(14,1,'GEST-3','Secretaría de General y Servicios Administrativos',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(15,1,'GEST-4','Secretaria de Gobierno Y Participación Ciudadana',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(16,1,'GEST-21','Secretaría de Infraestructura Física',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(17,1,'GEST-5','Secretaria de Planeación, OOPPMM, Vivienda y Ordenamiento Territorial - Proceso Ordenamiento territo',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(18,1,'GEST-20','Secretaría de Planeación, Vivienda y Ordenamiento Territorial',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(19,1,'GEST-6','Secretaría de Salud y Protección Social',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(20,1,'GEST-7','Secretaría de Transito y Transporte',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(21,1,'GEST-8','Secretaria, de Hacienda',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(22,1,'GEST-11','Sisbén',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL),
(23,1,'GEST-19','Tesorería',NULL,'activa','2026-06-26 10:28:50','2026-06-26 10:28:50',NULL);
/*!40000 ALTER TABLE `dependencias` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `encargos`
--

DROP TABLE IF EXISTS `encargos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `encargos` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `dependencia_a` int(11) NOT NULL,
  `responsable_a` int(11) NOT NULL,
  `responsable_e` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_salida` date DEFAULT NULL,
  `id_decreto` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `fecha_creacion` date NOT NULL,
  `hora` time NOT NULL,
  `Id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encargos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `encargos` WRITE;
/*!40000 ALTER TABLE `encargos` DISABLE KEYS */;
INSERT INTO `encargos` VALUES
(1,12,158,153,'2026-06-05','2026-06-05','D2026-00001','2026-06-05','11:27:57',11),
(2,2,165,157,'2026-06-05','2026-06-05','','2026-06-05','14:20:59',11),
(3,1,162,154,'2026-06-18','2026-06-18','D2026-0022','2026-06-18','10:45:11',11),
(4,21,155,177,'2026-06-19','2026-06-19','D2026-0471','2026-06-18','14:33:46',11);
/*!40000 ALTER TABLE `encargos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `entidades`
--

DROP TABLE IF EXISTS `entidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `entidades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo` enum('entidad','organismo','instituto','superintendencia','agencia','otro') NOT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_codigo` (`codigo`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entidades`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `entidades` WRITE;
/*!40000 ALTER TABLE `entidades` DISABLE KEYS */;
INSERT INTO `entidades` VALUES
(1,'CARE-001','Alcaldia de Carepa','entidad','890001234','Carepa','Antioquia','activa','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL);
/*!40000 ALTER TABLE `entidades` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `evaluaciones`
--

DROP TABLE IF EXISTS `evaluaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `periodo_id` bigint(20) unsigned NOT NULL,
  `evaluado_id` bigint(20) unsigned NOT NULL,
  `evaluador_id` bigint(20) unsigned NOT NULL,
  `concertacion_id` bigint(20) unsigned DEFAULT NULL,
  `tipo` enum('parcial_primer_semestre','parcial_segundo_semestre','parcial_eventual','calificacion_definitiva','calificacion_extraordinaria') NOT NULL,
  `motivo_parcial_eventual` enum('cambio_evaluador','lapso_ultima_evaluacion','periodo_prueba_otro_empleo','separacion_temporal_mas_30_dias','cambio_empleo_traslado') DEFAULT NULL,
  `motivo_extraordinaria` text DEFAULT NULL,
  `evaluador_no_jefe` tinyint(1) NOT NULL DEFAULT 0,
  `motivo_no_jefe` enum('retiro_empleado_responsable','impedimento','recusacion') DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `nota_funcionales` decimal(5,2) DEFAULT NULL,
  `nota_comportamentales` decimal(5,2) DEFAULT NULL,
  `calificacion_definitiva` decimal(5,2) DEFAULT NULL,
  `nivel_resultado` enum('sobresaliente','satisfactorio','no_satisfactorio') DEFAULT NULL,
  `estado` enum('pendiente','en_proceso','calificada','aprobada_comision','rechazada_comision','cerrada') NOT NULL DEFAULT 'pendiente',
  `es_comision_evaluadora` tinyint(1) DEFAULT 0,
  `comision_evaluadora_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_evaluacion` datetime DEFAULT NULL,
  `fecha_calificacion` date DEFAULT NULL,
  `fecha_concertacion` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_evaluado_periodo_tipo` (`evaluado_id`,`periodo_id`,`tipo`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_evaluado` (`evaluado_id`),
  KEY `idx_evaluador` (`evaluador_id`),
  KEY `idx_concertacion` (`concertacion_id`),
  KEY `idx_tipo_estado` (`tipo`,`estado`),
  KEY `idx_comision` (`comision_evaluadora_id`),
  CONSTRAINT `fk_eval_comision` FOREIGN KEY (`comision_evaluadora_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_eval_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_eval_evaluado` FOREIGN KEY (`evaluado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eval_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eval_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `evaluaciones` WRITE;
/*!40000 ALTER TABLE `evaluaciones` DISABLE KEYS */;
INSERT INTO `evaluaciones` VALUES
(1,1,6,2,NULL,'parcial_primer_semestre',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'en_proceso',0,NULL,NULL,NULL,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 08:44:10',NULL),
(2,1,7,2,NULL,'parcial_primer_semestre',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'en_proceso',0,NULL,NULL,NULL,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 08:44:10',NULL),
(3,1,8,3,NULL,'parcial_primer_semestre',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'en_proceso',0,NULL,NULL,NULL,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 08:44:10',NULL),
(4,1,9,5,NULL,'parcial_primer_semestre',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'en_proceso',0,NULL,NULL,NULL,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 08:44:10',NULL),
(5,1,10,5,NULL,'parcial_primer_semestre',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'en_proceso',0,NULL,NULL,NULL,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 08:44:10',NULL),
(6,1,12,14,3,'parcial_primer_semestre',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'cerrada',0,NULL,NULL,NULL,'2026-06-26',NULL,'2026-06-26 12:45:01','2026-06-26 13:20:54',NULL);
/*!40000 ALTER TABLE `evaluaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `evidencias`
--

DROP TABLE IF EXISTS `evidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidencias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `concertacion_id` bigint(20) unsigned NOT NULL,
  `compromiso_id` bigint(20) unsigned DEFAULT NULL,
  `periodo_id` bigint(20) unsigned DEFAULT NULL,
  `registrado_por` bigint(20) unsigned NOT NULL,
  `compromiso_competencia` varchar(255) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `ubicacion` text NOT NULL,
  `observacion` text DEFAULT NULL,
  `tipo` enum('compromiso','competencia','general') DEFAULT 'general',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_concertacion` (`concertacion_id`),
  KEY `idx_compromiso` (`compromiso_id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_registrado_por` (`registrado_por`),
  CONSTRAINT `fk_evi_compromiso` FOREIGN KEY (`compromiso_id`) REFERENCES `compromisos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evi_concertacion` FOREIGN KEY (`concertacion_id`) REFERENCES `concertaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_evi_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evi_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidencias`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `evidencias` WRITE;
/*!40000 ALTER TABLE `evidencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `evidencias` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ext_dependencias`
--

DROP TABLE IF EXISTS `ext_dependencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ext_dependencias` (
  `Id` int(2) NOT NULL,
  `Descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `Id_dependencia` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_descripcion` (`Descripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ext_dependencias`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ext_dependencias` WRITE;
/*!40000 ALTER TABLE `ext_dependencias` DISABLE KEYS */;
INSERT INTO `ext_dependencias` VALUES
(1,'Secretaría de Agricultura y Medio Ambiente',0),
(2,'Secretaría de Educación',0),
(3,'Secretaría de General y Servicios Administrativos',0),
(4,'Secretaria de Gobierno Y Participación Ciudadana',0),
(5,'Secretaria de Planeación, OOPPMM, Vivienda y Ordenamiento Territorial - Proceso Ordenamiento territo',0),
(6,'Secretaría de Salud y Protección Social',0),
(7,'Secretaría de Transito y Transporte',0),
(8,'Secretaria, de Hacienda',0),
(9,'Inspección',4),
(10,'Comisaria',4),
(11,'Sisbén',20),
(12,'Despacho del Alcalde',0),
(13,'Oficina de Juridica',3),
(17,'Comunicaciones',12),
(18,'Control Interno',0),
(19,'Tesorería',8),
(20,'Secretaría de Planeación, Vivienda y Ordenamiento Territorial',0),
(21,'Secretaría de Infraestructura Física',0);
/*!40000 ALTER TABLE `ext_dependencias` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `funcionarios`
--

DROP TABLE IF EXISTS `funcionarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionarios` (
  `Id` int(3) NOT NULL AUTO_INCREMENT,
  `Cedula` int(10) NOT NULL,
  `Nombre` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `Telefono` int(15) NOT NULL,
  `direccion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `correo` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `is_active` int(11) NOT NULL,
  `id_super_usuario` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_cedula` (`Cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `funcionarios` WRITE;
/*!40000 ALTER TABLE `funcionarios` DISABLE KEYS */;
INSERT INTO `funcionarios` VALUES
(1,39425357,'ALBA NELLY GUERRA MONTOYA','0000-00-00',0,'','',1,11),
(2,1040375031,'ALDAIR  ROMERO LOPEZ','0000-00-00',0,'','',1,11),
(3,71258461,'ALEXANDER MOSQUERA MOSQUERA','0000-00-00',0,'','',2,11),
(4,22731855,'ALEXANDRA PATRICIA SILVA GUTIERREZ','0000-00-00',0,'','',2,11),
(5,98648954,'JONNAN ALEXIS CERQUERA','0000-00-00',0,'','',2,11),
(6,1037573859,'ALVARO  HINCAPIE HERNANDEZ','0000-00-00',0,'','',2,11),
(7,10940356,'ALVARO JOSE CERPA HERRERA','0000-00-00',0,'','',2,11),
(8,43141244,'ANA FELISA MOSQUERA MARMOLEJO','0000-00-00',0,'','',2,11),
(9,1027947311,'ANA ISABEL RESTREPO BEDOYA','0000-00-00',0,'','',2,11),
(10,1040375017,'ANDERSON  PATIÑO ALVAREZ','0000-00-00',0,'','',1,11),
(11,1040365874,'ANDRY JULIETH FUENTES LOPEZ','0000-00-00',0,'','',1,11),
(12,33272957,'ANYIBED YUBELI MÁRQUEZ BALLESTEROS','0000-00-00',0,'','',2,11),
(13,71257412,'ARLEY DARIO MURILLO LARGACHA','0000-00-00',0,'','',1,11),
(14,43143319,'BERLIDIS BEATRIZ VARGAS BOLAÑOS','0000-00-00',0,'','',2,11),
(15,43140963,'BERTHA CECILIA HIGUITA VARGAS','0000-00-00',0,'','',1,11),
(16,71242407,'CARLOS ALBERTO MARTINEZ VELEZ','0000-00-00',0,'','',1,11),
(17,71240572,'CARLOS ALBERTO QUEJADA GONZALEZ','0000-00-00',0,'','',2,11),
(18,1027948618,'CAROLINA  HENAO ANDRADE','0000-00-00',0,'','',2,11),
(19,1027999478,'CINDY JHOANNA PALACIOS MENA','0000-00-00',0,'','',1,11),
(20,43143025,'CLAUDIA CECILIA BEDOYA BENITEZ','0000-00-00',0,'','',2,11),
(21,66870688,'CLAUDIA LORENA RODRIGUEZ CHAVEZ','0000-00-00',0,'','',1,11),
(22,43142808,'CLAUDIA LUZ GARCES GARCIA ','0000-00-00',0,'','',2,11),
(23,26328965,'CLEOFE  MOSQUERA MARTINEZ','0000-00-00',0,'','',1,11),
(24,1040382085,'CRISTIAN ANDRES HURTADO HERNANDEZ','0000-00-00',0,'','',1,11),
(25,1001667647,'DANIEL  CORONADO SEPULVEDA','0000-00-00',0,'','',1,11),
(26,1038815273,'DANIEL BERNARDO CASTRILLON PULGARIN','0000-00-00',0,'','',1,11),
(27,39426817,'DANNY DEL PILAR CAUSIL DONADO','0000-00-00',0,'','',1,11),
(28,32852959,'DANNY JOHANA NARVAEZ CORONADO','0000-00-00',0,'','',2,11),
(29,71278837,'DEIVIS  NORIEGA TEHERAN','0000-00-00',0,'','',2,11),
(30,71942673,'EDILSON ENRIQUE CORONADO GUZMÁN','0000-00-00',0,'','',2,11),
(31,1027950228,'EIDY ALEJANDRA OCHOA ARRIETA','0000-00-00',0,'','',1,11),
(32,1038811001,'ELISSAUD  GOMEZ PRECIADO','0000-00-00',0,'','',1,11),
(33,1040354603,'ELIZA  MOSQUERA PALACIO','0000-00-00',0,'','',1,11),
(34,71936117,'ELKIN DARIO DAVID GIRALDO','0000-00-00',0,'','',1,11),
(35,39427628,'ERIKA ANDREA PULGARIN RENGIFO','0000-00-00',0,'','',1,11),
(36,1040366326,'ESTEFANIA  DUQUE MOSQUERA','0000-00-00',0,'','',2,11),
(37,71948054,'EUCLIDES  MENA MORENO','0000-00-00',0,'','',1,11),
(38,34976950,'EUGENIA DEL SOCORRO OLMOS DE MENDOZA','0000-00-00',0,'','',2,11),
(39,71252661,'FABIAN DARLEY ROLDAN VILLA','0000-00-00',0,'','',1,11),
(40,8414514,'FERNANDO ALONSO GUERRA ','0000-00-00',0,'','',1,11),
(41,70557902,'FRANCISCO JAVIER CASTAÑO BOLIVAR ','0000-00-00',0,'','',2,11),
(42,25025100,'GLORIA ELENA GONZALEZ LONDOÑO','0000-00-00',0,'','',2,11),
(43,43146247,'GLORIA LEIDIS MOSQUERA BARRIOS','0000-00-00',0,'','',1,11),
(44,71252120,'GUSTAVO ANTONIO GARCIA MANCO','0000-00-00',0,'','',1,11),
(45,8413893,'GUSTAVO DE JESUS ECHAVARRIA GARCIA','0000-00-00',0,'','',1,11),
(46,1017260456,'HAROL MAURICIO CAVADIA SIERRA','0000-00-00',0,'','',2,11),
(47,71250103,'HENDER  MANCO AVENDAÑO','0000-00-00',0,'','',2,11),
(48,1037671779,'ISABELLA  MARTINEZ RENDON','0000-00-00',0,'','',1,11),
(49,1040365117,'JADER ENRIQUE ACOSTA JARAMILLO','0000-00-00',0,'','',1,11),
(50,11808238,'JAILER BARRIOS RIVAS','0000-00-00',0,'','',2,11),
(51,1000438217,'JAIME LEON QUINTERO MEJIA','0000-00-00',0,'','',2,11),
(52,8321504,'JAIRO  GUERRA MONTOYA','0000-00-00',0,'','',1,11),
(53,71947096,'JESUS DAYLER HURTADO CORDOBA','0000-00-00',0,'','',1,11),
(54,7494222,'JESÚS EVELIO FAJARDO ','0000-00-00',0,'','',1,11),
(55,1073978319,'JHONATAN  HERNANDEZ ORTIZ','0000-00-00',0,'','',1,11),
(56,73133514,'JORGE ARTURO MENDOZA HIJUELOS','0000-00-00',0,'','',1,11),
(57,1040355181,'JORGE IVAN USQUIANO CASTRILLON','0000-00-00',0,'','',1,11),
(58,71250959,'JOSE ALFONSO BETANCOURT MERCADO','0000-00-00',0,'','',1,11),
(59,18461991,'JOSE LEONEL BLANDON LOPEZ','0000-00-00',0,'','',1,11),
(60,71254734,'JOSE NOEL MOSQUERA TORRES','0000-00-00',0,'','',1,11),
(61,98618358,'JOSE WALTER ALFONSO SIERRA','0000-00-00',0,'','',2,11),
(62,1028014661,'JUAN DAVID QUINCHIA SILVA','0000-00-00',0,'','',1,11),
(63,23182741,'KAREN TATIANA SUAREZ ZABALA','0000-00-00',0,'','',2,11),
(64,1028010602,'KATHERIN  LOZANO DURANGO','0000-00-00',0,'','',1,11),
(65,39423830,'KATHERINE HYLEANA QUINTERO PAEZ','0000-00-00',0,'','',1,11),
(66,38463675,'LADY DIANA CASAS CASAS','0000-00-00',0,'','',1,11),
(67,1040372789,'LAURA CRISTINA GIRON ESPITIA','0000-00-00',0,'','',2,11),
(68,1040370353,'LEDYS PAOLA ALVAREZ GALVAN','0000-00-00',0,'','',1,11),
(69,43140526,'LETICIA ELENA TAPIA PALACIOS','0000-00-00',0,'','',2,11),
(70,50934559,'LIGIA ESTHER DIAZ LOPEZ','0000-00-00',0,'','',1,11),
(71,43147732,'LILIANA ASTRID MURILLO TORRES','0000-00-00',0,'','',1,11),
(72,43757087,'LILIANA PATRICIA MUÑOZ VALENCIA','0000-00-00',0,'','',1,11),
(73,1027965245,'LINA MARCELA IBARGUEN GOMEZ','0000-00-00',0,'','',1,11),
(74,22144267,'LINA YANETH ANGULO DIAZ','0000-00-00',0,'','',2,11),
(75,43142342,'LISBEN YUDEIMI MORENO ORREGO','0000-00-00',0,'','',2,11),
(76,39427384,'LORENA MARCELA ROMAÑA PEREA','0000-00-00',0,'','',2,11),
(77,50975680,'LUBY MARIA MARTINEZ ROJAS','0000-00-00',0,'','',2,11),
(78,71933053,'LUIS ALFONSO LOPEZ HERNANDEZ','0000-00-00',0,'','',1,11),
(79,10275544,'LUIS CARLOS HENAO ','0000-00-00',0,'','',2,11),
(80,43141896,'LUSELY OREJUELA','0000-00-00',0,'','',2,11),
(81,32801099,'LUZMILA  CASTRO AGUALIMPIA','0000-00-00',0,'','',1,11),
(82,71250641,'MANUEL ELADIO PALACIOS PALACIOS','0000-00-00',0,'','',2,11),
(83,39299652,'MARÍA ELAILDA MUÑOZ CORRALES','0000-00-00',0,'','',1,11),
(84,43140053,'MARÍA FERNEDYS GUISAO VILLA','0000-00-00',0,'','',1,11),
(85,1001032633,'MARIA JOSE CASTAÑO GONZALEZ','0000-00-00',0,'','',1,11),
(86,39409914,'MARIA JULIANA PALACIOS PALACIOS','0000-00-00',0,'','',1,11),
(87,1001389422,'MARIA LIZETH TAMAYO MUÑOZ','0000-00-00',0,'','',1,11),
(88,32107335,'MARIA MAGALY HIGUITA GAVIRIA','0000-00-00',0,'','',1,11),
(89,71258197,'MARIO ALBERTO CARDENAS DIAZ','0000-00-00',0,'','',1,11),
(90,39408083,'MARITZA  SANTOS HOYOS','0000-00-00',0,'','',1,11),
(91,40985572,'MARLA  YABRUDY ZABALETA','0000-00-00',0,'','',2,11),
(92,26331249,'MARTINA QUIÑONES URBANO','0000-00-00',0,'','',1,11),
(93,1027946373,'MAYRA ALEJANDRA CORREA DIAZ','0000-00-00',0,'','',1,11),
(94,70555733,'MIGUEL ANGEL RUIZ BRAND','0000-00-00',0,'','',1,11),
(95,29740850,'MILADY SOTO REYES','0000-00-00',0,'','',2,11),
(96,43141067,'MONICA ALEXANDRA ESCOBAR MANCO','0000-00-00',0,'','',2,11),
(97,1027956341,'MYLADYS  MARTINEZ PANDALES','0000-00-00',0,'','',1,11),
(98,32287553,'OMAIRA DEL CARMEN RUEDA MANCO','0000-00-00',0,'','',1,11),
(99,26263416,'OSIRYS ABELIA MOSQUERA CUESTA','0000-00-00',0,'','',1,11),
(100,30657273,'OTTY LUZ ROMERO VILORIA','0000-00-00',0,'','',1,11),
(101,71254465,'PAULO CESAR CAVADIA CASTELLANOS','0000-00-00',0,'','',1,11),
(102,11810811,'REYKLER ENRIQE RAMIREZ RENTERIA','0000-00-00',0,'','',2,11),
(103,71252838,'RIKELME  ROBLEDO ROMAÑA','0000-00-00',0,'','',1,11),
(104,39409027,'ROSMIRA PUERTA VARGAS','0000-00-00',0,'','',1,11),
(105,32290307,'RUBITH ELISA CARVAJAL VILLADA','0000-00-00',0,'','',1,11),
(106,45529531,'SANDRA CAROLINA MOSQUERA BOTERO','0000-00-00',0,'','',2,11),
(107,32294724,'SANDRA MILER MENA JAVA','0000-00-00',0,'','',1,11),
(108,1038803717,'SINDY PAOLA HERNANDEZ SANCHEZ','0000-00-00',0,'','',2,11),
(109,39429450,'TRINIDAD  BEDOYA PEREIRA','0000-00-00',0,'','',1,11),
(110,1074007092,'WENDY JOHANA ALVAREZ VANEGAS','0000-00-00',0,'','',1,11),
(111,71253027,'WILMAR PAZ SANCHEZ','0000-00-00',0,'','',2,11),
(112,43144065,'YAMILE URREGO','0000-00-00',0,'','',1,11),
(113,1040364701,'YANIRIS MARTINEZ ROVIRA','0000-00-00',0,'','',2,11),
(114,1001593242,'YEIMER DE JESUS TAPIAS GONZALEZ','0000-00-00',0,'','',1,11),
(115,1040353165,'YEISON  ROMAÑA CORDOBA','1986-09-18',2147483647,'CLL 83 # 70 - 29','maiayevir@hotmail.com',1,11),
(116,1040380043,'YEISON ANDRES BENITE RIVAS','0000-00-00',0,'','',1,11),
(117,1018448277,'YESSICA ALEJANDRA HENAO SANCHEZ','0000-00-00',0,'','',1,11),
(118,67039597,'YILIS MARCELA  RENTERIA LOZANO','0000-00-00',0,'','',2,11),
(119,1040373101,'YISETH NATALIA CERON MARTINEZ','0000-00-00',0,'','',1,11),
(120,21697399,'YOLIMA ZAPATA HERNANDEZ','0000-00-00',0,'','',2,11),
(121,1040378628,'YULISA YIBETH DUARTE ORTIZ','0000-00-00',0,'','',1,11),
(122,1077432997,'YURY LLISED VALOYES MENA','0000-00-00',0,'','',2,11),
(123,0,'COMITE BIENESTAR LABORAL','0000-00-00',0,'','',2,11),
(125,1040371219,'LAURA ALEJANDRA VELEZ VALLE','0000-00-00',0,'','',2,11),
(146,43148186,'XIOMARA ASTRID PALACIOS CAICED','0000-00-00',0,'','',2,11),
(154,71254735,'GARLANT YAFER LEDEZMA MARTINEZ','0000-00-00',0,'','',1,11),
(156,8328415,'PITERSON ALEXANDER TRELLEZ URUETA','0000-00-00',0,'','',1,11),
(157,71985750,'JIMMY RIVAS QUINTO','0000-00-00',0,'','',1,11),
(158,71940986,'RAMIRO ALVAREZ HIGUITA','0000-00-00',0,'','',1,11),
(159,4808313,'AGAPÍTO MURILLO PALACIOS','0000-00-00',0,'','',1,11),
(160,11804635,'EISON LIZCANO PANESO','0000-00-00',0,'','',1,11),
(161,1038798666,'ANIS EMILCEN BARRERA PEREZ','0000-00-00',0,'','',1,11),
(166,31445623,'YAMILETH OMAIRA MURILLO CHAVERRA','0000-00-00',0,'','',1,11),
(168,11798188,'JOSE ELVIN PALACIOS','0000-00-00',0,'','',1,11),
(172,71947858,'UBER ANTONIO BORJA HINESTROZA','0000-00-00',0,'','',2,11),
(176,1003143150,'SHIRLEY PAOLA ESPITIA PASSOS','0000-00-00',0,'','',2,11),
(177,1001032834,'HARILSON MOSQUERA OSORIO','0000-00-00',0,'','',1,11),
(178,82383828,'CARLOS AMIN LONGA CAICEDO','0000-00-00',0,'','',1,11),
(179,1128397309,'YORLEIDY CUESTA CAICEDO','0000-00-00',0,'','',1,11),
(180,1027959334,'SANDY LILIANA AYAZO PEÑATA','0000-00-00',0,'','',1,11),
(181,1028024442,'ANGIE KATERINE ROSERO PEÑA','0000-00-00',0,'','',1,11),
(182,39316282,'LUZ DARYS PASTRANA MENDOZA','0000-00-00',0,'','',1,11),
(183,8437788,'JUAN DAVID ECHAVARRIA TRUJILLO','0000-00-00',0,'','',1,11),
(184,1077459275,'JUAN DAVID ZAYA MARTINEZ','0000-00-00',0,'','',1,11),
(185,71255448,'EDIS JOANNIS RIVAS MEDINA','0000-00-00',0,'','',1,11),
(186,1001400647,'SHIRLEY PETRO SEÑA','0000-00-00',0,'','',1,11),
(188,1001667608,'LUZ STEFANY PALACIOS SOCARRAS','0000-00-00',0,'','',1,11),
(189,43414737,'DORA LUZ BENITEZ ZAPATA','0000-00-00',0,'','',1,11),
(190,39419250,'MARTHA CECILIA ORTIZ ZAPATA','0000-00-00',0,'','',1,11),
(191,1038806156,'CRISTINA ISABEL GORDON GULFO','0000-00-00',0,'','',1,11),
(193,1040352093,'ARGENIDES YULIETH SERNA PALACIO','0000-00-00',0,'','',1,11),
(195,43145431,'GILDA IBERO PEREA GUTIERREZ','0000-00-00',0,'','',1,11),
(196,1028009884,'JORGE ENRIQUE PALACIO CHALA','0000-00-00',0,'','',1,11),
(197,1038802989,'DUBAN GULFO MARTÍNEZ','0000-00-00',0,'','',1,11),
(198,35871798,'YULY RENTERÍA CERVANTES','0000-00-00',0,'','',1,11),
(201,39317954,'YIRLEY ROJAS CUESTA','0000-00-00',0,'','',1,11),
(202,1040353140,'LINA MARCELA BARRAZA PARRA','0000-00-00',0,'','',1,11),
(203,71257924,'DELKIN RUBEIRO ROMAÑA CORDOBA','0000-00-00',0,'','',1,11),
(205,1017231150,'MARIA CAMILA OSORIO CORREA','0000-00-00',0,'','',1,11),
(206,43924616,'SANDRA LILIANA GUISAO ZAPATA','0000-00-00',0,'','',1,11),
(207,1040363632,'ROSA LILIANA RIVAS IBARGUEN','0000-00-00',0,'','',1,11),
(213,98617682,'FABIAN MAURICIO PATIÑO NAVARRO','0000-00-00',0,'','',1,11),
(214,1001668446,'ESTEFFANI PAOLA MANCO ARISTIZABAL','0000-00-00',0,'','',1,11),
(215,1040379689,'LINA FERNANDA REYES VALENCIA','0000-00-00',0,'','',1,11),
(216,1028004441,'DARY LICETH JULIO ARENAS','0000-00-00',0,'','',1,11),
(217,1238938020,'JULIAN DAVID JIMENEZ','0000-00-00',0,'','',1,11),
(218,1040382522,'DIEGO FERNANDO ALBORNOZ LANZ','0000-00-00',0,'','',1,11),
(219,39273861,'ELVIA TERESA JARAVA PALENCIA','0000-00-00',0,'','',1,11),
(220,71987721,'VICTOR VARGAS HIDALGO','0000-00-00',0,'','',1,11),
(221,32144209,'MARYELIS DIAZ BERRIO','0000-00-00',0,'','',1,11),
(223,1040378929,'JHOSELIN ASTRID GUERRERO MORENO','0000-00-00',0,'','',1,11),
(224,1040378974,'ROSALBA SERNA ALVAREZ','0000-00-00',0,'','',1,11),
(225,1001671213,'SEBASTIAN BRAVO CARDONA','0000-00-00',0,'','',1,11),
(226,8439996,'ARISTOBULO TAPIAS TORRES','0000-00-00',0,'','',1,11),
(227,1040354330,'YADERLIS JHOANA ESCOBAR LEZCANO ','0000-00-00',0,'','',1,11),
(228,1040379118,'ROBINSON DE JESÚS TABORDA SANCHEZ','0000-00-00',0,'','',1,11),
(229,1040369733,'DANIEL CAICEDO PALACIOS','0000-00-00',0,'','',1,11),
(230,1036686086,'MAGDY KATHERINE PEREA MOSQUERA','0000-00-00',0,'','',1,11),
(231,1040352386,'KAROLL DAJHANA MOSQUERA MENDOZA','0000-00-00',0,'','',1,11),
(232,1077440918,'SANDRA MILENA ALEGRIA PALACIOS','0000-00-00',0,'','',1,11),
(233,1040375234,'FABIAN ANTONIO MEJIA TABARES','0000-00-00',0,'','',1,11),
(234,1040376851,'ALEJANDRO RENTERIA MURILLO','0000-00-00',0,'','',1,11),
(235,1040370053,'WILFER YAFET MURILLO PALACIOS','0000-00-00',0,'','',1,11),
(236,71253373,'JOSE ALIRIO BARRERA LOPERA ','0000-00-00',0,'','',1,11),
(237,71255124,'GERSON ELIAS GOEZ REYES ','0000-00-00',0,'','',1,11),
(238,1003756352,'LUISA FERNANDA OVIEDO GIRON ','0000-00-00',0,'','',1,11),
(239,11807117,'ERVIN MENA ROMAÑA ','0000-00-00',0,'','',1,11),
(240,1003853930,'LUIS MIGUEL GULFO MOSQUERA ','0000-00-00',0,'','',1,11),
(241,1040351863,'NATALIT PAOLA PUENTES VELASQUEZ','0000-00-00',0,'','',1,11),
(242,1040369324,'DISNEY SEPULVEDA DUARTE','0000-00-00',0,'','',1,11),
(243,1040366428,'HELENA PATRICIA BRAVO GAMBOA','0000-00-00',0,'','',1,11),
(244,71252860,'MILTON ARBOLEDA ROMAÑA','0000-00-00',0,'','',1,11),
(245,1040373127,'LAURA STHEFANY JARAMILLO PEÑA','0000-00-00',0,'','',1,11),
(246,1040374861,'SANTIAGO PEÑA URREGO ','0000-00-00',0,'','',1,11),
(247,71241176,'CARLOS MARIO ESCOBAR RIALES ','0000-00-00',0,'','',1,11),
(248,1040378244,'JHON MARIO ACOSTA ROJAS ','0000-00-00',0,'','',1,11),
(249,71942191,'OFRACINO PALACIOS CUESTA','0000-00-00',0,'','',1,11),
(250,1001673522,'LAURA ANDREA GARCIA RODRIGUEZ ','0000-00-00',0,'','',1,11),
(251,1001401126,'NEIDYS CECILIA PETRO SEÑA','0000-00-00',0,'','',1,11),
(252,11937166,'YUDNE WISTON DIAZ RIVAS','0000-00-00',0,'','',1,11),
(253,71983799,'LUIS ANGEL GONZALEZ MOYA','0000-00-00',0,'','',1,11),
(254,1007853357,'ELIZABETH ESTRADA MADARIAGA','0000-00-00',0,'','',1,11),
(255,1040353939,'JORGE ALBERTO HERRERA LONDOÑO','0000-00-00',0,'','',1,11),
(256,71255324,'JOSE HENRY ASPRILLA MOSQUERA ','0000-00-00',0,'','',1,11),
(257,1040358454,'JAVIER ENRIQUE PEREZ HERNANDEZ','0000-00-00',0,'','',1,11),
(258,1038815277,'GLENYS CECILIA VALENCIA BLANDON ','0000-00-00',0,'','',1,11),
(259,1001673430,'VALENTINA ZUÑIGA CANO','0000-00-00',0,'','',1,11),
(260,1027956781,'HAMIGTON MOSQUERA MOSQUERA ','0000-00-00',0,'','',1,11),
(261,1040361340,'LUIS GUILLERMO VELASQUEZ DAVID ','0000-00-00',0,'','',1,11),
(262,1040375710,'AIDA LUZ BEDOYA MARTINEZ','0000-00-00',0,'','',1,11),
(263,878787878,'OTRO MAS DE SISTEMAS','2000-12-11',314447553,'CArepa','otrosistemas@carepa-antioquia.gov.co',1,11),
(265,9999999,'CORONCORO PEREA VASQUEZ','1988-01-18',2147483647,'CLL 23 # 12-85','elmismodesiempre@carepa-antioquia',1,11),
(266,1234567890,'ANASTASIA KOLUVOV','1986-09-18',2147483647,'CLL 23 # 12-85','maiayevir@hotmail.com',1,11),
(267,111222334,'ANASTASIA KOLUVOV','1986-09-18',2147483647,'CLL 23 # 12-85','maiayevir@hotmail.com',1,11);
/*!40000 ALTER TABLE `funcionarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mejoramiento_seguimientos`
--

DROP TABLE IF EXISTS `mejoramiento_seguimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mejoramiento_seguimientos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `compromiso_mejoramiento_id` bigint(20) unsigned NOT NULL,
  `registrado_por` bigint(20) unsigned NOT NULL,
  `avance` int(11) NOT NULL DEFAULT 0,
  `observacion` text DEFAULT NULL,
  `fecha_seguimiento` datetime NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mejoramiento` (`compromiso_mejoramiento_id`),
  KEY `idx_registrado_por` (`registrado_por`),
  CONSTRAINT `fk_seguimiento_mejoramiento` FOREIGN KEY (`compromiso_mejoramiento_id`) REFERENCES `compromisos_mejoramiento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seguimiento_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mejoramiento_seguimientos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mejoramiento_seguimientos` WRITE;
/*!40000 ALTER TABLE `mejoramiento_seguimientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `mejoramiento_seguimientos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `metas`
--

DROP TABLE IF EXISTS `metas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `metas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `periodo_id` bigint(20) unsigned NOT NULL,
  `dependencia_id` bigint(20) unsigned NOT NULL,
  `funcionario_id` bigint(20) unsigned DEFAULT NULL,
  `evaluador_id` bigint(20) unsigned DEFAULT NULL,
  `tipo` enum('cualitativa','cuantitativa','mixta') DEFAULT 'cuantitativa',
  `descripcion` text NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `indicador` varchar(500) DEFAULT NULL,
  `meta_numerica` decimal(12,2) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `estado` enum('pendiente','concertada','aprobada','en_seguimiento','evaluada','cerrada') NOT NULL DEFAULT 'pendiente',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_dependencia` (`dependencia_id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_evaluador` (`evaluador_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_meta_dependencia` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meta_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_meta_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_meta_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `metas` WRITE;
/*!40000 ALTER TABLE `metas` DISABLE KEYS */;
INSERT INTO `metas` VALUES
(1,1,14,13,13,'cuantitativa','Cumplir con todos los deberes',NULL,NULL,NULL,NULL,'concertada','2026-06-26 12:23:14','2026-06-26 12:36:45',NULL),
(7,1,14,13,13,'cuantitativa','Cumplir con todos los deberes de manera eficiente',NULL,NULL,NULL,NULL,'pendiente','2026-06-26 12:44:10','2026-06-26 12:44:10',NULL);
/*!40000 ALTER TABLE `metas` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `movilidades`
--

DROP TABLE IF EXISTS `movilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `movilidades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `funcionario_id` bigint(20) unsigned NOT NULL,
  `tipo` enum('ascenso','traslado','encargo','comision','reintegro','retiro','otro') NOT NULL,
  `entidad_origen_id` bigint(20) unsigned DEFAULT NULL,
  `dependencia_origen_id` bigint(20) unsigned DEFAULT NULL,
  `entidad_destino_id` bigint(20) unsigned DEFAULT NULL,
  `dependencia_destino_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_movimiento` date NOT NULL,
  `acto_administrativo` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('tramite','aprobado','ejecutado','anulado') NOT NULL DEFAULT 'tramite',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_funcionario` (`funcionario_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_estado` (`estado`),
  KEY `fk_mov_ent_origen` (`entidad_origen_id`),
  KEY `fk_mov_ent_destino` (`entidad_destino_id`),
  KEY `fk_mov_dep_origen` (`dependencia_origen_id`),
  KEY `fk_mov_dep_destino` (`dependencia_destino_id`),
  CONSTRAINT `fk_mov_dep_destino` FOREIGN KEY (`dependencia_destino_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_dep_origen` FOREIGN KEY (`dependencia_origen_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_ent_destino` FOREIGN KEY (`entidad_destino_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_ent_origen` FOREIGN KEY (`entidad_origen_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movilidades`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `movilidades` WRITE;
/*!40000 ALTER TABLE `movilidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `movilidades` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('info','alerta','error','exito') NOT NULL DEFAULT 'info',
  `evaluacion_id` bigint(20) unsigned DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_leida` (`leida`),
  KEY `idx_evaluacion` (`evaluacion_id`),
  CONSTRAINT `fk_not_evaluacion` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluaciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_not_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES
(1,12,'Concertación de compromisos pendiente','Su evaluador ha concertado compromisos funcionales y competencias comportamentales para su evaluación. Debe aceptar o rechazar la concertación.','info',NULL,1,'2026-06-26 12:51:19'),
(2,12,'Concertación de compromisos pendiente','Su evaluador ha concertado compromisos funcionales y competencias comportamentales para su evaluación. Debe aceptar o rechazar la concertación.','info',NULL,0,'2026-06-26 13:19:02');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `parametros`
--

DROP TABLE IF EXISTS `parametros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parametros` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text NOT NULL,
  `tipo` enum('texto','numero','booleano','json') NOT NULL DEFAULT 'texto',
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parametros`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `parametros` WRITE;
/*!40000 ALTER TABLE `parametros` DISABLE KEYS */;
INSERT INTO `parametros` VALUES
(1,'jwt_secret','cambiar_esto_por_un_secret_seguro_openssl_rand_hex_32','texto','Clave secreta para JWT','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(2,'jwt_expiracion_minutos','120','numero','Tiempo de expiracion del token JWT en minutos','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(3,'intentos_login_maximos','5','numero','Maximo de intentos de login antes de bloquear cuenta','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(4,'password_longitud_minima','8','numero','Longitud minima de contraseña','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(5,'cors_origen_permitido','http://localhost:5174','texto','Origen permitido para CORS','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(6,'peso_funcionales','85','numero','Peso porcentual de compromisos funcionales en calificacion definitiva','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(7,'peso_comportamentales','15','numero','Peso porcentual de compromisos comportamentales en calificacion definitiva','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(8,'min_compromisos_funcionales','1','numero','Minimo de compromisos funcionales por periodo anual','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(9,'max_compromisos_funcionales','3','numero','Maximo de compromisos funcionales por periodo anual','2026-06-26 08:43:37','2026-06-26 12:28:43'),
(10,'min_compromisos_comportamentales','3','numero','Minimo de compromisos comportamentales','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(11,'max_compromisos_comportamentales','5','numero','Maximo de compromisos comportamentales','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(12,'umbral_sobresaliente','90','numero','Porcentaje minimo para nivel Sobresaliente','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(13,'umbral_satisfactorio','65','numero','Porcentaje minimo para nivel Satisfactorio','2026-06-26 08:43:37','2026-06-26 08:43:37'),
(14,'min_dias_ausentismo_no_evaluable','30','numero','Dias minimos de ausentismo para periodo no evaluable','2026-06-26 08:43:37','2026-06-26 08:43:37');
/*!40000 ALTER TABLE `parametros` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `periodos`
--

DROP TABLE IF EXISTS `periodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `anio` varchar(9) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('configuracion','concertacion','seguimiento','evaluacion','calificacion','cerrado') NOT NULL DEFAULT 'configuracion',
  `fecha_inicio_concertacion` date DEFAULT NULL,
  `fecha_fin_concertacion` date DEFAULT NULL,
  `fecha_inicio_seguimiento` date DEFAULT NULL,
  `fecha_fin_seguimiento` date DEFAULT NULL,
  `fecha_inicio_evaluacion` date DEFAULT NULL,
  `fecha_fin_evaluacion` date DEFAULT NULL,
  `fecha_inicio_calificacion` date DEFAULT NULL,
  `fecha_fin_calificacion` date DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `periodos` WRITE;
/*!40000 ALTER TABLE `periodos` DISABLE KEYS */;
INSERT INTO `periodos` VALUES
(1,'Periodo de Evaluacion 2026-I','2025-2026','2025-02-01','2026-01-31','concertacion','2025-02-01','2025-02-21','2025-02-22','2025-07-15','2025-07-16','2026-01-31',NULL,NULL,'2026-06-26 08:43:37','2026-06-26 08:44:10',NULL);
/*!40000 ALTER TABLE `periodos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(80) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_codigo` (`codigo`),
  KEY `idx_modulo` (`modulo`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES
(1,'entidades.listar','Listar entidades','entidades','Ver listado de entidades','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(2,'entidades.crear','Crear entidad','entidades','Registrar nueva entidad','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(3,'entidades.editar','Editar entidad','entidades','Modificar datos de entidad','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(4,'entidades.eliminar','Eliminar entidad','entidades','Inactivar entidad','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(5,'dependencias.listar','Listar dependencias','dependencias','Ver dependencias','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(6,'dependencias.crear','Crear dependencia','dependencias','Registrar dependencia','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(7,'dependencias.editar','Editar dependencia','dependencias','Modificar dependencia','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(8,'usuarios.listar','Listar usuarios','usuarios','Ver listado de usuarios','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(9,'usuarios.crear','Crear usuario','usuarios','Registrar nuevo usuario','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(10,'usuarios.editar','Editar usuario','usuarios','Modificar datos de usuario','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(11,'usuarios.cargar','Carga masiva usuarios','usuarios','Cargar usuarios via archivo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(12,'periodos.listar','Listar periodos','periodos','Ver periodos evaluativos','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(13,'periodos.crear','Crear periodo','periodos','Abrir nuevo periodo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(14,'periodos.editar','Editar periodo','periodos','Modificar periodo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(15,'metas.listar','Listar metas','metas','Ver metas de desempeño','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(16,'metas.crear','Crear meta','metas','Definir meta de desempeño','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(17,'metas.editar','Editar meta','metas','Modificar meta','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(18,'concertaciones.listar','Listar concertaciones','concertaciones','Ver concertaciones','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(19,'concertaciones.crear','Crear concertacion','concertaciones','Registrar concertacion','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(20,'concertaciones.cargar','Carga masiva concertaciones','concertaciones','Cargar concertaciones via archivo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(21,'evaluaciones.listar','Listar evaluaciones','evaluaciones','Ver evaluaciones','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(22,'evaluaciones.crear','Crear evaluacion','evaluaciones','Iniciar evaluacion','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(23,'evaluaciones.evaluar','Evaluar','evaluaciones','Calificar evaluacion','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(24,'evaluaciones.cargar','Carga masiva evaluaciones','evaluaciones','Cargar evaluaciones via archivo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(25,'compromisos.listar','Listar compromisos','compromisos','Ver compromisos','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(26,'compromisos.crear','Crear compromiso','compromisos','Registrar compromiso','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(27,'compromisos.editar','Editar compromiso','compromisos','Modificar compromiso','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(28,'evidencias.listar','Listar evidencias','evidencias','Ver evidencias','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(29,'evidencias.crear','Registrar evidencia','evidencias','Registrar evidencia descriptiva','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(30,'evidencias.editar','Editar evidencia','evidencias','Modificar evidencia propia','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(31,'ausentismos.listar','Listar ausentismos','ausentismos','Ver ausentismos','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(32,'ausentismos.crear','Registrar ausentismo','ausentismos','Crear registro de ausentismo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(33,'ausentismos.editar','Editar ausentismo','ausentismos','Modificar ausentismo','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(34,'movilidades.listar','Listar movilidades','movilidades','Ver movilidades','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(35,'movilidades.crear','Registrar movilidad','movilidades','Crear registro de movilidad','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(36,'movilidades.editar','Editar movilidad','movilidades','Modificar movilidad','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(37,'reportes.ver','Ver reportes','reportes','Acceder a reportes','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(38,'reportes.generar','Generar reportes','reportes','Generar reportes del sistema','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(39,'cargas.listar','Ver cargas masivas','cargas','Ver historial de cargas masivas','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(40,'cargas.ejecutar','Ejecutar carga masiva','cargas','Procesar archivos de carga','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(41,'auditoria.ver','Ver auditoria','auditoria','Consultar registro de auditoria','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(42,'parametros.editar','Editar parametros','parametros','Modificar configuracion del sistema','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(43,'evaluaciones.aprobar','Aprobar calificacion definitiva','evaluaciones','Aprobar evaluacion calificada','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(44,'compromisos.devolver','Devolver compromiso al evaluado','compromisos','Devolver compromiso en concertacion','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(45,'compromisos.aprobar','Aprobar compromiso en concertacion','compromisos','Aprobar compromiso propuesto','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(46,'usuarios.restablecer','Restablecer contraseña de usuario','usuarios','Resetear clave de usuario','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(47,'entidades.habilitar','Habilitar entidad en el sistema','entidades','Habilitar entidad','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(48,'parametros.listar','Listar parametros del sistema','parametros','Ver parametros','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(49,'compromisos.enviar','Proponer compromiso','compromisos','Evaluado propone compromiso','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(50,'mejoramiento.crear','Registrar compromiso de mejoramiento','mejoramiento','Crear compromiso de mejoramiento','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(51,'mejoramiento.listar','Listar compromisos de mejoramiento','mejoramiento','Ver compromisos de mejoramiento','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(70,'evaluaciones.comision','Aprobar Comision Evaluadora','evaluaciones','Comision Evaluadora aprueba calificaciones definitivas','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL);
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `recuperaciones`
--

DROP TABLE IF EXISTS `recuperaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `recuperaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `utilizado` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_token` (`token`(64)),
  CONSTRAINT `fk_rec_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuperaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `recuperaciones` WRITE;
/*!40000 ALTER TABLE `recuperaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `recuperaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `responsables`
--

DROP TABLE IF EXISTS `responsables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsables` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Id_funcionarios` int(11) NOT NULL,
  `Id_dependencia` int(2) NOT NULL,
  `id_tbl_tipo_vinculacion` int(11) NOT NULL,
  `is_active` int(11) NOT NULL,
  `id_tbl_cargo` int(11) NOT NULL,
  `id_tbl_detalle_cargo` int(11) NOT NULL,
  `fecha_creacion` date NOT NULL,
  `hora` time NOT NULL,
  `fecha_vinculacion` date DEFAULT NULL,
  `acto_administrativo_v` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `fehca_desvinculacion` date DEFAULT NULL,
  `acto_administrativo_d` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `id_tbl_correo_institucional` int(11) NOT NULL,
  `id_super_usuario` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id_dependencia` (`Id_dependencia`,`id_tbl_tipo_vinculacion`,`id_tbl_detalle_cargo`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsables`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `responsables` WRITE;
/*!40000 ALTER TABLE `responsables` DISABLE KEYS */;
INSERT INTO `responsables` VALUES
(1,1,1,1,1,0,68,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(2,2,8,1,1,0,80,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(3,3,3,1,2,0,78,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(4,4,4,3,2,0,6,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(5,5,12,6,2,0,1,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(6,6,3,3,2,0,7,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(7,7,1,1,2,0,68,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(8,8,6,1,2,0,46,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(9,9,7,3,2,0,11,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(10,10,5,1,1,0,58,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(11,11,7,1,1,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(12,12,4,4,2,0,40,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(13,13,8,1,1,0,33,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(14,14,4,2,2,0,48,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(15,15,8,1,1,0,60,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(16,16,2,1,1,0,64,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(17,17,8,2,2,0,59,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(18,18,18,6,2,0,2,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(19,19,8,1,1,0,59,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(20,20,1,2,2,0,87,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(21,21,2,2,1,0,3,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(22,22,3,2,2,0,17,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(23,23,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(24,24,4,1,1,0,49,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(25,25,9,1,1,0,76,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(26,26,1,1,1,0,68,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(27,27,8,1,1,0,82,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(28,28,10,2,2,0,15,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(29,29,2,3,2,0,12,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(30,30,8,3,2,0,4,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(31,31,7,1,1,0,15,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(32,32,6,1,1,0,44,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(33,33,6,1,1,0,30,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(34,34,3,1,1,0,53,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(35,35,3,1,1,0,78,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(36,36,7,3,2,0,11,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(37,37,7,2,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(38,38,6,2,2,0,31,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(39,39,6,1,1,0,45,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(40,40,8,1,1,0,58,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(41,41,5,1,2,0,24,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(42,42,5,1,2,0,8,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(43,43,6,1,1,0,46,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(44,44,3,1,1,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(45,45,3,1,1,0,78,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(46,46,2,1,2,0,61,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(47,47,3,1,2,0,21,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(48,48,2,1,1,0,62,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(49,49,4,1,1,0,71,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(50,50,5,1,2,0,23,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(51,51,9,1,2,0,41,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(52,52,1,1,1,0,68,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(53,53,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(54,54,3,1,1,0,89,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(55,55,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(56,56,5,1,1,0,58,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(57,57,3,1,1,0,78,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(58,58,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(59,59,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(60,60,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(61,61,12,1,2,0,3,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(62,62,2,1,1,0,38,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(63,63,10,1,2,0,17,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(64,64,3,1,1,0,18,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(65,65,4,1,1,0,48,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(66,66,6,1,1,0,54,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(67,67,8,1,2,0,14,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(68,68,21,1,1,0,85,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(69,69,4,1,2,0,70,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(70,70,4,1,1,0,70,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(71,71,1,1,1,0,68,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(72,72,7,1,1,0,56,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(73,73,4,1,1,0,48,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(74,74,4,1,2,0,41,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(75,75,3,1,2,0,64,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(76,76,1,1,2,0,68,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(77,77,2,1,2,0,46,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(78,78,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(79,79,12,1,2,0,3,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(80,80,2,1,2,0,38,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(81,81,6,1,1,0,31,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(82,82,6,1,2,0,3,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(83,83,2,1,1,0,84,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(84,84,7,1,1,0,79,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(85,85,3,1,1,0,75,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(86,86,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(87,87,17,1,1,0,13,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(88,88,6,1,1,0,69,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(89,89,3,1,1,0,89,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(90,90,3,1,1,0,88,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(91,91,6,1,2,0,29,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(92,92,3,1,1,0,75,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(93,93,1,1,1,0,87,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(94,94,2,3,1,0,12,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(95,95,7,1,2,0,79,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(96,96,1,1,2,0,10,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(97,97,3,1,1,0,52,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(98,98,3,1,1,0,77,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(99,99,2,1,1,0,67,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(100,100,8,3,1,0,9,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(101,101,3,1,1,0,51,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(102,102,5,1,2,0,86,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(103,103,5,1,1,0,24,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(104,104,6,1,1,0,45,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(105,105,3,1,1,0,17,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(106,106,6,1,2,0,30,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(107,107,6,1,1,0,29,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(108,108,3,1,2,0,52,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(109,109,6,1,1,0,43,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(110,110,20,1,1,0,23,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(111,111,5,1,2,0,85,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(112,112,8,1,1,0,83,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(113,113,4,1,2,0,73,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(114,114,5,1,1,0,28,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(115,115,3,1,0,0,18,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(116,116,11,1,1,0,86,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(117,117,7,1,1,0,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(118,118,12,1,2,0,3,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(119,119,5,1,1,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(120,120,8,1,2,0,34,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(121,121,6,1,1,0,69,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(122,122,2,1,2,0,83,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(123,123,3,2,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(124,124,20,2,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(125,125,3,2,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(126,126,5,2,2,0,24,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(127,127,5,1,2,0,8,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(128,128,13,2,2,19,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(129,129,5,2,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(130,130,2,1,2,0,12,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(131,131,1,1,2,0,10,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(132,132,13,2,2,19,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(133,133,2,2,2,0,37,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(134,134,1,2,2,0,42,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(135,135,7,2,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(136,136,20,2,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(137,137,3,2,2,0,18,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(138,138,4,4,2,0,40,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(139,139,19,4,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(140,140,21,0,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(141,141,22,0,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(142,142,3,4,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(143,143,18,6,2,0,2,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(144,144,19,0,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(145,145,6,2,2,0,54,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(146,146,2,4,2,0,63,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(147,147,17,4,2,0,50,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(148,148,19,3,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(149,149,5,4,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(150,150,5,4,2,0,0,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(151,152,10,2,2,0,17,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(152,153,3,1,2,0,18,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(153,154,6,1,1,6,3,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(154,155,3,3,1,6,7,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(155,156,21,3,1,6,95,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(156,157,8,3,1,6,9,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(157,158,7,3,1,6,11,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(158,159,12,6,1,1,1,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(159,160,4,3,1,6,6,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(160,161,18,1,1,2,16,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(161,162,13,1,1,19,21,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(162,163,1,1,1,6,10,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(163,165,2,3,2,0,12,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(164,166,10,2,1,0,15,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(165,168,2,3,1,6,12,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(166,169,4,4,1,0,40,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(167,170,13,2,1,19,21,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(168,171,13,2,1,19,21,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(169,172,18,4,2,2,2,'2024-05-29','08:41:34','2024-05-29','',NULL,'',0,11),
(170,176,3,2,1,11,20,'2024-06-24','10:01:18','2024-06-24','',NULL,'',0,11),
(171,177,12,3,1,5,5,'2024-08-05','08:12:54','2024-08-05','',NULL,'',0,11),
(172,178,8,3,1,7,14,'2024-08-05','08:18:00','2024-08-05','',NULL,'',0,11),
(173,179,19,3,1,9,16,'2024-10-30','09:55:18','2024-10-30','',NULL,'',0,11),
(174,180,3,1,1,11,20,'2024-12-11','09:07:57','2024-12-11','',NULL,'',0,11),
(175,181,3,1,1,11,21,'2024-12-11','09:09:59','2024-12-11','',NULL,'',0,11),
(176,182,1,1,1,3,68,'2024-12-20','04:44:26','2024-12-20','',NULL,'',0,11),
(177,183,20,3,1,6,96,'2025-04-10','07:50:56','2025-04-10','',NULL,'',0,11),
(178,184,9,2,1,12,41,'2025-04-10','03:36:44','2025-04-10','',NULL,'',0,11),
(179,185,6,2,1,4,97,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(180,186,6,2,1,4,98,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(181,187,3,2,1,11,99,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(182,188,3,2,1,4,100,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(183,189,3,2,1,15,101,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(184,190,7,2,1,4,102,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(185,191,7,2,1,4,103,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(186,192,7,2,1,15,104,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(187,193,8,2,1,11,105,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(188,194,8,2,1,4,106,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(189,195,8,2,1,15,107,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(190,196,2,2,1,4,108,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(191,197,20,2,1,4,109,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(192,198,20,2,1,4,110,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(193,199,6,2,1,4,111,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(194,200,4,2,1,11,112,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(195,201,4,2,1,4,113,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(196,202,3,2,1,4,114,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(197,203,8,2,1,11,115,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(198,204,20,2,1,4,116,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(199,205,6,2,1,11,117,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(200,206,6,2,1,15,118,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(201,207,4,2,1,15,119,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(202,208,6,2,1,4,120,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(203,209,2,2,1,11,121,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(204,210,20,2,0,11,122,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(205,211,20,2,1,4,123,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(206,212,1,2,1,11,124,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(207,213,21,2,1,11,125,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(208,214,21,2,1,15,126,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(209,215,7,2,1,3,127,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(210,216,1,2,1,3,128,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(211,217,21,2,1,11,129,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(212,218,7,2,1,13,130,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(213,219,6,2,1,11,131,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(214,220,8,2,1,15,132,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(215,221,2,2,1,3,61,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(216,223,17,3,1,11,93,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(217,224,1,2,1,3,128,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(218,225,7,2,1,2,57,'0000-00-00','00:00:00','0000-00-00','',NULL,'',0,11),
(219,226,20,2,1,11,136,'2025-04-21','00:00:00','2025-04-21','',NULL,'',0,11),
(220,227,6,2,1,11,32,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(221,228,4,2,1,11,148,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(222,229,6,2,1,11,151,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(223,230,4,2,1,15,148,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(224,231,8,2,1,15,157,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(225,232,4,2,1,4,149,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(226,233,6,2,1,4,152,'2025-04-25','00:00:00','2025-04-25','',NULL,'',0,11),
(227,234,2,2,1,3,141,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(228,235,2,2,1,15,140,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(229,236,4,2,1,15,72,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(230,237,2,2,1,15,145,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(231,238,6,2,1,15,153,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(232,239,20,2,1,15,137,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(233,240,2,2,1,15,144,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(234,241,2,2,1,15,147,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(235,242,2,2,1,15,147,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(236,243,6,2,1,15,154,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(237,244,6,2,1,11,155,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(238,245,6,2,1,15,154,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(239,246,8,2,1,15,157,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(240,247,6,2,1,15,156,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(241,248,4,2,1,15,150,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(242,249,8,2,1,15,157,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(243,250,8,2,1,4,158,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(244,251,6,2,1,3,153,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(245,252,2,2,1,3,142,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(246,253,2,2,1,4,143,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(247,254,8,2,1,15,159,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(248,255,20,2,1,15,137,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(249,256,20,2,1,15,137,'2025-05-05','00:00:00','2025-05-05','',NULL,'',0,11),
(250,257,8,2,1,15,157,'2025-05-06','00:00:00','2025-05-06','',NULL,'',0,11),
(251,258,6,2,1,15,118,'2025-05-06','00:00:00','2025-05-06','',NULL,'',0,11),
(252,259,20,2,1,15,138,'2025-05-08','00:00:00','2025-05-08','',NULL,'',0,11),
(253,260,2,2,1,3,139,'2025-05-08','00:00:00','2025-05-08','',NULL,'',0,11),
(254,261,2,2,1,4,146,'2025-05-13','00:00:00','2025-05-13','',NULL,'',0,11),
(255,262,2,2,1,3,61,'2025-05-15','00:00:00','2025-05-15','',NULL,'',0,11),
(256,263,12,4,2,4,0,'2026-06-11','03:14:10','2026-06-11','',NULL,'',0,11),
(257,264,12,4,1,4,0,'2026-06-11','03:21:25','2026-06-11','',NULL,'',0,11),
(258,265,12,6,1,3,3,'2026-06-11','03:53:00','2026-06-08','',NULL,'',0,11),
(267,115,20,1,1,11,122,'0000-00-00','16:46:29','2026-02-03','D2026-9547',NULL,'',7,11),
(268,52,8,1,1,4,106,'0000-00-00','16:51:49','2022-01-18','D2026-1111',NULL,'',41,11),
(269,266,1,4,1,24,136,'0000-00-00','07:49:56','2026-06-01','D2026-1244',NULL,'',63,11),
(270,267,8,4,1,24,143,'0000-00-00','07:55:05','2026-02-10','D2026-0003',NULL,'',18,11);
/*!40000 ALTER TABLE `responsables` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `rol_id` bigint(20) unsigned NOT NULL,
  `permiso_id` bigint(20) unsigned NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `idx_permiso` (`permiso_id`),
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES
(1,1,'2026-06-26 08:43:37'),
(1,2,'2026-06-26 08:43:37'),
(1,3,'2026-06-26 08:43:37'),
(1,4,'2026-06-26 08:43:37'),
(1,5,'2026-06-26 08:43:37'),
(1,6,'2026-06-26 08:43:37'),
(1,7,'2026-06-26 08:43:37'),
(1,8,'2026-06-26 08:43:37'),
(1,9,'2026-06-26 08:43:37'),
(1,10,'2026-06-26 08:43:37'),
(1,11,'2026-06-26 08:43:37'),
(1,12,'2026-06-26 08:43:37'),
(1,13,'2026-06-26 08:43:37'),
(1,14,'2026-06-26 08:43:37'),
(1,15,'2026-06-26 08:43:37'),
(1,16,'2026-06-26 08:43:37'),
(1,17,'2026-06-26 08:43:37'),
(1,18,'2026-06-26 08:43:37'),
(1,19,'2026-06-26 08:43:37'),
(1,20,'2026-06-26 08:43:37'),
(1,21,'2026-06-26 08:43:37'),
(1,22,'2026-06-26 08:43:37'),
(1,23,'2026-06-26 08:43:37'),
(1,24,'2026-06-26 08:43:37'),
(1,25,'2026-06-26 08:43:37'),
(1,26,'2026-06-26 08:43:37'),
(1,27,'2026-06-26 08:43:37'),
(1,28,'2026-06-26 08:43:37'),
(1,29,'2026-06-26 08:43:37'),
(1,30,'2026-06-26 08:43:37'),
(1,31,'2026-06-26 08:43:37'),
(1,32,'2026-06-26 08:43:37'),
(1,33,'2026-06-26 08:43:37'),
(1,34,'2026-06-26 08:43:37'),
(1,35,'2026-06-26 08:43:37'),
(1,36,'2026-06-26 08:43:37'),
(1,37,'2026-06-26 08:43:37'),
(1,38,'2026-06-26 08:43:37'),
(1,39,'2026-06-26 08:43:37'),
(1,40,'2026-06-26 08:43:37'),
(1,41,'2026-06-26 08:43:37'),
(1,42,'2026-06-26 08:43:37'),
(1,43,'2026-06-26 08:43:37'),
(1,44,'2026-06-26 08:43:37'),
(1,45,'2026-06-26 08:43:37'),
(1,46,'2026-06-26 08:43:37'),
(1,47,'2026-06-26 08:43:37'),
(1,48,'2026-06-26 08:43:37'),
(1,49,'2026-06-26 08:43:37'),
(1,50,'2026-06-26 08:43:37'),
(1,51,'2026-06-26 08:43:37'),
(1,70,'2026-06-26 08:43:37'),
(2,1,'2026-06-26 08:43:37'),
(2,5,'2026-06-26 08:43:37'),
(2,8,'2026-06-26 08:43:37'),
(2,12,'2026-06-26 08:43:37'),
(2,15,'2026-06-26 08:43:37'),
(2,16,'2026-06-26 08:43:37'),
(2,17,'2026-06-26 08:43:37'),
(2,18,'2026-06-26 08:43:37'),
(2,19,'2026-06-26 08:43:37'),
(2,21,'2026-06-26 08:43:37'),
(2,22,'2026-06-26 08:43:37'),
(2,23,'2026-06-26 08:43:37'),
(2,25,'2026-06-26 08:43:37'),
(2,26,'2026-06-26 08:43:37'),
(2,28,'2026-06-26 08:43:37'),
(2,29,'2026-06-26 08:43:37'),
(2,30,'2026-06-26 08:43:37'),
(2,37,'2026-06-26 08:43:37'),
(2,43,'2026-06-26 08:43:37'),
(2,44,'2026-06-26 08:43:37'),
(2,45,'2026-06-26 08:43:37'),
(2,49,'2026-06-26 08:43:37'),
(2,50,'2026-06-26 08:43:37'),
(2,51,'2026-06-26 08:43:37'),
(2,70,'2026-06-26 08:43:37'),
(3,15,'2026-06-26 08:43:37'),
(3,18,'2026-06-26 08:43:37'),
(3,21,'2026-06-26 08:43:37'),
(3,25,'2026-06-26 08:43:37'),
(3,28,'2026-06-26 08:43:37'),
(3,29,'2026-06-26 08:43:37'),
(3,31,'2026-06-26 08:43:37'),
(3,34,'2026-06-26 08:43:37'),
(3,37,'2026-06-26 08:43:37'),
(3,49,'2026-06-26 08:43:37'),
(4,1,'2026-06-26 10:08:00'),
(4,2,'2026-06-26 10:08:00'),
(4,3,'2026-06-26 10:08:00'),
(4,4,'2026-06-26 10:08:00'),
(4,5,'2026-06-26 10:08:00'),
(4,6,'2026-06-26 10:08:00'),
(4,7,'2026-06-26 10:08:00'),
(4,8,'2026-06-26 10:08:00'),
(4,9,'2026-06-26 10:08:00'),
(4,10,'2026-06-26 10:08:00'),
(4,11,'2026-06-26 10:08:00'),
(4,12,'2026-06-26 10:08:00'),
(4,13,'2026-06-26 10:08:00'),
(4,14,'2026-06-26 10:08:00'),
(4,15,'2026-06-26 10:08:00'),
(4,16,'2026-06-26 10:08:00'),
(4,17,'2026-06-26 10:08:00'),
(4,18,'2026-06-26 10:08:00'),
(4,19,'2026-06-26 10:08:00'),
(4,20,'2026-06-26 10:08:00'),
(4,21,'2026-06-26 10:08:00'),
(4,22,'2026-06-26 10:08:00'),
(4,23,'2026-06-26 10:08:00'),
(4,24,'2026-06-26 10:08:00'),
(4,25,'2026-06-26 10:08:00'),
(4,26,'2026-06-26 10:08:00'),
(4,27,'2026-06-26 10:08:00'),
(4,28,'2026-06-26 10:08:00'),
(4,29,'2026-06-26 10:08:00'),
(4,30,'2026-06-26 10:08:00'),
(4,31,'2026-06-26 10:08:00'),
(4,32,'2026-06-26 10:08:00'),
(4,33,'2026-06-26 10:08:00'),
(4,34,'2026-06-26 10:08:00'),
(4,35,'2026-06-26 10:08:00'),
(4,36,'2026-06-26 10:08:00'),
(4,37,'2026-06-26 10:08:00'),
(4,38,'2026-06-26 10:08:00'),
(4,39,'2026-06-26 10:08:00'),
(4,40,'2026-06-26 10:08:00'),
(4,41,'2026-06-26 10:08:00'),
(4,42,'2026-06-26 10:08:00'),
(4,43,'2026-06-26 10:08:00'),
(4,44,'2026-06-26 10:08:00'),
(4,45,'2026-06-26 10:08:00'),
(4,46,'2026-06-26 10:08:00'),
(4,47,'2026-06-26 10:08:00'),
(4,48,'2026-06-26 10:08:00'),
(4,49,'2026-06-26 10:08:00'),
(4,50,'2026-06-26 10:08:00'),
(4,51,'2026-06-26 10:08:00'),
(4,70,'2026-06-26 10:08:00'),
(5,5,'2026-06-26 10:08:00'),
(5,8,'2026-06-26 10:08:00'),
(5,9,'2026-06-26 10:08:00'),
(5,10,'2026-06-26 10:08:00'),
(5,12,'2026-06-26 10:08:00'),
(5,15,'2026-06-26 12:13:36'),
(5,16,'2026-06-26 12:13:36'),
(5,17,'2026-06-26 12:13:36'),
(5,18,'2026-06-26 12:13:36'),
(5,19,'2026-06-26 12:13:36'),
(5,21,'2026-06-26 10:08:00'),
(5,22,'2026-06-26 12:13:36'),
(5,23,'2026-06-26 12:13:36'),
(5,25,'2026-06-26 10:08:00'),
(5,26,'2026-06-26 12:13:36'),
(5,27,'2026-06-26 12:13:36'),
(5,28,'2026-06-26 10:08:00'),
(5,29,'2026-06-26 12:13:36'),
(5,30,'2026-06-26 12:13:36'),
(5,31,'2026-06-26 10:08:00'),
(5,32,'2026-06-26 10:08:00'),
(5,33,'2026-06-26 10:08:00'),
(5,34,'2026-06-26 12:13:36'),
(5,35,'2026-06-26 12:13:36'),
(5,36,'2026-06-26 12:13:36'),
(5,37,'2026-06-26 10:08:00'),
(5,38,'2026-06-26 12:13:36'),
(5,39,'2026-06-26 10:08:00'),
(5,40,'2026-06-26 10:08:00'),
(5,43,'2026-06-26 10:08:00'),
(5,44,'2026-06-26 12:13:36'),
(5,45,'2026-06-26 12:13:36'),
(5,46,'2026-06-26 10:08:00'),
(5,48,'2026-06-26 10:08:00'),
(5,49,'2026-06-26 12:13:36'),
(5,50,'2026-06-26 12:13:36'),
(5,51,'2026-06-26 12:13:36');
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'admin','Administrador','Gestion completa del sistema: usuarios, entidades, dependencias, periodos, metas, ausentismos, reportes, evaluaciones y configuracion.','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(2,'evaluador','Evaluador','Concerta o fija compromisos funcionales y comportamentales, realiza seguimiento, registra evidencias y califica desempeño.','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(3,'evaluado','Evaluado','Servidor publico sujeto a evaluacion. Propone compromisos, registra evidencias y acepta/rechaza compromisos concertados.','2026-06-26 08:43:37','2026-06-26 08:43:37',NULL),
(4,'admin_carepa','Administrador CAREPA','Superadministrador global','2026-06-26 10:08:00','2026-06-26 10:08:00',NULL),
(5,'jefe_dependencia','Jefe de Dependencia','Administra usuarios de su dependencia','2026-06-26 10:08:00','2026-06-26 10:08:00',NULL),
(6,'comision_evaluadora','Comisión Evaluadora','Evalúa y aprueba calificaciones','2026-06-26 10:08:00','2026-06-26 10:08:00',NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `revocada` tinyint(1) NOT NULL DEFAULT 0,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_token` (`token_hash`(64)),
  KEY `idx_expiracion` (`fecha_expiracion`),
  CONSTRAINT `fk_ses_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
INSERT INTO `sesiones` VALUES
(1,11,'91f91eaaf27ffa00267f76249272cf6ce79b7e2818a0183d23a63e24adc25deb','127.0.0.1','curl/8.20.0','2026-06-26 15:50:35',1,'2026-06-26 08:50:35'),
(2,2,'67e4fa7f4788056080055c15608de645c28f3c037aab3eef313ba1e88631bea3','127.0.0.1','curl/8.20.0','2026-06-26 15:55:54',0,'2026-06-26 08:55:54'),
(3,6,'18a7b45e4bdaf6615a8a62bbb4f45debc7da4896d6ae8a9077173cb3b25be851','127.0.0.1','curl/8.20.0','2026-06-26 15:58:15',0,'2026-06-26 08:58:15'),
(4,2,'164e0aed6714143452d139ca9e8abdcd3bca0894d56b82579617f870dca311e8','127.0.0.1','curl/8.20.0','2026-06-26 16:05:22',0,'2026-06-26 09:05:22'),
(5,2,'53052bced2b77a7793e4b6d39cf3a539e2bbbbf6105a6dc460f42b62592e85f6','127.0.0.1','curl/8.20.0','2026-06-26 16:07:46',0,'2026-06-26 09:07:46'),
(6,2,'612476d53d944fbb0450402615e8c091304fe9a6fdcf5ccb991aafc338eecc3c','127.0.0.1','curl/8.20.0','2026-06-26 16:10:32',0,'2026-06-26 09:10:32'),
(7,2,'512b4dc3e6f1c006cb793e8cd49c7a61112b26d13552ff98fd6b91bff4210a3c','127.0.0.1','curl/8.20.0','2026-06-26 16:18:18',0,'2026-06-26 09:18:18'),
(8,2,'268a47066fb523ca9cea225be768be994f2de67c066d97a0779dbeb1b2b1c514','127.0.0.1','curl/8.20.0','2026-06-26 16:20:33',0,'2026-06-26 09:20:33'),
(9,11,'23761afac03f008c88becf308f7dda0cb9b50672be685b47fbb66b0e54d5674e','127.0.0.1','Python-urllib/3.13','2026-06-26 16:25:58',1,'2026-06-26 09:25:58'),
(10,11,'433b5458f1b53ab1f736ffaed1a7b618719e37d8b2c642f0458178d7357a923c','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 16:28:58',1,'2026-06-26 09:28:58'),
(11,12,'17cc2dc768ababdff419dc723b1a3aafe2a8b76922a48eb0072deb5854a6bf37','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0','2026-06-26 17:11:29',1,'2026-06-26 10:11:29'),
(12,12,'0d8ac4ef8bbbc08473d1a554562937a36dee3fa4da8b2b2cee27461575f5d89d','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0','2026-06-26 17:11:33',1,'2026-06-26 10:11:33'),
(13,12,'1705d9c78ec4475dc1ebaa527ca262ea011da194800a14cb9b4d16346da6b162','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:14:08',1,'2026-06-26 10:14:08'),
(14,12,'34a9915c189988b5cd63baef47d57a5a74734540500ac1651c2fc22a12fddc71','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:14:09',1,'2026-06-26 10:14:09'),
(15,13,'7135c0b70d775a987d801537a043535443740fc81acf7240fe0912a900b386d4','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:30:54',1,'2026-06-26 10:30:54'),
(16,13,'68b5857559de0a0ac98eb3d5661eabf2b73c3e985f94b0fd21bddc17f375d3bf','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:37:14',1,'2026-06-26 10:37:14'),
(17,13,'d082c83decd30b81bb8a73816bce23c4acd192bf8db865dfe6f0dbc6b422e874','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:37:42',1,'2026-06-26 10:37:42'),
(18,12,'a710af53b7c43b9dcee28de7dd8ce09023fa441d14b5a006e7e253995dd22e2a','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:38:10',1,'2026-06-26 10:38:10'),
(19,12,'22e36ebec673e2f35d1a546beef9f00957a4714b30fa0e0e773da3e81de1a1cb','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:38:11',1,'2026-06-26 10:38:11'),
(20,13,'c67a57e34a034be4eec6e9a8b4cfa557fcc00f173b9425e551f774917b085a11','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:48:56',1,'2026-06-26 10:48:56'),
(21,13,'112ae255e9e0f45870077e2ed033caeb33810544c83c80bc392eb38d71151097','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:48:58',1,'2026-06-26 10:48:58'),
(22,14,'699d0a610f253dbe4de2d033c43c518dc294849954713b05e8fe092bfae962e0','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:49:34',1,'2026-06-26 10:49:34'),
(23,14,'c293e3209672b652c97de56ecede76411ef6f49f398487d02bc0c96391635a1d','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:49:36',1,'2026-06-26 10:49:36'),
(24,13,'cc054f542af4dccbc1c65a37b2c9967560b23fa25e7afe1c59b6d3559da80859','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:50:05',1,'2026-06-26 10:50:05'),
(25,13,'a2c3f689090da48ad0ea691d2862c0e2a4b506c6f8c199f05d35aac8e87e5ff4','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:50:06',1,'2026-06-26 10:50:06'),
(26,12,'2be89fd346783fd79a23ed9f446f9626060d3562d5527b8f141e788a30c73187','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:50:20',1,'2026-06-26 10:50:20'),
(27,14,'946afec7ca31f4f28d0fe7950cff1b5dd9ad31171906bbac2e8da72d0b841ef0','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:50:47',1,'2026-06-26 10:50:47'),
(28,14,'207b16aba6d50f8727ee052a8d41f7225bea973531893869ca8af34a116a191c','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 17:50:50',1,'2026-06-26 10:50:50'),
(29,14,'128001891368e901ec668f1ec2f03a09fa200929d99b61486efeb6cf16291dae','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 18:32:47',1,'2026-06-26 11:32:47'),
(30,14,'c56c6862ae48877a6a1142245e2f963b0826e7d4bea359b8c1ec0dbb0c846927','127.0.0.1','Mozilla/5.0 (Android 16; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0','2026-06-26 18:32:48',1,'2026-06-26 11:32:48'),
(31,12,'fe93d8068ad1fa7a6b3267d01447e184299356af2b7b3cb1ead3e25243011aa6','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 18:39:10',1,'2026-06-26 11:39:10'),
(32,12,'bc7c0557c6bb353dae2ee227046d0b5930dc10a32aac6fe67cc378f4406c922d','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:39:23',1,'2026-06-26 11:39:23'),
(33,12,'1a5c1280190fddf1c801c65fe2ed89a038555754c109166a338b28fd25cadae4','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:39:26',1,'2026-06-26 11:39:26'),
(34,14,'8ba65a62a51a94dbe6c4a5864eb4cd8a972d6457230d1e69a535a4e058cc06e4','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:39:48',1,'2026-06-26 11:39:48'),
(35,14,'27e2b68b3451d9bbd6c42caa74e577342ad430b041f1c8c3efc04dab689b6828','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:39:50',1,'2026-06-26 11:39:50'),
(36,14,'7a06f10b9c75fc1702dd64e6f3e7bc34766ad2a9d92a2c817b1325a8429a529a','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:40:23',1,'2026-06-26 11:40:23'),
(37,14,'3698ea5a5aadf4d61877a103150341edea6ddf34fc1cfddc96c0bb3a1850039b','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:40:24',1,'2026-06-26 11:40:24'),
(38,14,'8f54e21012225cd17e05341230417ef9c18e2fa8f0eaddbf3fea425a1f8feb6e','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:40:42',1,'2026-06-26 11:40:42'),
(39,14,'3af3e0abb9b32f2f9b430adc0139cfc3b19ab2f7833466bb250cc31adeab2539','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:40:43',1,'2026-06-26 11:40:43'),
(40,14,'820b7783c29f821fcd1d3f799c52a6d7da457adb09ab415355def869770e5af6','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:48:32',1,'2026-06-26 11:48:32'),
(41,14,'b56be1737e55dade24ec64b4f5920f1f10d15643047895628e12b30efebc817f','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:48:33',1,'2026-06-26 11:48:33'),
(42,14,'40af93299bdf406bbdd9d7e0a4c771392b169303055c3d7c0d7cb0cc330635f4','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:53:29',1,'2026-06-26 11:53:29'),
(43,14,'ade4cbed6911dd581705ebd8c0d21dd8f52b29510efc072938a37dc0da373590','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 18:53:30',1,'2026-06-26 11:53:30'),
(44,12,'7fba67074f9c072ac9d2d2d40d8c12367efdad6af92445f88fab17672fe89162','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:03:51',1,'2026-06-26 12:03:51'),
(45,12,'5abc6f653cc07ad43b565ee5a5dd0e22c4eea8abc4523d437e4983684ddfc093','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:03:53',1,'2026-06-26 12:03:53'),
(46,14,'fe7a9a0b3e386d3b69a4ed3874ee8747a6275ac6e4bdd919d10197838968cc3a','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:04:25',1,'2026-06-26 12:04:25'),
(47,14,'823cbe4ee509a94a541b59f6ede1f54f009b79f9921d3d4a1317c1acd14b0b23','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:04:28',1,'2026-06-26 12:04:28'),
(48,12,'4cfb77d9846b09fad0082835b2dcac3e55a7f8888b585ca36f44120afddf7850','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:05:58',1,'2026-06-26 12:05:58'),
(49,12,'39c42c0c60ee528c733086e9b595458213ad744de1e82a4dc8d236218692fff2','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:06:02',1,'2026-06-26 12:06:02'),
(50,13,'e179988f330137265c003746e7f5bfe5b2eb41bc5e905f99c58297d641e50448','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:06:19',1,'2026-06-26 12:06:19'),
(51,13,'68e8703ffa10550b087e8fc9b0ed176ac0c8646a82ca90d19857b3f1d3fd00bc','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:06:21',1,'2026-06-26 12:06:21'),
(52,13,'d01f9fc076c0d2334906e06dd28cc341d175a5caba7516c45b1658cd7731226d','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:24:08',1,'2026-06-26 12:24:08'),
(53,14,'f2c9b999db5cd8ce05f135685986f34bb64f1f7436f87c81a69f2b66d0251623','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:24:23',1,'2026-06-26 12:24:23'),
(54,14,'2caa296b5dbfec0b8cf5596ce7e22f306451d2cd06121c2f7606ca90342ff025','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:24:24',1,'2026-06-26 12:24:24'),
(55,13,'b6b89f7a9ed4c3fa2824a78807854033669f913071c3aa1b83b309a86f7cbe59','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:30:08',1,'2026-06-26 12:30:08'),
(56,14,'648dcc41d3594ed3ff480fb15d9e18883cf7b10a644c399f01efd365a7b9cd1a','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:30:23',1,'2026-06-26 12:30:23'),
(57,14,'0ec1dbdb5869dfbf6f9bafb0c5d8f37754892fc697fa06da0c69d774b443da2e','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:30:24',1,'2026-06-26 12:30:24'),
(58,13,'74986d1c0c3eb2f08b8a11122ca704072eeb15e756ac3fb9773126b71b064032','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:30:53',1,'2026-06-26 12:30:53'),
(59,13,'36f3fb98dc1069ed2b1948915216ac80065e02db4bccbb0ac3192a01ce8c352f','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:30:56',1,'2026-06-26 12:30:56'),
(60,14,'3b3dc085ed746053c833f0c9e500dab871d51918ab3b1117afc1fab3bcedd236','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:31:29',1,'2026-06-26 12:31:29'),
(61,14,'1503ae5c85f5eda6f8a55e8c802d938c8df8931227c42bbe28be84db91e90bd2','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:31:32',1,'2026-06-26 12:31:32'),
(62,13,'1525ba497107ccff99527f70f68c22319f261c3264197e3da36a30a9f3b2e229','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:32:20',1,'2026-06-26 12:32:20'),
(63,13,'1aa79fe1e9faccead8bfec96852e19fe36aa377c6bbfbe0711a08cdafd141aa9','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:32:22',1,'2026-06-26 12:32:22'),
(64,14,'b0711f6861b0be34e8e2de78f9cce212a78d1465ac42b91d03320e0464403773','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:34:41',1,'2026-06-26 12:34:41'),
(65,14,'c21b67ff3d9861ffe604d014d2351e669f21118817c9605143627fccfb6623c4','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:34:42',1,'2026-06-26 12:34:42'),
(66,12,'06c08b7c6848e87a96c3454f6be850ef1aca2d42a630d9508025fb66ae252180','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:42:44',1,'2026-06-26 12:42:44'),
(67,12,'a60fbc8bccdf85c10ea41e0bf82041cef653cf0afc35e410fb0ee1196aaa13a5','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:42:45',1,'2026-06-26 12:42:45'),
(68,13,'14701eb2f9767ec23fdbd22cda49b41472a7de71d0c0f9269baecb5a369acbd3','127.0.0.1','curl/8.20.0','2026-06-26 19:44:02',0,'2026-06-26 12:44:02'),
(69,14,'b6a0543ace721a0bbb6c24cb5862533ca0d046ed5829a3f720ca494e824caeb4','127.0.0.1','curl/8.20.0','2026-06-26 19:44:16',1,'2026-06-26 12:44:16'),
(70,14,'95758a82df6f0c18e15b70f625f9abbe3b010bc6ab295be5377cadf8b394b50d','127.0.0.1','curl/8.20.0','2026-06-26 19:44:43',1,'2026-06-26 12:44:43'),
(71,14,'07c4e27d8cb0539f4759777fb7293ad207568e6cbd358c4ad5f1e3f0575103fe','127.0.0.1','curl/8.20.0','2026-06-26 19:45:36',1,'2026-06-26 12:45:36'),
(72,14,'9ae723afca82f9535847f23e956b9278fbc3bd28fb53c445ff76fad0f979ebce','127.0.0.1','curl/8.20.0','2026-06-26 19:45:46',1,'2026-06-26 12:45:46'),
(73,14,'c4673a6783ee064e371b6c13ef1bc31c90072983f9cb36ae91c36f44d8404daf','127.0.0.1','curl/8.20.0','2026-06-26 19:45:56',1,'2026-06-26 12:45:56'),
(74,14,'03a9ccec56eb464e9b57fd15455728f8ceda4120bebe1fc371d91ac908b5155c','127.0.0.1','curl/8.20.0','2026-06-26 19:46:09',1,'2026-06-26 12:46:09'),
(75,14,'01d1d7245fc3f75de816ca608dabf928506ede74392ae9ec63b7168eeba76443','127.0.0.1','curl/8.20.0','2026-06-26 19:50:10',1,'2026-06-26 12:50:10'),
(76,14,'a84fe8c5ce1daae4feff2f12bb20919ce59a159003cb22177f435208543515c3','127.0.0.1','curl/8.20.0','2026-06-26 19:50:22',1,'2026-06-26 12:50:22'),
(77,14,'42e978449d132da0206eccf311d27fdf7c35b3be63abf76b53696b2e1a2077c1','127.0.0.1','curl/8.20.0','2026-06-26 19:50:27',1,'2026-06-26 12:50:27'),
(78,14,'ace0e55376131de26ea78bc750bf426194587d064eba114f3be5e736ff0f781b','127.0.0.1','curl/8.20.0','2026-06-26 19:50:55',1,'2026-06-26 12:50:55'),
(79,14,'9755a2a08e471c483f038dbffdc693a38a4df54016a5a0c02abb6f4ab6983636','127.0.0.1','curl/8.20.0','2026-06-26 19:51:11',1,'2026-06-26 12:51:11'),
(80,14,'959801082020e7a57762e3c4fe1e80e4f44f5a3b3e409e51dd81a1d3942b41ea','127.0.0.1','curl/8.20.0','2026-06-26 19:51:19',1,'2026-06-26 12:51:19'),
(81,14,'420717ac67e779f15f07c065cac004a3f9f741d6a432ef0d9036ef61490d8fa0','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:52:12',1,'2026-06-26 12:52:12'),
(82,14,'9e5c05b06fbde0031c144cb6ecbef3dbbaa5e5bab1345432730bc045a08a8d48','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:52:13',1,'2026-06-26 12:52:13'),
(83,12,'a53a70dfd117dda4c19b9c0d46bb1184fa5dc7ca3927e6f516a06d125387b6fc','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:52:57',1,'2026-06-26 12:52:57'),
(84,12,'e4c4cfb6e2ebd8eb0f9e4f0d00a332d95f8fb2b8791769ad1534a07620c92320','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:53:01',1,'2026-06-26 12:53:01'),
(85,12,'52665082af6fd53aaa38cfb2e46d70f47a3267ca84f49b5a14472d457be89d70','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:53:18',1,'2026-06-26 12:53:18'),
(86,12,'f33b997f897784b2b0e3dcc6e4a4493a8e2b0318a17262887c5fdd222d167ea1','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 19:53:19',1,'2026-06-26 12:53:19'),
(87,14,'189c339c036f1bf4616008bcc7643cee768a1e00739ec1258751030fd6e31144','127.0.0.1','curl/8.20.0','2026-06-26 20:02:44',1,'2026-06-26 13:02:44'),
(88,14,'e4261da20f784415ae1faf3601504b130ddf61fffd015a6e18afd701629f7d52','127.0.0.1','curl/8.20.0','2026-06-26 20:03:23',1,'2026-06-26 13:03:23'),
(89,14,'e9e2262b98d25164d8a4d83f5ce83c708bc0e9669000014326e9dd4ec4683489','127.0.0.1','curl/8.20.0','2026-06-26 20:03:34',1,'2026-06-26 13:03:34'),
(90,14,'068651fccb5958921f2edc17cf309d567b8a1660767a05c6bcc0a70b1db2f3fb','127.0.0.1','curl/8.20.0','2026-06-26 20:03:43',1,'2026-06-26 13:03:43'),
(91,12,'7224ad2ed77a18bf80f611149bb8037e27333e66733065a964b7e9c29750923c','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 20:12:54',1,'2026-06-26 13:12:54'),
(92,12,'325dac0ba999be7342b7ce69459a3db89785440135eb28343597f77d0f5de43f','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 20:12:56',1,'2026-06-26 13:12:56'),
(93,12,'3856a0bd596fd35768752b052d5a183a4c1fa844398f451fd6bbe841eca5436f','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 20:13:52',1,'2026-06-26 13:13:52'),
(94,12,'a72c8e57b366d84d5170bf631d34e99ad9d9ec032274684d9a89b53e9434f0a9','127.0.0.1','Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36','2026-06-26 20:13:54',1,'2026-06-26 13:13:54'),
(95,14,'656c590481f54a9ac4b87c4e8d86b6d2e2027274c4e8465fefbcef355781e73e','127.0.0.1','curl/8.20.0','2026-06-26 20:15:47',1,'2026-06-26 13:15:47'),
(96,14,'b12ce4302db73392aaa8a2337e47f189d666d37d7aeeae64a14cf85831e36723','127.0.0.1','curl/8.20.0','2026-06-26 20:18:41',1,'2026-06-26 13:18:41'),
(97,14,'710a00145229788981f024831b04d9f41704897b92ac05e421983fa5e9a53b70','127.0.0.1','curl/8.20.0','2026-06-26 20:19:02',1,'2026-06-26 13:19:02'),
(98,12,'4e62da039e77c4e6ff3ab72908ba11c2bbae1205ef9543a4f1e5bc6514630472','127.0.0.1','curl/8.20.0','2026-06-26 20:19:10',1,'2026-06-26 13:19:10'),
(99,12,'67295331792d252f663dfe7b4ae3bccb6b5c8900baffc237acddc3b0cf475b78','127.0.0.1','curl/8.20.0','2026-06-26 20:19:20',1,'2026-06-26 13:19:20'),
(100,12,'579db406c50f158f355fe0a1ac765aae6f6d619a1ad8fc8f3a254d059d82ca13','127.0.0.1','curl/8.20.0','2026-06-26 20:20:12',1,'2026-06-26 13:20:12'),
(101,14,'c7035d269a75ffe917bff7200b1dbc293788d1c3863e2cf940dd3578f644fa16','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 20:21:16',1,'2026-06-26 13:21:16'),
(102,14,'650c9e135cfe7d54e982c69f6efecf1ed7a2d76e12ae6715c9287cdb8ec527fd','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 20:21:18',1,'2026-06-26 13:21:18'),
(103,12,'73ba83fae959181a6933d55dda7f4e1cca7bb7a88c5c9eb5228661d257564e07','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 20:51:40',0,'2026-06-26 13:51:40'),
(104,12,'bb0d7a67c8df3ad3ad4b41a7cd8fc48f3a9155977bcbd3596f68617982f50a0a','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36','2026-06-26 20:51:46',0,'2026-06-26 13:51:46');
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tbl_cargo`
--

DROP TABLE IF EXISTS `tbl_cargo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_cargo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_tbl_nivel_cargo` int(11) NOT NULL,
  `id_tbl_naraleza_cargo` int(11) NOT NULL,
  `descripcion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_cargo`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tbl_cargo` WRITE;
/*!40000 ALTER TABLE `tbl_cargo` DISABLE KEYS */;
INSERT INTO `tbl_cargo` VALUES
(1,1,1,'Alcalde'),
(2,1,2,'Gerente'),
(3,2,3,'Tecnico Operativo'),
(4,2,3,'Tecnico Administrativo'),
(5,3,2,'Conductor'),
(6,1,2,'Secretario de despacho'),
(7,1,2,'Director Financiero'),
(8,4,2,'Asesor de prensa'),
(9,5,2,'Tesorero general'),
(10,5,3,'Comisario de familia'),
(11,5,3,'Profesional universitario'),
(12,2,3,'Inspector de Policía 3a a 6° Categoría'),
(13,2,3,'Inspector de Tránsito y Transporte'),
(14,2,3,'Agentes de Transito'),
(15,3,3,'Auxiliar Administrativo'),
(16,2,3,'Técnico Administrativo'),
(17,3,3,'Auxiliar de Servicios Generales'),
(18,3,3,'Celador'),
(19,4,2,'Asesor Jurídico'),
(24,6,5,'Contratista');
/*!40000 ALTER TABLE `tbl_cargo` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tbl_detalle_cargo`
--

DROP TABLE IF EXISTS `tbl_detalle_cargo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_detalle_cargo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_dependencia` int(11) NOT NULL,
  `id_tbl_cargo` int(11) NOT NULL,
  `descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_tbl_cargo` (`id_tbl_cargo`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_detalle_cargo`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tbl_detalle_cargo` WRITE;
/*!40000 ALTER TABLE `tbl_detalle_cargo` DISABLE KEYS */;
INSERT INTO `tbl_detalle_cargo` VALUES
(1,12,1,'Despacho del Alcalde'),
(2,18,2,'Control Interno'),
(3,12,3,'Despacho del Alcalde -  Apoyo a la gestion'),
(4,12,4,'Despacho del Alcalde -  Apoyo a la gestion'),
(5,12,5,'Despacho del Alcalde -  Apoyo a la gestion'),
(6,4,6,'Secretaria de Gobierno y participacion ciudadana'),
(7,3,6,'Secretaria general y servicios administrativos'),
(8,5,6,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento territorial'),
(9,8,6,'Secretaria de Hacienda'),
(10,1,6,'Secretaria de Agricultura y Medio Ambiente'),
(11,7,6,'Secretaria de Transito y Transporte'),
(12,2,6,'Secretaria de Educacion '),
(13,6,6,'Secretaria de Salud y Proteccion Social'),
(14,8,7,'Secretaria de Hacienda - Gestion Contable'),
(15,3,8,'Secretaria general y servicios administrativos -Comunicaciones '),
(16,8,9,'Secretaria de Hacienda - Tesoreria General'),
(17,10,10,'Comisaria de Familia - Convivencia Ciudadana - Comisario de familia'),
(18,3,11,'Secretaria General y de Servicios Administrativos - TIC - Sistemas y Mantenimiento'),
(19,3,11,'Secretaria General y Servicios Administrativos - Seguridad y salud  en el trabajo'),
(20,3,11,'Secretaria General y Servicios Administrativos - Gestion Talento Humano'),
(21,3,11,'Secretaria General y de Servicios Administrativos- Jurídica'),
(22,3,11,'Secretaria General y Servicios Administrativos Contratacion - Financiera'),
(23,5,11,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - Proceso Ordenamiento territo'),
(24,5,11,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial -  Banco de Proyectos y Estadi'),
(25,5,11,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - Sistemas de Informacion'),
(26,5,11,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - Infraestructura y Obras Publ'),
(27,5,11,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - Catastro'),
(28,5,11,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - Infraestructura y Obras Publ'),
(29,6,11,'Secretaria de Salud y Proteccion Social - Salud Publica  '),
(30,6,11,'Secretaria de Salud y Proteccion Social - Aseguramiento'),
(31,6,11,'Secretaria de Salud y Proteccion Social - Promocion y Bienestar Social'),
(32,6,11,'Secretaria de Salud y Proteccion Social - Salud Publica - Vigilancia Epidemiologica'),
(33,8,11,'Secretaria de Hacienda -Gestion Financiera -Impuestos'),
(34,8,11,'Secretaria de Hacienda - Impuestos - Cobro Coactivo'),
(35,8,11,'Secretaria de Hacienda -Impuestos - Fiscalizacion Tributaria'),
(36,8,11,'Secretaria de Hacienda - Presupuesto'),
(37,2,11,'Secretaria de Educacion  - Gestion Educativa y Cultural'),
(38,2,11,'Secretaria de Educacion - Seguridad Alimentaria'),
(39,4,11,'Secretaria de Gobierno - Convivencia ciudadana - Comisaria'),
(40,4,11,'Secretaria de Gobierno - Convivencia ciudadana - Psicologia'),
(41,4,12,'Secretaria de Gobierno - Seguridad y Orden publico'),
(42,1,11,'Secretaria de Agricultura y Medio Ambiente- Gestion del Riesgo'),
(43,6,3,'Secretaria de Salud y Proteccion Social - Programas Sociales (Equidad género)'),
(44,6,3,'Secretaria de Salud y Proteccion Social - Programas Sociales (Juventudes)'),
(45,6,3,'Secretaria de Salud y Proteccion Social - Programas Sociales ( Discapacidad)'),
(46,6,3,'Secretaria de Salud y Proteccion Social - Programas Sociales (Familias en accion)'),
(47,4,3,'Secretaria de Gobierno - Espacio Publico'),
(48,4,3,'Secretaria de Gobierno - Poblacion Victima'),
(49,4,3,'Secretaria de Gobierno - Participacion ciudadana'),
(50,3,3,'Secretaria General y Servicios Administrativos -   Comunicaciones - Diseno'),
(51,3,3,'Secretaria General y Servicios Administrativos - Contratacion - Plataformas de informacion(secop,sig'),
(52,3,3,'Secretaria General y Servicios Administrativos - Gestion Documental'),
(53,3,3,'Secretaria General y Servicios Administrativos - Recursos Fisicos'),
(54,6,4,'Secretaria de Salud y Proteccion Social - Salud publica - Estadistica'),
(55,7,13,'Secretaria de Transito y Transporte - Apoyo a la Gestion del Transito y Transporte'),
(56,7,3,'Secretaria de Transito y Transporte - Apoyo a la Gestion del Transito y Transporte'),
(57,7,14,'Secretaria de Transito y Transporte - Apoyo operativo '),
(58,5,3,'Secretaria de Planeacion, Vivienda y Ordenamiento Territorial - Apoyo a la gestion - Catastro'),
(59,8,3,'Secretaria de Hacienda - Apoyo a la Gestion- Contabilidad'),
(60,8,3,'Secretaria de Hacienda - Apoyo a la Gestion- Presupuesto'),
(61,2,3,'Secretaria de Educacion - Gestion Educativa - Sistemas Informacion'),
(62,2,3,'Secretaria de Educacion - Seguridad Alimentaria'),
(63,2,3,'Secretaria de Educacion  - Educacion Superior'),
(64,2,3,'Secretaria de Educacion  -  Casa de la cultura'),
(65,2,3,'Secretaria de Educacion - Gestion de la Cultura'),
(66,5,3,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - OOPP Y Servicios Publicos'),
(67,5,3,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial -Sisben'),
(68,1,3,'Secretaria de Agricultura y Medio Ambiente -Apoyo a la Gestion Operativa'),
(69,6,15,'Secretaria de Salud y Proteccion Social -Apoyo a la Gestion'),
(70,4,15,'Secretaria de Gobierno - Seguridad y Orden Publico -Inspeccion'),
(71,4,15,'Secretaria de Gobierno - Apoyo a la gestion '),
(72,4,15,'Secretaria de Gobierno - Apoyo a la gestion - Participacion Ciudadana'),
(73,4,15,'Secretaria de Gobierno - Apoyo a la gestion Comisaria'),
(74,3,15,'Secretaria general y servicios administrativos - Comunicaciones'),
(75,3,15,'Secretaria General y Servicios Administrativos - Apoyo a la gestion'),
(76,3,15,'Secretaria General y Servicios Administrativos - Talento Humano '),
(77,3,15,'Secretaria general y servicios administrativos - Gestion Documental'),
(78,3,15,'Secretaria general y servicios administrativos - Apoyo a la gestion - mensajeria'),
(79,7,15,'Secretaria de Transito y Transporte - Apoyo a la Gestion'),
(80,8,15,'Secretaria de Hacienda - Apoyo a la gestion'),
(81,8,15,'Secretaria de Hacienda -Apoyo a la Gestion - Facturacion'),
(82,8,15,'Secretaria de Hacienda -Apoyo a la Gestion - Impuestos y cobro coactivo'),
(83,8,15,'Secretaria de Hacienda -Apoyo a la Gestion - Impuestos y cobro coactivo'),
(84,2,16,'Secretaria de educacion  - Gestion Educativa y Cultural '),
(85,5,15,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - Apoyo a la Gestion'),
(86,5,15,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial - SISBEN'),
(87,1,15,'Secretaria de Agricultura y Medio Ambiente - Apoyo a la Gestion'),
(88,3,17,'Secretaria General y Servicios Administrativos - Recursos Físicos'),
(89,3,18,'Secretaria general y servicios administrativos'),
(90,3,5,'Secretaria General y Servicios Administrativos'),
(91,9,11,'Secretaria de Gobierno - Seguridad y Orden publico - Inspector'),
(92,11,3,'Secretaria de Planeacion, OOPPMM, Vivienda y Ordenamiento Territorial -Sisben'),
(93,17,8,'Secretaria general y servicios administrativos -Comunicaciones'),
(94,13,11,'Secretaria General y de Servicios Administrativos- Jurídica'),
(95,21,6,'Secretaría de Infraestructura Física'),
(96,20,6,'Secretaría de Planeación, Vivienda y Ordenamiento Territorial'),
(97,6,4,'Técnico administrativo - negritudes '),
(98,6,4,'Técnico administrativo - salud pública '),
(99,3,11,'Profesional universitario - procesos y gestión de calidad'),
(100,3,4,'Técnico administrativo - gestión transparente y contratación'),
(101,3,15,'Auxiliar administrativo - asistente oficina jurídica'),
(102,7,4,'Técnico administrativo - gestión documental'),
(103,7,4,'Técnico administrativo - gestión de trámites'),
(104,7,15,'Auxiliar administrativo - gestión de trámites'),
(105,8,11,'Profesional universitario - fiscalización'),
(106,8,4,'Técnico administrativo - apoyo rendición de cuentas, actualización   secop ii'),
(107,8,15,'Auxiliar administrativo - impuestos'),
(108,2,4,'Técnico administrativo - cultura '),
(109,20,4,'Técnico administrativo - gestión de riesgo de desastres'),
(110,20,4,'Técnico administrativo - sisbén'),
(111,6,4,'Técnico administrativo - discapacidad '),
(112,4,11,'Profesional universitario - atención victimas migrantes retornada y gestión de paz '),
(113,4,4,'Técnico administrativo - víctimas'),
(114,3,4,'Técnico administrativo - servicios y apoyo administrativo'),
(115,8,11,'Profesional universitario - manejo de datos'),
(116,20,4,'Técnico administrativo - control urbanístico '),
(117,6,11,'Profesional universitario - psicólogo'),
(118,6,15,'Auxiliar administrativo - casa de la mujer'),
(119,4,15,'Auxiliar administrativo - comisaría'),
(120,6,4,'Técnico administrativo - renta ciudadana '),
(121,2,11,'Profesional universitario - primera infancia '),
(122,20,11,'Profesional universitario - licenciamiento'),
(123,20,4,'Técnico administrativo - catastro'),
(124,1,11,'Profesional universitario - veterinario'),
(125,21,11,'Profesional universitario - oppm'),
(126,21,15,'Auxiliar administrativo - asistente tesorería'),
(127,7,3,'Técnico operativo - supervisión y control'),
(128,1,3,'Técnico operativo - asistente'),
(129,21,11,'Profesional universitario - ooppmm'),
(130,7,13,'Inspector de tránsito y transporte'),
(131,6,11,'Profesional universitario - salud pública'),
(132,8,15,'Auxiliar administrativo - mensajero y apoyo administrativo'),
(133,20,4,'Técnico administrativo - catastro'),
(134,1,11,'Profesional universitario - programas y proyectos'),
(135,21,4,'Técnico administrativo - ooppmm'),
(136,1,24,'Contratista'),
(137,2,24,'Contratista'),
(138,3,24,'Contratista'),
(139,4,24,'Contratista'),
(140,5,24,'Contratista'),
(141,6,24,'Contratista'),
(142,7,24,'Contratista'),
(143,8,24,'Contratista'),
(144,12,24,'Contratista'),
(145,20,24,'Contratista'),
(146,21,24,'Contratista');
/*!40000 ALTER TABLE `tbl_detalle_cargo` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `usuario_id` bigint(20) unsigned NOT NULL,
  `rol_id` bigint(20) unsigned NOT NULL,
  `entidad_id` bigint(20) unsigned DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`rol_id`),
  KEY `idx_rol` (`rol_id`),
  KEY `idx_entidad` (`entidad_id`),
  CONSTRAINT `fk_ur_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
INSERT INTO `usuario_rol` VALUES
(2,2,NULL,'2026-06-26 08:44:10'),
(3,2,NULL,'2026-06-26 08:44:10'),
(4,1,NULL,'2026-06-26 08:44:10'),
(4,2,NULL,'2026-06-26 08:44:10'),
(5,1,NULL,'2026-06-26 08:44:10'),
(5,2,NULL,'2026-06-26 08:44:10'),
(6,3,NULL,'2026-06-26 08:44:10'),
(7,3,NULL,'2026-06-26 08:44:10'),
(8,3,NULL,'2026-06-26 08:44:10'),
(9,3,NULL,'2026-06-26 08:44:10'),
(10,3,NULL,'2026-06-26 08:44:10'),
(11,1,NULL,'2026-06-26 08:49:40'),
(11,3,1,'2026-06-26 10:42:33'),
(12,2,1,'2026-06-26 10:42:33'),
(12,3,NULL,'2026-06-26 10:08:17'),
(12,4,NULL,'2026-06-26 10:08:17'),
(13,3,1,'2026-06-26 10:42:33'),
(13,5,1,'2026-06-26 10:30:22'),
(14,2,NULL,'2026-06-26 10:08:17'),
(14,3,1,'2026-06-26 10:42:33'),
(15,3,1,'2026-06-26 10:42:33'),
(16,3,1,'2026-06-26 10:42:33'),
(17,3,1,'2026-06-26 10:42:33'),
(18,3,1,'2026-06-26 10:42:33'),
(19,3,1,'2026-06-26 10:42:33'),
(20,3,1,'2026-06-26 10:42:33'),
(21,3,1,'2026-06-26 10:42:33'),
(22,3,1,'2026-06-26 10:42:33'),
(23,3,1,'2026-06-26 10:42:33'),
(24,3,1,'2026-06-26 10:42:33'),
(25,3,1,'2026-06-26 10:42:33'),
(26,3,1,'2026-06-26 10:42:33'),
(27,3,1,'2026-06-26 10:42:33'),
(28,3,1,'2026-06-26 10:42:33'),
(29,3,1,'2026-06-26 10:42:33'),
(30,3,1,'2026-06-26 10:42:33'),
(31,3,1,'2026-06-26 10:42:33'),
(32,3,1,'2026-06-26 10:42:33'),
(33,3,1,'2026-06-26 10:42:33'),
(34,3,1,'2026-06-26 10:42:33'),
(35,3,1,'2026-06-26 10:42:33'),
(36,3,1,'2026-06-26 10:42:33'),
(37,3,1,'2026-06-26 10:42:33'),
(38,3,1,'2026-06-26 10:42:33'),
(39,3,1,'2026-06-26 10:42:33'),
(40,3,1,'2026-06-26 10:42:33'),
(41,3,1,'2026-06-26 10:42:33'),
(42,3,1,'2026-06-26 10:42:33'),
(43,3,1,'2026-06-26 10:42:33'),
(44,3,1,'2026-06-26 10:42:33'),
(45,3,1,'2026-06-26 10:42:33'),
(46,3,1,'2026-06-26 10:42:33'),
(47,3,1,'2026-06-26 10:42:33'),
(48,3,1,'2026-06-26 10:42:33'),
(49,3,1,'2026-06-26 10:42:33'),
(50,3,1,'2026-06-26 10:42:33'),
(51,3,1,'2026-06-26 10:42:33'),
(52,3,1,'2026-06-26 10:42:33'),
(53,3,1,'2026-06-26 10:42:33'),
(54,3,1,'2026-06-26 10:42:33'),
(55,3,1,'2026-06-26 10:42:33'),
(56,3,1,'2026-06-26 10:42:33'),
(57,3,1,'2026-06-26 10:42:33'),
(58,3,1,'2026-06-26 10:42:33'),
(59,3,1,'2026-06-26 10:42:33'),
(60,3,1,'2026-06-26 10:42:33'),
(61,3,1,'2026-06-26 10:42:33'),
(62,3,1,'2026-06-26 10:42:33'),
(63,3,1,'2026-06-26 10:42:33'),
(64,3,1,'2026-06-26 10:42:33'),
(65,3,1,'2026-06-26 10:42:33'),
(66,3,1,'2026-06-26 10:42:33'),
(67,3,1,'2026-06-26 10:42:33'),
(68,3,1,'2026-06-26 10:42:33'),
(69,3,1,'2026-06-26 10:42:33'),
(70,3,1,'2026-06-26 10:42:33'),
(71,3,1,'2026-06-26 10:42:33'),
(72,3,1,'2026-06-26 10:42:33'),
(73,3,1,'2026-06-26 10:42:33'),
(74,3,1,'2026-06-26 10:42:33'),
(75,3,1,'2026-06-26 10:42:33'),
(76,3,1,'2026-06-26 10:42:33'),
(77,3,1,'2026-06-26 10:42:33'),
(78,3,1,'2026-06-26 10:42:33'),
(79,3,1,'2026-06-26 10:42:33'),
(80,3,1,'2026-06-26 10:42:33'),
(81,3,1,'2026-06-26 10:42:33'),
(82,3,1,'2026-06-26 10:42:33'),
(83,3,1,'2026-06-26 10:42:33'),
(84,3,1,'2026-06-26 10:42:33'),
(85,3,1,'2026-06-26 10:42:33'),
(86,3,1,'2026-06-26 10:42:33'),
(87,3,1,'2026-06-26 10:42:33'),
(88,3,1,'2026-06-26 10:42:33'),
(89,3,1,'2026-06-26 10:42:33'),
(90,3,1,'2026-06-26 10:42:33'),
(91,3,1,'2026-06-26 10:42:33'),
(92,3,1,'2026-06-26 10:42:33'),
(93,3,1,'2026-06-26 10:42:33'),
(94,3,1,'2026-06-26 10:42:33'),
(95,3,1,'2026-06-26 10:42:33'),
(96,3,1,'2026-06-26 10:42:33'),
(97,3,1,'2026-06-26 10:42:33'),
(98,3,1,'2026-06-26 10:42:33'),
(99,3,1,'2026-06-26 10:42:33'),
(100,3,1,'2026-06-26 10:42:33'),
(101,3,1,'2026-06-26 10:42:33'),
(102,3,1,'2026-06-26 10:42:33'),
(103,3,1,'2026-06-26 10:42:33'),
(104,3,1,'2026-06-26 10:42:33'),
(105,3,1,'2026-06-26 10:42:33'),
(106,3,1,'2026-06-26 10:42:33'),
(107,3,1,'2026-06-26 10:42:33'),
(108,3,1,'2026-06-26 10:42:33'),
(109,3,1,'2026-06-26 10:42:33'),
(110,3,1,'2026-06-26 10:42:33'),
(111,3,1,'2026-06-26 10:42:33'),
(112,3,1,'2026-06-26 10:42:33'),
(113,3,1,'2026-06-26 10:42:33'),
(114,3,1,'2026-06-26 10:42:33'),
(115,3,1,'2026-06-26 10:42:33'),
(116,3,1,'2026-06-26 10:42:33'),
(117,3,1,'2026-06-26 10:42:33'),
(118,3,1,'2026-06-26 10:42:33'),
(119,3,1,'2026-06-26 10:42:33'),
(120,3,1,'2026-06-26 10:42:33'),
(121,3,1,'2026-06-26 10:42:33'),
(122,3,1,'2026-06-26 10:42:33'),
(123,3,1,'2026-06-26 10:42:33'),
(124,3,1,'2026-06-26 10:42:33'),
(125,3,1,'2026-06-26 10:42:33'),
(126,3,1,'2026-06-26 10:42:33'),
(127,3,1,'2026-06-26 10:42:33'),
(128,3,1,'2026-06-26 10:42:33'),
(129,3,1,'2026-06-26 10:42:33'),
(130,3,1,'2026-06-26 10:42:33'),
(131,3,1,'2026-06-26 10:42:33'),
(132,3,1,'2026-06-26 10:42:33'),
(133,3,1,'2026-06-26 10:42:33'),
(134,3,1,'2026-06-26 10:42:33'),
(135,3,1,'2026-06-26 10:42:33'),
(136,3,1,'2026-06-26 10:42:33'),
(136,5,1,'2026-06-26 10:42:33'),
(137,3,1,'2026-06-26 10:42:33'),
(137,5,1,'2026-06-26 10:42:33'),
(138,3,1,'2026-06-26 10:42:33'),
(138,5,1,'2026-06-26 10:42:33'),
(139,3,1,'2026-06-26 10:42:33'),
(139,5,1,'2026-06-26 10:42:33'),
(140,3,1,'2026-06-26 10:42:33'),
(140,4,1,'2026-06-26 10:42:33'),
(141,3,1,'2026-06-26 10:42:33'),
(141,5,1,'2026-06-26 10:42:33'),
(142,3,1,'2026-06-26 10:42:33'),
(142,5,1,'2026-06-26 10:42:33'),
(143,3,1,'2026-06-26 10:42:33'),
(144,3,1,'2026-06-26 10:42:33'),
(144,5,1,'2026-06-26 10:42:33'),
(145,3,1,'2026-06-26 10:42:33'),
(145,5,1,'2026-06-26 10:42:33'),
(146,2,1,'2026-06-26 10:42:33'),
(146,3,1,'2026-06-26 10:42:33'),
(147,3,1,'2026-06-26 10:42:33'),
(148,3,1,'2026-06-26 10:42:33'),
(148,5,1,'2026-06-26 10:42:33'),
(149,3,1,'2026-06-26 10:42:33'),
(149,5,1,'2026-06-26 10:42:33'),
(150,2,1,'2026-06-26 10:42:33'),
(150,3,1,'2026-06-26 10:42:33'),
(151,2,1,'2026-06-26 10:42:33'),
(151,3,1,'2026-06-26 10:42:33'),
(152,3,1,'2026-06-26 10:42:33'),
(153,3,1,'2026-06-26 10:42:33'),
(153,5,1,'2026-06-26 10:42:33'),
(154,2,1,'2026-06-26 10:42:33'),
(154,3,1,'2026-06-26 10:42:33'),
(155,3,1,'2026-06-26 10:42:33'),
(156,3,1,'2026-06-26 10:42:33'),
(157,3,1,'2026-06-26 10:42:33'),
(158,3,1,'2026-06-26 10:42:33'),
(159,3,1,'2026-06-26 10:42:33'),
(160,3,1,'2026-06-26 10:42:33'),
(161,2,1,'2026-06-26 10:42:33'),
(161,3,1,'2026-06-26 10:42:33'),
(162,3,1,'2026-06-26 10:42:33'),
(163,3,1,'2026-06-26 10:42:33'),
(164,3,1,'2026-06-26 10:42:33'),
(165,3,1,'2026-06-26 10:42:33'),
(166,3,1,'2026-06-26 10:42:33'),
(167,3,1,'2026-06-26 10:42:33'),
(168,2,1,'2026-06-26 10:42:33'),
(168,3,1,'2026-06-26 10:42:33'),
(169,2,1,'2026-06-26 10:42:33'),
(169,3,1,'2026-06-26 10:42:33'),
(170,3,1,'2026-06-26 10:42:33'),
(171,3,1,'2026-06-26 10:42:33'),
(172,2,1,'2026-06-26 10:42:33'),
(172,3,1,'2026-06-26 10:42:33'),
(173,3,1,'2026-06-26 10:42:33'),
(174,3,1,'2026-06-26 10:42:33'),
(175,3,1,'2026-06-26 10:42:33'),
(176,2,1,'2026-06-26 10:42:33'),
(176,3,1,'2026-06-26 10:42:33'),
(177,2,1,'2026-06-26 10:42:33'),
(177,3,1,'2026-06-26 10:42:33'),
(178,2,1,'2026-06-26 10:42:33'),
(178,3,1,'2026-06-26 10:42:33'),
(179,3,1,'2026-06-26 10:42:33'),
(180,3,1,'2026-06-26 10:42:33'),
(181,2,1,'2026-06-26 10:42:33'),
(181,3,1,'2026-06-26 10:42:33'),
(182,3,1,'2026-06-26 10:42:33'),
(183,3,1,'2026-06-26 10:42:33'),
(183,5,1,'2026-06-26 10:42:33'),
(184,2,1,'2026-06-26 10:42:33'),
(184,3,1,'2026-06-26 10:42:33'),
(185,2,1,'2026-06-26 10:42:33'),
(185,3,1,'2026-06-26 10:42:33'),
(186,2,1,'2026-06-26 10:42:33'),
(186,3,1,'2026-06-26 10:42:33'),
(187,2,1,'2026-06-26 10:42:33'),
(187,3,1,'2026-06-26 10:42:33'),
(188,3,1,'2026-06-26 10:42:33'),
(189,3,1,'2026-06-26 10:42:33'),
(190,3,1,'2026-06-26 10:42:33'),
(191,3,1,'2026-06-26 10:42:33'),
(192,3,1,'2026-06-26 10:42:33'),
(193,3,1,'2026-06-26 10:42:33'),
(194,3,1,'2026-06-26 10:42:33'),
(195,3,1,'2026-06-26 10:42:33'),
(196,3,1,'2026-06-26 10:42:33'),
(197,3,1,'2026-06-26 10:42:33'),
(198,3,1,'2026-06-26 10:42:33'),
(199,3,1,'2026-06-26 10:42:33'),
(200,3,1,'2026-06-26 10:42:33'),
(201,3,1,'2026-06-26 10:42:33'),
(202,2,1,'2026-06-26 10:42:33'),
(202,3,1,'2026-06-26 10:42:33'),
(203,3,1,'2026-06-26 10:42:33'),
(204,3,1,'2026-06-26 10:42:33'),
(205,3,1,'2026-06-26 10:42:33'),
(206,3,1,'2026-06-26 10:42:33'),
(207,3,1,'2026-06-26 10:42:33'),
(208,3,1,'2026-06-26 10:42:33'),
(209,3,1,'2026-06-26 10:42:33'),
(210,3,1,'2026-06-26 10:42:33'),
(211,3,1,'2026-06-26 10:42:33'),
(212,3,1,'2026-06-26 10:42:33'),
(213,3,1,'2026-06-26 10:42:33'),
(214,3,1,'2026-06-26 10:42:33'),
(215,3,1,'2026-06-26 10:42:33'),
(216,3,1,'2026-06-26 10:42:33'),
(217,3,1,'2026-06-26 10:42:33'),
(218,3,1,'2026-06-26 10:42:33'),
(219,3,1,'2026-06-26 10:42:33'),
(220,3,1,'2026-06-26 10:42:33'),
(221,3,1,'2026-06-26 10:42:33'),
(222,3,1,'2026-06-26 10:42:33');
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `documento` varchar(30) NOT NULL,
  `tipo_documento` enum('CC','CE','PA','TI','RC','DIP','NIT') NOT NULL DEFAULT 'CC',
  `genero` enum('masculino','femenino','otro') DEFAULT NULL,
  `primer_nombre` varchar(60) NOT NULL,
  `segundo_nombre` varchar(60) DEFAULT NULL,
  `primer_apellido` varchar(60) NOT NULL,
  `segundo_apellido` varchar(60) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `email_confirmado` tinyint(1) NOT NULL DEFAULT 0,
  `telefono1` varchar(30) DEFAULT NULL,
  `telefono2` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
  `intentos_fallidos` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `ultimo_acceso` datetime DEFAULT NULL,
  `entidad_id` bigint(20) unsigned DEFAULT NULL,
  `dependencia_id` bigint(20) unsigned DEFAULT NULL,
  `es_contratista` tinyint(1) NOT NULL DEFAULT 0,
  `nivel` enum('directivo','asesor','profesional','tecnico','asistencial') DEFAULT NULL,
  `naturaleza` enum('carrera_administrativa','libre_nombramiento','libre_nombramiento_gerencia_publica') DEFAULT NULL,
  `tipo_nombramiento` enum('hecho_en_carrera','periodo_de_prueba','provisional','encargo_planta_global','encargo_planta_temporal','encargo_vacancia_definitiva','encargo_vacancia_temporal') DEFAULT NULL,
  `denominacion_empleo` varchar(200) DEFAULT NULL,
  `codigo_empleo` varchar(30) DEFAULT NULL,
  `grado_empleo` varchar(10) DEFAULT NULL,
  `es_evaluador_y_evaluado` tinyint(1) NOT NULL DEFAULT 0,
  `dependencia_evaluacion_id` bigint(20) unsigned DEFAULT NULL,
  `en_periodo_prueba` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_posesion` date DEFAULT NULL,
  `proposito_principal_empleo` text DEFAULT NULL,
  `evaluacion_inicio_febrero` tinyint(1) NOT NULL DEFAULT 1,
  `debe_cambiar_password` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_inicio_evaluacion` date DEFAULT NULL,
  `motivo_fecha_inicio_diferente` enum('terminacion_periodo_prueba','terminacion_vacancia_temporal','regreso_vacaciones','regreso_incapacidad','regreso_encargo','regreso_comision_servicios','regreso_licencia','suspension_ejercicio_cargo','otro') DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `eliminado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_documento` (`documento`,`tipo_documento`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_entidad` (`entidad_id`),
  KEY `idx_dependencia` (`dependencia_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_naturaleza` (`naturaleza`),
  KEY `idx_dependencia_evaluacion` (`dependencia_evaluacion_id`),
  CONSTRAINT `fk_usu_dep_evaluacion` FOREIGN KEY (`dependencia_evaluacion_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_usu_dependencia` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_usu_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `entidades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=270 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(2,'52987634','CC',NULL,'Maria',NULL,'Rodriguez Perez',NULL,'maria.rodriguez@carepa.gov.co',0,'3101234567',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,'2026-06-26 09:20:33',1,1,0,NULL,NULL,'hecho_en_carrera','Evaluador Senior',NULL,'20',0,NULL,0,'2018-03-15',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(3,'71428536','CC',NULL,'Carlos',NULL,'Martinez Lopez',NULL,'carlos.martinez@carepa.gov.co',0,'3102345678',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,2,0,NULL,NULL,'hecho_en_carrera','Evaluador Tecnico',NULL,'18',0,NULL,0,'2019-06-01',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(4,'39847261','CC',NULL,'Andrea',NULL,'Sanchez Vega',NULL,'andrea.sanchez@carepa.gov.co',0,'3103456789',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,1,0,NULL,NULL,'hecho_en_carrera','Jefe de Entidad',NULL,'24',0,NULL,0,'2015-01-10',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(5,'60182934','CC',NULL,'Luis',NULL,'Hernandez Torres',NULL,'luis.hernandez@carepa.gov.co',0,'3104567890',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,3,0,NULL,NULL,'hecho_en_carrera','Jefe de Dependencia',NULL,'22',0,NULL,0,'2016-08-20',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(6,'1045678923','CC',NULL,'Juan',NULL,'Gomez Ramirez',NULL,'juan.gomez@carepa.gov.co',0,'3115678901',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,'2026-06-26 08:58:15',1,1,0,NULL,NULL,'hecho_en_carrera','Profesional Universitario',NULL,'14',0,NULL,0,'2020-02-01',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(7,'1056789034','CC',NULL,'Patricia',NULL,'Diaz Morales',NULL,'patricia.diaz@carepa.gov.co',0,'3116789012',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,1,0,NULL,NULL,'provisional','Tecnico Operativo',NULL,'11',0,NULL,0,'2022-05-15',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(8,'1067890123','CC',NULL,'Fernando',NULL,'Torres Nino',NULL,'fernando.torres@carepa.gov.co',0,'3117890123',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,2,0,NULL,NULL,'hecho_en_carrera','Profesional Especializado',NULL,'17',0,NULL,0,'2017-11-01',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(9,'1078901234','CC',NULL,'Lucia',NULL,'Castro Rojas',NULL,'lucia.castro@carepa.gov.co',0,'3118901234',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,3,0,NULL,NULL,'provisional','Auxiliar Administrativo',NULL,'08',0,NULL,0,'2023-01-10',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(10,'1089012345','CC',NULL,'Roberto',NULL,'Munoz Silva',NULL,'roberto.munoz@carepa.gov.co',0,'3119012345',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,NULL,1,3,0,NULL,NULL,'hecho_en_carrera','Profesional Universitario',NULL,'15',0,NULL,0,'2021-07-01',NULL,1,0,NULL,NULL,'2026-06-26 08:44:10','2026-06-26 10:09:37',NULL),
(11,'admin','CC',NULL,'Admin',NULL,'Principal',NULL,'admin@carepa.gov.co',0,NULL,NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,'2026-06-26 09:28:58',1,1,0,NULL,NULL,'hecho_en_carrera','Administrador',NULL,'25',0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 08:49:40','2026-06-26 10:09:37',NULL),
(12,'1040353165','CC',NULL,'YEISON',NULL,'ROMAÑA','CORDOBA','maiayevir@hotmail.com',0,'2147483647',NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,'2026-06-26 13:51:40',1,14,0,NULL,NULL,NULL,'Funcionario',NULL,NULL,0,NULL,0,'2026-02-03',NULL,1,0,NULL,NULL,'2026-06-26 10:08:17','2026-06-26 13:51:40',NULL),
(13,'43141896','CC','femenino','LUSELY',NULL,'OREJUELA',NULL,'user80@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,'2026-06-26 12:44:02',1,14,0,'directivo','libre_nombramiento_gerencia_publica','hecho_en_carrera','Jefe de Dependencia',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:08:17','2026-06-26 12:44:02',NULL),
(14,'32290307','CC',NULL,'RUBITH','ELISA','CARVAJAL','VILLADA','rubith.carvajal@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$eOad/yQpHRHBiy1Wmglmx.wezTgTOlumGNMRhm7PInJqzDEi0D3yG','activo',0,'2026-06-26 13:21:16',1,14,0,NULL,NULL,NULL,'Funcionario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:08:17','2026-06-26 13:21:16',NULL),
(15,'39425357','CC',NULL,'ALBA','NELLY','GUERRA','MONTOYA','user1@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(16,'1040375031','CC',NULL,'ALDAIR','','ROMERO','LOPEZ','user2@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(17,'71258461','CC',NULL,'ALEXANDER',NULL,'MOSQUERA',NULL,'user3@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(18,'22731855','CC',NULL,'ALEXANDRA','PATRICIA','SILVA','GUTIERREZ','user4@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(19,'98648954','CC',NULL,'JONNAN',NULL,'ALEXIS',NULL,'user5@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,9,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(20,'1037573859','CC',NULL,'ALVARO','','HINCAPIE','HERNANDEZ','user6@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(21,'10940356','CC',NULL,'ALVARO','JOSE','CERPA','HERRERA','user7@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(22,'43141244','CC',NULL,'ANA','FELISA','MOSQUERA','MARMOLEJO','user8@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(23,'1027947311','CC',NULL,'ANA','ISABEL','RESTREPO','BEDOYA','user9@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(24,'1040375017','CC',NULL,'ANDERSON',NULL,' PATIÑO',NULL,'user10@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(25,'1040365874','CC',NULL,'ANDRY','JULIETH','FUENTES','LOPEZ','user11@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(26,'33272957','CC',NULL,'ANYIBED','YUBELI','MÁRQUEZ','BALLESTEROS','user12@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(27,'71257412','CC',NULL,'ARLEY','DARIO','MURILLO','LARGACHA','user13@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(28,'43143319','CC',NULL,'BERLIDIS','BEATRIZ','VARGAS','BOLAÑOS','user14@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(29,'43140963','CC',NULL,'BERTHA','CECILIA','HIGUITA','VARGAS','user15@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(30,'71242407','CC',NULL,'CARLOS','ALBERTO','MARTINEZ','VELEZ','user16@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(31,'71240572','CC',NULL,'CARLOS','ALBERTO','QUEJADA','GONZALEZ','user17@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(32,'1027948618','CC',NULL,'CAROLINA','','HENAO','ANDRADE','user18@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,8,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(33,'1027999478','CC',NULL,'CINDY','JHOANNA','PALACIOS','MENA','user19@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(34,'43143025','CC',NULL,'CLAUDIA','CECILIA','BEDOYA','BENITEZ','user20@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(35,'66870688','CC',NULL,'CLAUDIA','LORENA','RODRIGUEZ','CHAVEZ','user21@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(36,'43142808','CC',NULL,'CLAUDIA','LUZ','GARCES','GARCIA','user22@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(37,'26328965','CC',NULL,'CLEOFE','','MOSQUERA','MARTINEZ','user23@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(38,'1040382085','CC',NULL,'CRISTIAN','ANDRES','HURTADO','HERNANDEZ','user24@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(39,'1001667647','CC',NULL,'DANIEL','','CORONADO','SEPULVEDA','user25@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,10,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(40,'1038815273','CC',NULL,'DANIEL','BERNARDO','CASTRILLON','PULGARIN','user26@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(41,'39426817','CC',NULL,'DANNY','DEL','CAUSIL','DONADO','user27@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(42,'32852959','CC',NULL,'DANNY','JOHANA','NARVAEZ','CORONADO','user28@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,6,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(43,'71278837','CC',NULL,'DEIVIS','','NORIEGA','TEHERAN','user29@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(44,'71942673','CC',NULL,'EDILSON','ENRIQUE','CORONADO','GUZMÁN','user30@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(45,'1027950228','CC',NULL,'EIDY','ALEJANDRA','OCHOA','ARRIETA','user31@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(46,'1038811001','CC',NULL,'ELISSAUD','','GOMEZ','PRECIADO','user32@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(47,'1040354603','CC',NULL,'ELIZA','','MOSQUERA','PALACIO','user33@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(48,'71936117','CC',NULL,'ELKIN','DARIO','DAVID','GIRALDO','user34@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(49,'39427628','CC',NULL,'ERIKA','ANDREA','PULGARIN','RENGIFO','user35@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(50,'1040366326','CC',NULL,'ESTEFANIA','','DUQUE','MOSQUERA','user36@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(51,'71948054','CC',NULL,'EUCLIDES','','MENA','MORENO','user37@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(52,'34976950','CC',NULL,'EUGENIA','DEL','DE','MENDOZA','user38@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(53,'71252661','CC',NULL,'FABIAN','DARLEY','ROLDAN','VILLA','user39@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(54,'8414514','CC',NULL,'FERNANDO',NULL,'ALONSO',NULL,'user40@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(55,'70557902','CC',NULL,'FRANCISCO','JAVIER','CASTAÑO','BOLIVAR','user41@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(56,'25025100','CC',NULL,'GLORIA','ELENA','GONZALEZ','LONDOÑO','user42@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(57,'43146247','CC',NULL,'GLORIA','LEIDIS','MOSQUERA','BARRIOS','user43@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(58,'71252120','CC',NULL,'GUSTAVO','ANTONIO','GARCIA','MANCO','user44@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(59,'8413893','CC',NULL,'GUSTAVO','DE','ECHAVARRIA','GARCIA','user45@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(60,'1017260456','CC',NULL,'HAROL','MAURICIO','CAVADIA','SIERRA','user46@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(61,'71250103','CC',NULL,'HENDER',NULL,' MANCO',NULL,'user47@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(62,'1037671779','CC',NULL,'ISABELLA','','MARTINEZ','RENDON','user48@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(63,'1040365117','CC',NULL,'JADER','ENRIQUE','ACOSTA','JARAMILLO','user49@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(64,'11808238','CC',NULL,'JAILER',NULL,'BARRIOS',NULL,'user50@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(65,'1000438217','CC',NULL,'JAIME','LEON','QUINTERO','MEJIA','user51@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,10,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(66,'8321504','CC',NULL,'JAIRO','','GUERRA','MONTOYA','user52@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2022-01-18',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(67,'71947096','CC',NULL,'JESUS','DAYLER','HURTADO','CORDOBA','user53@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(68,'7494222','CC',NULL,'JESÚS',NULL,'EVELIO',NULL,'user54@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(69,'1073978319','CC',NULL,'JHONATAN','','HERNANDEZ','ORTIZ','user55@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(70,'73133514','CC',NULL,'JORGE','ARTURO','MENDOZA','HIJUELOS','user56@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(71,'1040355181','CC',NULL,'JORGE','IVAN','USQUIANO','CASTRILLON','user57@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(72,'71250959','CC',NULL,'JOSE','ALFONSO','BETANCOURT','MERCADO','user58@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(73,'18461991','CC',NULL,'JOSE','LEONEL','BLANDON','LOPEZ','user59@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(74,'71254734','CC',NULL,'JOSE','NOEL','MOSQUERA','TORRES','user60@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(75,'98618358','CC',NULL,'JOSE','WALTER','ALFONSO','SIERRA','user61@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,9,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(76,'1028014661','CC',NULL,'JUAN','DAVID','QUINCHIA','SILVA','user62@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(77,'23182741','CC',NULL,'KAREN','TATIANA','SUAREZ','ZABALA','user63@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,6,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(78,'1028010602','CC',NULL,'KATHERIN','','LOZANO','DURANGO','user64@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(79,'39423830','CC',NULL,'KATHERINE','HYLEANA','QUINTERO','PAEZ','user65@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(80,'38463675','CC',NULL,'LADY','DIANA','CASAS','CASAS','user66@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(81,'1040372789','CC',NULL,'LAURA','CRISTINA','GIRON','ESPITIA','user67@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(82,'1040370353','CC',NULL,'LEDYS','PAOLA','ALVAREZ','GALVAN','user68@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,16,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(83,'43140526','CC',NULL,'LETICIA','ELENA','TAPIA','PALACIOS','user69@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(84,'50934559','CC',NULL,'LIGIA','ESTHER','DIAZ','LOPEZ','user70@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(85,'43147732','CC',NULL,'LILIANA','ASTRID','MURILLO','TORRES','user71@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(86,'43757087','CC',NULL,'LILIANA','PATRICIA','MUÑOZ','VALENCIA','user72@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(87,'1027965245','CC',NULL,'LINA','MARCELA','IBARGUEN','GOMEZ','user73@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(88,'22144267','CC',NULL,'LINA','YANETH','ANGULO','DIAZ','user74@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(89,'43142342','CC',NULL,'LISBEN','YUDEIMI','MORENO','ORREGO','user75@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(90,'39427384','CC',NULL,'LORENA','MARCELA','ROMAÑA','PEREA','user76@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(91,'50975680','CC',NULL,'LUBY','MARIA','MARTINEZ','ROJAS','user77@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(92,'71933053','CC',NULL,'LUIS','ALFONSO','LOPEZ','HERNANDEZ','user78@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(93,'10275544','CC',NULL,'LUIS',NULL,'CARLOS',NULL,'user79@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,9,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(94,'32801099','CC',NULL,'LUZMILA','','CASTRO','AGUALIMPIA','user81@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(95,'71250641','CC',NULL,'MANUEL','ELADIO','PALACIOS','PALACIOS','user82@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(96,'39299652','CC',NULL,'MARÍA','ELAILDA','MUÑOZ','CORRALES','user83@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(97,'43140053','CC',NULL,'MARÍA','FERNEDYS','GUISAO','VILLA','user84@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(98,'1001032633','CC',NULL,'MARIA','JOSE','CASTAÑO','GONZALEZ','user85@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(99,'39409914','CC',NULL,'MARIA','JULIANA','PALACIOS','PALACIOS','user86@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(100,'1001389422','CC',NULL,'MARIA','LIZETH','TAMAYO','MUÑOZ','user87@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,7,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(101,'32107335','CC',NULL,'MARIA','MAGALY','HIGUITA','GAVIRIA','user88@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(102,'71258197','CC',NULL,'MARIO','ALBERTO','CARDENAS','DIAZ','user89@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(103,'39408083','CC',NULL,'MARITZA','','SANTOS','HOYOS','user90@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(104,'40985572','CC',NULL,'MARLA','','YABRUDY','ZABALETA','user91@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(105,'26331249','CC',NULL,'MARTINA',NULL,'QUIÑONES',NULL,'user92@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(106,'1027946373','CC',NULL,'MAYRA','ALEJANDRA','CORREA','DIAZ','user93@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(107,'70555733','CC',NULL,'MIGUEL','ANGEL','RUIZ','BRAND','user94@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(108,'29740850','CC',NULL,'MILADY',NULL,'SOTO',NULL,'user95@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(109,'43141067','CC',NULL,'MONICA','ALEXANDRA','ESCOBAR','MANCO','user96@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,12,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(110,'1027956341','CC',NULL,'MYLADYS','','MARTINEZ','PANDALES','user97@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(111,'32287553','CC',NULL,'OMAIRA','DEL','RUEDA','MANCO','user98@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(112,'26263416','CC',NULL,'OSIRYS','ABELIA','MOSQUERA','CUESTA','user99@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(113,'30657273','CC',NULL,'OTTY','LUZ','ROMERO','VILORIA','user100@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(114,'71254465','CC',NULL,'PAULO','CESAR','CAVADIA','CASTELLANOS','user101@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(115,'11810811','CC',NULL,'REYKLER','ENRIQE','RAMIREZ','RENTERIA','user102@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(116,'71252838','CC',NULL,'RIKELME',NULL,' ROBLEDO',NULL,'user103@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(117,'39409027','CC',NULL,'ROSMIRA',NULL,'PUERTA',NULL,'user104@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(118,'45529531','CC',NULL,'SANDRA','CAROLINA','MOSQUERA','BOTERO','user106@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(119,'32294724','CC',NULL,'SANDRA','MILER','MENA','JAVA','user107@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(120,'1038803717','CC',NULL,'SINDY','PAOLA','HERNANDEZ','SANCHEZ','user108@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(121,'39429450','CC',NULL,'TRINIDAD','','BEDOYA','PEREIRA','user109@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(122,'1074007092','CC',NULL,'WENDY','JOHANA','ALVAREZ','VANEGAS','user110@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(123,'71253027','CC',NULL,'WILMAR',NULL,'PAZ',NULL,'user111@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(124,'43144065','CC',NULL,'YAMILE',NULL,'YAMILE URREGO',NULL,'user112@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(125,'1040364701','CC',NULL,'YANIRIS',NULL,'MARTINEZ',NULL,'user113@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(126,'1001593242','CC',NULL,'YEIMER','DE','TAPIAS','GONZALEZ','user114@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(127,'1040380043','CC',NULL,'YEISON','ANDRES','BENITE','RIVAS','user116@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,22,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(128,'1018448277','CC',NULL,'YESSICA','ALEJANDRA','HENAO','SANCHEZ','user117@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(129,'67039597','CC',NULL,'YILIS','MARCELA','RENTERIA','LOZANO','user118@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,9,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(130,'1040373101','CC',NULL,'YISETH','NATALIA','CERON','MARTINEZ','user119@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,17,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(131,'21697399','CC',NULL,'YOLIMA',NULL,'ZAPATA',NULL,'user120@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,21,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(132,'1040378628','CC',NULL,'YULISA','YIBETH','DUARTE','ORTIZ','user121@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(133,'1077432997','CC',NULL,'YURY','LLISED','VALOYES','MENA','user122@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(134,'1040371219','CC',NULL,'LAURA','ALEJANDRA','VELEZ','VALLE','user125@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(135,'43148186','CC',NULL,'XIOMARA','ASTRID','PALACIOS','CAICED','user146@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,13,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(136,'71254735','CC',NULL,'GARLANT','YAFER','LEDEZMA','MARTINEZ','user154@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(137,'8328415','CC',NULL,'PITERSON','ALEXANDER','TRELLEZ','URUETA','user156@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,16,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(138,'71985750','CC',NULL,'JIMMY',NULL,'RIVAS',NULL,'user157@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(139,'71940986','CC',NULL,'RAMIRO',NULL,'ALVAREZ',NULL,'user158@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(140,'4808313','CC',NULL,'AGAPÍTO',NULL,'MURILLO',NULL,'user159@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,9,0,NULL,NULL,NULL,'Alcalde',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(141,'11804635','CC',NULL,'EISON',NULL,'LIZCANO',NULL,'user160@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(142,'1038798666','CC',NULL,'ANIS','EMILCEN','BARRERA','PEREZ','user161@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,8,0,NULL,NULL,NULL,'Gerente',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(143,'31445623','CC',NULL,'YAMILETH','OMAIRA','MURILLO','CHAVERRA','user166@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,6,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(144,'11798188','CC',NULL,'JOSE',NULL,'ELVIN',NULL,'user168@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(145,'71947858','CC',NULL,'UBER','ANTONIO','BORJA','HINESTROZA','user172@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,8,0,NULL,NULL,NULL,'Gerente',NULL,NULL,0,NULL,0,'2024-05-29',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(146,'1003143150','CC',NULL,'SHIRLEY','PAOLA','ESPITIA','PASSOS','user176@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','inactivo',0,NULL,1,14,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2024-06-24',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(147,'1001032834','CC',NULL,'HARILSON',NULL,'MOSQUERA',NULL,'user177@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,9,0,NULL,NULL,NULL,'Conductor',NULL,NULL,0,NULL,0,'2024-08-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(148,'82383828','CC',NULL,'CARLOS','AMIN','LONGA','CAICEDO','user178@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Director Financiero',NULL,NULL,0,NULL,0,'2024-08-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(149,'1128397309','CC',NULL,'YORLEIDY',NULL,'CUESTA',NULL,'user179@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,23,0,NULL,NULL,NULL,'Tesorero general',NULL,NULL,0,NULL,0,'2024-10-30',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(150,'1027959334','CC',NULL,'SANDY','LILIANA','AYAZO','PEÑATA','user180@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2024-12-11',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(151,'1028024442','CC',NULL,'ANGIE','KATERINE','ROSERO','PEÑA','user181@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2024-12-11',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(152,'39316282','CC',NULL,'LUZ','DARYS','PASTRANA','MENDOZA','user182@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2024-12-20',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(153,'8437788','CC',NULL,'JUAN','DAVID','ECHAVARRIA','TRUJILLO','user183@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Secretario de despacho',NULL,NULL,0,NULL,0,'2025-04-10',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(154,'1077459275','CC',NULL,'JUAN','DAVID','ZAYA','MARTINEZ','user184@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,10,0,NULL,NULL,NULL,'Inspector de Policía 3a a 6° Categoría\n',NULL,NULL,0,NULL,0,'2025-04-10',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(155,'71255448','CC',NULL,'EDIS','JOANNIS','RIVAS','MEDINA','user185@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(156,'1001400647','CC',NULL,'SHIRLEY',NULL,'PETRO',NULL,'user186@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(157,'1001667608','CC',NULL,'LUZ','STEFANY','PALACIOS','SOCARRAS','user188@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(158,'43414737','CC',NULL,'DORA','LUZ','BENITEZ','ZAPATA','user189@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(159,'39419250','CC',NULL,'MARTHA','CECILIA','ORTIZ','ZAPATA','user190@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(160,'1038806156','CC',NULL,'CRISTINA','ISABEL','GORDON','GULFO','user191@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(161,'1040352093','CC',NULL,'ARGENIDES','YULIETH','SERNA','PALACIO','user193@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(162,'43145431','CC',NULL,'GILDA','IBERO','PEREA','GUTIERREZ','user195@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(163,'1028009884','CC',NULL,'JORGE','ENRIQUE','PALACIO','CHALA','user196@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(164,'1038802989','CC',NULL,'DUBAN',NULL,'GULFO',NULL,'user197@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(165,'35871798','CC',NULL,'YULY',NULL,'RENTERÍA',NULL,'user198@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(166,'39317954','CC',NULL,'YIRLEY',NULL,'ROJAS',NULL,'user201@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(167,'1040353140','CC',NULL,'LINA','MARCELA','BARRAZA','PARRA','user202@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(168,'71257924','CC',NULL,'DELKIN','RUBEIRO','ROMAÑA','CORDOBA','user203@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(169,'1017231150','CC',NULL,'MARIA','CAMILA','OSORIO','CORREA','user205@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(170,'43924616','CC',NULL,'SANDRA','LILIANA','GUISAO','ZAPATA','user206@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(171,'1040363632','CC',NULL,'ROSA','LILIANA','RIVAS','IBARGUEN','user207@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(172,'98617682','CC',NULL,'FABIAN','MAURICIO','PATIÑO','NAVARRO','user213@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,16,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(173,'1001668446','CC',NULL,'ESTEFFANI','PAOLA','MANCO','ARISTIZABAL','user214@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,16,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(174,'1040379689','CC',NULL,'LINA','FERNANDA','REYES','VALENCIA','user215@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,14,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:33:24',NULL),
(175,'1028004441','CC',NULL,'DARY','LICETH','JULIO','ARENAS','user216@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(176,'1238938020','CC',NULL,'JULIAN',NULL,'DAVID',NULL,'user217@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,16,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(177,'1040382522','CC',NULL,'DIEGO','FERNANDO','ALBORNOZ','LANZ','user218@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,'Inspector de Tránsito y Transporte',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(178,'39273861','CC',NULL,'ELVIA','TERESA','JARAVA','PALENCIA','user219@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(179,'71987721','CC',NULL,'VICTOR',NULL,'VARGAS',NULL,'user220@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(180,'32144209','CC',NULL,'MARYELIS',NULL,'DIAZ',NULL,'user221@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(181,'1040378929','CC',NULL,'JHOSELIN','ASTRID','GUERRERO','MORENO','user223@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,7,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(182,'1040378974','CC',NULL,'ROSALBA',NULL,'SERNA',NULL,'user224@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,12,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(183,'1001671213','CC',NULL,'SEBASTIAN',NULL,'BRAVO',NULL,'user225@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,20,0,NULL,NULL,NULL,'Gerente',NULL,NULL,0,NULL,0,NULL,NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(184,'8439996','CC',NULL,'ARISTOBULO',NULL,'TAPIAS',NULL,'user226@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2025-04-21',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(185,'1040354330','CC',NULL,'YADERLIS','JHOANA','ESCOBAR','LEZCANO','user227@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(186,'1040379118','CC',NULL,'ROBINSON','DE','TABORDA','SANCHEZ','user228@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(187,'1040369733','CC',NULL,'DANIEL',NULL,'CAICEDO',NULL,'user229@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(188,'1036686086','CC',NULL,'MAGDY','KATHERINE','PEREA','MOSQUERA','user230@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(189,'1040352386','CC',NULL,'KAROLL','DAJHANA','MOSQUERA','MENDOZA','user231@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(190,'1077440918','CC',NULL,'SANDRA','MILENA','ALEGRIA','PALACIOS','user232@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(191,'1040375234','CC',NULL,'FABIAN','ANTONIO','MEJIA','TABARES','user233@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2025-04-25',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(192,'1040376851','CC',NULL,'ALEJANDRO',NULL,'RENTERIA',NULL,'user234@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(193,'1040370053','CC',NULL,'WILFER','YAFET','MURILLO','PALACIOS','user235@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(194,'71253373','CC',NULL,'JOSE','ALIRIO','BARRERA','LOPERA','user236@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(195,'71255124','CC',NULL,'GERSON','ELIAS','GOEZ','REYES','user237@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(196,'1003756352','CC',NULL,'LUISA','FERNANDA','OVIEDO','GIRON','user238@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(197,'11807117','CC',NULL,'ERVIN',NULL,'MENA',NULL,'user239@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(198,'1003853930','CC',NULL,'LUIS','MIGUEL','GULFO','MOSQUERA','user240@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(199,'1040351863','CC',NULL,'NATALIT','PAOLA','PUENTES','VELASQUEZ','user241@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(200,'1040369324','CC',NULL,'DISNEY',NULL,'SEPULVEDA',NULL,'user242@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(201,'1040366428','CC',NULL,'HELENA','PATRICIA','BRAVO','GAMBOA','user243@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(202,'71252860','CC',NULL,'MILTON',NULL,'ARBOLEDA',NULL,'user244@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Profesional universitario',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(203,'1040373127','CC',NULL,'LAURA','STHEFANY','JARAMILLO','PEÑA','user245@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(204,'1040374861','CC',NULL,'SANTIAGO',NULL,'PEÑA',NULL,'user246@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(205,'71241176','CC',NULL,'CARLOS','MARIO','ESCOBAR','RIALES','user247@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(206,'1040378244','CC',NULL,'JHON','MARIO','ACOSTA','ROJAS','user248@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,15,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(207,'71942191','CC',NULL,'OFRACINO',NULL,'PALACIOS',NULL,'user249@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(208,'1001673522','CC',NULL,'LAURA','ANDREA','GARCIA','RODRIGUEZ','user250@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(209,'1001401126','CC',NULL,'NEIDYS','CECILIA','PETRO','SEÑA','user251@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(210,'11937166','CC',NULL,'YUDNE','WISTON','DIAZ','RIVAS','user252@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(211,'71983799','CC',NULL,'LUIS','ANGEL','GONZALEZ','MOYA','user253@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(212,'1007853357','CC',NULL,'ELIZABETH',NULL,'ESTRADA',NULL,'user254@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(213,'1040353939','CC',NULL,'JORGE','ALBERTO','HERRERA','LONDOÑO','user255@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(214,'71255324','CC',NULL,'JOSE','HENRY','ASPRILLA','MOSQUERA','user256@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-05',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(215,'1040358454','CC',NULL,'JAVIER','ENRIQUE','PEREZ','HERNANDEZ','user257@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,21,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-06',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(216,'1038815277','CC',NULL,'GLENYS','CECILIA','VALENCIA','BLANDON','user258@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,19,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-06',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(217,'1001673430','CC',NULL,'VALENTINA',NULL,'ZUÑIGA',NULL,'user259@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,18,0,NULL,NULL,NULL,'Auxiliar Administrativo',NULL,NULL,0,NULL,0,'2025-05-08',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(218,'1027956781','CC',NULL,'HAMIGTON',NULL,'MOSQUERA',NULL,'user260@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2025-05-08',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(219,'1040361340','CC',NULL,'LUIS','GUILLERMO','VELASQUEZ','DAVID','user261@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2025-05-13',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(220,'1040375710','CC',NULL,'AIDA','LUZ','BEDOYA','MARTINEZ','user262@carepa-antioquia.gov.co',0,NULL,NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,13,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2025-05-15',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(221,'878787878','CC',NULL,'OTRO','MAS','DE','SISTEMAS','otrosistemas@carepa-antioquia.gov.co',0,'314447553',NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,9,0,NULL,NULL,NULL,'Tecnico Administrativo',NULL,NULL,0,NULL,0,'2026-06-11',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL),
(222,'9999999','CC',NULL,'CORONCORO',NULL,'PEREA',NULL,'elmismodesiempre@carepa-antioquia',0,'2147483647',NULL,'$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a','activo',0,NULL,1,9,0,NULL,NULL,NULL,'Tecnico Operativo',NULL,NULL,0,NULL,0,'2026-06-08',NULL,1,0,NULL,NULL,'2026-06-26 10:13:26','2026-06-26 10:41:26',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`edl_user`@`localhost`*/ /*!50003 TRIGGER trg_usuarios_audit AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
 INSERT INTO auditoria (usuario_id, accion, entidad, registro_id, datos_anteriores, datos_nuevos)
 VALUES (NEW.id, 'actualizar', 'usuarios', NEW.id,
 JSON_OBJECT('primer_nombre', OLD.primer_nombre, 'primer_apellido', OLD.primer_apellido, 'estado', OLD.estado, 'email', OLD.email),
 JSON_OBJECT('primer_nombre', NEW.primer_nombre, 'primer_apellido', NEW.primer_apellido, 'estado', NEW.estado, 'email', NEW.email)
 );
END 
*/;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-06-26 14:27:11
