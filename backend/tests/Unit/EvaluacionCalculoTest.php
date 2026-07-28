<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Service\EvaluacionService;
use Tests\TestCase;

class EvaluacionCalculoTest extends TestCase
{
    /**
     * Test calcularNotaDefinitiva with various inputs
     * Testing the 85% / 15% weighting per Acuerdo 617 de 2018
     */
    public function testCalcularNotaDefinitivaBasica(): void
    {
        $result = EvaluacionService::calcularNotaDefinitiva(80.0, 100.0);
        
        // 80 * 0.85 = 68.0
        // 100 * 0.15 = 15.0
        // Total = 83.0 -> Satisfactorio
        $this->assertEquals(68.0, $result['nota_funcional_pond']);
        $this->assertEquals(15.0, $result['nota_comportamental_pond']);
        $this->assertEquals(83.0, $result['definitiva']);
        $this->assertEquals('MEDIO', $result['banda']);
        $this->assertEquals('satisfactorio', $result['nivel']);
    }

    public function testCalcularNotaDefinitivaSobresaliente(): void
    {
        $result = EvaluacionService::calcularNotaDefinitiva(95.0, 100.0);
        
        // 95 * 0.85 = 80.75
        // 100 * 0.15 = 15.0
        // Total = 95.75 -> Sobresaliente
        $this->assertEquals(95.75, $result['definitiva']);
        $this->assertEquals('ALTO', $result['banda']);
        $this->assertEquals('sobresaliente', $result['nivel']);
    }

    public function testCalcularNotaDefinitivaNoSatisfactorio(): void
    {
        $result = EvaluacionService::calcularNotaDefinitiva(50.0, 80.0);
        
        // 50 * 0.85 = 42.5
        // 80 * 0.15 = 12.0
        // Total = 54.5 -> No Satisfactorio
        $this->assertEquals(54.5, $result['definitiva']);
        $this->assertEquals('BAJO', $result['banda']);
        $this->assertEquals('no_satisfactorio', $result['nivel']);
    }

    public function testCalcularNotaDefinitivaExactThresholds(): void
    {
        // Exactly 90 = Sobresaliente
        $result = EvaluacionService::calcularNotaDefinitiva(90.0, 90.0);
        $this->assertEquals(90.0, $result['definitiva']);
        $this->assertEquals('sobresaliente', $result['nivel']);

        // Exactly 65 = No Satisfactorio (must be > 65)
        $result = EvaluacionService::calcularNotaDefinitiva(65.0, 65.0);
        $this->assertEquals(65.0, $result['definitiva']);
        $this->assertEquals('no_satisfactorio', $result['nivel']);

        // 65.01 = Satisfactorio
        $result = EvaluacionService::calcularNotaDefinitiva(65.01, 65.01);
        $this->assertEquals('satisfactorio', $result['nivel']);
    }

    public function testCalcularNotaDefinitivaWithZero(): void
    {
        $result = EvaluacionService::calcularNotaDefinitiva(0.0, 0.0);
        
        $this->assertEquals(0.0, $result['definitiva']);
        $this->assertEquals('BAJO', $result['banda']);
        $this->assertEquals('no_satisfactorio', $result['nivel']);
    }

    public function testCalcularNotaDefinitivaWithDecimalPrecision(): void
    {
        // Test rounding behavior
        $result = EvaluacionService::calcularNotaDefinitiva(77.777, 88.888);
        
        // 77.777 * 0.85 = 66.11045 -> rounded to 66.11
        // 88.888 * 0.15 = 13.3332 -> rounded to 13.33
        // Total = 79.44
        $this->assertEquals(66.11, $result['nota_funcional_pond']);
        $this->assertEquals(13.33, $result['nota_comportamental_pond']);
        $this->assertEquals(79.44, $result['definitiva']);
    }
}

class EvaluacionFechasTest extends TestCase
{
    /**
     * Test validarFechasSegundoSemestreStatic
     * Segundo semestre: 01-08-YYYY a 31-01-YYYY+1
     */
    public function testValidarFechasSegundoSemestreValidas(): void
    {
        $error = EvaluacionService::validarFechasSegundoSemestreStatic(
            '2024-08-01', '2025-01-31', '2024-2025'
        );
        $this->assertNull($error);
    }

    public function testValidarFechasSegundoSemestreInicioMuyTemprano(): void
    {
        $error = EvaluacionService::validarFechasSegundoSemestreStatic(
            '2024-07-31', '2025-01-31', '2024-2025'
        );
        $this->assertStringContainsString('01-08-2024', $error);
    }

    public function testValidarFechasSegundoSemestreFinMuyTarde(): void
    {
        $error = EvaluacionService::validarFechasSegundoSemestreStatic(
            '2024-08-01', '2025-02-01', '2024-2025'
        );
        $this->assertStringContainsString('31-01-2025', $error);
    }

    public function testValidarFechasSegundoSemestreInicioMayorFin(): void
    {
        $error = EvaluacionService::validarFechasSegundoSemestreStatic(
            '2025-01-15', '2024-12-01', '2024-2025'
        );
        $this->assertStringContainsString('inicio no puede ser posterior', $error);
    }

    public function testValidarFechasSegundoSemestrePeriodoInvalido(): void
    {
        $error = EvaluacionService::validarFechasSegundoSemestreStatic(
            '2024-08-01', '2025-01-31', '2024-2026'
        );
        $this->assertStringContainsString('no tiene un formato valido', $error);
    }

    public function testValidarFechasSegundoSemestrePeriodoNull(): void
    {
        $error = EvaluacionService::validarFechasSegundoSemestreStatic(
            '2024-08-01', '2025-01-31', ''
        );
        $this->assertNull($error); // Empty periodo = no validation
    }
}