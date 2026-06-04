<?php

namespace App\Model;

class Compromiso
{
    public ?int $id = null;
    public ?int $evaluacion_id = null;
    public ?string $tipo = null;
    public ?string $descripcion = null;
    public ?string $plazo = null;
    public ?int $responsable_id = null;
    public string $estado = 'propuesto';

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
