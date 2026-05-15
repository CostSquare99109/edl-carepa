import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro civil' },
  { value: 'NIT', label: 'NIT' },
];

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(documento, tipoDocumento, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Tarjeta de login */}
        <div className="edl-card">
          {/* Logo CNSC */}
          <div className="flex justify-center mb-6">
            <img
              src={`${import.meta.env.BASE_URL}escudo.png`}
              alt="CNSC"
              className="h-20 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('.escudo-fallback')) {
                  const span = document.createElement('span');
                  span.className =
                    'escudo-fallback text-3xl font-heading font-bold text-inst-azul';
                  span.textContent = 'CNSC';
                  parent.appendChild(span);
                }
              }}
            />
          </div>

          {/* Título */}
          <h1 className="text-lg font-heading font-bold text-inst-azul text-center mb-1">
            Evaluación del Desempeño Laboral
          </h1>
          <p className="text-sm text-inst-texto-claro text-center mb-6">
            Comisión Nacional del Servicio Civil
          </p>

          {/* Doble línea */}
          <div className="edl-divider" />
          <div className="edl-divider-accent" />

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-inst-rojo/20 rounded text-sm text-inst-rojo">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de documento */}
            <div>
              <label className="block text-sm font-medium text-inst-texto mb-1">
                Tipo de documento
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="edl-input"
              >
                {TIPOS_DOCUMENTO.map((td) => (
                  <option key={td.value} value={td.value}>
                    {td.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Número de documento */}
            <div>
              <label className="block text-sm font-medium text-inst-texto mb-1">
                Número de documento
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="edl-input"
                placeholder="Ingrese su número de documento"
                required
                autoComplete="username"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-inst-texto mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="edl-input pr-10"
                  placeholder="Ingrese su contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1"
                  tabIndex={-1}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-icons text-xl">
                    {mostrarPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-icons text-base animate-spin">refresh</span>
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        {/* Pie */}
        <p className="text-center text-xs text-inst-texto-claro mt-6">
          Comisión Nacional del Servicio Civil -- Sistema EDL-CNSC
        </p>
      </div>
    </div>
  );
}
