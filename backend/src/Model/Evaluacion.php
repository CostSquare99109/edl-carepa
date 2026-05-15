<?php

namespace App\Model;

class Evaluacion
{
    public ?int $id = null;
    public ?int $periodo_id = null;
    public ?int $evaluado_id = null;
    public ?int $evaluador_id = null;
    public ?string $tipo = null;
    public ?float $puntaje = null;
    public string $estado = 'pendiente';
    public ?string $fecha_evaluacion = null;
    public ?string $observaciones = null;

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
