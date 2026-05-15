<?php

namespace App\Service;

use App\Repository\CargaMasivaRepository;
use App\Helper\ResponseHelper;
use App\Helper\ValidatorHelper;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class CargaMasivaService
{
    private CargaMasivaRepository $repo;

    public function __construct()
    {
        $this->repo = new CargaMasivaRepository();
    }

    public function historial(int $pagina, int $porPagina): array
    {
        $user = AuthMiddleware::user();
        return $this->repo->listarPorUsuario($user['id'], $pagina, $porPagina);
    }

    public function procesar(string $tipo, array $archivo): int
    {
        $maxMB = (int) Env::get('UPLOAD_TAMANO_MAXIMO_MB', 10);
        $exts = ['xls', 'xlsx', 'csv'];

        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            ResponseHelper::error('Error al subir archivo', 400);
        }
        if ($archivo['size'] > $maxMB * 1024 * 1024) {
            ResponseHelper::error("Archivo excede {$maxMB}MB", 400);
        }

        $ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $exts)) {
            ResponseHelper::error('Extension no permitida para carga masiva: ' . $ext, 400);
        }

        $user = AuthMiddleware::user();
        $nombreSeguro = bin2hex(random_bytes(16)) . '.' . $ext;
        $ruta = EDL_ROOT . '/storage/cargas/' . $nombreSeguro;

        if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
            ResponseHelper::error('Error al guardar archivo', 500);
        }

        $cargaId = $this->repo->registrarCarga($user['id'], $tipo, $archivo['name'], $nombreSeguro);
        AuditoriaService::registrar('carga_masiva', 'cargas_masivas', $cargaId, null, ['tipo' => $tipo, 'archivo' => $archivo['name']]);

        return $cargaId;
    }

    public function usuarios(array $archivo): int
    {
        return $this->procesar('usuarios', $archivo);
    }

    public function concertaciones(array $archivo): int
    {
        return $this->procesar('concertaciones', $archivo);
    }

    public function evaluaciones(array $archivo): int
    {
        return $this->procesar('evaluaciones', $archivo);
    }

    public function cursos(array $archivo): int
    {
        return $this->procesar('cursos_induccion', $archivo);
    }
}
