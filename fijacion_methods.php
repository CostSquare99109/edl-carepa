
	public function puedeFijarUnilateral(int $concertacionId): array
	{
		$concertacion = $this->concertacionRepo->buscarPorId($concertacionId);
		if (!$concertacion) {
			ResponseHelper::notFound('Concertacion no encontrada');
		}

		if ($concertacion['estado'] === 'concertada') {
			return ['puede' => false, 'motivo' => 'La concertacion ya fue aprobada bilateralmente'];
		}

		if ($concertacion['estado'] === 'fijada') {
			return ['puede' => false, 'motivo' => 'Los compromisos ya fueron fijados unilateralmente'];
		}

		// Obtener fecha de inicio de la etapa de concertación del período
		$periodo = $this->concertacionRepo->getPeriodo($concertacion['periodo_id']);
		$fechaInicioConcertacion = $periodo['fecha_inicio_concertacion'] ?? $periodo['fecha_inicio'];

		if (!$fechaInicioConcertacion) {
			return ['puede' => false, 'motivo' => 'No hay fecha de inicio de concertación definida para el período'];
		}

		$inicio = new DateTime($fechaInicioConcertacion);
		$hoy = new DateTime();

		// Calcular días hábiles transcurridos
		$diasHabiles = 0;
		$fechaActual = clone $inicio;
		while ($fechaActual <= $hoy) {
			$diaSemana = (int) $fechaActual->format('N'); // 1=Lunes, 7=Domingo
			if ($diaSemana >= 1 && $diaSemana <= 5) {
				$diasHabiles++;
			}
			$fechaActual->modify('+1 day');
		}

		$puede = $diasHabiles >= 15;

		return [
			'puede' => $puede,
			'dias_habiles_transcurridos' => $diasHabiles,
			'fecha_inicio_concertacion' => $fechaInicioConcertacion,
			'motivo' => $puede ? 'Han transcurrido 15 o más días hábiles desde el inicio de la concertación' : "Faltan " . (15 - $diasHabiles) . " días hábiles para poder fijar unilateralmente",
		];
	}

	/**
	 * Ejecuta la fijación unilateral automática (después de 15 días hábiles)
	 * Cambia el estado a 'fijada' y notifica al evaluado
	 */
	public function fijarUnilateral(int $concertacionId): void
	{
		$check = $this->puedeFijarUnilateral($concertacionId);
		if (!$check['puede']) {
			ResponseHelper::error('No se puede fijar unilateralmente: ' . $check['motivo'], 422);
		}

		$concertacion = $this->concertacionRepo->buscarPorId($concertacionId);

		// Verificar que el usuario es el evaluador
		$user = AuthMiddleware::user();
		if ((int) $concertacion['evaluador_id'] !== (int) $user['id']) {
			ResponseHelper::forbidden('Solo el evaluador puede fijar compromisos unilateralmente');
		}

		// Cambiar tipo de concertación a fijada por evaluador
		$this->concertacionRepo->actualizar($concertacionId, [
			'estado' => 'fijada',
			'tipo_concertacion' => 'fijados_evaluador',
			'fecha_concertacion' => date('Y-m-d H:i:s'),
		]);

		// Cambiar estado de compromisos a aprobados (fijados por evaluador)
		$compromisos = $this->concertacionRepo->compromisosPorConcertacion($concertacionId);
		foreach ($compromisos as $c) {
			if ($c['estado'] !== 'aprobado' && $c['estado'] !== 'cumplido' && $c['estado'] !== 'incumplido') {
				$this->compromisoRepo->actualizar($c['id'], [
					'estado' => 'aprobado',
					'propuesto_por_jefe_entidad' => 1,
				]);
			}
		}

		// Notificar al evaluado
		$this->notificarEvaluadoFijacionUnilateral($concertacion);

		AuditoriaService::registrar('fijar_unilateral', 'concertaciones', $concertacionId);
	}

	private function notificarEvaluadoFijacionUnilateral(array $concertacion): void
	{
		$pdo = Database::getInstance();
		$stmt = $pdo->prepare(
			"INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, evaluacion_id, creado_en)
			VALUES (?, 'alerta', 'Concertación fijada unilateralmente', ?, ?, NOW())"
		);
		// Buscar la evaluación asociada
		$stmtEval = $pdo->prepare("SELECT id FROM evaluaciones WHERE concertacion_id = ? AND eliminado_en IS NULL LIMIT 1");
		$stmtEval->execute([$concertacion['id']]);
		$eval = $stmtEval->fetch(PDO::FETCH_ASSOC);

		$mensaje = 'El evaluador ha fijado unilateralmente los compromisos de su evaluación conforme al Art. 33 de la Resolución 1760 de 2010, tras transcurrir 15 días hábiles sin acuerdo en la concertación bilateral.';

		$stmt->execute([
			$concertacion['evaluado_id'],
			$mensaje,
			$eval['id'] ?? null
		]);
	}
}