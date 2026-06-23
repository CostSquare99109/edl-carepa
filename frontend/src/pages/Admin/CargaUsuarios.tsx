import { useState } from 'react'
import { api, API_BASE } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Button, Alert, Badge } from '../../components/ui'
import { toast } from 'sonner'

interface CargaResultado {
  carga_id?: number;
  mensaje?: string;
  [key: string]: unknown;
}

export default function CargaUsuarios() {
 const { rolActivo } = useAuth()
 const [archivo, setArchivo] = useState<File | null>(null)
 const [subiendo, setSubiendo] = useState(false)
 const [resultado, setResultado] = useState<CargaResultado | null>(null)
 const [error, setError] = useState('')
 const [arrastrando, setArrastrando] = useState(false)

 async function descargarPlantilla() {
  try {
   const token = localStorage.getItem('edl_token')
   const resp = await fetch(`${API_BASE}/cargas/plantilla-usuarios`, {
    headers: { Authorization: `Bearer ${token}` }
   })
   if (!resp.ok) throw new Error('No se pudo descargar la plantilla')
   const blob = await resp.blob()
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = 'plantilla_usuarios.csv'
   a.click()
   URL.revokeObjectURL(url)
   toast.success('Plantilla descargada')
  } catch (e) {
   const msg = e instanceof Error ? e.message : 'Error al descargar plantilla'
   setError(msg);
   toast.error(msg)
  }
 }

 function validarArchivo(file: File): string | null {
  const nombre = file.name.toLowerCase();
  if (!nombre.endsWith('.csv') && !nombre.endsWith('.xls') && !nombre.endsWith('.xlsx')) {
   return 'El archivo debe ser CSV, XLS o XLSX';
  }
  const maxMB = 10;
  if (file.size > maxMB * 1024 * 1024) {
   return `El archivo excede el tamaño máximo de ${maxMB}MB`;
  }
  return null;
 }

 function onFileChange(file: File | null) {
  setError('');
  setResultado(null);
  if (!file) { setArchivo(null); return; }
  const err = validarArchivo(file);
  if (err) {
   setError(err);
   toast.error(err);
   setArchivo(null);
   return;
  }
  setArchivo(file);
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
    toast.success('Archivo procesado correctamente')
   } else {
    const msg = data.error || data.mensaje || 'Error al procesar el archivo'
    setError(msg);
    toast.error(msg)
   }
  } catch (e) {
   const msg = e instanceof Error ? e.message : 'Error de conexión'
   setError(msg);
   toast.error(msg)
  }
  setSubiendo(false)
 }

 if (rolActivo !== 'admin') {
  return (
   <div className="space-y-4">
    <h2 className="edl-section-title">Carga Masiva de Usuarios</h2>
    <Alert tone="warning" title="Acceso restringido">
     No tiene permisos para acceder a este módulo. Solo los administradores pueden realizar cargas masivas.
    </Alert>
   </div>
  )
 }

 const paso1Activo = !archivo;
 const paso2Activo = !!archivo && !resultado && !subiendo;

 return (
  <div className="space-y-6">
   <div className="animate-fadeIn">
    <div className="flex items-center gap-2 mb-1">
     <span className="material-icons text-inst-azul-osc text-xl">upload_file</span>
     <h2 className="edl-section-title">Carga Masiva de Usuarios</h2>
    </div>
    <p className="text-sm text-inst-texto-claro ml-7">
     Descargue la plantilla, diligencie los datos y cargue el archivo. El proceso es asíncrono: la carga se registrará y se procesará en segundo plano.
    </p>
   </div>

   <div className="flex items-center gap-3 flex-wrap text-sm">
    <Badge tone={paso1Activo ? 'info' : 'success'}>1. Plantilla</Badge>
    <span className="text-inst-borde">→</span>
    <Badge tone={archivo ? 'info' : 'neutral'}>2. Archivo</Badge>
    <span className="text-inst-borde">→</span>
    <Badge tone={subiendo || resultado ? 'info' : 'neutral'}>3. Enviar</Badge>
   </div>

   <Card>
    <h3 className="font-heading font-semibold text-inst-azul-osc mb-3">
     <span className="material-icons align-middle text-base mr-1">download</span>
     Paso 1: Descargar plantilla
    </h3>
    <p className="text-sm text-inst-texto-claro mb-4">
     Descargue la plantilla en formato CSV con las columnas requeridas.
     El archivo incluye ejemplos que puede reemplazar.
    </p>
    <Button
     variant="outline"
     iconLeft={<span className="material-icons text-base">download</span>}
     onClick={descargarPlantilla}
    >
     Descargar plantilla CSV
    </Button>
   </Card>

   <Card>
    <h3 className="font-heading font-semibold text-inst-azul-osc mb-3">
     <span className="material-icons align-middle text-base mr-1">description</span>
     Paso 2: Seleccionar archivo
    </h3>
    <p className="text-sm text-inst-texto-claro mb-4">
     Seleccione el archivo con los datos de los usuarios. Formatos aceptados: CSV, XLS, XLSX. Máximo 10 MB.
    </p>
    <label
     onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
     onDragLeave={() => setArrastrando(false)}
     onDrop={(e) => {
      e.preventDefault();
      setArrastrando(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFileChange(f);
     }}
     className={[
      'flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
      arrastrando ? 'border-inst-verde bg-inst-verde-light/30' : 'border-inst-borde hover:border-inst-verde hover:bg-inst-gris/50',
     ].join(' ')}
    >
     <span className="material-icons text-4xl text-inst-texto-claro mb-2">cloud_upload</span>
     <span className="text-sm font-medium text-inst-texto">
      {archivo ? archivo.name : 'Arrastre el archivo aquí o haga clic para seleccionar'}
     </span>
     {archivo ? (
      <span className="text-xs text-inst-texto-claro mt-1">
       {(archivo.size / 1024).toFixed(1)} KB · {archivo.type || 'CSV'}
      </span>
     ) : (
      <span className="text-xs text-inst-texto-claro mt-1">CSV, XLS o XLSX · máx. 10 MB</span>
     )}
     <input
      type="file"
      accept=".csv,.xls,.xlsx"
      onChange={e => onFileChange(e.target.files?.[0] || null)}
      className="sr-only"
     />
    </label>
    {archivo ? (
     <div className="mt-3 flex justify-end">
      <Button variant="ghost" size="sm" onClick={() => { setArchivo(null); setResultado(null); setError(''); }}>
       Quitar archivo
      </Button>
     </div>
    ) : null}
   </Card>

   <Card>
    <h3 className="font-heading font-semibold text-inst-azul-osc mb-3">
     <span className="material-icons align-middle text-base mr-1">send</span>
     Paso 3: Enviar archivo
    </h3>
    <p className="text-sm text-inst-texto-claro mb-4">
      Una vez enviado, el archivo será procesado. Puede consultar el historial en la sección de Cargas.
    </p>
    <Button
     variant="primary"
     iconLeft={<span className="material-icons text-base">cloud_upload</span>}
     onClick={subirArchivo}
     loading={subiendo}
     disabled={!archivo || paso1Activo}
    >
     Enviar archivo
    </Button>
   </Card>

   {error ? (
    <Alert tone="danger" title="Error en la carga" onDismiss={() => setError('')}>
     {error}
    </Alert>
   ) : null}

   {resultado ? (
    <Alert tone="success" title="Carga procesada exitosamente">
     <p className="mb-2">El archivo fue recibido y está en cola para procesamiento.</p>
     <details className="text-xs">
      <summary className="cursor-pointer font-medium">Ver detalles técnicos</summary>
      <pre className="mt-2 bg-inst-gris p-3 rounded overflow-auto max-h-[300px]">
       {JSON.stringify(resultado, null, 2)}
      </pre>
     </details>
    </Alert>
   ) : null}
  </div>
 )
}
