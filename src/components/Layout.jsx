import { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, LayoutGrid, LogOut, CalendarDays, Pencil, Trash2, Heart } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ProfileAvatar({ user, onEdit, onRemove }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative group focus:outline-none"
        aria-label="Perfil"
      >
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt="perfil"
            className="w-9 h-9 rounded-full object-cover ring-1 ring-black/10 group-hover:ring-pink-400/60 transition-all"
            style={{ ringColor: 'var(--border)' }}
          />
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold ring-1 group-hover:ring-pink-400/60 transition-all"
            style={{ ringColor: 'var(--border)' }}>
            {user?.avatar}
          </div>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Pencil className="w-2 h-2 text-pink-400" />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-12 z-50 rounded-xl shadow-2xl p-1.5 w-44"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => { setOpen(false); onEdit() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Pencil className="w-3.5 h-3.5" />
              {user?.profilePhoto ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {user?.profilePhoto && (
              <button
                onClick={() => { setOpen(false); onRemove() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Quitar foto
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}


const navLinks = [
  { to: '/', label: 'Galería', icon: LayoutGrid },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/upload', label: 'Subir', icon: PlusCircle },
]

export default function Layout({ children }) {
  const { user, logout, updateProfilePhoto, isSilvia } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/login') }
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    updateProfilePhoto(await toBase64(file))
    e.target.value = ''
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* ── Sidebar desktop ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 z-50 px-4 py-6"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 group">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="leading-none">
            <p className="font-display font-black text-sm" style={{ color: 'var(--text)' }}>Nuestra</p>
            <p className="font-display font-black text-sm" style={{ color: 'var(--text)' }}>Galería{isSilvia ? ' 💕' : ''}</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
                style={{
                  background: active ? 'var(--bg-hover)' : '',
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' } }}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-pink-400' : ''}`} />
                <span className="font-display font-bold text-sm">{label}</span>
                {active && <span className="ml-auto w-1 h-1 rounded-full bg-pink-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="pt-4 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Tema */}
          <ThemeToggle />

          <div className="flex items-center gap-2.5 px-3 py-2">
            <ProfileAvatar
              user={user}
              onEdit={() => fileInputRef.current?.click()}
              onRemove={() => updateProfilePhoto(null)}
            />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm leading-none truncate" style={{ color: 'var(--text)' }}>{user?.username}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>perfil</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm group"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-display font-bold text-sm">Salir</span>
          </button>
        </div>
      </aside>

      {/* ── Topbar sm/md (tablet/móvil) ─────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl h-13"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="h-13 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display font-black text-sm" style={{ color: 'var(--text)' }}>
              {isSilvia ? 'Nuestra Galería 💕' : 'Nuestra Galería'}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <ProfileAvatar
              user={user}
              onEdit={() => fileInputRef.current?.click()}
              onRemove={() => updateProfilePhoto(null)}
            />
            <button onClick={handleLogout} className="ml-1 transition-colors" style={{ color: 'var(--text-faint)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido principal ──────────────────────────── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 pt-20 lg:pt-8 pb-24 lg:pb-10 max-w-5xl w-full mx-auto lg:mx-0">
          {children}
        </main>

        <footer className="text-center py-5 text-[11px] font-display" style={{ color: 'var(--text-faint)' }}>
          {isSilvia ? '💕 Hecho con mucho amor para Silvia 💕' : 'Hecho con 💕 para Yeray y Silvia'}
        </footer>
      </div>

      {/* ── Bottom nav móvil ─────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="flex">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                style={{ color: active ? 'var(--text)' : 'var(--text-faint)' }}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-pink-400' : ''}`} />
                <span className="font-display font-bold text-[10px]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
