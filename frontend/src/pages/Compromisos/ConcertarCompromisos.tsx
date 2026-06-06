import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

interface Evaluado {
  id: number;
  documento: string;
  nombre_completo: string;
  primer_nombre: string;
  nivel: string;
  denominacion: string;
  codigo: string;
  grado: string;
  evaluacion_id: number;
  periodo_id: number;
  periodo_nombre: string;
  es_comision_evaluadora: number;
}

interface Meta {
  id: number;
  descripcion: string;
  entidad_id: number;
  entidad_nombre: string;
}

interface CompromisoFuncional {
  id?: number;
  meta_id: number;
  meta_nombre: string;
  descripcion: string;
  peso: number;
}

interface CompetenciaComportamental {
  id: number;
  nombre: string;
  decreto: string;
  descripcion: string;
}

interface CompromisoComportamental {
  id?: number;
  competencia_id: number;
  competencia_nombre: string;
  decreto: string;
  es_propuesto_jefe: boolean;
}

export default function ConcertarCompromisos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;

  // Periodo
  const [periodos, setPeriodos] = useState<{ id: number; nombre: string }[]>([]);
  const [periodoId, setPeriodoId] = useState<number>(0);

  // Comisión evaluadora
  const [aplicaComision, setAplicaComision] = useState(false);
  const [usuariosComision, setUsuariosComision] = useState<{ id: number; nombre: string }[]>([]);
  const [comisionSeleccionada, setComisionSeleccionada] = useState<number>(0);

  // No es jefe inmediato
  const [noEsJefe, setNoEsJefe] = useState(false);
  const [motivoCambio, setMotivoCambio] = useState('');

  // Compromisos funcionales
  const [funcionales, setFuncionales] = useState<CompromisoFuncional[]>([]);
  const [showModalFuncional, setShowModalFuncional] = useState(false);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [funcionalEditIndex, setFuncionalEditIndex] = useState<number | null>(null);

  // Modal funcional fields
  const [fMetaId, setFMetaId] = useState<number>(0);
  const [fDescripcion, setFDescripcion] = useState('');
  const [fPeso, setFPeso] = useState<number>(0);

  // Compromisos comportamentales
  const [competencias, setCompetencias] = useState<CompetenciaComportamental[]>([]);
  const [comportamentales, setComportamentales] = useState<CompromisoComportamental[]>([]);
  const [showModalComportamental, setShowModalComportamental] = useState(false);
  const [selectedCompetencias, setSelectedCompetencias] = useState<number[]>([]);
  const [propuestoJefeMap, setPropuestoJefeMap] = useState<Record<number, boolean>>({});

  // Tipo concertación
  const [tipoConcertacion, setTipoConcertacion] = useState<'concertacion_evaluador_evaluado' | 'fijados_evaluador'>('concertacion_evaluador_evaluado');

  // Alerta inicial
  const [showAlerta, setShowAlerta] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (evaluado) {
      setShowAlerta(true);
      setTimeout(() => setShowAlerta(false), 5000);
    }
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [periodosRes, competenciasRes] = await Promise.all([
       api.get('/periodos'),
       api.get('/competencias'),
      ]);
       const periodosArray: any[] = Array.isArray(periodosRes) ? periodosRes : [];
       setPeriodos(periodosArray);
       const competenciasArray: any[] = Array.isArray(competenciasRes) ? competenciasRes : [];
       setCompetencias(competenciasArray);

      // Si hay evaluado, setear periodo
      if (evaluado?.periodo_id) {
        setPeriodoId(evaluado.periodo_id);
      }

      // Cargar usuarios para comisión evaluadora
      try {
        const usersRes = await api.get<any>('/usuarios?por_pagina=100');
        const users = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);
        setUsuariosComision(users.map((u: any) => ({ id: u.id, nombre: `${u.nombres} ${u.apellidos}` })));
      } catch {}

      // Cargar metas del periodo
      if (evaluado?.periodo_id) {
        try {
          const metasRes = await api.get<any>(`/periodos/${evaluado.periodo_id}/metas`);
          const m = Array.isArray(metasRes) ? metasRes : (metasRes?.data || []);
          setMetas(m);
        } catch {}
      }

      // Cargar compromisos existentes de la evaluación
      if (evaluacionId) {
        try {
          const compRes = await api.get<any>(`/compromisos/evaluacion/${evaluacionId}`);
          if (compRes?.funcionales) {
            setFuncionales(compRes.funcionales.map((c: any) => ({
              id: c.id,
              meta_id: c.meta_id || 0,
              meta_nombre: metas.find((m: Meta) => m.id === c.meta_id)?.descripcion || 'Sin meta',
              descripcion: c.descripcion,
              peso: parseFloat(c.peso) || 0,
            })));
          }
          if (compRes?.comportamentales) {
            setComportamentales(compRes.comportamentales.map((c: any) => ({
              id: c.id,
              competencia_id: c.competencia_id || 0,
              competencia_nombre: c.competencia_nombre || c.descripcion,
              decreto: c.competencia_decreto || '',
              es_propuesto_jefe: !!c.es_propuesto_jefe,
            })));
          }
        } catch {}
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }

  // Suma de pesos funcionales
  const sumaPesosFuncionales = funcionales.reduce((sum, f) => sum + f.peso, 0);

  function openModalFuncional(editIdx: number | null = null) {
    if (editIdx !== null) {
      const f = funcionales[editIdx];
      setFMetaId(f.meta_id);
      setFDescripcion(f.descripcion);
      setFPeso(f.peso);
    } else {
      setFMetaId(0);
      setFDescripcion('');
      setFPeso(0);
    }
    setFuncionalEditIndex(editIdx);
    setShowModalFuncional(true);
  }

  function guardarFuncional() {
    if (!fDescripcion.trim()) {
      setMensaje('La descripcion del compromiso es requerida');
      return;
    }
    if (fPeso <= 0) {
      setMensaje('El peso debe ser mayor a 0');
      return;
    }
    if (fPeso > 100) {
      setMensaje('El peso no puede ser mayor a 100');
      return;
    }

    const metaNombre = metas.find(m => m.id === fMetaId)?.descripcion || 'Sin meta asociada';

    if (funcionalEditIndex !== null) {
      // Editar
      const nuevos = [...funcionales];
      nuevos[funcionalEditIndex] = {
        ...nuevos[funcionalEditIndex],
        meta_id: fMetaId,
        meta_nombre: metaNombre,
        descripcion: fDescripcion.trim(),
        peso: fPeso,
      };
      setFuncionales(nuevos);
    } else {
      // Nuevo - máximo 5
      if (funcionales.length >= 5) {
        setMensaje('No se pueden agregar más de 5 compromisos funcionales');
        return;
      }
      setFuncionales([...funcionales, {
        meta_id: fMetaId,
        meta_nombre: metaNombre,
        descripcion: fDescripcion.trim(),
        peso: fPeso,
      }]);
    }

    setShowModalFuncional(false);
    setMensaje('');
  }

	async function eliminarFuncional(idx: number) {
		const comp = funcionales[idx];
		// Si ya existe en BD, eliminar del backend
		if (comp.id) {
			try {
				await api.delete(`/compromisos/funcional/${comp.id}`);
			} catch (err: any) {
				setMensaje('Error al eliminar compromiso funcional: ' + (err.message || ''));
				return;
			}
		}
		setFuncionales(funcionales.filter((_, i) => i !== idx));
	}

  function toggleCompetencia(id: number) {
    if (selectedCompetencias.includes(id)) {
      setSelectedCompetencias(selectedCompetencias.filter(c => c !== id));
    } else {
      if (selectedCompetencias.length >= 5) return;
      setSelectedCompetencias([...selectedCompetencias, id]);
    }
  }

  function guardarComportamentales() {
    if (selectedCompetencias.length < 3) {
      setMensaje('Debe seleccionar al menos 3 competencias comportamentales');
      return;
    }
    if (selectedCompetencias.length > 5) {
      setMensaje('No puede seleccionar más de 5 competencias comportamentales');
      return;
    }

    const nuevos: CompromisoComportamental[] = selectedCompetencias.map(compId => {
      const comp = competencias.find(c => c.id === compId)!;
      return {
        competencia_id: comp.id,
        competencia_nombre: comp.nombre,
        decreto: comp.decreto,
        es_propuesto_jefe: propuestoJefeMap[comp.id] || false,
      };
    });

    setComportamentales(nuevos);
    setShowModalComportamental(false);
    setSelectedCompetencias([]);
    setPropuestoJefeMap({});
    setMensaje('');
  }

	async function eliminarComportamental(idx: number) {
		const comp = comportamentales[idx];
		// Si ya existe en BD, eliminar del backend
		if (comp.id) {
			try {
				await api.delete(`/compromisos/comportamental/${comp.id}`);
			} catch (err: any) {
				setMensaje('Error al eliminar compromiso comportamental: ' + (err.message || ''));
				return;
			}
		}
		setComportamentales(comportamentales.filter((_, i) => i !== idx));
	}

  async function confirmarConcertacion() {
    if (!evaluacionId) return;

    // Validaciones
    if (funcionales.length < 1) {
      setMensaje('Debe ingresar al menos 1 compromiso funcional');
      return;
    }
    if (funcionales.length > 5) {
      setMensaje('No puede tener más de 5 compromisos funcionales');
      return;
    }
    if (Math.abs(sumaPesosFuncionales - 100) > 0.01) {
      setMensaje(`La suma de los pesos funcionales debe ser exactamente 100. Actualmente suma: ${sumaPesosFuncionales}`);
      return;
    }
    if (comportamentales.length < 3) {
      setMensaje('Debe ingresar al menos 3 compromisos comportamentales');
      return;
    }
    if (comportamentales.length > 5) {
      setMensaje('No puede tener más de 5 compromisos comportamentales');
      return;
    }

    setSaving(true);
    setMensaje('');

    try {
      // 1. Guardar compromisos funcionales
      for (const f of funcionales) {
        await api.post('/compromisos/funcional', {
          evaluacion_id: parseInt(evaluacionId),
          meta_id: f.meta_id || null,
          descripcion: f.descripcion,
          peso: f.peso,
          tipo_concertacion: tipoConcertacion,
          no_es_jefe_inmediato: noEsJefe ? 1 : 0,
          motivo_cambio_evaluador: noEsJefe ? motivoCambio : null,
          ...(f.id ? { id: f.id } : {}),
        });
      }

      // 2. Guardar compromisos comportamentales
      await api.post('/compromisos/comportamental', {
        evaluacion_id: parseInt(evaluacionId),
        tipo_concertacion: tipoConcertacion,
        competencias: comportamentales.map(c => ({
          competencia_id: c.competencia_id,
          es_propuesto_jefe: c.es_propuesto_jefe ? 1 : 0,
        })),
      });

      // 3. Confirmar concertación
      await api.put(`/compromisos/confirmar-concertacion/${evaluacionId}`);

      setMensaje('Concertación de compromisos confirmada exitosamente');
      setTimeout(() => navigate('/compromisos-y-competencias'), 2000);
    } catch (err: any) {
      setMensaje(err.message || 'Error al guardar la concertación');
    } finally {
      setSaving(false);
    }
  }

  if (!evaluado) {
    return (
      <div className="edl-card text-center py-8">
        <p className="text-inst-texto-claro">No se encontraron datos del evaluado. Vuelva a buscar.</p>
        <button onClick={() => navigate('/compromisos-y-competencias')} className="edl-btn-primary mt-4">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Alerta inicial de 5 segundos */}
      {showAlerta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 text-center">
            <span className="material-icons text-4xl text-yellow-500 mb-2">warning</span>
            <h3 className="font-heading font-bold text-inst-azul mb-2">Recuerde</h3>
            <p className="text-sm text-inst-texto">
              El evaluado <strong>{evaluado.primer_nombre}</strong> se deben ingresar
              minimo <strong>1</strong> y maximo <strong>5</strong> compromisos funcionales
              y para los compromisos comportamentales entre <strong>3</strong> y <strong>5</strong>.
            </p>
            <button onClick={() => setShowAlerta(false)} className="edl-btn-primary mt-4 text-sm">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/compromisos-y-competencias')}
          className="edl-btn-secondary flex items-center gap-1 text-sm"
        >
          <span className="material-icons text-lg">arrow_back</span>
          Volver
        </button>
        <h2 className="edl-section-title">
          Concertacion de compromisos para {evaluado.nombre_completo}
        </h2>
      </div>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PERIODO */}
          <div className="edl-card">
            <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
              <span className="material-icons">calendar_today</span>
              Periodo
            </h3>

            <div className="space-y-4">
              <div>
                <label className="edl-label">Seleccione un periodo</label>
                <select
                  value={periodoId}
                  onChange={e => setPeriodoId(Number(e.target.value))}
                  className="edl-input"
                >
                  <option value={0}>--</option>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Comisión evaluadora */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aplicaComision}
                    onChange={e => setAplicaComision(e.target.checked)}
                    className="w-4 h-4 accent-inst-azul"
                  />
                  <div>
                    <span className="text-sm font-medium text-inst-texto">Aplica comision evaluadora?</span>
                    <p className="text-xs text-inst-texto-claro">Seleccione si aplica comision evaluadora</p>
                  </div>
                </label>
                {aplicaComision && (
                  <div className="mt-3 pl-6 border-l-2 border-inst-azul/20">
                    <label className="edl-label">Comision evaluadora - Seleccione un usuario</label>
                    <select
                      value={comisionSeleccionada}
                      onChange={e => setComisionSeleccionada(Number(e.target.value))}
                      className="edl-input"
                    >
                      <option value={0}>Seleccione un integrante</option>
                      {usuariosComision.map(u => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* No es jefe inmediato */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noEsJefe}
                    onChange={e => { setNoEsJefe(e.target.checked); if (!e.target.checked) setMotivoCambio(''); }}
                    className="w-4 h-4 accent-inst-azul"
                  />
                  <div>
                    <span className="text-sm font-medium text-inst-texto">No es el jefe inmediato?</span>
                    <p className="text-xs text-inst-texto-claro">Seleccione si NO es el jefe inmediato del evaluado</p>
                  </div>
                </label>
                {noEsJefe && (
                  <div className="mt-3 pl-6 border-l-2 border-inst-azul/20">
                    <label className="edl-label">Motivo cambio evaluador</label>
                    <select
                      value={motivoCambio}
                      onChange={e => setMotivoCambio(e.target.value)}
                      className="edl-input"
                    >
                      <option value="">-- Seleccione un motivo --</option>
                      <option value="retiro_empleado">Retiro del empleado responsable de evaluar</option>
                      <option value="impedimento">Impedimento</option>
                      <option value="recusacion">Recusacion</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COMPROMISOS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compromisos funcionales */}
            <div className="edl-card">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">work</span>
                Compromisos funcionales
              </h3>

              <button
                onClick={() => openModalFuncional(null)}
                className="edl-btn-primary flex items-center gap-2 mb-4"
              >
                <span className="material-icons text-lg">add</span>
                Ingresar compromiso funcional
              </button>

              {/* Tabla de funcionales */}
              {funcionales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-inst-azul/5 text-left">
                        <th className="px-3 py-2 font-medium text-inst-azul">Meta</th>
                        <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                        <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
                        <th className="px-3 py-2 font-medium text-inst-azul text-center">Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionales.map((f, idx) => (
                        <tr key={idx} className="border-b border-inst-borde">
                          <td className="px-3 py-2 text-inst-texto">{f.meta_nombre}</td>
                          <td className="px-3 py-2 text-inst-texto">{f.descripcion}</td>
                          <td className="px-3 py-2 text-center font-semibold">{f.peso}%</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openModalFuncional(idx)}
                                className="p-1 rounded hover:bg-inst-gris text-inst-azul"
                                title="Editar"
                              >
                                <span className="material-icons text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => eliminarFuncional(idx)}
                                className="p-1 rounded hover:bg-red-50 text-red-500"
                                title="Eliminar"
                              >
                                <span className="material-icons text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-inst-azul/5">
                        <td colSpan={2} className="px-3 py-2 font-semibold text-inst-azul text-right">Total pesos:</td>
                        <td className="px-3 py-2 text-center font-bold text-inst-azul">{sumaPesosFuncionales}%</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                  {Math.abs(sumaPesosFuncionales - 100) > 0.01 && sumaPesosFuncionales > 0 && (
                    <div className={`mt-2 p-2 rounded text-xs font-medium ${
                      sumaPesosFuncionales > 100
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {sumaPesosFuncionales > 100
                        ? `La suma de los pesos es mayor a 100 (${sumaPesosFuncionales}%)`
                        : `La suma de los pesos es menor a 100 (${sumaPesosFuncionales}%)`
                      }
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-inst-texto-claro text-center py-4">
                  No hay compromisos funcionales registrados
                </p>
              )}
            </div>

            {/* Compromisos comportamentales */}
            <div className="edl-card">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">psychology</span>
                Compromisos comportamentales
              </h3>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  Recuerde que para la concertacion de compromisos, TODAS las competencias
                  comportamentales a evaluar se deben seleccionar de las contempladas en el
                  <strong> Decreto 2539 de 2005</strong> o bien en el
                  <strong> Decreto 815 de 2018</strong>, segun corresponda.
                </p>
              </div>

              <button
                onClick={() => setShowModalComportamental(true)}
                className="edl-btn-primary flex items-center gap-2 mb-4"
              >
                <span className="material-icons text-lg">add</span>
                Ingresar compromiso comportamental
              </button>

              {/* Tabla de comportamentales */}
              {comportamentales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-inst-azul/5 text-left">
                        <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                        <th className="px-3 py-2 font-medium text-inst-azul text-center">Opciones</th>
                        <th className="px-3 py-2 font-medium text-inst-azul text-center">Es propuesto por el jefe de entidad?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comportamentales.map((c, idx) => (
                        <tr key={idx} className="border-b border-inst-borde">
                          <td className="px-3 py-2 text-inst-texto">
                            {c.competencia_nombre}
                            <span className="text-xs text-inst-texto-claro ml-1">({c.decreto === '2539/2005' ? 'D.2539/2005' : 'D.815/2018'})</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => eliminarComportamental(idx)}
                              className="p-1 rounded hover:bg-red-50 text-red-500"
                              title="Eliminar"
                            >
                              <span className="material-icons text-lg">delete</span>
                            </button>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={c.es_propuesto_jefe}
                              onChange={e => {
                                const nuevos = [...comportamentales];
                                nuevos[idx] = { ...nuevos[idx], es_propuesto_jefe: e.target.checked };
                                setComportamentales(nuevos);
                              }}
                              className="w-4 h-4 accent-inst-azul"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-inst-texto-claro text-center py-4">
                  No hay compromisos comportamentales registrados
                </p>
              )}
            </div>

            {/* Tipo de concertación */}
            <div className="edl-card">
              <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
                <span className="material-icons">handshake</span>
                Tipo de concertacion
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoConcertacion"
                    checked={tipoConcertacion === 'concertacion_evaluador_evaluado'}
                    onChange={() => setTipoConcertacion('concertacion_evaluador_evaluado')}
                    className="w-4 h-4 accent-inst-azul"
                  />
                  <span className="text-sm text-inst-texto">Concertacion por parte del Evaluador y el Evaluado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoConcertacion"
                    checked={tipoConcertacion === 'fijados_evaluador'}
                    onChange={() => setTipoConcertacion('fijados_evaluador')}
                    className="w-4 h-4 accent-inst-azul"
                  />
                  <span className="text-sm text-inst-texto">Fijados por el Evaluador</span>
                </label>
              </div>
            </div>

            {/* Botón confirmar */}
            <div className="flex items-center gap-4">
              <button
                onClick={confirmarConcertacion}
                disabled={saving}
                className="edl-btn-primary flex items-center gap-2 px-6 py-3"
              >
                <span className="material-icons text-lg">check_circle</span>
                {saving ? 'Confirmando...' : 'Confirmar compromiso'}
              </button>
              <button
                onClick={() => navigate('/compromisos-y-competencias')}
                className="edl-btn-secondary"
              >
                Cancelar
              </button>
            </div>

            {/* Mensaje */}
            {mensaje && (
              <div className={`p-3 rounded text-sm font-medium ${
                mensaje.includes('exitosamente')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {mensaje}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Compromiso funcional */}
      {showModalFuncional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <h3 className="font-heading font-bold text-inst-azul mb-4">
              {funcionalEditIndex !== null ? 'Editar' : 'Registrar'} compromiso funcional
            </h3>

            <div className="space-y-4">
              <div>
                <label className="edl-label">Meta</label>
                <select
                  value={fMetaId}
                  onChange={e => setFMetaId(Number(e.target.value))}
                  className="edl-input"
                >
                  <option value={0}>Seleccione la Meta a la cual desea asociar el compromiso</option>
                  {metas.map(m => (
                    <option key={m.id} value={m.id}>{m.descripcion}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="edl-label">Compromiso</label>
                <textarea
                  value={fDescripcion}
                  onChange={e => setFDescripcion(e.target.value)}
                  className="edl-input min-h-[80px]"
                  placeholder="Digite el compromiso a concertar"
                />
                <p className="text-xs text-inst-texto-claro mt-1 bg-blue-50 p-2 rounded">
                  Nota: El compromiso se debe formular como: <strong>Verbo + Objeto + Condicion de resultado</strong>
                </p>
              </div>

              <div>
                <label className="edl-label">Peso</label>
                <input
                  type="number"
                  value={fPeso || ''}
                  onChange={e => setFPeso(Number(e.target.value))}
                  className="edl-input"
                  placeholder="Ingrese el peso (1-100)"
                  min={1}
                  max={100}
                />
                <p className="text-xs text-inst-texto-claro mt-1">
                  El peso no puede ser mayor a 100, ni un numero negativo, ni 0
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={guardarFuncional} className="edl-btn-primary">
                Guardar compromiso funcional
              </button>
              <button
                onClick={() => {
                  // Si no es edición, permite agregar otro
                  if (funcionalEditIndex === null && funcionales.length < 4) {
                    guardarFuncional();
                    // Reabrir para agregar otro
                    setTimeout(() => openModalFuncional(null), 100);
                  } else {
                    setShowModalFuncional(false);
                  }
                }}
                className="edl-btn-secondary text-sm"
                style={{ display: funcionalEditIndex === null && funcionales.length < 5 ? 'inline-flex' : 'none' }}
              >
                Agregar otro compromiso
              </button>
              <button onClick={() => setShowModalFuncional(false)} className="edl-btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Compromiso comportamental */}
      {showModalComportamental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-inst-azul mb-4">
              Seleccionar competencias comportamentales
            </h3>

            <p className="text-xs text-inst-texto-claro mb-4">
              Seleccione entre 3 y 5 competencias comportamentales ({selectedCompetencias.length} seleccionadas)
            </p>

            {/* Decreto 2539/2005 */}
            <h4 className="text-sm font-bold text-inst-azul mb-2">Decreto 2539 de 2005</h4>
            <div className="space-y-2 mb-4">
              {competencias.filter(c => c.decreto === '2539/2005').map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-inst-gris">
                  <input
                    type="checkbox"
                    checked={selectedCompetencias.includes(c.id)}
                    onChange={() => toggleCompetencia(c.id)}
                    className="w-4 h-4 accent-inst-azul"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-inst-texto">{c.nombre}</span>
                    {c.descripcion && (
                      <p className="text-xs text-inst-texto-claro">{c.descripcion}</p>
                    )}
                  </div>
                  {selectedCompetencias.includes(c.id) && (
                    <label className="flex items-center gap-1 text-xs text-inst-texto-claro">
                      <input
                        type="checkbox"
                        checked={propuestoJefeMap[c.id] || false}
                        onChange={e => setPropuestoJefeMap({ ...propuestoJefeMap, [c.id]: e.target.checked })}
                        className="w-3 h-3 accent-inst-azul"
                      />
                      Propuesto por jefe
                    </label>
                  )}
                </label>
              ))}
            </div>

            {/* Decreto 815/2018 */}
            <h4 className="text-sm font-bold text-inst-azul mb-2">Decreto 815 de 2018</h4>
            <div className="space-y-2 mb-4">
              {competencias.filter(c => c.decreto === '815/2018').map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-inst-gris">
                  <input
                    type="checkbox"
                    checked={selectedCompetencias.includes(c.id)}
                    onChange={() => toggleCompetencia(c.id)}
                    className="w-4 h-4 accent-inst-azul"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-inst-texto">{c.nombre}</span>
                    {c.descripcion && (
                      <p className="text-xs text-inst-texto-claro">{c.descripcion}</p>
                    )}
                  </div>
                  {selectedCompetencias.includes(c.id) && (
                    <label className="flex items-center gap-1 text-xs text-inst-texto-claro">
                      <input
                        type="checkbox"
                        checked={propuestoJefeMap[c.id] || false}
                        onChange={e => setPropuestoJefeMap({ ...propuestoJefeMap, [c.id]: e.target.checked })}
                        className="w-3 h-3 accent-inst-azul"
                      />
                      Propuesto por jefe
                    </label>
                  )}
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t">
              <button
                onClick={guardarComportamentales}
                disabled={selectedCompetencias.length < 3}
                className="edl-btn-primary"
              >
                Guardar competencias seleccionadas
              </button>
              <button
                onClick={() => { setShowModalComportamental(false); setSelectedCompetencias([]); }}
                className="edl-btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
