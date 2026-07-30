-- VANT database dump
-- Source: maglev.proxy.rlwy.net/railway
-- Generated: 2026-07-30T20:01:20.146Z
-- Tables: 10

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- SCHEMA (CREATE TABLE)
-- =====================================================

DROP TABLE IF EXISTS `bateria`;
CREATE TABLE `bateria` (
  `id_bateria` int NOT NULL AUTO_INCREMENT,
  `numero_de_serie` varchar(45) NOT NULL,
  `voltage` int NOT NULL,
  `capacidad` int NOT NULL,
  `ciclos_de_carga` int DEFAULT NULL,
  `estado` enum('Buena','Desgastada','Dañanda') NOT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id_bateria`),
  UNIQUE KEY `numero_de_serie_UNIQUE` (`numero_de_serie`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `dron`;
CREATE TABLE `dron` (
  `id_dron` int NOT NULL AUTO_INCREMENT,
  `matricula` varchar(45) NOT NULL,
  `numero_de_serie` varchar(45) NOT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `estado` enum('En Servicio','En Mantenimiento','Fuera de Servicio') DEFAULT NULL,
  `fecha_mantenimiento` date DEFAULT NULL,
  `observaciones` varchar(200) DEFAULT NULL,
  `imagen` varchar(45) DEFAULT NULL,
  `id_modelo_dron` int NOT NULL,
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `piloto_id` int DEFAULT NULL,
  `horas_vuelo_acum` decimal(8,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_dron`),
  UNIQUE KEY `matricula_UNIQUE` (`matricula`),
  UNIQUE KEY `numero_de_serie_UNIQUE` (`numero_de_serie`),
  KEY `fk_piloto_asignado_idx` (`piloto_id`),
  KEY `fk_modelo_dron_idx` (`id_modelo_dron`),
  CONSTRAINT `fk_dron_modelo_dron` FOREIGN KEY (`id_modelo_dron`) REFERENCES `modelo_dron` (`id_modelo_dron`),
  CONSTRAINT `fk_dron_piloto` FOREIGN KEY (`piloto_id`) REFERENCES `piloto` (`id_pilotos`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `mantenimiento`;
CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int NOT NULL AUTO_INCREMENT,
  `dron_id` int NOT NULL,
  `fk_bateria_id` int NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('Preventivo','Correctivo','Actualizacion de Firmware','Calibracion') NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `costo` decimal(10,0) NOT NULL,
  `horas_de_vuelo` int NOT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `fk_dron_id_idx` (`dron_id`),
  KEY `fk_bateria_id_idx` (`fk_bateria_id`),
  CONSTRAINT `fk_mantenimiento_bateria` FOREIGN KEY (`fk_bateria_id`) REFERENCES `bateria` (`id_bateria`),
  CONSTRAINT `fk_mantenimiento_dron` FOREIGN KEY (`dron_id`) REFERENCES `dron` (`id_dron`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `modelo_dron`;
CREATE TABLE `modelo_dron` (
  `id_modelo_dron` int NOT NULL AUTO_INCREMENT,
  `modelo` varchar(45) NOT NULL,
  `fabricante` varchar(45) NOT NULL,
  PRIMARY KEY (`id_modelo_dron`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `piloto`;
CREATE TABLE `piloto` (
  `id_pilotos` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) NOT NULL,
  `dni` int unsigned NOT NULL,
  `certificacion` varchar(45) NOT NULL,
  `vencimiento_cma` date NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `contacto` int DEFAULT NULL,
  `rol` enum('Admin','Usuario') NOT NULL DEFAULT 'Usuario',
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `horas_vuelo_acum` decimal(8,2) NOT NULL DEFAULT '0.00',
  `imagen` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id_pilotos`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `previstos`;
CREATE TABLE `previstos` (
  `id_previstos` int NOT NULL AUTO_INCREMENT,
  `nombre_clave` varchar(150) NOT NULL,
  `descripcion` varchar(450) DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `previstoscol` enum('Planificado','En Curso','Finalizado','Pospuesto','Cancelado') NOT NULL,
  `solicitante` varchar(45) NOT NULL,
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id_previstos`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `vuelo`;
CREATE TABLE `vuelo` (
  `id_vuelo` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `coordenadas` varchar(100) NOT NULL,
  `tiempo_de_vuelo` time NOT NULL,
  `proposito` varchar(45) NOT NULL,
  `clima` enum('Despejado','Parcialmente Nublado','Nublado','Lluvia Ligera','Lluvia Fuerte','Viento Fuerte','Niebla') NOT NULL,
  `observaciones` text,
  `previsto_id` int DEFAULT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'Realizado',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id_vuelo`),
  KEY `fk_vuelo_previsto` (`previsto_id`),
  CONSTRAINT `fk_vuelo_previsto` FOREIGN KEY (`previsto_id`) REFERENCES `previstos` (`id_previstos`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `vuelo_baterias`;
CREATE TABLE `vuelo_baterias` (
  `vuelo_id` int NOT NULL,
  `bateria_id` int NOT NULL,
  KEY `fk_vuelo_idx` (`vuelo_id`),
  KEY `fk_bateria_idx` (`bateria_id`),
  CONSTRAINT `fk_vielo_baterias_bateria` FOREIGN KEY (`bateria_id`) REFERENCES `bateria` (`id_bateria`) ON DELETE CASCADE,
  CONSTRAINT `fk_vuelo_baterias_vuelo` FOREIGN KEY (`vuelo_id`) REFERENCES `vuelo` (`id_vuelo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `vuelo_drones`;
CREATE TABLE `vuelo_drones` (
  `vuelo_id` int NOT NULL,
  `dron_id` int NOT NULL,
  KEY `fk_vuelo_idx` (`vuelo_id`),
  KEY `fk_dron_idx` (`dron_id`),
  CONSTRAINT `fk_vuelo_drones_dron` FOREIGN KEY (`dron_id`) REFERENCES `dron` (`id_dron`) ON DELETE CASCADE,
  CONSTRAINT `fk_vuelo_drones_vuelo` FOREIGN KEY (`vuelo_id`) REFERENCES `vuelo` (`id_vuelo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `vuelo_pilotos`;
CREATE TABLE `vuelo_pilotos` (
  `piloto_id` int NOT NULL,
  `vuelo_id` int NOT NULL,
  KEY `id_vuelo_idx` (`piloto_id`),
  KEY `id_vuelo_idx1` (`vuelo_id`),
  CONSTRAINT `fk_vuelo_pilotos_piloto` FOREIGN KEY (`piloto_id`) REFERENCES `piloto` (`id_pilotos`) ON DELETE CASCADE,
  CONSTRAINT `fk_vuelo_pilotos_vuelo` FOREIGN KEY (`vuelo_id`) REFERENCES `vuelo` (`id_vuelo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
