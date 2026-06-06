import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
 evaluacion_estado: string;
 periodo_id: number;
 periodo_nombre: string;
 es_comision_evaluadora: number;
}

export default function CompromisosYCompetencias() {
 const navigate = useNavigate();
 const [documento, setDocumento] = useState('');
 const [loading, setLoading] = useState(false);
 const [evaluado, setEvaluado] = useState<Evaluado | null>(null);
 const [error, setError] = useState('');

 async function buscarEvaluado() {
  if (!documento.trim()) return;
  setLoading(true);
  setError('');
  setEvaluado(null);

  try {
   const data: any = await api.get(`/compromisos/buscar-evaluado?documento=${documento.trim()}`);
   setEvaluado(data);
  } catch (err: any) {
   setError(err.message || 'Error al buscar evaluado');
  } finally {
   setLoading(false);
  }
 }

 function handleConcertar() {
  if (!evaluado) return;
  navigate(`/compromisos/concertar/${evaluado.evaluacion_id}`, {
   state: { evaluado },
  });
 }

 function handleVerCompromisos() {
  if (!evaluado) return;
  navigate(`/compromisos/ver/${evaluado.evaluacion_id}`, {
   state: { evaluado },
  });
 }

 function handleVerPropuestos() {
  if (!evaluado) return;
  navigate(`/compromisos/propuestos`, {
   state: { evaluado },
  });
 }

 function handleAjustar() {
  if (!evaluado) return;
  navigate(`/compromisos/ajustar/${evaluado.evaluacion_id}`, {
   state: { evaluado },
  });
 }

 return (
  <div>
   <div className="mb-6">
    <h2 className="edl-section-title">Compromisos y Competencias</h2>
    <p className="text-sm text-inst-texto-claro mt-1">
     Busque evaluados para concertar compromisos o consultar compromisos existentes
    </p>
   </div>

   <div className="edl-card mb-4">
    <span className="text-xs text-inst-texto-claro uppercase font-medium">Tipo de busqueda</span>
    <p className="text-sm font-medium text-inst-texto mt-1">
     Buscar evaluados para concertar / Buscar evaluados con compromisos rechazados
    </p>
   </div>

   <div className="edl-card mb-4">
    <div className="flex gap-3 items-end">
     <div className="flex-1">
      <label className="edl-label">Numero de documento del evaluado</label>
      <input
       type="text"
       value={documento}
       onChange={e => setDocumento(e.target.value)}
       onKeyDown={e => e.key === 'Enter' && buscarEvaluado()}
       className="edl-input"
       placeholder="Ingrese el numero de documento"
      />
     </div>
     <button
      onClick={buscarEvaluado}
      disabled={loading || !documento.trim()}
      className="edl-btn-primary flex items-center gap-2 whitespace-nowrap"
     >
      <span className="material-icons text-lg">search</span>
      {loading ? 'Buscando...' : 'Buscar'}
     </button>
    </div>
   </div>

   {error && (
    <div className="edl-card mb-4 border-l-4 border-red-500 bg-red-50">
     <div className="flex items-center gap-2 text-red-700">
      <span className="material-icons">error</span>
      <span className="text-sm font-medium">{error}</span>
     </div>
    </div>
   )}

   {evaluado && (
    <div className="edl-card mb-4">
     <h3 className="font-heading font-bold text-inst-azul mb-4">
      Resultado de la busqueda
     </h3>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <div>
       <span className="text-xs text-inst-texto-claro uppercase font-medium">Documento</span>
       <p className="text-sm font-semibold text-inst-texto">{evaluado.documento}</p>
      </div>
      <div>
       <span className="text-xs text-inst-texto-claro uppercase font-medium">Evaluado</span>
       <p className="text-sm font-semibold text-inst-texto">{evaluado.nombre_completo}</p>
      </div>
      <div>
       <span className="text-xs text-inst-texto-claro uppercase font-medium">Nivel</span>
       <p className="text-sm font-semibold text-inst-texto">{evaluado.nivel}</p>
      </div>
      <div>
       <span className="text-xs text-inst-texto-claro uppercase font-medium">Denominacion</span>
       <p className="text-sm font-semibold text-inst-texto">{evaluado.denominacion}</p>
      </div>
      <div>
       <span className="text-xs text-inst-texto-claro uppercase font-medium">Codigo</span>
       <p className="text-sm font-semibold text-inst-texto">{evaluado.codigo}</p>
      </div>
      <div>
       <span className="text-xs text-inst-texto-claro uppercase font-medium">Grado</span>
       <p className="text-sm font-semibold text-inst-texto">{evaluado.grado}</p>
      </div>
     </div>

     <div className="border-t border-inst-borde pt-4">
      <h4 className="text-xs text-inst-texto-claro uppercase font-medium mb-3">Opciones</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
       <button
        onClick={handleConcertar}
        className="edl-btn-primary flex items-center gap-2 justify-center"
       >
        <span className="material-icons text-lg">handshake</span>
        Concertar compromisos
       </button>
       <button
        onClick={handleVerCompromisos}
        className="edl-btn-secondary flex items-center gap-2 justify-center"
       >
        <span className="material-icons text-lg">visibility</span>
        Ver compromisos
       </button>
       <button
        onClick={handleVerPropuestos}
        className="edl-btn-secondary flex items-center gap-2 justify-center"
       >
        <span className="material-icons text-lg">rate_review</span>
        Ver compromisos propuestos por el evaluado
       </button>
       <button
        onClick={handleAjustar}
        className="edl-btn-secondary flex items-center gap-2 justify-center"
       >
        <span className="material-icons text-lg">tune</span>
        Ajustar compromisos concertados
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
