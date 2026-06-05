<?php

namespace App\Model;

class Competencia
{
 public ?string $codigo = null;
 public ?string $nombre = null;
 public ?string $descripcion = null;
 public ?string $decreto = null;

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
