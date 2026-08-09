import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { api, API_BASE } from '../../lib/api';

interface Evaluado {
  documento: string;
  nombre_completo: string;
  primer_nombre: string;
}

interface Compromiso {
  id: number;
  tipo: string;
  descripcion: string;
  peso: number;
  estado: string;
  meta_id?: number;
  meta_descripcion?: string;
  competencia_nombre?: string;
  competencia_decreto?: string;
  es_propuesto_jefe?: number;
}

/** Decodifica entidades HTML basicas y normaliza saltos de linea. */
function sanitizarTexto(s: string | null | undefined): string {
  if (!s) return '';
  let v = String(s);
  // Decodificar entidades comunes si llegaron desde el backend
  v = v
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#10;/g, '\n')
    .replace(/&#13;/g, '\r');
  // Quitar simbolos literales \n \r que quedaron escapados
  v = v.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  // Colapsar espacios y trim
  v = v.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
  return v;
}

export default function VerCompromisos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { evaluacionId } = useParams();
  const evaluado = (location.state as { evaluado?: Evaluado })?.evaluado;

  const [funcionales, setFuncionales] = useState<Compromiso[]>([]);
  const [comportamentales, setComportamentales] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [sumaPesos, setSumaPesos] = useState(0);
  const [concertacionId, setConcertacionId] = useState<number | null>(null);

  useEffect(() => {
    if (evaluacionId) cargarCompromisos();
  }, [evaluacionId]);

  async function cargarCompromisos() {
    setLoading(true);
    try {
      // Primero obtenemos el detalle de la evaluación para conocer la concertacion_id
      const evalRes = await api.get<any>(`/evaluaciones/${evaluacionId}`);
      if (evalRes?.concertacion_id) {
        setConcertacionId(Number(evalRes.concertacion_id));
      }
      // Paquete 1: compromisos funcionales. Paquete 2: compromisos comportamentales.
      // Se consultan ambos endpoints independientes.
      const [funcRes, compRes] = await Promise.all([
        api.get<any>(`/compromisos/evaluacion/${evaluacionId}`),
        api.get<any>(`/compromisos-comportamentales/evaluacion/${evaluacionId}`),
      ]);
      const funcFiltrados = (funcRes?.funcionales || []).filter((c: any) => c.estado !== 'devuelto');
      setFuncionales(funcFiltrados);
      const compLista = Array.isArray(compRes) ? compRes : (compRes?.data || []);
      const compFiltrados = compLista.filter((c: any) => c.estado !== 'devuelto');
      setComportamentales(compFiltrados);
      setSumaPesos(funcFiltrados.reduce((s: number, c: any) => s + (parseFloat(String(c.peso)) || 0), 0));
    } catch (err) {
      console.error('Error cargando compromisos:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!evaluado) {
    return (
      <div className="edl-card text-center py-8">
        <p className="text-inst-texto-claro">No se encontraron datos del evaluado.</p>
        <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-primary mt-4">Volver</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/compromisos-y-competencias')} className="edl-btn-secondary flex items-center gap-1 text-sm">
            <span className="material-icons text-lg">arrow_back</span>Volver
          </button>
          <h2 className="edl-section-title">Compromisos de {evaluado.nombre_completo}</h2>
        </div>
        {concertacionId ? (
          <button
            onClick={() => api.download(`/reportes/concertacion-pdf/${concertacionId}`, `concertacion_${concertacionId}.pdf`)}
            className="edl-btn-secondary flex items-center gap-2 text-sm"
          >
            <span className="material-icons text-lg">download</span>
            Descargar PDF de concertación
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="edl-card text-center py-8 text-inst-texto-claro">Cargando...</div>
      ) : (
        <>
          {/* Funcionales */}
          <div className="edl-card mb-6">
            <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
              <span className="material-icons">work</span>Compromisos funcionales
            </h3>
            {funcionales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos funcionales registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                 <thead>
                  <tr className="bg-inst-azul/5 text-left">
                   <th className="px-3 py-2 font-medium text-inst-azul">Meta</th>
                   <th className="px-3 py-2 font-medium text-inst-azul">Compromiso</th>
                   <th className="px-3 py-2 font-medium text-inst-azul text-center">Peso</th>
                   <th className="px-3 py-2 font-medium text-inst-azul">Estado</th>
                  </tr>
                 </thead>
                 <tbody>
                  {funcionales.map(c => {
                    const metaTxt = sanitizarTexto(c.meta_descripcion);
                    const descTxt = sanitizarTexto(c.descripcion);
                    const metaIgual = metaTxt && descTxt && metaTxt === descTxt;
                    return (
                      <tr key={c.id} className="border-b border-inst-borde align-top">
                        <td className="px-3 py-2 text-xs text-inst-texto-claro whitespace-pre-line">
                          {metaTxt ? (
                            <span className={metaIgual ? 'italic text-inst-texto-claro' : ''}>{metaTxt}</span>
                          ) : (
                            <span className="italic">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-inst-texto whitespace-pre-line">{descTxt || <span className="italic text-inst-texto-claro">Sin descripción</span>}</td>
                        <td className="px-3 py-2 text-center font-semibold">{Number(c.peso).toFixed(2)}%</td>
                        <td className="px-3 py-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">{c.estado}</span>
                        </td>
                      </tr>
                    );
                  })}
                 </tbody>
                 <tfoot>
                  <tr className="bg-inst-azul/5">
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 font-semibold text-inst-azul text-right whitespace-nowrap">Total pesos:</td>
                    <td className="px-3 py-2 text-center font-bold text-inst-azul whitespace-nowrap">{Number(sumaPesos).toFixed(2)}%</td>
                    <td className="px-3 py-2"></td>
                  </tr>
                 </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Comportamentales */}
          <div className="edl-card">
            <h3 className="font-heading font-bold text-inst-azul mb-4 flex items-center gap-2">
              <span className="material-icons">psychology</span>Compromisos comportamentales
            </h3>
            {comportamentales.length === 0 ? (
              <p className="text-sm text-inst-texto-claro text-center py-4">No hay compromisos comportamentales registrados</p>
            ) : (
             <div className="space-y-4">
               {comportamentales.map(c => {
                 const nombre = sanitizarTexto(c.competencia_nombre) || sanitizarTexto(c.descripcion);
                 const codigo = sanitizarTexto(c.competencia_codigo);
                 const decreto = sanitizarTexto(c.competencia_decreto);
                 // Normalizar: BD entrega "2539/2005" o "815_2018"; UI muestra consistente
                 const decretoFmt = decreto ? decreto.replace(/_/g, '/') : '';
                 const conductas: Array<{ id: number; texto: string; orden: number }> =
                   Array.isArray(c.conductas)
                     ? [...c.conductas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                     : [];
                 return (
                   <div key={c.id} className="border border-inst-borde rounded-lg p-4 bg-inst-surface">
                     <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                       <div>
                         <p className="font-heading font-bold text-inst-azul text-base">
                           {nombre || <span className="italic text-inst-texto-claro">Sin nombre</span>}
                         </p>
                         {codigo ? (
                           <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-inst-azul/10 text-inst-azul font-mono">
                             {codigo}
                           </span>
                         ) : null}
                       </div>
                       <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                         {c.estado}
                       </span>
                     </div>
                     {conductas.length > 0 ? (
                       <div className="mt-2">
                         <p className="text-xs font-semibold text-inst-texto-claro uppercase mb-1">
                           Conductas esperadas ({conductas.length})
                         </p>
                         <ol className="list-decimal list-inside space-y-1 text-sm text-inst-texto">
                           {conductas.map(cond => (
                             <li key={cond.id} className="leading-snug">
                               {sanitizarTexto(cond.texto)}
                             </li>
                           ))}
                         </ol>
                       </div>
                     ) : (
                       <p className="text-xs italic text-inst-texto-claro mt-1">
                         Sin conductas registradas para esta competencia.
                       </p>
                     )}
                     <div className="flex items-center gap-4 mt-3 pt-2 border-t border-inst-borde text-xs text-inst-texto-claro">
                       <span>
                         Decreto: <strong className="text-inst-azul">
                           {decretoFmt || '—'}
                         </strong>
                       </span>
                       <span>
                         Propuesto por jefe: {c.es_propuesto_jefe ? (
                           <span className="text-green-700 font-semibold">Sí</span>
                         ) : (
                           <span>No</span>
                         )}
                       </span>
                     </div>
                   </div>
                 );
               })}
             </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
