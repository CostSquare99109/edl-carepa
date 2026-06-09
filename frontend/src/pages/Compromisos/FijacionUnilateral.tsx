import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { MENSAJES_CNSC } from '../../lib/mensajesCNSC'

interface CompromisoForm {
 tipo: 'funcional' | 'comportamental'
 descripcion: string
 resultado_esperado: string
 medio_verificacion: string
 peso: number
}

export default function FijacionUnilateral() {
 const { rolActivo } = useAuth()
 const [evaluadoId, setEvaluadoId] = useState('')
 const [periodoId, setPeriodoId] = useState('')
 const [motivo, setMotivo] = useState('no_conformidad')
 const [compromisos, setCompromisos] = useState<CompromisoForm[]>([
  { tipo: 'funcional', descripcion: '', resultado_esperado: '', medio_verificacion: '', peso: 0 },
 ])
 const [guardando, setGuardando] = useState(false)
 const [mensaje, setMensaje] = useState('')

 const agregarCompromiso = () => {
  setCompromisos([...compromisos, { tipo: 'funcional', descripcion: '', resultado_esperado: '', medio_verificacion: '', peso: 0 }])
 }

 const eliminarCompromiso = (idx: number) => {
  if (compromisos.length <= 1) return
  setCompromisos(compromisos.filter((_, i) => i !== idx))
 }

 const actualizarCompromiso = (idx: number, campo: keyof CompromisoForm, valor: string | number) => {
  const nuevos = [...compromisos]
  ;(nuevos[idx] as any)[campo] = valor
  setCompromisos(nuevos)
 }

 const totalPeso = compromisos.reduce((s, c) => s + c.peso, 0)
 const pesoValido = totalPeso === 100

 async function guardar() {
  if (!evaluadoId || !periodoId) {
   setMensaje('Debe indicar el evaluado y el periodo')
   return
  }
  if (!pesoValido) {
   setMensaje('Los pesos deben sumar 100%')
   return
  }

  setGuardando(true)
  setMensaje('')
  try {
   await api.post('/concertaciones', {
    evaluado_id: Number(evaluadoId),
    periodo_id: Number(periodoId),
    tipo_concertacion: 'fijados_evaluador',
    motivo_no_jefe: motivo === 'otro' ? 'Fijacion unilateral por no conformidad del evaluado' : motivo,
    compromisos: compromisos.map(c => ({
     tipo: c.tipo,
     descripcion: c.descripcion,
     resultado_esperado: c.resultado_esperado,
     medio_verificacion: c.medio_verificacion,
     peso: c.peso,
    })),
   })
   setMensaje('Fijación unilateral registrada exitosamente conforme al artículo 33 de la Resolución 1760 de 2010')
   setCompromisos([{ tipo: 'funcional', descripcion: '', resultado_esperado: '', medio_verificacion: '', peso: 0 }])
   setEvaluadoId('')
  } catch (e: any) {
   setMensaje(e.message || 'Error al registrar fijacion unilateral')
  } finally {
   setGuardando(false)
  }
 }

 return (
  <div className="min-h-screen">
   <div className="mb-6">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-rojo text-xl">gavel</span>
     <h2 className="edl-section-title">Fijacion Unilateral de Compromisos</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">
     Art. 33 Resolución 1760 de 2010: Procede cuando no se logra acuerdo en la concertación
    </p>
   </div>

   <div className="edl-card mb-6">
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
     <span className="material-icons text-yellow-600 mt-0.5">warning</span>
     <p className="text-sm text-yellow-800">
      La fijacion unilateral solo procede cuando el evaluado manifiesta su no conformidad con la concertacion bilateral
      o cuando vence el plazo de tres (3) dias habiles sin que el evaluado firme el acta.
     </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
     <div>
      <label className="edl-label">ID Evaluado</label>
      <input type="number" value={evaluadoId} onChange={e => setEvaluadoId(e.target.value)}
       className="edl-input" placeholder="Documento o ID" required />
     </div>
     <div>
      <label className="edl-label">ID Periodo</label>
      <input type="number" value={periodoId} onChange={e => setPeriodoId(e.target.value)}
       className="edl-input" placeholder="Período de evaluación" required />
     </div>
     <div>
      <label className="edl-label">Motivo de la fijacion</label>
      <select value={motivo} onChange={e => setMotivo(e.target.value)} className="edl-input">
       <option value="no_conformidad">No conformidad del evaluado</option>
       <option value="vencimiento_plazo">Vencimiento del plazo sin firma</option>
       <option value="negativa_concertar">Negativa a concertar</option>
       <option value="otro">Otro</option>
      </select>
     </div>
    </div>
   </div>

   <div className="edl-card mb-6">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-heading font-bold text-inst-azul">Compromisos a fijar</h3>
     <div className="flex items-center gap-3">
      <span className={`text-sm font-bold ${pesoValido ? 'text-inst-verde' : 'text-inst-rojo'}`}>
       Total peso: {totalPeso}%
      </span>
      <button onClick={agregarCompromiso} className="edl-btn-primary text-sm">
       <span className="material-icons text-sm mr-1">add</span> Agregar
      </button>
     </div>
    </div>

    <div className="space-y-4">
     {compromisos.map((c, idx) => (
      <div key={idx} className="border border-inst-borde rounded-lg p-4">
       <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-inst-texto">#{idx + 1}</span>
        {compromisos.length > 1 && (
         <button onClick={() => eliminarCompromiso(idx)} className="text-inst-rojo text-sm hover:underline">Eliminar</button>
        )}
       </div>
       <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
         <label className="edl-label">Tipo</label>
         <select value={c.tipo} onChange={e => actualizarCompromiso(idx, 'tipo', e.target.value)} className="edl-input">
          <option value="funcional">Funcional</option>
          <option value="comportamental">Comportamental</option>
         </select>
        </div>
        <div className="col-span-2">
         <label className="edl-label">Descripcion</label>
         <input value={c.descripcion} onChange={e => actualizarCompromiso(idx, 'descripcion', e.target.value)}
          className="edl-input" required />
        </div>
        <div>
         <label className="edl-label">Resultado esperado</label>
         <input value={c.resultado_esperado} onChange={e => actualizarCompromiso(idx, 'resultado_esperado', e.target.value)}
          className="edl-input" />
        </div>
        <div>
         <label className="edl-label">Peso %</label>
         <input type="number" value={c.peso} onChange={e => actualizarCompromiso(idx, 'peso', Number(e.target.value))}
          className="edl-input" min={0} max={100} />
        </div>
       </div>
       <div className="mt-2">
        <label className="edl-label">Medio de verificación</label>
        <input value={c.medio_verificacion} onChange={e => actualizarCompromiso(idx, 'medio_verificacion', e.target.value)}
          className="edl-input" />
       </div>
      </div>
     ))}
    </div>
   </div>

   {mensaje && (
    <div className={`edl-card mb-4 p-3 rounded-lg text-sm ${
     mensaje.includes('exitosamente') ? 'bg-green-50 border border-green-200 text-inst-verde' : 'bg-red-50 border border-red-200 text-inst-rojo'
    }`}>
     {mensaje}
    </div>
   )}

   <button onClick={guardar} disabled={guardando || !pesoValido}
    className="edl-btn-primary disabled:opacity-50">
    {guardando ? 'Registrando...' : 'Registrar Fijacion Unilateral'}
   </button>
  </div>
 )
}
