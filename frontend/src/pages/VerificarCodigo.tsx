import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export default function VerificarCodigo() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const email = searchParams.get('email') || ''

	const [codigo, setCodigo] = useState(['', '', '', '', '', ''])
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	useEffect(() => {
		if (!email) {
			navigate('/login')
			return
		}
		inputRefs.current[0]?.focus()
	}, [email, navigate])

	const handleChange = (index: number, value: string) => {
		const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
		if (upper.length > 1) return

		const newCodigo = [...codigo]
		newCodigo[index] = upper
		setCodigo(newCodigo)
		setError('')

		if (upper && index < 5) {
			inputRefs.current[index + 1]?.focus()
		}

		// Auto-submit cuando están los 6 caracteres
		if (upper && index === 5) {
			const fullCode = newCodigo.join('')
			if (fullCode.length === 6) {
				verifyCode(fullCode)
			}
		}
	}

	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === 'Backspace' && !codigo[index] && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}
	}

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault()
		const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
		if (pasted.length === 6) {
			const newCodigo = pasted.split('')
			setCodigo(newCodigo)
			inputRefs.current[5]?.focus()
			verifyCode(pasted)
		} else if (pasted.length > 0) {
			const newCodigo = [...codigo]
			for (let i = 0; i < pasted.length; i++) {
				newCodigo[i] = pasted[i]
			}
			setCodigo(newCodigo)
			inputRefs.current[pasted.length]?.focus()
		}
	}

	const verifyCode = async (code?: string) => {
		const fullCode = code || codigo.join('')
		if (fullCode.length !== 6) {
			setError('Ingrese el código completo de 6 caracteres')
			return
		}

		setLoading(true)
		setError('')

		try {
			const res = await fetch(`${API}/auth/verificar-codigo`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ codigo: fullCode })
			})
			const data = await res.json()

			if (data.code === '01') {
				navigate(`/nueva-contrasena?email=${encodeURIComponent(email)}&codigo=${fullCode}`)
			} else {
				setError(data.message || 'Código inválido')
				setCodigo(['', '', '', '', '', ''])
				inputRefs.current[0]?.focus()
			}
		} catch {
			setError('Error de conexión. Intente de nuevo.')
		} finally {
			setLoading(false)
		}
	}

	const reenviarCodigo = async () => {
		setLoading(true)
		setError('')
		try {
			const res = await fetch(`${API}/auth/recuperar`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			})
			const data = await res.json()
			if (data.code === '01') {
				setError('')
				alert('Se envió un nuevo código a su correo')
			} else {
				setError(data.message || 'No se pudo reenviar el código')
			}
		} catch {
			setError('Error de conexión')
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
						Verificar código
					</h1>
					<p className="text-sm text-inst-texto-claro text-center mb-6">
						Ingrese el código de 6 caracteres enviado a <strong>{email}</strong>
					</p>

					<div className="edl-divider" />
					<div className="edl-divider-accent" />

					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-inst-rojo/20 rounded-lg text-sm text-inst-rojo flex items-center gap-2">
							<span className="material-icons text-base">error</span>
							{error}
						</div>
					)}

					{/* Input de 6 casillas */}
					<div className="flex justify-center gap-3 mt-6 mb-6">
						{codigo.map((char, i) => (
							<input
								key={i}
								ref={(el) => { inputRefs.current[i] = el }}
								type="text"
								maxLength={1}
								value={char}
								onChange={(e) => handleChange(i, e.target.value)}
								onKeyDown={(e) => handleKeyDown(i, e)}
								onPaste={i === 0 ? handlePaste : undefined}
								className="w-12 h-14 text-center text-xl font-mono font-bold border-2 border-inst-borde rounded-lg focus:border-inst-azul focus:outline-none transition-colors uppercase"
								disabled={loading}
							/>
						))}
					</div>

					<button
						onClick={() => verifyCode()}
						disabled={loading || codigo.join('').length !== 6}
						className="edl-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
					>
						{loading ? (
							<>
								<span className="material-icons text-base animate-spin">sync</span>
								Verificando...
							</>
						) : (
							<>
								<span className="material-icons text-base">verified</span>
								Verificar código
							</>
						)}
					</button>

					<button
						onClick={reenviarCodigo}
						disabled={loading}
						className="w-full text-sm text-inst-texto-claro hover:text-inst-azul transition-colors py-2"
					>
						¿No recibió el código? <span className="font-medium underline">Reenviar código</span>
					</button>

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
