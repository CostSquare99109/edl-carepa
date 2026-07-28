import { describe, it, expect } from 'vitest'
import {
  MOTIVOS_NO_JEFE,
  TIPOS_EVALUACION,
  VALORACION_COMPORTAMENTAL,
  PONDERACION,
  MIN_CARACTERES_JUSTIFICACION,
  MIN_NOTA,
  MAX_NOTA,
} from './evaluacionConstantes'
import { MENSAJES_CNSC } from './mensajesCNSC'
import { COLORES, COLORES_TAILWIND, ROLES_SISTEMA, ROLE_COLORS } from '@/styles/colors'

describe('evaluacionConstantes', () => {
  describe('MOTIVOS_NO_JEFE', () => {
    it('has exactly 3 reasons', () => {
      expect(MOTIVOS_NO_JEFE).toHaveLength(3)
    })

    it('each item has value and label', () => {
      MOTIVOS_NO_JEFE.forEach(m => {
        expect(m).toHaveProperty('value')
        expect(m).toHaveProperty('label')
        expect(typeof m.value).toBe('string')
        expect(typeof m.label).toBe('string')
      })
    })

    it('contains retiro_empleado_responsable', () => {
      expect(MOTIVOS_NO_JEFE.some(m => m.value === 'retiro_empleado_responsable')).toBe(true)
    })
  })

  describe('TIPOS_EVALUACION', () => {
    it('has exactly 4 types', () => {
      expect(TIPOS_EVALUACION).toHaveLength(4)
    })

    it('contains all required types', () => {
      const values = TIPOS_EVALUACION.map(t => t.value)
      expect(values).toContain('parcial_eventual')
      expect(values).toContain('parcial_primer_semestre')
      expect(values).toContain('parcial_segundo_semestre')
      expect(values).toContain('calificacion_extraordinaria')
    })

    it('all values are non-empty strings', () => {
      TIPOS_EVALUACION.forEach(t => {
        expect(t.value).toBeTruthy()
        expect(t.label).toBeTruthy()
      })
    })
  })

  describe('VALORACION_COMPORTAMENTAL', () => {
    it('has 4 levels', () => {
      expect(VALORACION_COMPORTAMENTAL).toHaveLength(4)
    })

    it('has correct puntajes', () => {
      const levels: Record<string, number> = {}
      VALORACION_COMPORTAMENTAL.forEach(v => { levels[v.value] = v.puntaje })
      expect(levels.nunca).toBe(4)
      expect(levels.algunas_veces).toBe(7)
      expect(levels.frecuentemente).toBe(10)
      expect(levels.siempre).toBe(13)
    })

    it('puntajes are in ascending order', () => {
      for (let i = 1; i < VALORACION_COMPORTAMENTAL.length; i++) {
        expect(VALORACION_COMPORTAMENTAL[i].puntaje).toBeGreaterThan(VALORACION_COMPORTAMENTAL[i - 1].puntaje)
      }
    })
  })

  describe('PONDERACION', () => {
    it('funcional + comportamental = 1', () => {
      expect(PONDERACION.FUNCIONAL + PONDERACION.COMPORTAMENTAL).toBe(1)
    })

    it('funcional is 0.85', () => {
      expect(PONDERACION.FUNCIONAL).toBe(0.85)
    })

    it('comportamental is 0.15', () => {
      expect(PONDERACION.COMPORTAMENTAL).toBe(0.15)
    })
  })

  describe('MIN/MAX constants', () => {
    it('MIN_CARACTERES_JUSTIFICACION >= 20', () => {
      expect(MIN_CARACTERES_JUSTIFICACION).toBeGreaterThanOrEqual(20)
    })

    it('MIN_NOTA is 0', () => {
      expect(MIN_NOTA).toBe(0)
    })

    it('MAX_NOTA is 100', () => {
      expect(MAX_NOTA).toBe(100)
    })

    it('MIN_NOTA < MAX_NOTA', () => {
      expect(MIN_NOTA).toBeLessThan(MAX_NOTA)
    })
  })
})

describe('mensajesCNSC', () => {
  describe('concertacion', () => {
    it('creada includes funcionario name', () => {
      const msg = MENSAJES_CNSC.concertacion.creada('Juan Perez')
      expect(msg).toContain('Juan Perez')
      expect(msg).toContain('Acuerdo 617')
    })

    it('aprobada includes plazos', () => {
      const msg = MENSAJES_CNSC.concertacion.aprobada('Maria')
      expect(msg).toContain('Maria')
      expect(msg).toContain('tres (3) dias')
    })

    it('rechazada mentions fijacion unilateral', () => {
      const msg = MENSAJES_CNSC.concertacion.rechazada('Carlos')
      expect(msg).toContain('fijacion unilateral')
    })

    it('noConformidad mentions Comision de Personal', () => {
      const msg = MENSAJES_CNSC.concertacion.noConformidad('Ana')
      expect(msg).toContain('Comision de Personal')
      expect(msg).toContain('cinco (5) dias')
    })

    it('fijacionUnilateral mentions articulo 3', () => {
      const msg = MENSAJES_CNSC.concertacion.fijacionUnilateral('Luis')
      expect(msg).toContain('articulo 3')
    })
  })

  describe('evaluacion', () => {
    it('calificada includes calificacion and nivel', () => {
      const msg = MENSAJES_CNSC.evaluacion.calificada('Pedro', '85.5', 'Satisfactorio')
      expect(msg).toContain('Pedro')
      expect(msg).toContain('85.5%')
      expect(msg).toContain('Satisfactorio')
      expect(msg).toContain('recurso de reposicion')
    })

    it('aprobadaComision includes calificacion', () => {
      const msg = MENSAJES_CNSC.evaluacion.aprobadaComision('Luisa', '92', 'Sobresaliente')
      expect(msg).toContain('92%')
      expect(msg).toContain('Sobresaliente')
    })

    it('rechazadaComision mentions nueva evaluacion', () => {
      const msg = MENSAJES_CNSC.evaluacion.rechazadaComision('Jorge')
      expect(msg).toContain('nueva evaluacion')
      expect(msg).toContain('articulo 8')
    })

    it('recurso mentions reposicion', () => {
      const msg = MENSAJES_CNSC.evaluacion.recurso('Sofia')
      expect(msg).toContain('recurso de reposicion')
      expect(msg).toContain('cinco (5) dias')
    })
  })

  describe('compromiso', () => {
    it('mejoramiento includes motivo', () => {
      const msg = MENSAJES_CNSC.compromiso.mejoramiento('Andres', 'Bajo rendimiento')
      expect(msg).toContain('Andres')
      expect(msg).toContain('Bajo rendimiento')
    })

    it('incumplimiento mentions consecuencias', () => {
      const msg = MENSAJES_CNSC.compromiso.incumplimiento('Rosa')
      expect(msg).toContain('incumplimiento')
      expect(msg).toContain('consecuencias')
    })
  })

  describe('periodo', () => {
    it('apertura includes periodo name', () => {
      const msg = MENSAJES_CNSC.periodo.apertura('2025-A')
      expect(msg).toContain('2025-A')
    })

    it('cierre mentions pendientes', () => {
      const msg = MENSAJES_CNSC.periodo.cierre('2025-A')
      expect(msg).toContain('cerrado')
    })
  })

  describe('validacion', () => {
    it('pesoIncorrecto mentions 100', () => {
      expect(MENSAJES_CNSC.validacion.pesoIncorrecto()).toContain('100')
    })

    it('rangosCompromisos mentions minimo and maximo', () => {
      const msg = MENSAJES_CNSC.validacion.rangosCompromisos()
      expect(msg).toContain('minimo')
      expect(msg).toContain('maximo')
    })

    it('ausentismoInvalido mentions 30 dias', () => {
      expect(MENSAJES_CNSC.validacion.ausentismoInvalido()).toContain('30')
      expect(MENSAJES_CNSC.validacion.ausentismoInvalido()).toContain('Acuerdo 617')
    })
  })

  describe('all messages reference Acuerdo 617', () => {
    const allMsgs: string[] = []
    function collect(obj: Record<string, unknown>) {
      for (const v of Object.values(obj)) {
        if (typeof v === 'function') allMsgs.push(v())
        else if (typeof v === 'object' && v) collect(v as Record<string, unknown>)
      }
    }
    collect(MENSAJES_CNSC as unknown as Record<string, unknown>)

    it('most messages reference Acuerdo 617', () => {
      const referencing = allMsgs.filter(m => m.includes('Acuerdo 617'))
      expect(referencing.length).toBeGreaterThan(allMsgs.length * 0.5)
    })
  })
})

describe('colors', () => {
  describe('COLORES', () => {
    it('has correct institutional blue', () => {
      expect(COLORES.azul).toBe('#0A2B5E')
      expect(COLORES.azulOscuro).toBe('#0A2B5E')
    })

    it('has all required colors', () => {
      expect(COLORES).toHaveProperty('azul')
      expect(COLORES).toHaveProperty('rojo')
      expect(COLORES).toHaveProperty('verde')
    })

    it('all colors are valid hex strings', () => {
      Object.values(COLORES).forEach(c => {
        expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })

  describe('COLORES_TAILWIND', () => {
    it('has all required entries', () => {
      expect(COLORES_TAILWIND).toHaveProperty('azul')
      expect(COLORES_TAILWIND).toHaveProperty('rojo')
      expect(COLORES_TAILWIND).toHaveProperty('verde')
    })

    it('values start with valid tailwind prefix', () => {
      Object.values(COLORES_TAILWIND).forEach(v => {
        expect(v).toMatch(/^(bg|text|border)-/)
      })
    })
  })

  describe('ROLES_SISTEMA', () => {
    it('has exactly 4 roles', () => {
      expect(ROLES_SISTEMA).toHaveLength(4)
    })

    it('each role has codigo and nombre', () => {
      ROLES_SISTEMA.forEach(r => {
        expect(r).toHaveProperty('codigo')
        expect(r).toHaveProperty('nombre')
      })
    })

    it('contains evaluador and evaluado', () => {
      const codigos = ROLES_SISTEMA.map(r => r.codigo)
      expect(codigos).toContain('evaluador')
      expect(codigos).toContain('evaluado')
    })
  })

  describe('ROLE_COLORS', () => {
    it('has all system roles mapped', () => {
      ROLES_SISTEMA.forEach(r => {
        expect(ROLE_COLORS).toHaveProperty(r.codigo)
      })
    })

    it('also has comision_evaluadora', () => {
      expect(ROLE_COLORS).toHaveProperty('comision_evaluadora')
    })

    it('each color string contains bg- and text-', () => {
      Object.values(ROLE_COLORS).forEach(c => {
        expect(c).toContain('bg-')
        expect(c).toContain('text-')
      })
    })
  })
})
