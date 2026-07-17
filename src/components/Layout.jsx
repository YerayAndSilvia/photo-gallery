import { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Camera, PlusCircle, LayoutGrid, LogOut, CalendarDays, Pencil, Trash2 } from 'lucide-react'

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
      <button onClick={() => setOpen((o) => !o)} className="relative group focus:outline-none" aria-label="Perfil">
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt="perfil"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 group-hover:ring-pink-400 transition-all" />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10 group-hover:ring-pink-400 transition-all">
            {user?.avatar}
          </div>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1a1a1a] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
          <Pencil className="w-1.5 h-1.5 text-pink-400" />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-[#1c1c1c] rounded-xl shadow-2xl border border-white/10 p-1.5 w-44">
            <button onClick={() => { setOpen(false); onEdit() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              {user?.profilePhoto ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {user?.profilePhoto && (
              <button onClick={() => { setOpen(false); onRemove() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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

  const navLinks = [
    { to: '/', label: 'Galería', icon: LayoutGrid },
    { to: '/calendar', label: 'Calendario', icon: CalendarDays },
    { to: '/upload', label: 'Subir', icon: PlusCircle },
  ]

  return (
    <div className="relative min-h-screen bg-[#0e0e0e]">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm tracking-tight hidden sm:block">
              {isSilvia ? 'Nuestra Galería 💕' : 'Nuestra Galería'}
            </span>
          </Link>

          {/* Separador */}
          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          {/* Nav desktop */}
          <nav className="hidden sm:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? 'text-white bg-white/10'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-pink-400' : ''}`} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Derecha */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <ProfileAvatar user={user} onEdit={() => fileInputRef.current?.click()} onRemove={() => updateProfilePhoto(null)} />
            <span className="hidden sm:block text-sm text-white/50 font-medium">{user?.username}</span>
            <div className="w-px h-4 bg-white/10 hidden sm:block" />
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden flex border-t border-white/[0.06] bg-[#0e0e0e]">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-white' : 'text-white/30'
                }`}>
                <Icon className={`w-5 h-5 ${active ? 'text-pink-400' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {children}
      </main>

      <footer className="text-center py-6 text-xs text-white/15">
        {isSilvia ? '💕 Hecho con mucho amor para Silvia 💕' : 'Hecho con 💕 para Yeray y Silvia'}
      </footer>
    </div>
  )
}
