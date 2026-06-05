<?php

namespace App\Model;

class Concertacion
{
 public ?int $id = null;
 public ?int $periodo_id = null;
 public ?int $evaluador_id = null;
 public ?int $evaluado_id = null;
 public ?string $tipo_concertacion = null;
 public int $conformar_comision_evaluadora = 0;
 public ?int $comision_evaluador_id = null;
 public int $evaluador_no_jefe = 0;
 public ?string $motivo_no_jefe = null;
 public string $estado = 'pendiente';
 public ?string $observaciones = null;
 public ?string $fecha_concertacion = null;
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
