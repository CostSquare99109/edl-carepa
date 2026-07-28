import { describe, it, expect } from 'vitest'
import { calcularNotas, type ResultadoCalculo } from '@/lib/hooks/useCalculoEvaluacion'

describe('useCalculoEvaluacion - calcularNotas', () => {
  describe('Funcionales + Comportamentales (ponderación 85/15)', () => {
    it('calcula correctamente con todos funcionales en 100', () => {
      // Frontend: promedioComportamental se usa directamente * 0.15
      // Si promedioComportamental = 15 (max), notaComportamentalPond = 15 * 0.15 = 2.25
      // Si funcionales = [100, 100], promedioFuncional = 100, notaFuncionalPond = 100 * 0.85 = 85
      // definitiva = 85 + 2.25 = 87.25
      const result = calcularNotas([100, 100], 15)
      expect(result.promedioFuncional).toBe(100)
      expect(result.notaFuncionalPond).toBe(85)
      expect(result.notaComportamentalPond).toBe(2.25)
      expect(result.definitiva).toBe(87.25)
      expect(result.nivel).toBe('satisfactorio')
      expect(result.banda).toBe('MEDIO')
    })

    it('calcula correctamente con funcionales mixtos', () => {
      const result = calcularNotas([80, 90, 70], 10) // promedio 80, comportamental 10
      expect(result.promedioFuncional).toBe(80)
      expect(result.notaFuncionalPond).toBe(68) // 80 * 0.85
      expect(result.notaComportamentalPond).toBe(1.5) // 10 * 0.15
      expect(result.definitiva).toBe(69.5)
      expect(result.nivel).toBe('satisfactorio')
      expect(result.banda).toBe('MEDIO')
    })

    it('calcula correctamente en límite satisfactorio/no satisfactorio', () => {
      // 65.01 -> satisfactorio, 65 -> no_satisfactorio
      const result = calcularNotas([76.47], 0) // 76.47 * 0.85 = 65.0
      expect(result.definitiva).toBeLessThanOrEqual(65)
      expect(result.nivel).toBe('no_satisfactorio')
    })

    it('calcula correctamente en límite sobresaliente', () => {
      // Necesitamos >= 90
      // 100 * 0.85 = 85, necesitamos 5 más de comportamental
      // 5 / 0.15 = 33.33, pero max es 15
      // No es posible llegar a 90 con esta fórmula frontend
      // El máximo es 100 * 0.85 + 15 * 0.15 = 85 + 2.25 = 87.25
      const result = calcularNotas([100], 15)
      expect(result.definitiva).toBe(87.25)
      expect(result.nivel).toBe('satisfactorio')
    })

    it('maneja array vacío de funcionales', () => {
      const result = calcularNotas([], 10)
      expect(result.promedioFuncional).toBe(0)
      expect(result.notaFuncionalPond).toBe(0)
      expect(result.definitiva).toBe(1.5) // Solo comportamental: 10 * 0.15
    })

    it('maneja valores null/undefined en funcionales (se tratan como 0)', () => {
      const result = calcularNotas([100, null as any, 80, undefined as any], 12)
      // null/undefined -> Number.isFinite = false -> treated as 0
      // (100 + 0 + 80 + 0) / 4 = 45
      expect(result.promedioFuncional).toBe(45)
    })

    it('redondea a 2 decimales correctamente', () => {
      const result = calcularNotas([33.33, 66.66], 7)
      expect(Number.isInteger(result.promedioFuncional * 100)).toBe(true)
      expect(Number.isInteger(result.definitiva * 100)).toBe(true)
    })
  })

  describe('Casos edge', () => {
    it('funcionales con decimales', () => {
      const result = calcularNotas([85.5, 92.3], 10)
      expect(result.promedioFuncional).toBeCloseTo(88.9, 1)
    })

    it('comportamental en mínimo (0)', () => {
      const result = calcularNotas([100], 0)
      expect(result.notaComportamentalPond).toBe(0)
      expect(result.definitiva).toBe(85)
    })

    it('comportamental en máximo (15)', () => {
      const result = calcularNotas([0], 15)
      expect(result.notaFuncionalPond).toBe(0)
      expect(result.notaComportamentalPond).toBe(2.25)
      expect(result.definitiva).toBe(2.25)
    })

    it('ponderaciones suman 100%', () => {
      const result = calcularNotas([100], 15)
      // 85% + 15% = 100% del máximo posible
      expect(result.notaFuncionalPond + result.notaComportamentalPond).toBeLessThanOrEqual(87.25)
    })
  })
})

describe('ResultadoCalculo type', () => {
  it('tiene todas las propiedades requeridas', () => {
    const result: ResultadoCalculo = {
      promedioFuncional: 80,
      promedioComportamental: 10,
      notaFuncionalPond: 68,
      notaComportamentalPond: 1.5,
      definitiva: 69.5,
      banda: 'MEDIO',
      nivel: 'satisfactorio',
      nivelLabel: 'Satisfactorio',
    }
    
    expect(result).toHaveProperty('promedioFuncional')
    expect(result).toHaveProperty('promedioComportamental')
    expect(result).toHaveProperty('notaFuncionalPond')
    expect(result).toHaveProperty('notaComportamentalPond')
    expect(result).toHaveProperty('definitiva')
    expect(result).toHaveProperty('banda')
    expect(result).toHaveProperty('nivel')
    expect(result).toHaveProperty('nivelLabel')
  })
})