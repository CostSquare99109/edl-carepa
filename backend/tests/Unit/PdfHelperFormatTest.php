<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Helper\PdfHelper;
use Tests\TestCase;

class PdfHelperFormatTest extends TestCase
{
    public function testFormatoPorcentaje(): void
    {
        $this->assertEquals('85.00%', PdfHelper::formatoPorcentaje(85));
        $this->assertEquals('85.50%', PdfHelper::formatoPorcentaje(85.5));
        $this->assertEquals('85.50%', PdfHelper::formatoPorcentaje('85.5'));
        $this->assertEquals('—', PdfHelper::formatoPorcentaje(null));
        $this->assertEquals('—', PdfHelper::formatoPorcentaje(''));
        $this->assertEquals('—', PdfHelper::formatoPorcentaje('null'));
        $this->assertEquals('—', PdfHelper::formatoPorcentaje(false));
        $this->assertEquals('0.00%', PdfHelper::formatoPorcentaje(0));
    }

    public function testFormatoNumero(): void
    {
        $this->assertEquals('1,234.57', PdfHelper::formatoNumero(1234.567, 2));
        $this->assertEquals('1,234.567', PdfHelper::formatoNumero(1234.567, 3));
        $this->assertEquals('—', PdfHelper::formatoNumero(null));
        $this->assertEquals('—', PdfHelper::formatoNumero(''));
        $this->assertEquals('—', PdfHelper::formatoNumero('null'));
        $this->assertEquals('100.00', PdfHelper::formatoNumero('100', 2));
    }

    public function testFormatoTexto(): void
    {
        $this->assertEquals('Hola Mundo', PdfHelper::formatoTexto('Hola Mundo'));
        $this->assertEquals('No aplica', PdfHelper::formatoTexto(null));
        $this->assertEquals('No aplica', PdfHelper::formatoTexto(''));
        $this->assertEquals('No aplica', PdfHelper::formatoTexto('null'));
        $this->assertEquals('Custom', PdfHelper::formatoTexto(null, 'Custom'));
    }

    public function testFormatoFecha(): void
    {
        $this->assertEquals('15/01/2024', PdfHelper::formatoFecha('2024-01-15'));
        $this->assertEquals('15/01/2024', PdfHelper::formatoFecha('2024-01-15 10:30:00'));
        $this->assertEquals('—', PdfHelper::formatoFecha(null));
        $this->assertEquals('—', PdfHelper::formatoFecha(''));
        $this->assertEquals('—', PdfHelper::formatoFecha('0000-00-00'));
    }

    public function testFormatoFechaHora(): void
    {
        $this->assertEquals('15/01/2024 10:30', PdfHelper::formatoFechaHora('2024-01-15 10:30:00'));
        $this->assertEquals('—', PdfHelper::formatoFechaHora(null));
    }

    public function testFormatoEnum(): void
    {
        $this->assertEquals('SOBRESALIENTE', PdfHelper::formatoEnum('sobresaliente'));
        $this->assertEquals('NO SATISFACTORIO', PdfHelper::formatoEnum('no_satisfactorio'));
        $this->assertEquals('EN PROCESO', PdfHelper::formatoEnum('en_proceso'));
        $this->assertEquals('—', PdfHelper::formatoEnum(null));
    }

    public function testFormatoNivelJerarquico(): void
    {
        $this->assertEquals('Directivo', PdfHelper::formatoNivelJerarquico('directivo'));
        $this->assertEquals('Asesor', PdfHelper::formatoNivelJerarquico('asesor'));
        $this->assertEquals('Profesional', PdfHelper::formatoNivelJerarquico('profesional'));
        $this->assertEquals('Técnico', PdfHelper::formatoNivelJerarquico('tecnico'));
        $this->assertEquals('Asistencial', PdfHelper::formatoNivelJerarquico('asistencial'));
        $this->assertEquals('—', PdfHelper::formatoNivelJerarquico(null));
    }

    public function testFormatoTipoDocumento(): void
    {
        $this->assertEquals('C.C.', PdfHelper::formatoTipoDocumento('CC'));
        $this->assertEquals('C.E.', PdfHelper::formatoTipoDocumento('CE'));
        $this->assertEquals('T.I.', PdfHelper::formatoTipoDocumento('TI'));
        $this->assertEquals('Pasaporte', PdfHelper::formatoTipoDocumento('PA'));
        $this->assertEquals('—', PdfHelper::formatoTipoDocumento(null));
    }

    public function testFormatoNombreCompleto(): void
    {
        $this->assertEquals('Juan Pérez González', PdfHelper::formatoNombreCompleto([
            'primer_nombre' => 'Juan',
            'segundo_nombre' => '',
            'primer_apellido' => 'Pérez',
            'segundo_apellido' => 'González',
        ]));
        $this->assertEquals('María García', PdfHelper::formatoNombreCompleto([
            'primer_nombre' => 'María',
            'primer_apellido' => 'García',
        ]));
        $this->assertEquals('No registra', PdfHelper::formatoNombreCompleto([]));
    }

    public function testFormatoEstado(): void
    {
        $this->assertEquals('Pendiente', PdfHelper::formatoEstado('pendiente'));
        $this->assertEquals('Calificada', PdfHelper::formatoEstado('calificada'));
        $this->assertEquals('Aprobada por Comisión', PdfHelper::formatoEstado('aprobada_comision'));
        $this->assertEquals('Sí', PdfHelper::formatoEstado('si'));
        $this->assertEquals('No', PdfHelper::formatoEstado('no'));
        $this->assertEquals('Nunca', PdfHelper::formatoEstado('nunca'));
        $this->assertEquals('Algunas veces', PdfHelper::formatoEstado('algunas_veces'));
        $this->assertEquals('—', PdfHelper::formatoEstado(null));
    }

    public function testFormatoTipoEvaluacion(): void
    {
        $this->assertEquals('Evaluación 1.er Semestre', PdfHelper::formatoTipoEvaluacion('parcial_primer_semestre'));
        $this->assertEquals('Evaluación 2.do Semestre', PdfHelper::formatoTipoEvaluacion('parcial_segundo_semestre'));
        $this->assertEquals('Evaluación Parcial Eventual', PdfHelper::formatoTipoEvaluacion('parcial_eventual'));
        $this->assertEquals('Calificación Definitiva', PdfHelper::formatoTipoEvaluacion('calificacion_definitiva'));
    }

    public function testFormatoNivelResultado(): void
    {
        $this->assertEquals('Sobresaliente', PdfHelper::formatoNivelResultado('sobresaliente'));
        $this->assertEquals('Satisfactorio', PdfHelper::formatoNivelResultado('satisfactorio'));
        $this->assertEquals('No satisfactorio', PdfHelper::formatoNivelResultado('no_satisfactorio'));
        $this->assertEquals('—', PdfHelper::formatoNivelResultado(null));
    }
}