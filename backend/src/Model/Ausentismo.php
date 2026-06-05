<?php

namespace App\Model;

class Ausentismo
{
 public ?int $id = null;
 public ?int $funcionario_id = null;
 public ?string $motivo = null;
 public ?string $fecha_inicio = null;
 public ?string $fecha_fin = null;
 public ?int $dias = null;
 public ?string $observaciones = null;
 public string $estado = 'vigente';
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
