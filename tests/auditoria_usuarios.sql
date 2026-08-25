-- auditoria_usuarios.sql — Regresion R1/R8: sincronizacion usuarios.nivel <-> cargo.
-- Complemento de tests/auditor_usuarios_nivel.py (misma semantica, en SQL puro).
--
-- Q-CANONICA: desincronizados con vinculo vigente (unico alcance corregible M007).
-- ESPERADO POST-M007: 0 filas. HOY (pre-M007): 25 filas.
SELECT u.id AS usuario_id, u.documento, u.estado,
       u.nivel   AS nivel_usuario_actual,
       cm.nivel  AS nivel_esperado_cargo,
       cm.id AS cargo_id, cm.codigo, cm.grado
FROM usuarios u
JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id AND cm.eliminado_en IS NULL
WHERE u.eliminado_en IS NULL AND NOT(u.nivel<=>cm.nivel)
ORDER BY cm.codigo, u.id;

-- Q-B: poblacion SIN vinculo vigente (FUERA de alcance automatico; visible aqui).
-- Ningun UPDATE de M007 debe tocarla: su nivel esperado no es derivable.
SELECT u.id, u.estado, u.nivel, u.codigo_empleo
FROM usuarios u
LEFT JOIN usuario_cargo_manual ucm ON ucm.usuario_id=u.id AND ucm.vigente=1
WHERE u.eliminado_en IS NULL AND ucm.id IS NULL
ORDER BY u.nivel IS NULL DESC, u.id;

-- Q-INTEGRIDAD: vinculos rotos o duplicados (siempre esperado 0 filas).
SELECT 'vinculo_a_cargo_muerto' AS problema, ucm.id AS evidencia
FROM usuario_cargo_manual ucm
LEFT JOIN cargos_manual cm ON cm.id=ucm.cargo_manual_id AND cm.eliminado_en IS NULL
WHERE ucm.vigente=1 AND cm.id IS NULL
UNION ALL
SELECT 'usuario_con_mas_de_un_vinculo_vigente', usuario_id
FROM usuario_cargo_manual WHERE vigente=1
GROUP BY usuario_id HAVING COUNT(*)>1;
