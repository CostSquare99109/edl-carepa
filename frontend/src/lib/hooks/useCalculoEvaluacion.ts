/**
 * Hook puro para calcular nota definitiva, escala y banda
 * a partir de puntajes funcionales y comportamentales (espec. 10.1, 10.2, 11).
 */

import { PONDERACION } from '../evaluacionConstantes';

export interface ResultadoCalculo {
  promedioFuncional: number;
  promedioComportamental: number;
  notaFuncionalPond: number;
  notaComportamentalPond: number;
  definitiva: number;
  banda: 'ALTO' | 'MEDIO' | 'BAJO';
  nivel: 'sobresaliente' | 'satisfactorio' | 'no_satisfactorio';
  nivelLabel: string;
}

const UMBRAL_ALTO = 90;
const UMBRAL_MEDIO = 65;

function redondear(n: number, decimales: number = 2): number {
  return Math.round(n * Math.pow(10, decimales)) / Math.pow(10, decimales);
}

function calcularNivel(definitiva: number): ResultadoCalculo['nivel'] {
  if (definitiva >= UMBRAL_ALTO) return 'sobresaliente';
  if (definitiva > UMBRAL_MEDIO) return 'satisfactorio';
  return 'no_satisfactorio';
}

function calcularBanda(definitiva: number): ResultadoCalculo['banda'] {
  if (definitiva >= UMBRAL_ALTO) return 'ALTO';
  if (definitiva > UMBRAL_MEDIO) return 'MEDIO';
  return 'BAJO';
}

const NIVEL_LABELS: Record<ResultadoCalculo['nivel'], string> = {
  sobresaliente: 'Sobresaliente',
  satisfactorio: 'Satisfactorio',
  no_satisfactorio: 'No satisfactorio',
};

export function calcularNotas(
  puntajesFuncionales: number[],
  promedioComportamental: number,
): ResultadoCalculo {
  const promedioFuncional =
    puntajesFuncionales.length === 0
      ? 0
      : redondear(
          puntajesFuncionales.reduce((acc, p) => acc + (Number.isFinite(p) ? p : 0), 0) /
            puntajesFuncionales.length,
        );

  const notaFuncionalPond = redondear(promedioFuncional * PONDERACION.FUNCIONAL);
  const notaComportamentalPond = redondear(promedioComportamental * PONDERACION.COMPORTAMENTAL);
  const definitiva = redondear(notaFuncionalPond + notaComportamentalPond);

  const nivel = calcularNivel(definitiva);
  const banda = calcularBanda(definitiva);

  return {
    promedioFuncional,
    promedioComportamental: redondear(promedioComportamental),
    notaFuncionalPond,
    notaComportamentalPond,
    definitiva,
    banda,
    nivel,
    nivelLabel: NIVEL_LABELS[nivel],
  };
}
