import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import SilviaWelcome from '../components/SilviaWelcome'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSilviaWelcome, setShowSilviaWelcome] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const ok = login(form.username, form.password)
    setLoading(false)
    if (ok) {
      form.username.toLowerCase() === 'silvia' ? setShowSilviaWelcome(true) : navigate('/')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  if (showSilviaWelcome) return <SilviaWelcome onFinish={() => navigate('/')} />

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>
      {/* Botón de tema — siempre visible arriba a la derecha */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle compact />
      </div>

      {/* Fondo atmosférico */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-pink-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-700/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Cabecera */}
        <div className="text-center mb-10">
          <div className="inline-flex w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl items-center justify-center mb-5 shadow-lg shadow-pink-500/25">
            <span className="text-xl">💕</span>
          </div>
          <h1 className="font-display font-black text-3xl leading-tight" style={{ color: 'var(--text)' }}>
            Nuestros Recuerdos
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-faint)' }}>Solo para vosotros dos</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Usuario"
              required
              className="input-theme w-full px-4 py-3 rounded-xl text-sm"
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Contraseña"
                required
                className="input-theme w-full px-4 py-3 pr-11 rounded-xl text-sm"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs px-1">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-sm shadow-lg mt-2"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
