import { useState } from 'react'
import { api } from '../../lib/api'
import { Card, Button, Input, Select, Modal, Badge, DataTable, EmptyState } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import { toast } from 'sonner'

interface UsuarioResult {
 id: number
 documento: string
 primer_nombre: string
 segundo_nombre: string | null
 primer_apellido: string
 segundo_apellido: string | null
 nombre_completo: string
}

interface Ausentismo {
 id: number
 funcionario_id: number
 funcionario_documento: string
 funcionario_nombre: string
 motivo: string
 fecha_inicio: string
 fecha_fin: string
 dias: number
 observaciones: string | null
 estado: string
 creado_en: string
}

const TIPOS_AUSENTISMO = [
 { value: 'incapacidad', label: 'Incapacidad' },
 { value: 'comision', label: 'Comision' },
 { value: 'encargo', label: 'Encargo' },
 { value: 'suspension', label: 'Suspension' },
 { value: 'licencias', label: 'Licencias' },
 { value: 'vacaciones', label: 'Vacaciones' },
 { value: 'otro', label: 'Otros' },
]

export default function AusentismoList() {
  const [busquedaDoc, setBusquedaDoc] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [searchResults, setSearchResults] = useState<UsuarioResult[]>([])

  const [selectedUser, setSelectedUser] = useState<{id: number; documento: string; nombre: string} | null>(null)
  const [ausentismos, setAusentismos] = useState<Ausentismo[]>([])
  const [loadingAusentismos, setLoadingAusentismos] = useState(false)
  const [viewingList, setViewingList] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formMotivo, setFormMotivo] = useState('')
  const [formFechaInicio, setFormFechaInicio] = useState('')
  const [formFechaFin, setFormFechaFin] = useState('')
  const [formObservaciones, setFormObservaciones] = useState('')

  const [detailItem, setDetailItem] = useState<Ausentismo | null>(null)

  const [editItem, setEditItem] = useState<Ausentismo | null>(null)

  const [guardando, setGuardando] = useState(false)

  async function buscarFuncionario() {
    if (!busquedaDoc.trim()) return
    setBuscando(true)
    setSearchResults([])
    setViewingList(false)
    setSelectedUser(null)
    setAusentismos([])
    try {
      const res = await api.get<{data: UsuarioResult[]}>(`/usuarios?documento=${encodeURIComponent(busquedaDoc.trim())}&por_pagina=5`)
      const usuarios = res.data || []
      if (usuarios.length === 0) {
        toast.error('No se encontro un funcionario con ese documento.')
      }
      setSearchResults(usuarios)
    } catch {
      toast.error('Error al buscar el funcionario')
    }
    setBuscando(false)
  }

  async function abrirListado(user: {id: number; documento: string; nombre: string}) {
    setSelectedUser(user)
    setViewingList(true)
    setLoadingAusentismos(true)
    try {
      const res = await api.get<{data: Ausentismo[]}>(`/ausentismos?funcionario_id=${user.id}`)
      setAusentismos(res.data || [])
    } catch {
      toast.error('Error al cargar ausentismos')
    }
    setLoadingAusentismos(false)
  }

  function abrirCrear(user: {id: number; documento: string; nombre: string}) {
    setSelectedUser(user)
    setFormMotivo('')
    setFormFechaInicio('')
    setFormFechaFin('')
    setFormObservaciones('')
    setShowCreateModal(true)
  }

  async function guardarAusentismo() {
    if (!selectedUser) return
    if (!formMotivo || !formFechaInicio || !formFechaFin) {
      toast.error('Todos los campos son obligatorios excepto observaciones.')
      return
    }
    const inicio = new Date(formFechaInicio)
    const fin = new Date(formFechaFin)
    if (fin < inicio) {
      toast.error('La fecha fin debe ser posterior o igual a la fecha inicio.')
      return
    }
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    setGuardando(true)
    try {
      await api.post('/ausentismos', {
        funcionario_id: selectedUser.id,
        motivo: formMotivo,
        fecha_inicio: formFechaInicio,
        fecha_fin: formFechaFin,
        dias,
        observaciones: formObservaciones.trim() || null,
      })
      setShowCreateModal(false)
      toast.success('Ausentismo registrado correctamente')
      abrirListado(selectedUser)
    } catch (e: any) {
      toast.error(e?.message || 'Error al guardar el ausentismo')
    }
    setGuardando(false)
  }

  async function actualizarAusentismo() {
    if (!editItem) return
    if (!editItem.motivo || !editItem.fecha_inicio || !editItem.fecha_fin) {
      toast.error('Todos los campos son obligatorios.')
      return
    }
    const inicio = new Date(editItem.fecha_inicio)
    const fin = new Date(editItem.fecha_fin)
    if (fin < inicio) {
      toast.error('La fecha fin debe ser posterior o igual a la fecha inicio.')
      return
    }
    setGuardando(true)
    try {
      await api.put(`/ausentismos/${editItem.id}`, {
        motivo: editItem.motivo,
        fecha_inicio: editItem.fecha_inicio,
        fecha_fin: editItem.fecha_fin,
        observaciones: editItem.observaciones,
      })
      toast.success('Ausentismo actualizado correctamente')
      setEditItem(null)
      if (selectedUser) abrirListado(selectedUser)
    } catch (e: any) {
      toast.error(e?.message || 'Error al actualizar el ausentismo')
    }
    setGuardando(false)
  }

  function resetBusqueda() {
    setBusquedaDoc('')
    setSearchResults([])
    setSelectedUser(null)
    setViewingList(false)
    setAusentismos([])
  }

  const resultsColumns: DataTableColumn<UsuarioResult>[] = [
    { key: 'documento', header: 'Documento', render: (u) => u.documento },
    { key: 'nombre', header: 'Nombre', render: (u) => u.nombre_completo },
    {
      key: 'opciones',
      header: 'Opciones',
      align: 'center',
      render: (u) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="primary" size="sm" onClick={() => abrirCrear({id: u.id, documento: u.documento, nombre: u.nombre_completo})}>
            Ingresar registro de ausentismo
          </Button>
          <Button variant="outline" size="sm" onClick={() => abrirListado({id: u.id, documento: u.documento, nombre: u.nombre_completo})}>
            Listar ausentismo
          </Button>
        </div>
      ),
    },
  ]

  const ausentismoLabel = (m: string) => TIPOS_AUSENTISMO.find(t => t.value === m)?.label || m

  const listColumns: DataTableColumn<Ausentismo>[] = [
    { key: 'motivo', header: 'Motivo', render: (a) => ausentismoLabel(a.motivo) },
    { key: 'fecha_inicio', header: 'Fecha inicial', render: (a) => a.fecha_inicio?.substring(0, 10) },
    { key: 'fecha_fin', header: 'Fecha final', render: (a) => a.fecha_fin?.substring(0, 10) },
    { key: 'observaciones', header: 'Observaciones', render: (a) => a.observaciones || '-' },
    {
      key: 'opciones',
      header: 'Opciones',
      align: 'center',
      render: (a) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailItem(a)}>
            <span className="material-icons text-lg">visibility</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditItem({...a})}>
            <span className="material-icons text-lg">edit</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-inst-azul text-xl">event_busy</span>
          <h2 className="edl-section-title">Ausentismos</h2>
        </div>
        <p className="text-sm text-inst-texto-claro ml-7">
          Periodos no evaluables superiores a 30 dias (Decreto 815 Art. 36).
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Buscar funcionario por documento"
              type="text"
              value={busquedaDoc}
              onChange={e => setBusquedaDoc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarFuncionario()}
              placeholder="Numero de documento"
              iconRight={
                <Button
                  variant="primary"
                  size="sm"
                  loading={buscando}
                  disabled={!busquedaDoc.trim()}
                  onClick={buscarFuncionario}
                >
                  Buscar
                </Button>
              }
            />
          </div>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <DataTable<UsuarioResult>
            columns={resultsColumns}
            data={searchResults}
            rowKey={(u) => u.id}
            ariaLabel="Resultados de busqueda"
          />
        </Card>
      )}

      {viewingList && selectedUser && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-icons text-inst-azul">account_circle</span>
              <span className="font-heading font-bold text-inst-texto">{selectedUser.nombre}</span>
              <span className="text-sm text-inst-texto-claro">&mdash; {selectedUser.documento}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => abrirCrear(selectedUser)}>
              Ingresar registro de ausentismo
            </Button>
          </div>
          {loadingAusentismos ? (
            <EmptyState
              icon={<span className="material-icons text-3xl animate-spin">sync</span>}
              title="Cargando..."
            />
          ) : ausentismos.length === 0 ? (
            <EmptyState
              icon={<span className="material-icons text-3xl">event_available</span>}
              title="Sin ausentismos registrados"
              description="Este funcionario no tiene ausentismos registrados."
            />
          ) : (
            <DataTable<Ausentismo>
              columns={listColumns}
              data={ausentismos}
              rowKey={(a) => a.id}
              ariaLabel="Lista de ausentismos del funcionario"
            />
          )}
        </Card>
      )}

      {showCreateModal && selectedUser && (
        <Modal open={true} onClose={() => setShowCreateModal(false)} title="Registro de ausentismo" size="lg">
          <div className="mb-4 p-3 bg-inst-gris rounded-lg flex items-center gap-2">
            <span className="material-icons text-inst-azul">account_circle</span>
            <span className="font-heading font-semibold text-inst-texto">{selectedUser.nombre}</span>
            <span className="text-sm text-inst-texto-claro">&mdash; {selectedUser.documento}</span>
          </div>
          <div className="space-y-3">
            <Select
              label="Motivo"
              required
              value={formMotivo}
              onChange={e => setFormMotivo(e.target.value)}
              placeholder="Seleccione un motivo"
              options={TIPOS_AUSENTISMO.map(t => ({ value: t.value, label: t.label }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Fecha inicial" type="date" required value={formFechaInicio} onChange={e => setFormFechaInicio(e.target.value)} />
              <Input label="Fecha final" type="date" required value={formFechaFin} onChange={e => setFormFechaFin(e.target.value)} />
            </div>
            <div>
              <label htmlFor="obs-crear" className="edl-label">Observacion (opcional)</label>
              <textarea
                id="obs-crear"
                value={formObservaciones}
                onChange={e => setFormObservaciones(e.target.value)}
                className="edl-input min-h-[60px]"
                placeholder="Observaciones sobre el ausentismo"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button variant="primary" loading={guardando} onClick={guardarAusentismo}>Crear registro</Button>
          </div>
        </Modal>
      )}

      {detailItem && (
        <Modal open={true} onClose={() => setDetailItem(null)} title="Detalles del ausentismo" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="edl-label text-xs text-inst-texto-claro">Motivo</label>
                <p className="font-medium">{ausentismoLabel(detailItem.motivo)}</p>
              </div>
              <div>
                <label className="edl-label text-xs text-inst-texto-claro">Estado</label>
                <p><Badge tone={detailItem.estado === 'vigente' ? 'warning' : detailItem.estado === 'finalizado' ? 'success' : 'danger'}>{detailItem.estado}</Badge></p>
              </div>
              <div>
                <label className="edl-label text-xs text-inst-texto-claro">Fecha inicial</label>
                <p className="font-medium">{detailItem.fecha_inicio?.substring(0, 10)}</p>
              </div>
              <div>
                <label className="edl-label text-xs text-inst-texto-claro">Fecha final</label>
                <p className="font-medium">{detailItem.fecha_fin?.substring(0, 10)}</p>
              </div>
              <div>
                <label className="edl-label text-xs text-inst-texto-claro">Dias</label>
                <p className="font-medium">{detailItem.dias}</p>
              </div>
            </div>
            <div>
              <label className="edl-label text-xs text-inst-texto-claro">Observaciones</label>
              <p className="font-medium whitespace-pre-wrap">{detailItem.observaciones || 'Sin observaciones'}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={() => setDetailItem(null)}>Cerrar</Button>
          </div>
        </Modal>
      )}

      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title="Editar ausentismo" size="lg">
          <div className="space-y-3">
            <Select
              label="Motivo"
              required
              value={editItem.motivo}
              onChange={e => setEditItem({...editItem, motivo: e.target.value})}
              options={TIPOS_AUSENTISMO.map(t => ({ value: t.value, label: t.label }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fecha inicial"
                type="date"
                required
                value={editItem.fecha_inicio?.substring(0, 10)}
                onChange={e => setEditItem({...editItem, fecha_inicio: e.target.value})}
              />
              <Input
                label="Fecha final"
                type="date"
                required
                value={editItem.fecha_fin?.substring(0, 10)}
                onChange={e => setEditItem({...editItem, fecha_fin: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="obs-edit" className="edl-label">Observaciones (opcional)</label>
              <textarea
                id="obs-edit"
                value={editItem.observaciones || ''}
                onChange={e => setEditItem({...editItem, observaciones: e.target.value})}
                className="edl-input min-h-[60px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-inst-borde">
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancelar</Button>
            <Button variant="primary" loading={guardando} onClick={actualizarAusentismo}>Guardar</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
