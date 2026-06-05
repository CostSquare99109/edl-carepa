<?php

namespace App\Model;

class Usuario
{
 public ?int $id = null;
 public ?string $documento = null;
 public ?string $tipo_documento = null;
 public ?string $genero = null;
 public ?string $primer_nombre = null;
 public ?string $segundo_nombre = null;
 public ?string $primer_apellido = null;
 public ?string $segundo_apellido = null;
 public ?string $email = null;
 public int $email_confirmado = 0;
 public ?string $telefono1 = null;
 public ?string $telefono2 = null;
 public ?string $password_hash = null;
 public string $estado = 'activo';
 public int $intentos_fallidos = 0;
 public ?string $ultimo_acceso = null;
 public ?int $entidad_id = null;
 public ?int $dependencia_id = null;
 public int $es_contratista = 0;
 public ?string $nivel = null;
 public ?string $naturaleza = null;
 public ?string $tipo_nombramiento = null;
 public ?string $denominacion_empleo = null;
 public ?string $codigo_empleo = null;
 public ?string $grado_empleo = null;
 public int $es_evaluador_y_evaluado = 0;
 public ?int $dependencia_evaluacion_id = null;
 public int $en_periodo_prueba = 0;
 public ?string $fecha_posesion = null;
 public ?string $proposito_principal_empleo = null;
 public int $evaluacion_inicio_febrero = 1;
 public ?string $fecha_inicio_evaluacion = null;
 public ?string $motivo_fecha_inicio_diferente = null;
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

 public function nombreCompleto(): string
 {
 $partes = array_filter([
 $this->primer_nombre,
 $this->segundo_nombre,
 $this->primer_apellido,
 $this->segundo_apellido,
 ]);
 return implode(' ', $partes);
 }

 public function nombresLegados(): string
 {
 return trim(($this->primer_nombre ?? '') . ' ' . ($this->segundo_nombre ?? ''));
 }

 public function apellidosLegados(): string
 {
 return trim(($this->primer_apellido ?? '') . ' ' . ($this->segundo_apellido ?? ''));
 }
}
