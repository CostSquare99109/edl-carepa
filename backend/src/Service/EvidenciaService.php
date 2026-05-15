<?php

namespace App\Service;

use App\Repository\EvidenciaRepository;
use App\Helper\ResponseHelper;
use App\Helper\ValidatorHelper;
use App\Config\Env;
use App\Middleware\AuthMiddleware;

class EvidenciaService
{
    private EvidenciaRepository $repo;

    public function __construct()
    {
        $this->repo = new EvidenciaRepository();
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        return $this->repo->listarConRelaciones($filtros, $pagina, $porPagina);
    }

    public function subir(array $datos, array $archivo): int
    {
        $maxMB = (int) Env::get('UPLOAD_TAMANO_MAXIMO_MB', 10);
        $exts = explode(',', Env::get('UPLOAD_EXTENSIONES_PERMITIDAS', 'pdf,doc,docx,xls,xlsx,jpg,png'));

        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            ResponseHelper::error('Error al subir archivo', 400);
        }

        if ($archivo['size'] > $maxMB * 1024 * 1024) {
            ResponseHelper::error("Archivo excede {$maxMB}MB", 400);
        }

        $ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $exts)) {
            ResponseHelper::error('Extension no permitida: ' . $ext, 400);
        }

        $user = AuthMiddleware::user();
        $nombreSeguro = bin2hex(random_bytes(16)) . '.' . $ext;
        $ruta = EDL_ROOT . '/storage/evidencias/' . $nombreSeguro;

        if (!move_uploaded_file($archivo['tmp_name'], $ruta)) {
            ResponseHelper::error('Error al guardar archivo', 500);
        }

        $datos['subido_por'] = $user['id'];
        $datos['nombre_archivo'] = $archivo['name'];
        $datos['ruta_archivo'] = $nombreSeguro;
        $datos['tipo_mime'] = $archivo['type'];
        $datos['tamano_bytes'] = $archivo['size'];
        $datos['estado'] = 'pendiente';

        $id = $this->repo->crear($datos);
        AuditoriaService::registrar('subir', 'evidencias', $id, null, ['nombre' => $archivo['name']]);
        return $id;
    }

    public function verificar(int $id, string $estado): void
    {
        $evidencia = $this->repo->buscarPorId($id);
        if (!$evidencia) {
            ResponseHelper::error('Evidencia no encontrada', 404);
        }
        if (!in_array($estado, ['verificada', 'rechazada'])) {
            ResponseHelper::error('Estado invalido', 400);
        }
        $this->repo->actualizar($id, ['estado' => $estado]);
        AuditoriaService::registrar('verificar', 'evidencias', $id, $evidencia, ['estado' => $estado]);
    }
}
