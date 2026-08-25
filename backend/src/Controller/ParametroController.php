<?php
declare(strict_types=1);

namespace App\Controller;

use App\Config\Database;
use App\Helper\ResponseHelper;
use App\Helper\SanitizerHelper;
use App\Service\AuditoriaService;
use App\Middleware\AuthMiddleware;

class ParametroController
{
    /** Claves que nunca deben exponerse por API (se gestionan solo en .env/servidor) */
    private const CLAVES_SENSIBLES = ['jwt_secret', 'jwt_refresh_secret', 'mail_password', 'db_password', 'app_key'];

    private static function esSensible(string $clave): bool
    {
        foreach (self::CLAVES_SENSIBLES as $s) {
            if (strcasecmp(trim($clave), $s) === 0) {
                return true;
            }
        }
        return (bool) preg_match('/(secret|password|passwd|token|api_key)/i', $clave);
    }

    /** Listar todos los parámetros agrupados por categoría */
    public function listar(): void
    {
        $db = Database::getInstance();
        $stmt = $db->query("SELECT id, clave, valor, tipo, descripcion, creado_en, actualizado_en FROM parametros ORDER BY clave");
        $params = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $params = array_values(array_filter($params, fn (array $p): bool => !self::esSensible((string) $p['clave'])));
        ResponseHelper::success($params);
    }

    /** Obtener un parámetro por clave */
    public function verPorClave(string $clave): void
    {
        if (self::esSensible($clave)) {
            ResponseHelper::forbidden('Parámetro protegido: no es consultable por API');
        }
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT id, clave, valor, tipo, descripcion FROM parametros WHERE clave = ?");
        $stmt->execute([$clave]);
        $param = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$param) {
            ResponseHelper::notFound('Parámetro no encontrado');
        }
        ResponseHelper::success($param);
    }

    /** Crear o actualizar un parámetro (upsert) */
    public function upsert(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $input = SanitizerHelper::sanitizeArray($input);

        if (empty($input['clave']) || !array_key_exists('valor', $input)) {
            ResponseHelper::error('clave y valor son requeridos', 422);
        }
        if (self::esSensible((string) $input['clave'])) {
            ResponseHelper::forbidden('Clave protegida: gestionar solo via .env/servidor');
        }

        $db = Database::getInstance();
        $tipo = $input['tipo'] ?? 'texto';
        $descripcion = $input['descripcion'] ?? null;

        // Verificar si ya existe
        $stmt = $db->prepare("SELECT id FROM parametros WHERE clave = ?");
        $stmt->execute([$input['clave']]);
        $existente = $stmt->fetch();

        if ($existente) {
            $stmt = $db->prepare("UPDATE parametros SET valor = ?, tipo = ?, descripcion = ? WHERE clave = ?");
            $stmt->execute([$input['valor'], $tipo, $descripcion, $input['clave']]);
            AuditoriaService::registrar('actualizar', 'parametros', (int)$existente['id'], null, $input);
            ResponseHelper::success(null, 'Parámetro actualizado');
        } else {
            $stmt = $db->prepare("INSERT INTO parametros (clave, valor, tipo, descripcion) VALUES (?, ?, ?, ?)");
            $stmt->execute([$input['clave'], $input['valor'], $tipo, $descripcion]);
            $id = (int) $db->lastInsertId();
            AuditoriaService::registrar('crear', 'parametros', $id, null, $input);
            ResponseHelper::success(['id' => $id], 'Parámetro creado', 201);
        }
    }

    /** Actualizar múltiples parámetros a la vez */
    public function actualizarMasivo(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        if (empty($input['parametros']) || !is_array($input['parametros'])) {
            ResponseHelper::error('parametros es requerido y debe ser un array', 422);
        }

        $db = Database::getInstance();
        $db->beginTransaction();
        try {
            $stmt = $db->prepare("INSERT INTO parametros (clave, valor, tipo, descripcion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor), tipo = VALUES(tipo), descripcion = VALUES(descripcion)");
            foreach ($input['parametros'] as $p) {
                if (!empty($p['clave']) && array_key_exists('valor', $p)) {
                    if (self::esSensible((string) $p['clave'])) {
                        continue;
                    }
                    $stmt->execute([
                        $p['clave'],
                        $p['valor'],
                        $p['tipo'] ?? 'texto',
                        $p['descripcion'] ?? null,
                    ]);
                }
            }
            $db->commit();
            AuditoriaService::registrar('actualizar_masivo', 'parametros', 0, null, ['count' => count($input['parametros'])]);
            ResponseHelper::success(null, count($input['parametros']) . ' parámetros actualizados');
        } catch (\Throwable $e) {
            $db->rollBack();
            ResponseHelper::error('Error al actualizar parámetros: ' . $e->getMessage(), 500);
        }
    }

    /** Eliminar un parámetro */
    public function eliminar(int $id): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT clave FROM parametros WHERE id = ?");
        $stmt->execute([$id]);
        $param = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$param) {
            ResponseHelper::notFound('Parámetro no encontrado');
        }
        $db->prepare("DELETE FROM parametros WHERE id = ?")->execute([$id]);
        AuditoriaService::registrar('eliminar', 'parametros', $id, $param, null);
        ResponseHelper::success(null, 'Parámetro eliminado');
    }
}
