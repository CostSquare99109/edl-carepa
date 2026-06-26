/**
 * Constantes oficiales para el flujo del Evaluador.
 * Espec. sec. 5, 10 y 11.
 */

export const MOTIVOS_NO_JEFE: { value: string; label: string }[] = [
  { value: 'retiro_empleado_responsable', label: 'Retiro del empleado responsable de evaluar' },
  { value: 'impedimento', label: 'Impedimento' },
  { value: 'recusacion', label: 'Recusacion' },
];

export const TIPOS_EVALUACION = [
  { value: 'parcial_eventual', label: 'Evaluacion parcial eventual' },
  { value: 'parcial_primer_semestre', label: 'Evaluacion 1 semestre' },
  { value: 'parcial_segundo_semestre', label: 'Evaluacion 2 semestre' },
  { value: 'calificacion_extraordinaria', label: 'Calificacion extraordinaria' },
] as const;

export type TipoEvaluacion = typeof TIPOS_EVALUACION[number]['value'];

export const VALORACION_COMPORTAMENTAL = [
  { value: 'nunca', label: 'Nunca', puntaje: 4 },
  { value: 'algunas_veces', label: 'Algunas veces', puntaje: 7 },
  { value: 'frecuentemente', label: 'Frecuentemente', puntaje: 10 },
  { value: 'siempre', label: 'Siempre', puntaje: 13 },
] as const;

export const PONDERACION = {
  FUNCIONAL: 0.85,
  COMPORTAMENTAL: 0.15,
};

export const MIN_CARACTERES_JUSTIFICACION = 40;
export const MIN_NOTA = 0;
export const MAX_NOTA = 100;
