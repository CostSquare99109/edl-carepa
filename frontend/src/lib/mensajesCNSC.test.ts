import { describe, it, expect } from 'vitest'
import { MENSAJES_CNSC } from './mensajesCNSC'

describe('mensajesCNSC', () => {
  const testNombre = 'JUAN GOMEZ'

  describe('concertacion', () => {
    it('creada contiene nombre del funcionario', () => {
      const msg = MENSAJES_CNSC.concertacion.creada(testNombre)
      expect(msg).toContain(testNombre)
    })

    it('creada referencia Acuerdo 617', () => {
      const msg = MENSAJES_CNSC.concertacion.creada(testNombre)
      expect(msg).toContain('Acuerdo 617')
    })

    it('creada referencia articulo 3', () => {
      const msg = MENSAJES_CNSC.concertacion.creada(testNombre)
      expect(msg).toContain('articulo 3')
    })

    it('aprobada contiene 3 dias habiles', () => {
      const msg = MENSAJES_CNSC.concertacion.aprobada(testNombre)
      expect(msg).toContain('tres (3) dias')
    })

    it('aprobada referencia no conformidad', () => {
      const msg = MENSAJES_CNSC.concertacion.aprobada(testNombre)
      expect(msg).toContain('no conformidad')
    })

    it('rechazada referencia fijacion unilateral', () => {
      const msg = MENSAJES_CNSC.concertacion.rechazada(testNombre)
      expect(msg).toContain('fijacion unilateral')
    })

    it('noConformidad contiene 5 dias habiles', () => {
      const msg = MENSAJES_CNSC.concertacion.noConformidad(testNombre)
      expect(msg).toContain('cinco (5) dias')
    })

    it('fijacionUnilateral referencia articulo 3', () => {
      const msg = MENSAJES_CNSC.concertacion.fijacionUnilateral(testNombre)
      expect(msg).toContain('articulo 3')
    })

    it('todos los mensajes son strings no vacios', () => {
      const eventos = [
        MENSAJES_CNSC.concertacion.creada(testNombre),
        MENSAJES_CNSC.concertacion.aprobada(testNombre),
        MENSAJES_CNSC.concertacion.rechazada(testNombre),
        MENSAJES_CNSC.concertacion.noConformidad(testNombre),
        MENSAJES_CNSC.concertacion.fijacionUnilateral(testNombre),
      ]
      eventos.forEach(msg => {
        expect(typeof msg).toBe('string')
        expect(msg.length).toBeGreaterThan(10)
      })
    })
  })

  describe('evaluacion', () => {
    it('calificada contiene nombre y calificacion', () => {
      const msg = MENSAJES_CNSC.evaluacion.calificada(testNombre, '85', 'Sobresaliente')
      expect(msg).toContain(testNombre)
      expect(msg).toContain('85%')
      expect(msg).toContain('Sobresaliente')
    })

    it('calificada referencia recurso de reposicion', () => {
      const msg = MENSAJES_CNSC.evaluacion.calificada(testNombre, '85', 'Satisfactorio')
      expect(msg).toContain('recurso de reposicion')
    })

    it('calificada contiene 5 dias habiles', () => {
      const msg = MENSAJES_CNSC.evaluacion.calificada(testNombre, '85', 'Satisfactorio')
      expect(msg).toContain('cinco (5) dias')
    })

    it('aprobadaComision contiene datos', () => {
      const msg = MENSAJES_CNSC.evaluacion.aprobadaComision(testNombre, '90', 'Sobresaliente')
      expect(msg).toContain(testNombre)
      expect(msg).toContain('90%')
      expect(msg).toContain('Comision')
    })

    it('rechazadaComision referencia articulo 8', () => {
      const msg = MENSAJES_CNSC.evaluacion.rechazadaComision(testNombre)
      expect(msg).toContain('articulo 8')
    })

    it('recurso referencia 5 dias habiles', () => {
      const msg = MENSAJES_CNSC.evaluacion.recurso(testNombre)
      expect(msg).toContain('cinco (5) dias')
    })

    it('aprobacionRequerida referencia Art. 8', () => {
      const msg = MENSAJES_CNSC.evaluacion.aprobacionRequerida(testNombre)
      expect(msg).toContain('Art. 8')
    })
  })

  describe('compromiso', () => {
    it('mejoramiento contiene nombre y motivo', () => {
      const msg = MENSAJES_CNSC.compromiso.mejoramiento(testNombre, 'Bajo rendimiento')
      expect(msg).toContain(testNombre)
      expect(msg).toContain('Bajo rendimiento')
    })

    it('mejoramiento referencia articulo 5', () => {
      const msg = MENSAJES_CNSC.compromiso.mejoramiento(testNombre, 'Motivo')
      expect(msg).toContain('articulo 5')
    })

    it('incumplimiento contiene nombre', () => {
      const msg = MENSAJES_CNSC.compromiso.incumplimiento(testNombre)
      expect(msg).toContain(testNombre)
    })

    it('incumplimiento referencia articulo 5', () => {
      const msg = MENSAJES_CNSC.compromiso.incumplimiento(testNombre)
      expect(msg).toContain('articulo 5')
    })
  })

  describe('periodo', () => {
    it('apertura contiene periodo', () => {
      const msg = MENSAJES_CNSC.periodo.apertura('2026-2027')
      expect(msg).toContain('2026-2027')
    })

    it('apertura referencia Acuerdo 617', () => {
      const msg = MENSAJES_CNSC.periodo.apertura('2026-2027')
      expect(msg).toContain('Acuerdo 617')
    })

    it('cierre contiene periodo', () => {
      const msg = MENSAJES_CNSC.periodo.cierre('2026-2027')
      expect(msg).toContain('2026-2027')
    })
  })

  describe('validacion', () => {
    it('pesoIncorrecto es string no vacio', () => {
      const msg = MENSAJES_CNSC.validacion.pesoIncorrecto()
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(0)
    })

    it('rangosCompromisos menciona minimo y maximo', () => {
      const msg = MENSAJES_CNSC.validacion.rangosCompromisos()
      expect(msg).toContain('minimo')
      expect(msg).toContain('maximo')
    })

    it('ausentismoInvalido referencia 30 dias', () => {
      const msg = MENSAJES_CNSC.validacion.ausentismoInvalido()
      expect(msg).toContain('30 dias')
    })

    it('periodoPruebaInvalido referencia 20 dias', () => {
      const msg = MENSAJES_CNSC.validacion.periodoPruebaInvalido()
      expect(msg).toContain('20 dias')
    })

    it('dependenciaConUsuarios menciona usuarios activos', () => {
      const msg = MENSAJES_CNSC.validacion.dependenciaConUsuarios()
      expect(msg).toContain('usuarios activos')
    })
  })

  describe('Consistencia', () => {
    it('todos los mensajes referencian Acuerdo 617 o articulo', () => {
      const messages = [
        MENSAJES_CNSC.concertacion.creada('X'),
        MENSAJES_CNSC.concertacion.aprobada('X'),
        MENSAJES_CNSC.concertacion.rechazada('X'),
        MENSAJES_CNSC.concertacion.noConformidad('X'),
        MENSAJES_CNSC.concertacion.fijacionUnilateral('X'),
        MENSAJES_CNSC.evaluacion.calificada('X', '85', 'Sobresaliente'),
        MENSAJES_CNSC.evaluacion.aprobadaComision('X', '85', 'Sobresaliente'),
        MENSAJES_CNSC.evaluacion.rechazadaComision('X'),
        MENSAJES_CNSC.evaluacion.recurso('X'),
        MENSAJES_CNSC.evaluacion.aprobacionRequerida('X'),
        MENSAJES_CNSC.compromiso.mejoramiento('X', 'Y'),
        MENSAJES_CNSC.compromiso.incumplimiento('X'),
        MENSAJES_CNSC.periodo.apertura('2026'),
        MENSAJES_CNSC.periodo.cierre('2026'),
      ]
      messages.forEach((msg, i) => {
        const hasRef = msg.includes('Acuerdo 617') || msg.includes('articulo') || msg.includes('Art.') || msg.includes('Comision')
        if (!hasRef) {
          console.log(`Message ${i} without ref: "${msg.substring(0, 100)}..."`)
        }
        expect(hasRef).toBe(true)
      })
    })
  })
})
