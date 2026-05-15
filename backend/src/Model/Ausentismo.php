<?php

namespace App\Model;

class Ausentismo
{
    public ?int $id = null;
    public ?int $funcionario_id = null;
    public ?string $tipo = null;
    public ?string $fecha_inicio = null;
    public ?string $fecha_fin = null;
    public ?int $dias_habiles = null;
    public ?int $justificado = null;
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
