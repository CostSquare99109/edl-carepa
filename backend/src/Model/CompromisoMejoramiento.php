<?php

namespace App\Model;

class CompromisoMejoramiento
{
 public ?int $id = null;
 public ?int $concertacion_id = null;
 public ?int $compromiso_id = null;
 public ?int $registrado_por = null;
 public ?string $motivo = null;
 public ?string $aspecto_corregir = null;
 public ?string $acciones_mejoramiento = null;
 public ?string $observacion = null;
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
