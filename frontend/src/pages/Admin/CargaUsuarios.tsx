import { useState } from 'react'
import { api } from '../../lib/api'
import { API_BASE } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function CargaUsuarios() {
 const { rolActivo } = useAuth()
 const [archivo, setArchivo] = useState<File | null>(null)
 const [subiendo, setSubiendo] = useState(false)
 const [resultado, setResultado] = useState<any>(null)
 const [error, setError] = useState('')

 async function descargarPlantilla() {
  try {
   const token = localStorage.getItem('edl_token')
   const resp = await fetch(`${API_BASE}/cargas/plantilla-usuarios`, {
    headers: { Authorization: `Bearer ${token}` }
   })
   const blob = await resp.blob()
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = 'plantilla_usuarios.csv'
   a.click()
   URL.revokeObjectURL(url)
  } catch (e: any) {
   setError(e.message || 'Error al descargar plantilla')
  }
 }

 async function subirArchivo() {
  if (!archivo) return
  setSubiendo(true)
  setError('')
  setResultado(null)
  try {
   const formData = new FormData()
   formData.append('archivo', archivo)
   const token = localStorage.getItem('edl_token')
   const resp = await fetch(`${API_BASE}/cargas/usuarios`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
   })
   const data = await resp.json()
   if (resp.ok) {
    setResultado(data)
   } else {
    setError(data.error || 'Error al procesar el archivo')
   }
  } catch (e: any) {
   setError(e.message || 'Error de conexion')
  }
  setSubiendo(false)
 }

 if (!['admin', 'jefe_personal'].includes(rolActivo || '')) {
  return (
   <div>
    <h2 className="edl-section-title">Carga Masiva de Usuarios</h2>
    <p className="text-inst-texto-claro text-sm mt-2">No tiene permisos para acceder a este modulo.</p>
   </div>
  )
 }

 return (
  <div>
   <div className="flex items-center gap-2 mb-1">
    <span className="material-icons text-inst-azul text-xl">upload_file</span>
    <h2 className="edl-section-title">Carga Masiva de Usuarios</h2>
   </div>
   <p className="text-sm text-inst-texto-claro mb-4 ml-7">
    Descargue la plantilla, diligencie los datos y cargue el archivo.
   </p>

   <div className="edl-card mb-6">
    <h3 className="font-heading font-semibold text-inst-azul mb-3">Paso 1: Descargar plantilla</h3>
    <p className="text-sm text-inst-texto-claro mb-3">
     Descargue la plantilla en formato CSV con las columnas requeridas.
    </p>
    <button onClick={descargarPlantilla} className="edl-btn-outline flex items-center gap-2">
     <span className="material-icons text-sm">download</span>
     Descargar plantilla CSV
    </button>
   </div>

   <div className="edl-card mb-6">
    <h3 className="font-heading font-semibold text-inst-azul mb-3">Paso 2: Seleccionar archivo</h3>
    <p className="text-sm text-inst-texto-claro mb-3">
     Seleccione el archivo CSV con los datos de los usuarios.
    </p>
    <div className="flex items-center gap-4">
     <input
      type="file"
      accept=".csv"
      onChange={e => setArchivo(e.target.files?.[0] || null)}
      className="text-sm"
     />
     {archivo && (
      <span className="text-sm text-inst-texto-claro">{archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)</span>
     )}
    </div>
   </div>

   <div className="edl-card mb-6">
    <h3 className="font-heading font-semibold text-inst-azul mb-3">Paso 3: Enviar archivo</h3>
    <button onClick={subirArchivo} disabled={!archivo || subiendo}
     className="edl-btn-primary flex items-center gap-2 disabled:opacity-50">
     <span className="material-icons text-sm">cloud_upload</span>
     {subiendo ? 'Procesando...' : 'Enviar archivo'}
    </button>
   </div>

   {error && (
    <div className="edl-card border-l-4 border-l-inst-rojo mb-6">
     <div className="flex items-center gap-2">
      <span className="material-icons text-inst-rojo">error</span>
      <p className="text-sm text-inst-rojo font-medium">{error}</p>
     </div>
    </div>
   )}

   {resultado && (
    <div className="edl-card border-l-4 border-l-inst-verde mb-6">
     <div className="flex items-center gap-2 mb-2">
      <span className="material-icons text-inst-verde">check_circle</span>
      <p className="text-sm text-inst-verde font-medium">Carga procesada exitosamente</p>
     </div>
     <pre className="text-xs bg-inst-gris p-3 rounded overflow-auto max-h-[300px]">
      {JSON.stringify(resultado, null, 2)}
     </pre>
    </div>
   )}
  </div>
 )
}
