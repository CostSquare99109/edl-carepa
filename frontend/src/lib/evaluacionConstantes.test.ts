import { describe, it, expect } from 'vitest'
import {
  MOTIVOS_NO_JEFE,
  TIPOS_EVALUACION,
  VALORACION_COMPORTAMENTAL,
  PONDERACION,
  MIN_CARACTERES_JUSTIFICACION,
  MIN_NOTA,
  MAX_NOTA,
  type TipoEvaluacion,
} from './evaluacionConstantes'

describe('evaluacionConstantes', () => {
  describe('MOTIVOS_NO_JEFE', () => {
    it('tiene 3 motivos validos', () => {
      expect(MOTIVOS_NO_JEFE).toHaveLength(3)
    })

    it('todos tienen value y label', () => {
      MOTIVOS_NO_JEFE.forEach(m => {
        expect(m).toHaveProperty('value')
        expect(m).toHaveProperty('label')
        expect(typeof m.value).toBe('string')
        expect(typeof m.label).toBe('string')
        expect(m.value.length).toBeGreaterThan(0)
        expect(m.label.length).toBeGreaterThan(0)
      })
    })

    it('contiene retiro_empleado_responsable', () => {
      expect(MOTIVOS_NO_JEFE.find(m => m.value === 'retiro_empleado_responsable')).toBeDefined()
    })

    it('contiene impedimento', () => {
      expect(MOTIVOS_NO_JEFE.find(m => m.value === 'impedimento')).toBeDefined()
    })

    it('contiene recusacion', () => {
      expect(MOTIVOS_NO_JEFE.find(m => m.value === 'recusacion')).toBeDefined()
    })
  })

  describe('TIPOS_EVALUACION', () => {
    it('tiene 4 tipos', () => {
      expect(TIPOS_EVALUACION).toHaveLength(4)
    })

    it('todos son tipo TipoEvaluacion', () => {
      const validTypes: TipoEvaluacion[] = [
        'parcial_eventual',
        'parcial_primer_semestre',
        'parcial_segundo_semestre',
        'calificacion_extraordinaria',
      ]
      TIPOS_EVALUACION.forEach(t => {
        expect(validTypes).toContain(t.value)
      })
    })

    it('parcial_eventual existe', () => {
      expect(TIPOS_EVALUACION.find(t => t.value === 'parcial_eventual')).toBeDefined()
    })

    it('calificacion_extraordinaria existe', () => {
      expect(TIPOS_EVALUACION.find(t => t.value === 'calificacion_extraordinaria')).toBeDefined()
    })
  })

  describe('VALORACION_COMPORTAMENTAL', () => {
    it('tiene 4 niveles', () => {
      expect(VALORACION_COMPORTAMENTAL).toHaveLength(4)
    })

    it('puntajes van de menor a mayor', () => {
      const puntajes = VALORACION_COMPORTAMENTAL.map(v => v.puntaje)
      for (let i = 1; i < puntajes.length; i++) {
        expect(puntajes[i]).toBeGreaterThan(puntajes[i - 1])
      }
    })

    it('nunca tiene puntaje 4', () => {
      const nunca = VALORACION_COMPORTAMENTAL.find(v => v.value === 'nunca')
      expect(nunca?.puntaje).toBe(4)
    })

    it('siempre tiene puntaje 13', () => {
      const siempre = VALORACION_COMPORTAMENTAL.find(v => v.value === 'siempre')
      expect(siempre?.puntaje).toBe(13)
    })

    it('todos tienen value, label y puntaje', () => {
      VALORACION_COMPORTAMENTAL.forEach(v => {
        expect(v).toHaveProperty('value')
        expect(v).toHaveProperty('label')
        expect(v).toHaveProperty('puntaje')
        expect(typeof v.puntaje).toBe('number')
        expect(v.puntaje).toBeGreaterThan(0)
      })
    })
  })

  describe('PONDERACION', () => {
    it('funcional es 0.85 (85%)', () => {
      expect(PONDERACION.FUNCIONAL).toBe(0.85)
    })

    it('comportamental es 0.15 (15%)', () => {
      expect(PONDERACION.COMPORTAMENTAL).toBe(0.15)
    })

    it('suman 1.0 (100%)', () => {
      expect(PONDERACION.FUNCIONAL + PONDERACION.COMPORTAMENTAL).toBe(1.0)
    })
  })

  describe('Constantes numericas', () => {
    it('MIN_CARACTERES_JUSTIFICACION es 40', () => {
      expect(MIN_CARACTERES_JUSTIFICACION).toBe(40)
    })

    it('MIN_NOTA es 0', () => {
      expect(MIN_NOTA).toBe(0)
    })

    it('MAX_NOTA es 100', () => {
      expect(MAX_NOTA).toBe(100)
    })

    it('MIN_NOTA < MAX_NOTA', () => {
      expect(MIN_NOTA).toBeLessThan(MAX_NOTA)
    })
  })
})
