<?php

namespace App\Model;

class Dependencia
{
    public ?int $id = null;
    public ?int $entidad_id = null;
    public ?string $codigo = null;
    public ?string $nombre = null;
    public ?int $jefe_id = null;
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
