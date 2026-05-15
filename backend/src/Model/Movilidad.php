<?php

namespace App\Model;

class Movilidad
{
    public ?int $id = null;
    public ?int $funcionario_id = null;
    public ?string $tipo = null;
    public ?int $entidad_origen_id = null;
    public ?int $dependencia_origen_id = null;
    public ?int $entidad_destino_id = null;
    public ?int $dependencia_destino_id = null;
    public ?string $fecha_movimiento = null;
    public ?string $acto_administrativo = null;
    public ?string $observaciones = null;
    public string $estado = 'activo';

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
