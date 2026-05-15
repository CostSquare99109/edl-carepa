<?php

namespace App\Model;

class Meta
{
    public ?int $id = null;
    public ?int $periodo_id = null;
    public ?int $funcionario_id = null;
    public ?int $evaluador_id = null;
    public ?string $descripcion = null;
    public ?string $tipo = null;
    public ?float $peso = null;
    public ?string $indicador = null;
    public ?float $meta_numerica = null;
    public ?string $unidad_medida = null;
    public string $estado = 'pendiente';

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
