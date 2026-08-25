-- M004 — FASE C: P1-1 (13 competencias faltantes) + P1-2 (conductas literales de las 4 comunes)
--         + P1-3 (matriz nivel jerárquico -> competencias comportamentales)
-- Fuente EXCLUSIVA: Manuales Marzo 2025 (tabla de comunes §2 y conjuntos por nivel §3 del manual Global).
-- REGLAS RESPETADAS: no se definen competencias funcionales; no se equipara Pensamiento estratégico con
-- Pensamiento Sistémico; no se propaga el set técnico a otros niveles; sin conductas inventadas
-- (las 12 comportamentales nuevas van SIN conductas porque el manual no las transcribe).

-- ===== P1-1: competencias faltantes =====
-- Transparencia (común formal del manual, con definición literal):
INSERT INTO competencias (codigo, nombre, descripcion, decreto) VALUES
 ('TRANSP','Transparencia','Hacer uso claro y responsable de los recursos públicos, eliminando cualquier discrecionalidad indebida en su utilización y garantizar el acceso a la información gubernamental','815');
-- Comportamentales por nivel (solo nombre; el manual no transcribe definiciones ni conductas):
INSERT INTO competencias (codigo, nombre, descripcion, decreto) VALUES
 ('VIS_EST','Visión estratégica',NULL,'2539'),
 ('GEST_DES_PER','Gestión del desarrollo de las personas',NULL,'2539'),
 ('PEN_SIS','Pensamiento Sistémico',NULL,'2539'),
 ('RES_CON','Resolución de conflictos',NULL,'2539'),
 ('GEST_PRO','Gestión de procedimientos',NULL,'2539'),
 ('INS_DEC','Instrumentación de decisiones',NULL,'2539'),
 ('CONFI','Confiabilidad',NULL,'2539'),
 ('DISC','Disciplina',NULL,'2539'),
 ('RESP','Responsabilidad',NULL,'2539'),
 ('MAN_INF','Manejo de la información',NULL,'2539'),
 ('REL_INT','Relaciones interpersonales',NULL,'2539'),
 ('COLAB','Colaboración',NULL,'2539');

-- ===== P1-2: conductas literales del manual para las 4 comunes (versionado: se desactivan las genéricas, no se borran) =====
UPDATE conductas SET activo=0 WHERE competencia_codigo IN ('ORI_RES','ORI_USU','CMP_ORG') AND activo=1;

INSERT INTO conductas (competencia_codigo, texto, orden, activo) VALUES
('ORI_RES','Cumple con oportunidad en función de estándares, objetivos y metas establecidas por la entidad, las funciones que le son asignadas.',1,1),
('ORI_RES','Asume la responsabilidad por su resultado.',2,1),
('ORI_RES','Compromete recursos y tiempos para mejorar la productividad, tomando las medidas necesarias para minimizar los riesgos.',3,1),
('ORI_RES','Realiza todas las acciones necesarias para alcanzar los objetivos propuestos enfrentando los obstáculos que se presentan.',4,1),
('ORI_USU','Atiende y valora las necesidades de los usuarios y de ciudadanos en general.',1,1),
('ORI_USU','Considera las necesidades de los usuarios al diseñar proyectos o servicios.',2,1),
('ORI_USU','Da respuesta oportuna a las necesidades de los usuarios de conformidad con el servicio que ofrece la entidad.',3,1),
('ORI_USU','Establece diferentes canales de comunicación con el usuario para conocer sus necesidades y propuestas y responde a las mismas.',4,1),
('ORI_USU','Reconoce la interdependencia de su trabajo y el de los otros.',5,1),
('TRANSP','Proporciona información veraz, objetiva y basada en hechos.',1,1),
('TRANSP','Facilita el acceso a la información relacionada con sus responsabilidades y con el servicio a cargo con la entidad en que labora.',2,1),
('TRANSP','Demuestra imparcialidad en sus decisiones.',3,1),
('TRANSP','Ejecuta sus funciones con base en las normas y criterios aplicables.',4,1),
('TRANSP','Utiliza los recursos de la entidad para el desarrollo de las labores y la prestación del servicio.',5,1),
('CMP_ORG','Promueve las metas de la organización y respeta sus normas.',1,1),
('CMP_ORG','Antepone las necesidades de la organización a sus propias necesidades.',2,1),
('CMP_ORG','Apoya a la organización en situaciones difíciles.',3,1),
('CMP_ORG','Demuestra sentido de pertenencia en todas sus actuaciones.',4,1);

-- ===== P1-3: matriz nivel -> comportamentales (manual Global §3.1-3.5) =====
-- nombre_json conserva el nombre LITERAL del manual cuando difiere del catálogo BD (variante documentada).
INSERT INTO competencias_por_nivel (nivel_codigo, competencia_codigo, nombre_json, orden) VALUES
('directivo','VIS_EST','Visión estratégica',1),
('directivo','LIDER','Liderazgo efectivo',2),
('directivo','PLANE','Planeación',3),
('directivo','TOM_DEC','Toma de decisiones',4),
('directivo','GEST_DES_PER','Gestión del desarrollo de las personas',5),
('directivo','PEN_SIS','Pensamiento Sistémico',6),
('directivo','RES_CON','Resolución de conflictos',7),
('asesor','VIS_EST','Visión estratégica',1),
('asesor','LIDER','Liderazgo efectivo',2),
('asesor','PLANE','Planeación',3),
('asesor','TOM_DEC','Toma de decisiones',4),
('asesor','GEST_DES_PER','Gestión del desarrollo de las personas',5),
('asesor','PEN_SIS','Pensamiento Sistémico',6),
('asesor','RES_CON','Resolución de conflictos',7),
('profesional','APR_TEC','Aporte técnico-profesional',1),
('profesional','COM_EFEC','Comunicación efectiva',2),
('profesional','GEST_PRO','Gestión de procedimientos',3),
('profesional','INS_DEC','Instrumentación de decisiones',4),
('tecnico','CONFI','Confiabilidad',1),
('tecnico','DISC','Disciplina',2),
('tecnico','RESP','Responsabilidad',3),
('asistencial','MAN_INF','Manejo de la información',1),
('asistencial','REL_INT','Relaciones interpersonales',2),
('asistencial','COLAB','Colaboración',3);

-- Verificación: SELECT nivel_codigo, COUNT(*) FROM competencias_por_nivel GROUP BY nivel_codigo;
-- Esperado: directivo=7, asesor=7, profesional=4, tecnico=3, asistencial=3
