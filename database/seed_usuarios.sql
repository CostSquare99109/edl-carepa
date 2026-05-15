-- Seed: entidad, dependencias, periodo, usuarios, roles, evaluaciones
-- Ejecutar: sudo mysql edl_cnsc < seed_usuarios.sql

USE edl_cnsc;

-- 1. Entidad
INSERT INTO entidades (id, codigo, nombre, tipo, nit, estado) VALUES
(1, 'CNSC', 'Comision Nacional del Servicio Civil', 'entidad', '8901030181', 'activa')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 2. Dependencias
INSERT INTO dependencias (id, entidad_id, codigo, nombre, estado) VALUES
(1, 1, 'DED-001', 'Direccion de Evaluacion del Desempeno', 'activa'),
(2, 1, 'OCI-002', 'Oficina de Control Interno', 'activa'),
(3, 1, 'STH-003', 'Subdireccion de Talento Humano', 'activa')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 3. Periodo activo
INSERT INTO periodos (id, nombre, fecha_inicio, fecha_fin, estado) VALUES
(1, 'Periodo de Evaluacion 2026-I', '2026-01-01', '2026-06-30', 'en_evaluacion')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 4. Usuarios ficticios
-- NOTA: Los password_hash se generan con PHP password_hash()
-- Claves: Evaluadores='Eval2026!', Jefes='Jefe2026!', Funcionarios='Func2026!'
-- Se deben regenerar los hashes antes de ejecutar en produccion

INSERT INTO usuarios (id, documento, tipo_documento, nombres, apellidos, email, telefono, password_hash, estado, intentos_fallidos, entidad_id, dependencia_id, cargo, grado, tipo_vinculacion, fecha_vinculacion) VALUES
-- Evaluadores
(2, '52987634', 'CC', 'Maria', 'Rodriguez Perez', 'maria.rodriguez@cnsc.gov.co', '3101234567', '$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a', 'activo', 0, 1, 1, 'Evaluador Senior', '20', 'planta', '2018-03-15'),
(3, '71428536', 'CC', 'Carlos', 'Martinez Lopez', 'carlos.martinez@cnsc.gov.co', '3102345678', '$2y$12$bKQTlKgEnfSlrd6fV3d2Xu8QzN5nKH7mYJ0wR4ePvT1bHcDgFsW2a', 'activo', 0, 1, 2, 'Evaluador Tecnico', '18', 'planta', '2019-06-01'),
-- Jefes
(4, '39847261', 'CC', 'Andrea', 'Sanchez Vega', 'andrea.sanchez@cnsc.gov.co', '3103456789', '$2y$12$ILdWQNEP11kab3cF7gH5Oi9R2m8pJQ4nLK1vS6fWtT2cIdEhGvX3b', 'activo', 0, 1, 1, 'Jefe de Entidad', '24', 'planta', '2015-01-10'),
(5, '60182934', 'CC', 'Luis', 'Hernandez Torres', 'luis.hernandez@cnsc.gov.co', '3104567890', '$2y$12$ILdWQNEP11kab3cF7gH5Oi9R2m8pJQ4nLK1vS6fWtT2cIdEhGvX3b', 'activo', 0, 1, 3, 'Jefe de Dependencia', '22', 'planta', '2016-08-20'),
-- Funcionarios
(6, '1045678923', 'CC', 'Juan', 'Gomez Ramirez', 'juan.gomez@cnsc.gov.co', '3115678901', '$2y$12$f64gaRUQg/Yzo5mN4e3fXu7Pp2kLJ8nIM3wS5gR4tT6bHcDfFsW2c', 'activo', 0, 1, 1, 'Profesional Universitario', '14', 'planta', '2020-02-01'),
(7, '1056789034', 'CC', 'Patricia', 'Diaz Morales', 'patricia.diaz@cnsc.gov.co', '3116789012', '$2y$12$f64gaRUQg/Yzo5mN4e3fXu7Pp2kLJ8nIM3wS5gR4tT6bHcDfFsW2c', 'activo', 0, 1, 1, 'Tecnico Operativo', '11', 'contrato', '2022-05-15'),
(8, '1067890123', 'CC', 'Fernando', 'Torres Nino', 'fernando.torres@cnsc.gov.co', '3117890123', '$2y$12$f64gaRUQg/Yzo5mN4e3fXu7Pp2kLJ8nIM3wS5gR4tT6bHcDfFsW2c', 'activo', 0, 1, 2, 'Profesional Especializado', '17', 'planta', '2017-11-01'),
(9, '1078901234', 'CC', 'Lucia', 'Castro Rojas', 'lucia.castro@cnsc.gov.co', '3118901234', '$2y$12$f64gaRUQg/Yzo5mN4e3fXu7Pp2kLJ8nIM3wS5gR4tT6bHcDfFsW2c', 'activo', 0, 1, 3, 'Auxiliar Administrativo', '08', 'contrato', '2023-01-10'),
(10, '1089012345', 'CC', 'Roberto', 'Munoz Silva', 'roberto.munoz@cnsc.gov.co', '3119012345', '$2y$12$f64gaRUQg/Yzo5mN4e3fXu7Pp2kLJ8nIM3wS5gR4tT6bHcDfFsW2c', 'activo', 0, 1, 3, 'Profesional Universitario', '15', 'planta', '2021-07-01')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 5. Roles
INSERT IGNORE INTO usuario_rol (usuario_id, rol_id) VALUES
(2, 2), (3, 2), (4, 4), (4, 2), (5, 5), (5, 2),
(6, 3), (7, 3), (8, 3), (9, 3), (10, 3);

-- 6. Evaluaciones
INSERT INTO evaluaciones (id, periodo_id, evaluado_id, evaluador_id, tipo, estado) VALUES
(1, 1, 6, 2, 'heteroevaluacion', 'en_proceso'),
(2, 1, 7, 2, 'heteroevaluacion', 'en_proceso'),
(3, 1, 8, 3, 'heteroevaluacion', 'en_proceso'),
(4, 1, 9, 5, 'heteroevaluacion', 'en_proceso'),
(5, 1, 10, 5, 'heteroevaluacion', 'en_proceso')
ON DUPLICATE KEY UPDATE estado=VALUES(estado);
