import test from 'node:test'
import assert from 'node:assert'

// --- evaluacionConstantes ---
const PONDERACION = { FUNCIONAL: 0.85, COMPORTAMENTAL: 0.15 }
const VALORACION_COMPORTAMENTAL = [
  { value: 'nunca', label: 'Nunca', puntaje: 4 },
  { value: 'algunas_veces', label: 'Algunas veces', puntaje: 7 },
  { value: 'frecuentemente', label: 'Frecuentemente', puntaje: 10 },
  { value: 'siempre', label: 'Siempre', puntaje: 13 },
]
const TIPOS_EVALUACION = [
  { value: 'parcial_eventual', label: 'Evaluacion parcial eventual' },
  { value: 'parcial_primer_semestre', label: 'Evaluacion 1 semestre' },
  { value: 'parcial_segundo_semestre', label: 'Evaluacion 2 semestre' },
  { value: 'calificacion_extraordinaria', label: 'Calificacion extraordinaria' },
]
const MOTIVOS_NO_JEFE = [
  { value: 'retiro_empleado_responsable', label: 'Retiro del empleado responsable de evaluar' },
  { value: 'impedimento', label: 'Impedimento' },
  { value: 'recusacion', label: 'Recusacion' },
]
const MIN_CARACTERES_JUSTIFICACION = 40
const MIN_NOTA = 0
const MAX_NOTA = 100

test('PONDERACION: funcional + comportamental = 1', () => {
  assert.strictEqual(PONDERACION.FUNCIONAL + PONDERACION.COMPORTAMENTAL, 1)
  assert.strictEqual(PONDERACION.FUNCIONAL, 0.85)
  assert.strictEqual(PONDERACION.COMPORTAMENTAL, 0.15)
})

test('VALORACION_COMPORTAMENTAL: 4 levels, ascending puntajes', () => {
  assert.strictEqual(VALORACION_COMPORTAMENTAL.length, 4)
  const values = { nunca: 4, algunas_veces: 7, frecuentemente: 10, siempre: 13 }
  for (const v of VALORACION_COMPORTAMENTAL) {
    assert.strictEqual(v.puntaje, values[v.value])
  }
})

test('TIPOS_EVALUACION: 4 types', () => {
  assert.strictEqual(TIPOS_EVALUACION.length, 4)
  const values = TIPOS_EVALUACION.map(t => t.value)
  assert.ok(values.includes('parcial_eventual'))
  assert.ok(values.includes('parcial_primer_semestre'))
  assert.ok(values.includes('parcial_segundo_semestre'))
  assert.ok(values.includes('calificacion_extraordinaria'))
})

test('MOTIVOS_NO_JEFE: 3 reasons', () => {
  assert.strictEqual(MOTIVOS_NO_JEFE.length, 3)
  assert.ok(MOTIVOS_NO_JEFE.some(m => m.value === 'retiro_empleado_responsable'))
})

test('MIN/MAX constants', () => {
  assert.strictEqual(MIN_NOTA, 0)
  assert.strictEqual(MAX_NOTA, 100)
  assert.strictEqual(MIN_CARACTERES_JUSTIFICACION, 40)
  assert.ok(MIN_NOTA < MAX_NOTA)
})

// --- mensajesCNSC ---
const CNSC = {
  concertacion: {
    creada: n => `Se registro la concertacion de compromisos y competencias para el funcionario ${n}, conforme a lo establecido en el articulo 3 del Acuerdo 617 de 2018.`,
    aprobada: n => `La concertacion de compromisos y competencias del funcionario ${n} ha sido aprobada. De acuerdo con el articulo 4 del Acuerdo 617 de 2018, el evaluado cuenta con tres (3) dias habiles para manifestar su no conformidad.`,
    rechazada: n => `La concertacion del funcionario ${n} ha sido rechazada. Se iniciara el proceso de fijacion unilateral conforme al articulo 3 del Acuerdo 617 de 2018.`,
    noConformidad: n => `El funcionario ${n} ha manifestado su no conformidad. La Comision de Personal debera resolver dentro de los cinco (5) dias habiles siguientes (Art. 4, Acuerdo 617 de 2018).`,
    fijacionUnilateral: n => `Se procede con la fijacion unilateral de compromisos para el funcionario ${n}, conforme al articulo 3 del Acuerdo 617 de 2018.`,
  },
  evaluacion: {
    calificada: (n, c, l) => `Se ha calificado la evaluacion del funcionario ${n}. Calificacion definitiva: ${c}%, nivel ${l}. Conforme al articulo 7 del Acuerdo 617 de 2018, el evaluado cuenta con cinco (5) dias habiles para presentar recurso de reposicion.`,
    aprobadaComision: (n, c, l) => `La Comision Evaluadora ha aprobado la evaluacion del funcionario ${n} con calificacion ${c}%, nivel ${l}.`,
    rechazadaComision: n => `La Comision Evaluadora ha rechazado la evaluacion del funcionario ${n}. Se realizara una nueva evaluacion conforme al articulo 8 del Acuerdo 617 de 2018.`,
    recurso: n => `El funcionario ${n} ha interpuesto recurso de reposicion. La Comision dispone de cinco (5) dias habiles para resolver (Art. 7, Acuerdo 617 de 2018).`,
  },
  compromiso: {
    mejoramiento: (n, m) => `Se ha registrado un compromiso de mejoramiento para el funcionario ${n}, con motivo: ${m}. Conforme al articulo 5 del Acuerdo 617 de 2018.`,
    incumplimiento: n => `Se registra incumplimiento del compromiso de mejoramiento del funcionario ${n}. Conforme al articulo 5 del Acuerdo 617 de 2018, el incumplimiento reiterado dara lugar a las consecuencias establecidas en la ley.`,
  },
  periodo: {
    apertura: p => `Se ha abierto el periodo de evaluacion ${p}.`,
    cierre: p => `Se ha cerrado el periodo de evaluacion ${p}.`,
  },
  validacion: {
    pesoIncorrecto: () => 'El peso de los compromisos debe ser igual a 100.',
    rangosCompromisos: () => 'Para el periodo anual se deben ingresar minimo uno (1) y maximo cinco (5) compromisos funcionales.',
    ausentismoInvalido: () => 'La separacion temporal del cargo debe ser superior a 30 dias calendario para generar evaluacion parcial eventual (Art. 6, Acuerdo 617 de 2018).',
  },
}

test('CNSC concertacion messages', () => {
  assert.ok(CNSC.concertacion.creada('Juan').includes('Acuerdo 617'))
  assert.ok(CNSC.concertacion.aprobada('Maria').includes('tres (3) dias'))
  assert.ok(CNSC.concertacion.rechazada('Carlos').includes('fijacion unilateral'))
  assert.ok(CNSC.concertacion.noConformidad('Ana').includes('Comision de Personal'))
  assert.ok(CNSC.concertacion.fijacionUnilateral('Luis').includes('articulo 3'))
})

test('CNSC evaluacion messages', () => {
  const msg = CNSC.evaluacion.calificada('Pedro', '85.5', 'Satisfactorio')
  assert.ok(msg.includes('Pedro'))
  assert.ok(msg.includes('85.5%'))
  assert.ok(msg.includes('Satisfactorio'))
  assert.ok(msg.includes('recurso de reposicion'))
  
  const ap = CNSC.evaluacion.aprobadaComision('Luisa', '92', 'Sobresaliente')
  assert.ok(ap.includes('92%'))
  assert.ok(ap.includes('Sobresaliente'))
  
  assert.ok(CNSC.evaluacion.rechazadaComision('Jorge').includes('nueva evaluacion'))
  assert.ok(CNSC.evaluacion.recurso('Sofia').includes('recurso de reposicion'))
})

test('CNSC compromiso messages', () => {
  assert.ok(CNSC.compromiso.mejoramiento('Andres', 'Bajo').includes('Bajo'))
  assert.ok(CNSC.compromiso.incumplimiento('Rosa').includes('incumplimiento'))
})

// --- colors ---
const COLORES = {
  azul: '#0A2B5E', azulClaro: '#003366', azulOscuro: '#0A2B5E',
  rojo: '#C4282B', verde: '#1E5A3C',
}

const ROLES_SISTEMA = [
  { codigo: 'jefe_dependencia', nombre: 'Jefe de Dependencia' },
  { codigo: 'jefe_personal', nombre: 'Jefe de personal' },
  { codigo: 'evaluador', nombre: 'Evaluador' },
  { codigo: 'evaluado', nombre: 'Evaluado' },
]

const ROLE_COLORS = {
  jefe_dependencia: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  jefe_personal: 'bg-red-900 text-red-100 border-red-700',
  evaluador: 'bg-blue-100 text-blue-800 border-blue-200',
  evaluado: 'bg-sky-100 text-sky-800 border-sky-200',
  comision_evaluadora: 'bg-purple-100 text-purple-800 border-purple-200',
}

test('COLORES: valid hex', () => {
  for (const c of Object.values(COLORES)) {
    assert.match(c, /^#[0-9A-Fa-f]{6}$/)
  }
  assert.strictEqual(COLORES.azul, '#0A2B5E')
  assert.strictEqual(COLORES.rojo, '#C4282B')
  assert.strictEqual(COLORES.verde, '#1E5A3C')
})

test('ROLES_SISTEMA: 4 roles', () => {
  assert.strictEqual(ROLES_SISTEMA.length, 4)
  const codigos = ROLES_SISTEMA.map(r => r.codigo)
  assert.ok(codigos.includes('evaluador'))
  assert.ok(codigos.includes('evaluado'))
})

test('ROLE_COLORS: all roles mapped, bg+text classes', () => {
  for (const r of ROLES_SISTEMA) {
    assert.ok(ROLE_COLORS[r.codigo])
    assert.match(ROLE_COLORS[r.codigo], /bg-/)
    assert.match(ROLE_COLORS[r.codigo], /text-/)
  }
  assert.ok(ROLE_COLORS.comision_evaluadora)
})

// --- useCalculoEvaluacion logic ---
function calcularNotas(puntajesFuncionales, promedioComportamental) {
  const funcionales = puntajesFuncionales.filter(p => p != null && typeof p === 'number')
  const promedioFuncional = funcionales.length > 0
    ? funcionales.reduce((a, b) => a + b, 0) / funcionales.length
    : 0
  const notaFuncionalPond = Math.round(promedioFuncional * PONDERACION.FUNCIONAL * 100) / 100
  const notaComportamentalPond = Math.round(promedioComportamental * PONDERACION.COMPORTAMENTAL * 100) / 100
  const definitiva = Math.round((notaFuncionalPond + notaComportamentalPond) * 100) / 100
  const nivel = definitiva >= 90 ? 'sobresaliente' : definitiva > 65 ? 'satisfactorio' : 'no_satisfactorio'
  const banda = nivel === 'sobresaliente' ? 'ALTO' : nivel === 'satisfactorio' ? 'MEDIO' : 'BAJO'
  return { promedioFuncional, notaFuncionalPond, notaComportamentalPond, definitiva, nivel, banda }
}

test('calcularNotas: basic calculation', () => {
  const r = calcularNotas([100, 100], 15)
  assert.strictEqual(r.promedioFuncional, 100)
  assert.strictEqual(r.notaFuncionalPond, 85)
  assert.strictEqual(r.notaComportamentalPond, 2.25)
  assert.strictEqual(r.definitiva, 87.25)
  assert.strictEqual(r.nivel, 'satisfactorio')
  assert.strictEqual(r.banda, 'MEDIO')
})

test('calcularNotas: mixed scores', () => {
  const r = calcularNotas([80, 90, 70], 10)
  assert.strictEqual(r.promedioFuncional, 80)
  assert.strictEqual(r.notaFuncionalPond, 68)
  assert.strictEqual(r.notaComportamentalPond, 1.5)
  assert.strictEqual(r.definitiva, 69.5)
  assert.strictEqual(r.nivel, 'satisfactorio')
})

test('calcularNotas: boundary satisfactorio/no_satisfactorio', () => {
  const r = calcularNotas([76.47], 0)
  assert.ok(r.definitiva <= 65)
  assert.strictEqual(r.nivel, 'no_satisfactorio')
})

test('calcularNotas: empty funcionales array', () => {
  const r = calcularNotas([], 10)
  assert.strictEqual(r.promedioFuncional, 0)
  assert.strictEqual(r.notaFuncionalPond, 0)
  assert.strictEqual(r.definitiva, 1.5)
})

test('calcularNotas: nulls filtered out', () => {
  const r = calcularNotas([100, null, 80, undefined], 12)
  assert.strictEqual(r.promedioFuncional, 90)
})

test('calcularNotas: comportamental min 0', () => {
  const r = calcularNotas([100], 0)
  assert.strictEqual(r.notaComportamentalPond, 0)
  assert.strictEqual(r.definitiva, 85)
})

test('calcularNotas: comportamental max 15', () => {
  const r = calcularNotas([0], 15)
  assert.strictEqual(r.notaFuncionalPond, 0)
  assert.strictEqual(r.notaComportamentalPond, 2.25)
  assert.strictEqual(r.definitiva, 2.25)
})

test('calcularNotas: max possible score', () => {
  const r = calcularNotas([100], 15)
  assert.strictEqual(r.definitiva, 87.25)
})

// --- NaturalezaBadge logic ---
const NATURALEZA_CONFIG = {
  carrera_administrativa: { label: 'Carrera Admin.', color: 'bg-green-100', textColor: 'text-green-800' },
  libre_nombramiento: { label: 'Libre Nombramiento', color: 'bg-orange-100', textColor: 'text-orange-800' },
  libre_nombramiento_gerencia_publica: { label: 'Libre Nom. Gerencia Pub.', color: 'bg-pink-100', textColor: 'text-pink-800' },
  libre_nombramiento_remocion: { label: 'Libre Nom. y Remocion', color: 'bg-rose-100', textColor: 'text-rose-800' },
  periodo_fijo: { label: 'Periodo Fijo', color: 'bg-violet-100', textColor: 'text-violet-800' },
  temporal: { label: 'Temporal', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
}

function getNaturalezaBadge(naturaleza) {
  const key = (naturaleza || '').toLowerCase().trim()
  return NATURALEZA_CONFIG[key] || { label: naturaleza, color: 'bg-gray-100', textColor: 'text-gray-800' }
}

test('NaturalezaBadge: all 6 types', () => {
  for (const [key, config] of Object.entries(NATURALEZA_CONFIG)) {
    const result = getNaturalezaBadge(key)
    assert.strictEqual(result.label, config.label)
    assert.strictEqual(result.color, config.color)
  }
})

test('NaturalezaBadge: case insensitive', () => {
  const result = getNaturalezaBadge('CARRERA_ADMINISTRATIVA')
  assert.strictEqual(result.label, 'Carrera Admin.')
})

test('NaturalezaBadge: unknown fallback', () => {
  const result = getNaturalezaBadge('unknown')
  assert.strictEqual(result.label, 'unknown')
})

// --- PlantaBadge logic ---
const PLANTA_CONFIG = {
  global: { label: 'Global', color: 'bg-blue-100', textColor: 'text-blue-800' },
  temporal: { label: 'Temporal', color: 'bg-amber-100', textColor: 'text-amber-800' },
}

function getPlantaBadge(planta) {
  const key = (planta || '').toLowerCase().trim()
  return PLANTA_CONFIG[key] || { label: planta, color: 'bg-gray-100', textColor: 'text-gray-800' }
}

test('PlantaBadge: both types', () => {
  assert.strictEqual(getPlantaBadge('global').label, 'Global')
  assert.strictEqual(getPlantaBadge('temporal').label, 'Temporal')
})

test('PlantaBadge: case insensitive', () => {
  assert.strictEqual(getPlantaBadge('GLOBAL').label, 'Global')
})

test('PlantaBadge: unknown fallback', () => {
  assert.strictEqual(getPlantaBadge('unknown').label, 'unknown')
})

// --- NivelBadge logic ---
const NIVEL_CONFIG = {
  directivo: { label: 'Directivo', color: 'bg-purple-100', textColor: 'text-purple-800' },
  asesor: { label: 'Asesor', color: 'bg-indigo-100', textColor: 'text-indigo-800' },
  profesional: { label: 'Profesional', color: 'bg-blue-100', textColor: 'text-blue-800' },
  tecnico: { label: 'Tecnico', color: 'bg-amber-100', textColor: 'text-amber-800' },
  asistencial: { label: 'Asistencial', color: 'bg-gray-100', textColor: 'text-gray-800' },
}

function getNivelBadge(nivel) {
  const key = (nivel || '').toLowerCase().trim()
  return NIVEL_CONFIG[key] || { label: nivel, color: 'bg-gray-100', textColor: 'text-gray-800' }
}

test('NivelBadge: all 5 levels', () => {
  for (const [key, config] of Object.entries(NIVEL_CONFIG)) {
    const result = getNivelBadge(key)
    assert.strictEqual(result.label, config.label)
    assert.strictEqual(result.color, config.color)
  }
})

test('NivelBadge: case insensitive', () => {
  assert.strictEqual(getNivelBadge('PROFESIONAL').label, 'Profesional')
})

test('NivelBadge: unknown fallback', () => {
  assert.strictEqual(getNivelBadge('boss').label, 'boss')
})
