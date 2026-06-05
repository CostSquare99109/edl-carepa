<?php

namespace App\Model;

class Compromiso
{
 public ?int $id = null;
 public ?int $concertacion_id = null;
 public ?string $tipo = null;
 public ?int $meta_id = null;
 public ?string $descripcion = null;
 public ?float $peso = null;
 public ?string $competencia_codigo = null;
 public int $propuesto_por_jefe_entidad = 0;
 public string $estado = 'propuesto';
 public ?float $calificacion = null;
 public ?string $frecuencia = null;
 public ?string $nivel_comportamental = null;
 public ?float $puntaje_comportamental = null;
 public ?string $impacto_aporta_compromisos = null;
 public ?string $impacto_excede_estipulado = null;
 public ?string $justificacion_excede = null;
 public ?string $observaciones_evaluador = null;
 public ?string $observaciones_evaluado = null;
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
