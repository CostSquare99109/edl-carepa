<?php

namespace App\Model;

class Evidencia
{
    public ?int $id = null;
    public ?int $meta_id = null;
    public ?int $compromiso_id = null;
    public ?int $subido_por = null;
    public ?string $nombre_archivo = null;
    public ?string $ruta_archivo = null;
    public ?string $tipo_mime = null;
    public ?int $tamano_bytes = null;
    public ?string $descripcion = null;
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
