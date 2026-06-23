	/** Listar compromisos de una evaluación (para el evaluador) con conductas predefinidas */
	public function listarPorEvaluacion(int $evaluacionId): void
	{
		$compromisos = $this->service->compromisosConConductas($evaluacionId);

		$funcionales = [];
		$comportamentales = [];
		foreach ($compromisos as $c) {
			if ($c['tipo'] === 'funcional') {
				$funcionales[] = $c;
			} else {
				$comportamentales[] = $c;
			}
		}

		$sumaPesos = 0;
		foreach ($funcionales as $f) {
			$sumaPesos += (float) $f['peso'];
		}

		ResponseHelper::success([
			'funcionales' => $funcionales,
			'comportamentales' => $comportamentales,
			'suma_pesos_funcionales' => $sumaPesos,
		]);
	}