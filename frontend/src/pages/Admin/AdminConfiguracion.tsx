import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Configuraciones ─── */
interface ConfigItem {
  id: string;
  categoria: string;
  label: string;
  valor: string;
  tipo: 'text' | 'number' | 'select' | 'boolean';
  opciones?: string[];
}

const CONFIG_ITEMS: ConfigItem[] = [
  { id: 'periodo_activo', categoria: 'Evaluación', label: 'Periodo activo', valor: '2025-I', tipo: 'text' },
  { id: 'intentos_login', categoria: 'Seguridad', label: 'Intentos máximos de login', valor: '5', tipo: 'number' },
  { id: 'expiracion_jwt', categoria: 'Seguridad', label: 'Expiración JWT (minutos)', valor: '120', tipo: 'number' },
  { id: 'eval_autoactiva', categoria: 'Evaluación', label: 'Autoevaluación habilitada', valor: 'true', tipo: 'boolean' },
  { id: 'coevaluacion', categoria: 'Evaluación', label: 'Coevaluación habilitada', valor: 'false', tipo: 'boolean' },
  { id: 'notificaciones_email', categoria: 'Notificaciones', label: 'Notificaciones por correo', valor: 'true', tipo: 'boolean' },
  { id: 'escala_evaluacion', categoria: 'Evaluación', label: 'Escala de evaluación', valor: '1-5', tipo: 'select', opciones: ['1-5', '1-10', '1-100'] },
  { id: 'formato_reporte', categoria: 'Reportes', label: 'Formato por defecto', valor: 'Excel', tipo: 'select', opciones: ['Excel', 'PDF'] },
];

export default function AdminConfiguracion() {
  const [configs, setConfigs] = useState(CONFIG_ITEMS);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function actualizarValor(id: string, valor: string) {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, valor } : c));
    setGuardado(false);
  }

  async function guardarTodo() {
    setGuardando(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setGuardando(false);
    setGuardado(true);
  }

  const categorias = [...new Set(configs.map(c => c.categoria))];

  return (
    <div className="p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-inst-texto-claro mb-4">
        <span className="material-icons text-base text-inst-azul">home</span>
        <span>/</span><span>Admin</span><span>/</span>
        <span className="text-inst-texto font-medium">Configuración</span>
      </div>

      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-inst-azul flex items-center gap-2">
          <span className="material-icons text-3xl">settings</span>
          Configuración del Sistema
        </h1>
        <button onClick={guardarTodo} disabled={guardando}
          className="edl-btn-primary flex items-center gap-2 disabled:opacity-50">
          {guardando ? (
            <><span className="material-icons text-base animate-spin">sync</span>Guardando...</>
          ) : (
            <><span className="material-icons text-base">save</span>Guardar Cambios</>
          )}
        </button>
      </div>

      {/* Mensaje de éxito */}
      {guardado && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300/40 rounded-lg text-sm text-inst-verde flex items-center gap-2">
          <span className="material-icons text-base">check_circle</span>
          Configuración guardada exitosamente
        </div>
      )}

      {/* ── Cards por categoría ── */}
      {categorias.map(cat => {
        const items = configs.filter(c => c.categoria === cat);
        return (
          <div key={cat} className="bg-white rounded-lg border border-inst-borde shadow-sm mb-6">
            <div className="px-5 py-4 border-b border-inst-borde flex items-center gap-2">
              <span className="material-icons text-lg text-inst-azul">
                {cat === 'Evaluación' ? 'assessment' : cat === 'Seguridad' ? 'security' : cat === 'Notificaciones' ? 'notifications' : 'description'}
              </span>
              <h2 className="font-heading font-semibold text-inst-azul">{cat}</h2>
            </div>
            <div className="p-5 space-y-5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <label className="text-sm font-medium text-inst-texto min-w-[250px]">{item.label}</label>
                  <div className="flex-1 max-w-xs">
                    {item.tipo === 'text' && (
                      <input type="text" value={item.valor} onChange={e => actualizarValor(item.id, e.target.value)} className="edl-input" />
                    )}
                    {item.tipo === 'number' && (
                      <input type="number" value={item.valor} onChange={e => actualizarValor(item.id, e.target.value)} className="edl-input" />
                    )}
                    {item.tipo === 'boolean' && (
                      <button
                        onClick={() => actualizarValor(item.id, item.valor === 'true' ? 'false' : 'true')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.valor === 'true' ? 'bg-inst-verde' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow ${
                          item.valor === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    )}
                    {item.tipo === 'select' && item.opciones && (
                      <select value={item.valor} onChange={e => actualizarValor(item.id, e.target.value)} className="edl-input">
                        {item.opciones.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Zona peligrosa ── */}
      <div className="bg-white rounded-lg border border-inst-rojo/30 shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-inst-rojo/20 flex items-center gap-2">
          <span className="material-icons text-lg text-inst-rojo">warning</span>
          <h2 className="font-heading font-semibold text-inst-rojo">Zona Peligrosa</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-inst-texto">Reiniciar datos del periodo</p>
              <p className="text-xs text-inst-texto-claro">Elimina todas las evaluaciones y compromisos del periodo activo</p>
            </div>
            <button className="px-4 py-2 bg-red-50 text-inst-rojo text-sm font-medium rounded-lg hover:bg-red-100 transition-colors border border-inst-rojo/20">
              Reiniciar
            </button>
          </div>
          <div className="border-t border-inst-borde" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-inst-texto">Mantenimiento del sistema</p>
              <p className="text-xs text-inst-texto-claro">Pone el sistema en modo mantenimiento temporalmente</p>
            </div>
            <button className="px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-300/30">
              Activar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
