/**
 * Modal de confirmacion final para guardar la evaluacion.
 * Espec. sec. 6: "Evaluacion 2 Semestre / Esta seguro de terminar la evaluacion
 * de {Nombre}? / Nota funcional: {nf} / Nota comportamental: {nc} / Escala: {band}".
 */

import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { ResultadoCalculo } from '../../lib/hooks/useCalculoEvaluacion';

export interface PropsConfirmarGuardado {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
  nombreEvaluado: string;
  tipoEvaluacionLabel: string;
  calculo: ResultadoCalculo | null;
}

export default function ConfirmarGuardadoEvaluacion({
  open,
  onClose,
  onConfirm,
  loading,
  nombreEvaluado,
  tipoEvaluacionLabel,
  calculo,
}: PropsConfirmarGuardado) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tipoEvaluacionLabel}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            Guardar evaluacion
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-inst-texto">
          Esta seguro de terminar la evaluacion de{' '}
          <span className="font-semibold">{nombreEvaluado}</span>?
        </p>
        {calculo ? (
          <dl className="grid grid-cols-2 gap-y-2 gap-x-4 bg-inst-gris-med rounded-lg p-3">
            <dt className="text-inst-texto-claro">Nota funcional</dt>
            <dd className="text-right font-mono">
              {calculo.promedioFuncional.toFixed(1)} x 85% ={' '}
              <span className="font-bold text-inst-azul-osc">
                {calculo.notaFuncionalPond.toFixed(2)}
              </span>
            </dd>
            <dt className="text-inst-texto-claro">Nota comportamental</dt>
            <dd className="text-right font-mono">
              {calculo.promedioComportamental.toFixed(1)} x 15% ={' '}
              <span className="font-bold text-inst-azul-osc">
                {calculo.notaComportamentalPond.toFixed(2)}
              </span>
            </dd>
            <dt className="text-inst-texto">Definitiva</dt>
            <dd className="text-right font-mono font-bold text-lg text-inst-azul-osc">
              {calculo.definitiva.toFixed(2)}
            </dd>
            <dt className="text-inst-texto">Escala</dt>
            <dd className="text-right font-medium">
              {calculo.banda} - {calculo.nivelLabel}
            </dd>
          </dl>
        ) : (
          <p className="text-amber-700 bg-amber-50 rounded p-2">
            Aun faltan componentes por calcular.
          </p>
        )}
        <p className="text-xs text-inst-texto-claro">
          Al confirmar, la evaluacion quedara registrada y pasara a revision por la
          Comision Evaluadora.
        </p>
      </div>
    </Modal>
  );
}
