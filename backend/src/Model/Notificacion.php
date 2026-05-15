<?php

namespace App\Model;

class Notificacion
{
    public ?int $id = null;
    public ?int $usuario_id = null;
    public ?string $titulo = null;
    public ?string $mensaje = null;
    public ?string $tipo = null;
    public bool $leida = false;

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
