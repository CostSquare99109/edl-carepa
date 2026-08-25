-- M002 — P3-1 (seguridad): eliminar parametro muerto 'jwt_secret' expuesto por API
-- Evidencia: JwtHelper.php:16 usa Env::require('JWT_SECRET') (backend/.env, gitignored, 52 chars reales).
-- La fila 'parametros.jwt_secret' NO es usada por ningun codigo (grep verificado) y era devuelta
-- por GET /parametros. Valor previo era el placeholder 'cambiar_esto_por_un_secret_seguro...'.
-- Reversible: INSERT INTO parametros (clave, valor, tipo) VALUES ('jwt_secret','cambiar_esto_por_un_secret_seguro','texto');
DELETE FROM parametros WHERE clave = 'jwt_secret' AND valor LIKE 'cambiar_esto%';
