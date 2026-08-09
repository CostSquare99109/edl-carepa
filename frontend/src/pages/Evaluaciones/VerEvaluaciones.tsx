import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Card, Button, Badge, Alert, EmptyState, SkeletonText, Modal } from '../../components/ui';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  evaluacionIdParam?: number;
  evaluadoIdParam?: number;
}

interface EvaluacionPrevia {
  id: number;
  periodo_id: number;
  periodo_nombre: string;
  tipo: string;
  motivo_parcial_eventual: string | null;
  motivo_extraordinaria: string | null;
  evaluador_no_jefe: number;
  motivo_no_jefe: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  dias: number | null;
  nota_funcionales: number | null;
  nota_comportamentales: number | null;
  calificacion_definitiva: number | null;
  nivel_resultado: string | null;
  estado: string;
  fecha_evaluacion: string | null;
  fecha_calificacion: string | null;
  observaciones: string | null;
  motivo_anulacion?: string | null;
  es_comision_evaluadora?: number;
  comision_evaluadora_id?: number | null;
  evaluado_nombre?: string | null;
  evaluado_documento?: string | null;
  evaluador_nombre?: string | null;
  evaluador_documento?: string | null;
  resp_nombre?: string | null;
  resp_apellido?: string | null;
  resp_documento?: string | null;
  cumplio_compromisos?: string | null;
  aporte_adicional?: string | null;
  descripcion_aporte?: string | null;
  justificacion?: string | null;
  concertacion_id?: number | null;
}

interface DetalleEvaluacion extends EvaluacionPrevia {
  evaluado_nombre?: string | null;
  evaluado_documento?: string | null;
  evaluador_nombre?: string | null;
  concertacion_id?: number | null;
}

interface CompromisoDet {
  id: number;
  tipo: string;
  descripcion: string;
  resultado_esperado: string | null;
  medio_verificacion: string | null;
  peso: number;
  puntaje: number | null;
  estado: string;
  compromiso_competencia?: string | null;
  decreto?: string | null;
  conductas?: ConductaDet[];
  impacto_aporta_compromisos?: string | null;
  impacto_excede_estipulado?: string | null;
  justificacion_excede?: string | null;
  frecuencia?: string | null;
  nivel_comportamental?: string | null;
  puntaje_comportamental?: number | null;
}

interface ConductaDet {
  id: number;
  competencia_codigo?: string;
  texto: string;
  orden?: number;
  valoracion: string | null;
}

const TIPO_LABELS: Record<string, string> = {
  'parcial_primer_semestre': 'Evaluación 1er Semestre',
  'parcial_segundo_semestre': 'Evaluación 2do Semestre',
  'parcial_eventual': 'Evaluación Parcial Eventual',
  'calificacion_definitiva': 'Calificación Definitiva',
  'calificacion_extraordinaria': 'Calificación Extraordinaria',
};

const MOTIVO_LABELS: Record<string, string> = {
  'cambio_evaluador': 'Cambio de evaluador',
  'lapso_ultima_evaluacion': 'Lapso entre la última evaluación y el final del período',
  'periodo_prueba_otro_empleo': 'Período de prueba en otro empleo',
  'separacion_temporal_mas_30_dias': 'Separación temporal del empleo por más de 30 días calendario',
  'cambio_empleo_traslado': 'Cambio de empleo por traslado o reubicación',
};

const MOTIVO_NO_JEFE_LABELS: Record<string, string> = {
  'retiro_empleado_responsable': 'Retiro del empleado responsable de evaluar',
  'impedimento': 'Impedimento',
  'recusacion': 'Recusación',
};

const ESTADO_LABELS: Record<string, { label: string; tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral' }> = {
  'pendiente': { label: 'Pendiente', tone: 'warning' },
  'en_proceso': { label: 'En Proceso', tone: 'info' },
  'calificada': { label: 'Calificada', tone: 'info' },
  'aprobada_comision': { label: 'Aprobada por Comisión', tone: 'success' },
  'rechazada_comision': { label: 'Rechazada por Comisión', tone: 'danger' },
  'cerrada': { label: 'Cerrada', tone: 'neutral' },
  'anulada': { label: 'Anulada', tone: 'danger' },
};

function formatearNota(valor: unknown, decimales = 1): string {
  if (valor == null || valor === '') return '—';
  const num = typeof valor === 'number' ? valor : Number(valor);
  return isNaN(num) || !isFinite(num) ? '—' : `${num.toFixed(decimales)}%`;
}

function formatearPuntaje(valor: unknown, decimales = 1): string {
  if (valor == null || valor === '') return '—';
  const num = typeof valor === 'number' ? valor : Number(valor);
  return isNaN(num) || !isFinite(num) ? '—' : `${num.toFixed(decimales)}`;
}

function getEstadoLabel(ev: EvaluacionPrevia): { label: string; tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral' } {
  if (ev.estado === 'calificada' && ev.es_comision_evaluadora === 1) {
    return { label: 'Pendiente aprobación Comisión', tone: 'warning' };
  }
  return ESTADO_LABELS[ev.estado] || { label: ev.estado || '—', tone: 'neutral' };
}

const NIVEL_LABELS: Record<string, string> = {
  'sobresaliente': 'Sobresaliente',
  'satisfactorio': 'Satisfactorio',
  'no_satisfactorio': 'No Satisfactorio',
};

const VALORACION_FRECUENCIA_LABELS: Record<string, string> = {
  'nunca': 'Nunca',
  'algunas_veces': 'Algunas veces',
  'frecuentemente': 'Frecuentemente',
  'siempre': 'Siempre',
};

export default function VerEvaluaciones({ evaluacionIdParam, evaluadoIdParam }: Props) {
  const navigate = useNavigate();
  const { evaluacionId } = useParams();
  const { usuario } = useAuth();
  const evaluacionIdNum = evaluacionIdParam || (evaluacionId ? parseInt(evaluacionId, 10) : 0);
  const selfMode = !evaluacionIdNum && !evaluadoIdParam && !!usuario?.id;
  const resolvedEvaluadoId = evaluadoIdParam || (selfMode ? usuario!.id : 0);

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionPrevia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evaluadoInfo, setEvaluadoInfo] = useState<{ nombre: string; documento: string; cargo: string } | null>(null);

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleData, setDetalleData] = useState<DetalleEvaluacion | null>(null);
  const [detalleFuncionales, setDetalleFuncionales] = useState<CompromisoDet[]>([]);
  const [detalleComportamentales, setDetalleComportamentales] = useState<CompromisoDet[]>([]);
  const [detalleNombreEvaluado, setDetalleNombreEvaluado] = useState('');
  const [detalleDocumentoEvaluado, setDetalleDocumentoEvaluado] = useState('');
  const [detalleLoading, setDetalleLoading] = useState(false);

  const [anularOpen, setAnularOpen] = useState(false);
  const [anularData, setAnularData] = useState<EvaluacionPrevia | null>(null);
  const [anularMotivo, setAnularMotivo] = useState('');
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    if (evaluacionIdNum || resolvedEvaluadoId) {
      cargarEvaluacionesPrevias();
    }
  }, [evaluacionIdNum, resolvedEvaluadoId]);

  useEffect(() => {
    if (resolvedEvaluadoId) {
      cargarInfoEvaluado();
    }
  }, [resolvedEvaluadoId]);

  async function cargarInfoEvaluado() {
    try {
      const res: any = await api.get<any>(`/usuarios/${resolvedEvaluadoId}`);
      const data = res && typeof res === 'object' && 'data' in res ? res.data : res;
      if (data) {
        setEvaluadoInfo({
          nombre: data.nombre_completo || '',
          documento: data.documento || '',
          cargo: data.denominacion_empleo || data.cargo || '',
        });
      }
    } catch {
      // Si no se puede cargar el detalle del evaluado, usar el nombre
      // del primer registro de evaluacion cuando llegue
    }
  }

  async function cargarEvaluacionesPrevias() {
    setLoading(true);
    setError('');
    try {
      let res;
      if (evaluacionIdNum > 0) {
        res = await api.get<any>(`/evaluaciones/${evaluacionIdNum}/evaluaciones-previas`);
      } else if (resolvedEvaluadoId > 0) {
        if (selfMode) {
          res = await api.get<any>(`/evaluaciones/mias`);
        } else {
          res = await api.get<any>(`/evaluaciones/evaluado/${resolvedEvaluadoId}/previas`);
        }
      } else {
        setEvaluaciones([]);
        setLoading(false);
        return;
      }
      const data = Array.isArray(res) ? res : (res.data || []);
      setEvaluaciones(data);
      // Auto-poblar info del evaluado a partir del primer registro
      if (data.length > 0 && !evaluadoInfo) {
        const first = data[0];
        if (first.evaluado_nombre || first.evaluado_documento) {
          setEvaluadoInfo({
            nombre: first.evaluado_nombre || '',
            documento: first.evaluado_documento || '',
            cargo: '',
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar evaluaciones previas');
      toast.error(err.message || 'Error al cargar evaluaciones previas');
    } finally {
      setLoading(false);
    }
  }

  function getTipoLabel(tipo: string): string {
    return TIPO_LABELS[tipo] || tipo;
  }

  function getMotivoLabel(motivo: string | null): string {
    if (!motivo) return '—';
    return MOTIVO_LABELS[motivo] || motivo;
  }

  function getMotivoNoJefeLabel(motivo: string | null): string {
    if (!motivo) return '—';
    return MOTIVO_NO_JEFE_LABELS[motivo] || motivo;
  }

  function getEstadoInfo(estado: string, ev?: EvaluacionPrevia) {
    if (ev) {
      return getEstadoLabel(ev);
    }
    return ESTADO_LABELS[estado] || { label: estado, tone: 'neutral' };
  }

  function getNivelLabel(nivel: string | null): string {
    if (!nivel) return '—';
    return NIVEL_LABELS[nivel] || nivel;
  }

  function parseDateLocal(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateLocal(dateStr: string | null): string {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
  }

  function calcularDias(inicio: string | null, fin: string | null): number {
    if (!inicio || !fin) return 0;
    const f1 = parseDateLocal(inicio);
    const f2 = parseDateLocal(fin);
    const diff = f2.getTime() - f1.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  async function handleVerDetalle(evalData: EvaluacionPrevia) {
    setDetalleOpen(true);
    setDetalleLoading(true);
    setDetalleData(null);
    setDetalleFuncionales([]);
    setDetalleComportamentales([]);
    setDetalleNombreEvaluado('');
    setDetalleDocumentoEvaluado('');
    try {
      const [verRes, compRes] = await Promise.all([
        api.get<any>(`/evaluaciones/${evalData.id}`),
        api.get<any>(`/evaluaciones/${evalData.id}/compromisos`),
      ]);
      const verRaw = verRes && typeof verRes === 'object' && 'data' in verRes ? verRes.data : verRes;
      const verObj: DetalleEvaluacion = verRaw && typeof verRaw === 'object' ? verRaw : (evalData as DetalleEvaluacion);
      const payload: DetalleEvaluacion = { ...evalData, ...verObj };
      setDetalleData(payload);
      if (verObj?.evaluado_nombre) setDetalleNombreEvaluado(String(verObj.evaluado_nombre));
      if (verObj?.evaluado_documento) setDetalleDocumentoEvaluado(String(verObj.evaluado_documento));

      const compRaw = compRes && typeof compRes === 'object' && 'data' in compRes ? compRes.data : compRes;
      const compArr: CompromisoDet[] = Array.isArray(compRaw) ? compRaw
        : (compRaw && Array.isArray(compRaw.funcionales))
          ? [...(compRaw.funcionales || []), ...(compRaw.comportamentales || [])]
          : [];
      setDetalleFuncionales(compArr.filter(c => c.tipo === 'funcional' || c.tipo === 'Funcional'));
      setDetalleComportamentales(compArr.filter(c => c.tipo === 'comportamental' || c.tipo === 'Comportamental'));
    } catch (err: any) {
      setDetalleData(evalData as DetalleEvaluacion);
      toast.error(err?.message || 'No se pudo cargar el detalle completo. Mostrando resumen.');
    } finally {
      setDetalleLoading(false);
    }
  }

  function cerrarDetalle() {
    setDetalleOpen(false);
    setDetalleData(null);
    setDetalleFuncionales([]);
    setDetalleComportamentales([]);
  }

  async function handleDescargarPDF(evalData: EvaluacionPrevia) {
    try {
      api.download(`/reportes/evaluacion-pdf/${evalData.id}`, `evaluacion_${evalData.id}.pdf`);
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo descargar el PDF de la evaluación.');
    }
  }

  function handleOpenAnular(evalData: EvaluacionPrevia) {
    setAnularData(evalData);
    setAnularMotivo('');
    setAnularOpen(true);
  }

  function handleCloseAnular() {
    if (anulando) return;
    setAnularOpen(false);
    setAnularData(null);
    setAnularMotivo('');
  }

  async function handleConfirmarAnular() {
    if (!anularData) return;
    if (!anularMotivo.trim() || anularMotivo.trim().length < 10) {
      toast.error('Indique un motivo de anulación de al menos 10 caracteres.');
      return;
    }
    setAnulando(true);
    try {
      await api.put<any>(`/evaluaciones/${anularData.id}/anular`, { motivo: anularMotivo.trim() });
      toast.success('Evaluación anulada correctamente.');
      handleCloseAnular();
      await cargarEvaluacionesPrevias();
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo anular la evaluación.');
    } finally {
      setAnulando(false);
    }
  }

  function esAnulable(estado: string): boolean {
    return !['cerrada', 'aprobada_comision', 'anulada'].includes(estado);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonText lines={3} />
        <SkeletonText lines={10} />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert tone="danger">{error}</Alert>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          <span className="material-icons text-sm mr-1">arrow_back</span>
          Volver
        </Button>
      </Card>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<span className="material-icons text-3xl">assessment</span>}
          title="Sin evaluaciones previas"
          description="Este servidor no tiene evaluaciones registradas en períodos anteriores."
          action={
            <Button variant="outline" onClick={() => navigate(-1)}>
              <span className="material-icons text-sm mr-1">arrow_back</span>
              Volver
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con info del evaluado */}
      <Card className="border-l-4 border-l-inst-azul">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="edl-section-title">Evaluaciones del Servidor</h2>
            {evaluadoInfo && (evaluadoInfo.nombre || evaluadoInfo.documento) ? (
              <div className="mt-1 text-sm text-inst-texto-claro">
                <p className="font-medium text-inst-texto">
                  {evaluadoInfo.nombre || 'Servidor'}
                  {evaluadoInfo.documento && (
                    <span className="font-mono text-inst-texto-claro ml-2">CC {evaluadoInfo.documento}</span>
                  )}
                </p>
                {evaluadoInfo.cargo && <p className="text-xs">{evaluadoInfo.cargo}</p>}
              </div>
            ) : (
              <p className="text-sm text-inst-texto-claro mt-1">
                Historial de evaluaciones realizadas en este y anteriores períodos
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <span className="material-icons text-sm mr-1">arrow_back</span>
            Volver a Evaluar
          </Button>
        </div>
      </Card>

      {/* Tabla de evaluaciones previas */}
      <Card>
        <div className="overflow-x-auto">
          <table className="edl-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Tipo de Evaluación</th>
                <th>Motivo / Causal</th>
                <th>Fechas</th>
                <th>Días</th>
                <th>Notas Func. / Comp.</th>
                <th>Calif. Definitiva</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th className="w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map((ev) => {
                const estadoInfo = getEstadoInfo(ev.estado, ev);
                const dias = calcularDias(ev.fecha_inicio, ev.fecha_fin);
                return (
                  <tr key={ev.id}>
                    <td className="font-mono text-sm">{ev.periodo_nombre || `#${ev.periodo_id}`}</td>
                    <td className="text-sm">{getTipoLabel(ev.tipo)}</td>
                    <td className="text-sm max-w-[200px] truncate" title={getMotivoLabel(ev.motivo_parcial_eventual) + (ev.motivo_extraordinaria ? ' - ' + ev.motivo_extraordinaria : '')}>
                      {ev.tipo === 'parcial_eventual' && getMotivoLabel(ev.motivo_parcial_eventual)}
                      {ev.tipo === 'calificacion_extraordinaria' && ev.motivo_extraordinaria && (
                        <span className="block text-xs text-inst-texto-claro mt-1">{ev.motivo_extraordinaria}</span>
                      )}
                      {ev.evaluador_no_jefe && (
                        <span className="block text-xs text-inst-rojo mt-1">
                          No es jefe inmediato: {getMotivoNoJefeLabel(ev.motivo_no_jefe)}
                        </span>
                      )}
                    </td>
                    <td className="text-sm whitespace-nowrap">
                      {formatDateLocal(ev.fecha_inicio)}
                      {' '}
                      <span className="text-inst-texto-claro">→</span>
                      {' '}
                      {formatDateLocal(ev.fecha_fin)}
                    </td>
                    <td className="text-center text-sm">{dias > 0 ? dias : '—'}</td>
                    <td className="text-center text-sm">
                      {formatearNota(ev.nota_funcionales, 2)}
                      {' / '}
                      {formatearNota(ev.nota_comportamentales, 2)}
                    </td>
                    <td className="text-center font-bold text-lg">
                      {formatearNota(ev.calificacion_definitiva, 2)}
                    </td>
                    <td className="text-center">
                      <Badge tone={ev.nivel_resultado === 'sobresaliente' ? 'success' : ev.nivel_resultado === 'satisfactorio' ? 'info' : ev.nivel_resultado === 'no_satisfactorio' ? 'danger' : 'neutral'}>
                        {getNivelLabel(ev.nivel_resultado)}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge tone={estadoInfo.tone}>{estadoInfo.label}</Badge>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerDetalle(ev)}
                          title="Ver detalle"
                        >
                          <span className="material-icons text-base">visibility</span>
                        </Button>
                        {esAnulable(ev.estado) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAnular(ev)}
                            title="Anular evaluación"
                          >
                            <span className="material-icons text-base text-inst-rojo">block</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {detalleOpen && (
        <Modal
          open
          onClose={cerrarDetalle}
          title={`Detalle de evaluación #${detalleData?.id ?? ''}`}
          size="xl"
        >
          {detalleLoading && (
            <div className="space-y-4">
              <SkeletonText lines={3} />
              <SkeletonText lines={10} />
            </div>
          )}

          {!detalleLoading && detalleData && (
            <div className="space-y-5">
              <Card className="border-l-4 border-l-inst-azul">
                <h3 className="font-heading font-semibold text-inst-azul mb-3">
                  Información general
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Periodicidad</p>
                    <p>{detalleData.periodo_nombre || (detalleData.periodo_id ? `Periodo #${detalleData.periodo_id}` : '—')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Tipo de evaluación</p>
                    <p>{getTipoLabel(detalleData.tipo)}</p>
                  </div>
                  {detalleData.tipo === 'parcial_primer_semestre' && (
                    <div className="col-span-2">
                      <p className="text-xs text-inst-texto-claro uppercase">Período evaluado</p>
                      <p>1 de febrero — 31 de julio (Acuerdo 617 de 2018, art. 6)</p>
                    </div>
                  )}
                  {detalleData.tipo === 'parcial_segundo_semestre' && (
                    <div className="col-span-2">
                      <p className="text-xs text-inst-texto-claro uppercase">Período evaluado</p>
                      <p>1 de agosto — 31 de enero del año siguiente (Acuerdo 617 de 2018, art. 6)</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Motivo / Causal</p>
                    <p>
                      {detalleData.tipo === 'parcial_eventual' && getMotivoLabel(detalleData.motivo_parcial_eventual)}
                      {detalleData.tipo === 'calificacion_extraordinaria' && (detalleData.motivo_extraordinaria || '—')}
                      {detalleData.tipo !== 'parcial_eventual' && detalleData.tipo !== 'calificacion_extraordinaria' && '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Estado</p>
                    <Badge tone={getEstadoInfo(detalleData.estado, detalleData).tone}>
                      {getEstadoInfo(detalleData.estado, detalleData).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Fecha inicio</p>
                    <p>{detalleData.fecha_inicio ? formatDateLocal(detalleData.fecha_inicio) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Fecha fin</p>
                    <p>{detalleData.fecha_fin ? formatDateLocal(detalleData.fecha_fin) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Días evaluados</p>
                    <p>{calcularDias(detalleData.fecha_inicio, detalleData.fecha_fin) > 0 ? calcularDias(detalleData.fecha_inicio, detalleData.fecha_fin) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Evaluador no es jefe inmediato</p>
                    <p>
                      {detalleData.evaluador_no_jefe ? `Sí — ${getMotivoNoJefeLabel(detalleData.motivo_no_jefe)}` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Nota funcionales</p>
                    <p>{formatearNota(detalleData.nota_funcionales, 2)}</p>
                   </div>
                   <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Nota comportamentales</p>
                    <p>{formatearNota(detalleData.nota_comportamentales, 2)}</p>
                   </div>
                   <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Definitiva</p>
                    <p className="text-xl font-bold text-inst-azul">
                      {formatearNota(detalleData.calificacion_definitiva, 2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Nivel resultado</p>
                    <Badge tone={detalleData.nivel_resultado === 'sobresaliente' ? 'success' : detalleData.nivel_resultado === 'satisfactorio' ? 'info' : detalleData.nivel_resultado === 'no_satisfactorio' ? 'danger' : 'neutral'}>
                      {getNivelLabel(detalleData.nivel_resultado)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-inst-texto-claro uppercase">Fecha de calificación</p>
                    <p>{detalleData.fecha_calificacion ? new Date(detalleData.fecha_calificacion.replace(' ', 'T')).toLocaleDateString('es-CO') : '—'}</p>
                  </div>
                  {detalleData.cumplio_compromisos && (
                    <div>
                      <p className="text-xs text-inst-texto-claro uppercase">Cumplió compromisos</p>
                      <p>{detalleData.cumplio_compromisos === 'si' ? 'Sí' : detalleData.cumplio_compromisos === 'moderadamente' ? 'Moderadamente' : detalleData.cumplio_compromisos === 'no' ? 'No' : detalleData.cumplio_compromisos}</p>
                    </div>
                  )}
                  {detalleData.aporte_adicional && (
                    <div>
                      <p className="text-xs text-inst-texto-claro uppercase">Aporte adicional</p>
                      <p>{detalleData.aporte_adicional === 'si' ? 'Sí' : detalleData.aporte_adicional === 'no' ? 'No' : detalleData.aporte_adicional}</p>
                    </div>
                  )}
                  {detalleData.justificacion && (
                    <div className="col-span-2">
                      <p className="text-xs text-inst-texto-claro uppercase">Justificación del evaluador</p>
                      <p className="italic text-inst-texto">"{detalleData.justificacion}"</p>
                    </div>
                  )}
                  {detalleData.es_comision_evaluadora === 1 && (
                    <div className="col-span-2">
                      <p className="text-xs text-inst-texto-claro uppercase">Aprobada por Comisión Evaluadora</p>
                      <p>
                        {detalleData.resp_nombre || detalleData.resp_apellido
                          ? `${(detalleData.resp_nombre || '').trim()} ${(detalleData.resp_apellido || '').trim()}`.trim() +
                            (detalleData.resp_documento ? ` (CC ${detalleData.resp_documento})` : '')
                          : 'Servidor de libre nombramiento y remoción (Comisión Evaluadora)'}
                      </p>
                      <p className="text-xs text-inst-texto-claro mt-1">
                        La evaluación queda en firme tras la aprobación de la Comisión Evaluadora (Acuerdo 617 de 2018).
                      </p>
                    </div>
                  )}
                  {detalleData.estado === 'anulada' && detalleData.motivo_anulacion && (
                    <div className="col-span-2">
                      <p className="text-xs text-inst-texto-claro uppercase">Motivo de anulación</p>
                      <p className="italic text-inst-rojo">{detalleData.motivo_anulacion}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-inst-texto-claro uppercase">Observaciones</p>
                    <p>{detalleData.observaciones || '—'}</p>
                  </div>
                </div>
              </Card>

              {detalleFuncionales.length > 0 && (
                <Card>
                  <h3 className="font-heading font-semibold text-inst-azul mb-3">
                    Compromisos funcionales
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="edl-table w-full">
                      <thead>
                        <tr>
                          <th className="text-left">Compromiso</th>
                          <th className="text-center w-20">Peso</th>
                          <th className="text-center w-24">Calificación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleFuncionales.map((c) => (
                          <tr key={c.id}>
                            <td className="text-sm">{c.descripcion}</td>
                            <td className="text-center text-sm">{c.peso}%</td>
                            <td className="text-center text-sm font-semibold">
                              {formatearNota(c.calificacion)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {detalleComportamentales.length > 0 && (
                <Card>
                  <h3 className="font-heading font-semibold text-inst-azul mb-3">
                    Compromisos comportamentales
                  </h3>
                  <div className="space-y-3">
                    {detalleComportamentales.map((c) => (
                      <div key={c.id} className="border border-inst-borde rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {c.competencia_nombre || c.compromiso_competencia || c.descripcion}
                            {c.decreto && <span className="text-xs text-inst-texto-claro ml-1">(Decreto {c.decreto})</span>}
                          </p>
                          <Badge tone="info">
                            Puntaje: {c.puntaje_comportamental !== null && c.puntaje_comportamental !== undefined
                              ? `${c.puntaje_comportamental} / 15`
                              : (c.puntaje !== null ? `${c.puntaje} / 15` : '—')}
                          </Badge>
                        </div>
                        {c.conductas && c.conductas.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {c.conductas.map((cond) => (
                              <li key={cond.id} className="pl-3 border-l-2 border-inst-azul-oc-light flex items-center justify-between gap-2">
                                <span className="flex-1">{cond.texto}</span>
                                <span className="text-xs text-inst-texto-claro">
                                  {cond.valoracion
                                    ? VALORACION_FRECUENCIA_LABELS[cond.valoracion] || cond.valoracion
                                    : 'Sin calificar'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {(c.impacto_aporta_compromisos || c.impacto_excede_estipulado) && (
                          <div className="mt-2 text-xs text-inst-texto-claro space-y-1">
                            {c.impacto_aporta_compromisos && (
                              <p>
                                <span className="font-semibold">Aporte a compromisos: </span>
                                {c.impacto_aporta_compromisos === 'si' ? 'Sí' : c.impacto_aporta_compromisos === 'moderadamente' ? 'Moderadamente' : 'No'}
                              </p>
                            )}
                            {c.impacto_excede_estipulado && (
                              <p>
                                <span className="font-semibold">Excede lo estipulado: </span>
                                {c.impacto_excede_estipulado === 'si' ? 'Sí' : 'No'}
                              </p>
                            )}
                            {c.justificacion_excede && c.justificacion_excede.trim().length > 0 && (
                              <p className="pl-2 italic">"{c.justificacion_excede}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end mt-4 gap-2">
            {detalleData?.id && (
              <Button variant="outline" onClick={() => detalleData && handleDescargarPDF(detalleData as unknown as EvaluacionPrevia)}>
                <span className="material-icons text-sm mr-1">picture_as_pdf</span>
                Descargar PDF
              </Button>
            )}
            <Button variant="outline" onClick={cerrarDetalle}>Cerrar</Button>
          </div>
        </Modal>
      )}

      {anularOpen && anularData && (
        <Modal
          open
          onClose={handleCloseAnular}
          title="Anular evaluación"
          size="md"
        >
          <Alert tone="warning" className="mb-4">
            Esta acción marca la evaluación como <strong>anulada</strong> y no podrá revertirse.
            Use esta opción únicamente cuando existan motivos justificados (Acuerdo 617 de 2018).
          </Alert>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Servidor:</strong> {evaluadoInfo?.nombre || '—'}
              {evaluadoInfo?.documento && <span className="font-mono text-inst-texto-claro ml-2">CC {evaluadoInfo.documento}</span>}
            </p>
            <p>
              <strong>Tipo:</strong> {getTipoLabel(anularData.tipo)} — <strong>Período:</strong> {anularData.periodo_nombre || `#${anularData.periodo_id}`}
            </p>
            <p>
              <strong>Estado actual:</strong>{' '}
              <Badge tone={getEstadoInfo(anularData.estado, anularData).tone}>{getEstadoInfo(anularData.estado, anularData).label}</Badge>
            </p>
            <div>
              <label className="block text-xs font-semibold text-inst-texto uppercase mb-1">
                Motivo de anulación (mínimo 10 caracteres)
              </label>
              <textarea
                value={anularMotivo}
                onChange={e => setAnularMotivo(e.target.value)}
                rows={4}
                className="edl-input w-full"
                placeholder="Describa el motivo por el cual se anula la evaluación..."
              />
              <p className="text-xs text-inst-texto-claro mt-1">
                {anularMotivo.trim().length} / 10 caracteres
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={handleCloseAnular} disabled={anulando}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmarAnular}
              disabled={anulando || anularMotivo.trim().length < 10}
            >
              {anulando ? 'Anulando...' : 'Confirmar anulación'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}