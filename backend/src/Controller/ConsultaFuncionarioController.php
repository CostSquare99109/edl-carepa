<?php
declare(strict_types=1);

namespace App\Controller;

use App\Config\Database;
use App\Helper\ResponseHelper;

class ConsultaFuncionarioController
{
 public function consultar(string $documento): void
 {
 $pdo = Database::getInstance();

 $stmt = $pdo->prepare("
 SELECT u.id, u.documento, u.tipo_documento,
 u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
 CONCAT(u.primer_nombre, ' ', IFNULL(u.segundo_nombre, ''), ' ', u.primer_apellido, ' ', IFNULL(u.segundo_apellido, '')) AS nombres,
 u.primer_apellido AS apellidos
 FROM usuarios u
 WHERE u.documento = ? AND u.eliminado_en IS NULL
 ");
 $stmt->execute([$documento]);
 $funcionario = $stmt->fetch();

 if (!$funcionario) {
 ResponseHelper::error('Funcionario no encontrado', 404);
 }

 $stmtEval = $pdo->prepare("
 SELECT ev.estado, ev.nivel_resultado
 FROM evaluaciones ev
 WHERE ev.evaluado_id = ? AND ev.eliminado_en IS NULL
 ORDER BY ev.creado_en DESC
 LIMIT 1
 ");
 $stmtEval->execute([$funcionario['id']]);
 $evaluacion = $stmtEval->fetch();

 if (!$evaluacion) {
 $stmtConc = $pdo->prepare("
 SELECT c.estado
 FROM concertaciones c
 WHERE c.evaluado_id = ? AND c.eliminado_en IS NULL
 ORDER BY c.creado_en DESC
 LIMIT 1
 ");
 $stmtConc->execute([$funcionario['id']]);
 $concertacion = $stmtConc->fetch();
 }

 $resultado = [
 'nombres' => trim(preg_replace('/\s+/', ' ', $funcionario['nombres'])),
 'apellidos' => $funcionario['apellidos'],
 'documento' => $funcionario['documento'],
 'tipo_documento' => $funcionario['tipo_documento'],
 'estado_evaluacion' => $evaluacion['estado'] ?? ($concertacion['estado'] ?? null),
 'nivel_calificacion' => $evaluacion['nivel_resultado'] ?? null,
 ];

 ResponseHelper::success($resultado);
 }
}
