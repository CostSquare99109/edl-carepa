-- Migration: Agregar campo debe_cambiar_password a tabla usuarios
ALTER TABLE `usuarios` ADD COLUMN `debe_cambiar_password` tinyint(1) NOT NULL DEFAULT 0 AFTER `evaluacion_inicio_febrero`;
