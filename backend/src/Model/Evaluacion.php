<?php

namespace App\Model;

class Evaluacion
{
 public ?int $id = null;
 public ?int $periodo_id = null;
 public ?int $evaluado_id = null;
 public ?int $evaluador_id = null;
 public ?int $concertacion_id = null;
 public ?string $tipo = null;
 public ?string $motivo_parcial_eventual = null;
 public ?string $motivo_extraordinaria = null;
 public int $evaluador_no_jefe = 0;
 public ?string $motivo_no_jefe = null;
 public ?string $fecha_inicio = null;
 public ?string $fecha_fin = null;
 public ?float $nota_funcionales = null;
 public ?float $nota_comportamentales = null;
 public ?float $calificacion_definitiva = null;
 public ?string $nivel_resultado = null;
 public string $estado = 'pendiente';
 public int $es_comision_evaluadora = 0;
 public ?int $comision_evaluadora_id = null;
 public ?string $fecha_evaluacion = null;
 public ?string $fecha_calificacion = null;
 public ?string $observaciones = null;
 public ?string $creado_en = null;
 public ?string $actualizado_en = null;
 public ?string $eliminado_en = null;

 public static function fromArray(array $data): self
 {
 $obj = new self();
 foreach ($data as $key => $value) {
 if (property_exists($obj, $key)) {
 $obj->$key = $value;
 }
 }
 return $obj;
 }

 public function toArray(): array
 {
 return get_object_vars($this);
 }
}
