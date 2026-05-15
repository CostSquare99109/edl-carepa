<?php

namespace App\Model;

class CargaMasiva
{
    public ?int $id = null;
    public ?int $usuario_id = null;
    public ?string $tipo = null;
    public ?string $nombre_archivo = null;
    public ?string $ruta_archivo = null;
    public ?int $registros_total = null;
    public ?int $registros_exitosos = null;
    public ?int $registros_fallidos = null;
    public string $estado = 'pendiente';
    public ?string $resultado_detalle = null;

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
