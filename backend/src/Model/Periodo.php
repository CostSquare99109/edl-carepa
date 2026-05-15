<?php

namespace App\Model;

class Periodo
{
    public ?int $id = null;
    public ?string $nombre = null;
    public ?string $fecha_inicio = null;
    public ?string $fecha_fin = null;
    public string $estado = 'abierto';

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
