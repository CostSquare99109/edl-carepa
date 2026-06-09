import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export default function NuevaContrasena() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const email = searchParams.get('email') || ''
	const codigo = searchParams.get('codigo') || ''

	const [password, setPassword] = useState('')
	const [password2, setPassword2] = useState('')
	const [mostrarPass, setMostrarPass] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	if (!email || !codigo) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4">
				<div className="edl-card text-center p-8">
					<span className="material-icons text-5xl text-inst-rojo mb-4">error</span>
					<h2 className="text-lg font-heading font-bold text-inst-azul mb-2">Enlace inválido</h2>
					<p className="text-sm text-inst-texto-claro mb-4">No se encontró la información de recuperación.</p>
					<button onClick={() => navigate('/login')} className="edl-btn-primary">
						Ir al inicio de sesión
					</button>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (password.length < 8) {
			setError('La contraseña debe tener mínimo 8 caracteres')
			return
		}
		if (password !== password2) {
			setError('Las contraseñas no coinciden')
			return
		}

		setLoading(true)
		try {
			const res = await fetch(`${API}/auth/recuperar/${codigo}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			})
			const data = await res.json()

			if (data.code === '01') {
				navigate('/login?msg=contraseña-actualizada')
			} else {
				setError(data.message || 'Error al actualizar la contraseña')
			}
		} catch {
			setError('Error de conexión. Intente de nuevo.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				<div className="edl-card">
					{/* Logo Carepa */}
					<div className="flex justify-center mb-6">
						<img
							src={`${import.meta.env.BASE_URL}escudo.png`}
							alt="Carepa"
							className="h-20 w-auto"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = 'none'
								const parent = (e.target as HTMLImageElement).parentElement
								if (parent && !parent.querySelector('.escudo-fallback')) {
									const span = document.createElement('span')
'escudo-fallback text-3xl font-heading font-bold text-inst-azul'
span.textContent = 'CAREPA'
									parent.appendChild(span)
								}
							}}
						/>
					</div>

					<h1 className="text-lg font-heading font-bold text-inst-azul text-center mb-1">
						Nueva contraseña
					</h1>
					<p className="text-sm text-inst-texto-claro text-center mb-6">
						Ingrese su nueva contraseña para la cuenta <strong>{email}</strong>
					</p>

					<div className="edl-divider" />
					<div className="edl-divider-accent" />

					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-inst-rojo/20 rounded-lg text-sm text-inst-rojo flex items-center gap-2">
							<span className="material-icons text-base">error</span>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<label className="block text-sm font-medium text-inst-texto mb-1">
								Nueva contraseña
							</label>
							<div className="relative">
								<input
									type={mostrarPass ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="edl-input pr-10"
									placeholder="Mínimo 8 caracteres"
									required
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setMostrarPass(!mostrarPass)}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-inst-texto-claro hover:text-inst-texto p-1"
									tabIndex={-1}
								>
									<span className="material-icons text-xl">{mostrarPass ? 'visibility' : 'visibility_off'}</span>
								</button>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-inst-texto mb-1">
								Confirmar nueva contraseña
							</label>
							<input
								type="password"
								value={password2}
								onChange={(e) => setPassword2(e.target.value)}
								className="edl-input"
								placeholder="Repita la nueva contraseña"
								required
								minLength={8}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
						>
							{loading ? (
								<>
									<span className="material-icons text-base animate-spin">sync</span>
									Actualizando...
								</>
							) : (
								<>
									<span className="material-icons text-base">lock_reset</span>
									Cambiar contraseña
								</>
							)}
						</button>
					</form>

					<p className="text-center text-xs text-inst-texto-claro mt-4">
						¿Recuerda su contraseña?{' '}
						<button
							type="button"
							onClick={() => navigate('/login')}
							className="text-inst-azul hover:underline font-medium"
						>
							Inicie sesión
						</button>
					</p>
				</div>

				<p className="text-center text-xs text-inst-texto-claro mt-6">
					Alcaldía de Carepa — Sistema EDL-CAREPA
				</p>
			</div>
		</div>
	)
}
