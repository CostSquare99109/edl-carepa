/**
 * Reglas de evaluabilidad y ano laboral (espejo del backend
 * `ReglaEvaluabilidadService`). Solo presentation: el backend es la fuente de
 * verdad y responde 422 cuando una regla no se cumple.
 *
 * El ano laboral de un funcionario son DOS parciales consecutivas segun el
 * semestre en que ingreso:
 *  - Ingreso en 1er semestre -> [1er sem N, 2do sem N], definitiva en enero.
 *  - Ingreso en 2do semestre -> [2do sem N, 1er sem N+1], definitiva en julio.
 */

export type SemestreIngreso = 'primer_semestre' | 'segundo_semestre';

export interface ParcialAnioLaboral {
  posicion: number;
  periodo_id: number;
  semestre: SemestreIngreso;
  tipo: 'parcial_primer_semestre' | 'parcial_segundo_semestre';
  ventana: { inicio: string; fin: string } | null;
  existe: boolean;
  estado: string | null;
  evaluacion_id: number | null;
  calificacion_definitiva: number | null;
  calificada: boolean;
}

export interface DefinitivaAnioLaboral {
  puede_emitir: boolean;
  motivo: string | null;
  parciales: ParcialAnioLaboral[];
  nota_promedio: number | null;
  nivel: 'sobresaliente' | 'satisfactorio' | 'no_satisfactorio' | null;
  cierre: string | null;
  semestre_ingreso: SemestreIngreso;
}

export interface ReglasEvaluabilidad {
  periodo_id: number;
  periodo_nombre: string | null;
  semestre_ingreso: SemestreIngreso;
  semestre_ingreso_fuente: 'explicito' | 'fecha_posesion' | 'por_defecto';
  fecha_posesion: string | null;
  exento_primer_semestre: boolean;
  semestres_permitidos: SemestreIngreso[];
  puede_iniciar_primer_semestre: boolean;
  puede_iniciar_segundo_semestre: boolean;
  motivo_primer_semestre: string | null;
  motivo_segundo_semestre: string | null;
  anio_laboral: ParcialAnioLaboral[];
  anio_laboral_completas: number;
  definitiva: DefinitivaAnioLaboral;
  mensaje: string;
}

export const SEMESTRE_LABELS: Record<string, string> = {
  parcial_primer_semestre: 'Primer semestre',
  parcial_segundo_semestre: 'Segundo semestre',
};

export const NIVEL_LABELS: Record<string, string> = {
  sobresaliente: 'Sobresaliente',
  satisfactorio: 'Satisfactorio',
  no_satisfactorio: 'No satisfactorio',
};

/** Semestres del ano laboral, en orden de realizacion. */
export function parcialesAnioLaboral(reglas: ReglasEvaluabilidad | null): ParcialAnioLaboral[] {
  return reglas?.anio_laboral ?? [];
}

/** El funcionario ya completo las dos parciales de su ano laboral. */
export function anioLaboralCompleto(reglas: ReglasEvaluabilidad | null): boolean {
  return parcialesAnioLaboral(reglas).filter(p => p.calificada).length === 2;
}

/** Ultima nota de cada semestre, para mostrar la definitiva del ano laboral. */
export function notasParciales(reglas: ReglasEvaluabilidad | null): number[] {
  return parcialesAnioLaboral(reglas)
    .map(p => p.calificacion_definitiva)
    .filter((n): n is number => typeof n === 'number' && n > 0);
}

/** Umbrales vigentes: 85% Sobresaliente, 65% Satisfactorio. */
export const UMBRAL_SOBRESALIENTE = 85;
export const UMBRAL_SATISFACTORIO = 65;

export function formatearNota(valor: number | null | undefined, decimales = 2): string {
  const n = Number(valor);
  if (valor === null || valor === undefined || !isFinite(n)) return '—';
  return n.toFixed(decimales);
}

export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const [a, m, d] = fecha.split('-');
  if (!a || !m || !d) return fecha;
  return `${d}/${m}/${a}`;
}