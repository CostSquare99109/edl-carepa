<?php

namespace App\Model;

class Periodo
{
    public ?int $id = null;
    public ?string $nombre = null;
    public ?string $anio = null;
    public ?string $fecha_inicio = null;
    public ?string $fecha_fin = null;
    public string $estado = 'configuracion';

    public ?string $fecha_inicio_concertacion = null;
    public ?string $fecha_fin_concertacion = null;
    public ?string $fecha_inicio_seguimiento = null;
    public ?string $fecha_fin_seguimiento = null;
    public ?string $fecha_inicio_evaluacion = null;
    public ?string $fecha_fin_evaluacion = null;
    public ?string $fecha_inicio_calificacion_parcial = null;
    public ?string $fecha_fin_calificacion_parcial = null;
    public ?string $fecha_inicio_calificacion = null;
    public ?string $fecha_fin_calificacion = null;

    public ?string $fecha_inicio_evaluacion_segundo = null;
    public ?string $fecha_fin_evaluacion_segundo = null;

    public ?string $fecha_inicio_calificacion_definitiva = null;
    public ?string $fecha_fin_calificacion_definitiva = null;

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
