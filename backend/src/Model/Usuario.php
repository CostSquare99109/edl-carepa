<?php

namespace App\Model;

class Usuario
{
 public ?int $id = null;
 public ?string $documento = null;
 public ?string $tipo_documento = null;
 public ?string $nombres = null;
 public ?string $apellidos = null;
 public ?string $genero = null;
 public ?string $municipio = null;
 public ?string $email = null;
 public ?string $telefono = null;
 public ?string $telefono_secundario = null;
 public ?string $password_hash = null;
 public string $estado = 'activo';
 public int $intentos_fallidos = 0;
 public ?string $ultimo_acceso = null;
 public int $debe_cambiar_password = 0;
 public ?int $entidad_id = null;
 public ?int $dependencia_id = null;
 public ?string $cargo = null;
 public ?string $denominacion_empleo = null;
 public ?string $codigo_empleo = null;
 public ?string $grado = null;
 public ?string $tipo_vinculacion = null;
 public int $es_contratista = 0;
 public ?string $nivel_carrera = null;
 public ?string $naturaleza = null;
 public ?string $tipo_nombramiento = null;
 public ?string $fecha_vinculacion = null;
 public int $periodo_prueba = 0;
 public ?string $proposito_empleo = null;
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
  return trim(($this->nombres ?? '') . ' ' . ($this->apellidos ?? ''));
 }
}
