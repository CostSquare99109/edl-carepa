<?php

namespace App\Helper;

class MensajesCNSC
{
 public static function concertacion(string $evento, array $datos = []): string
 {
 $nombre = $datos['nombre'] ?? '';
 return match ($evento) {
 'creada' => 'Se ha registrado el acta de concertación de compromisos y competencias para el funcionario ' . $nombre . ', conforme a lo establecido en la Resolución 1760 de 2010.',
 'aprobada' => 'La concertación de compromisos y competencias del funcionario ' . $nombre . ' ha sido aprobada. De acuerdo con el artículo 34 de la Resolución 1760 de 2010, el evaluado cuenta con tres (3) días hábiles para manifestar su no conformidad.',
 'rechazada' => 'La concertación de compromisos y competencias del funcionario ' . $nombre . ' ha sido rechazada. Se iniciará el proceso de fijación unilateral conforme al artículo 33 de la Resolución 1760 de 2010.',
 'no_conformidad' => 'El funcionario ' . $nombre . ' ha manifestado su no conformidad con la concertación. La Comisión de Evaluación y Desempeño deberá resolver dentro de los cinco (5) días hábiles siguientes (Art. 34, Resolución 1760 de 2010).',
 'fijacion_unilateral' => 'Se procede con la fijación unilateral de compromisos y competencias para el funcionario ' . $nombre . ', conforme al artículo 33 de la Resolución 1760 de 2010, dado que no se logró acuerdo en la concertación.',
 default => '',
 };
 }

 public static function evaluacion(string $evento, array $datos = []): string
 {
 $nombre = $datos['nombre'] ?? '';
 $calificacion = $datos['calificacion'] ?? '-';
 $nivel = $datos['nivel'] ?? '-';
 return match ($evento) {
 'calificada' => 'Se ha calificado la evaluación del desempeño laboral del funcionario ' . $nombre . '. La calificación definitiva es ' . $calificacion . '%, correspondiente al nivel ' . $nivel . '. Conforme al artículo 48 de la Resolución 1760 de 2010, el evaluado cuenta con tres (3) días hábiles para manifestar su disconformidad.',
 'aprobada_comision' => 'La Comisión de Evaluación y Desempeño ha aprobado la evaluación del funcionario ' . $nombre . ' con calificación definitiva ' . $calificacion . '%, nivel ' . $nivel . '.',
 'rechazada_comision' => 'La Comisión de Evaluación y Desempeño ha rechazado la evaluación del funcionario ' . $nombre . '. Se realizará una nueva evaluación conforme al artículo 51 de la Resolución 1760 de 2010.',
 'recurso' => 'El funcionario ' . $nombre . ' ha interpuesto recurso de reposición contra la evaluación. La Comisión de Evaluación dispone de diez (10) días hábiles para resolver (Art. 52, Resolución 1760 de 2010).',
 default => '',
 };
 }

 public static function compromiso(string $evento, array $datos = []): string
 {
 $nombre = $datos['nombre'] ?? '';
 $motivo = $datos['motivo'] ?? '';
 return match ($evento) {
 'mejoramiento' => 'Se ha registrado un compromiso de mejoramiento para el funcionario ' . $nombre . ', con motivo: ' . $motivo . '. Conforme al artículo 62 de la Resolución 1760 de 2010, el funcionario deberá cumplir las acciones de mejoramiento dentro del período establecido.',
 'incumplimiento' => 'Se registra incumplimiento del compromiso de mejoramiento del funcionario ' . $nombre . '. Conforme al artículo 64 de la Resolución 1760 de 2010, el incumplimiento reiterado podrá dar lugar a la desvinculación del cargo.',
 default => '',
 };
 }

 public static function periodo(string $evento, array $datos = []): string
 {
 $periodo = $datos['periodo'] ?? '';
 return match ($evento) {
 'apertura' => 'Se ha abierto el período de evaluación ' . $periodo . '. De acuerdo con la Resolución 1760 de 2010, todos los servidores públicos sujetos a evaluación deben participar en el proceso.',
 'cierre' => 'Se ha cerrado el período de evaluación ' . $periodo . '. Las evaluaciones pendientes serán calificadas con base en la información disponible.',
 default => '',
 };
 }
}
