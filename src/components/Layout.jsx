import { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Camera, PlusCircle, Home, LogOut, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import HeartsBackground from './HeartsBackground'

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ProfileAvatar({ user, onEdit, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="relative group focus:outline-none"
        aria-label="Perfil"
      >
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt="perfil"
            className="w-8 h-8 rounded-full object-cover shadow ring-2 ring-pink-200 group-hover:ring-pink-400 transition-all"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ring-2 ring-transparent group-hover:ring-pink-300 transition-all">
            {user?.avatar}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="w-2 h-2 text-pink-400" />
        </div>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-48">
            <button
              onClick={() => { setMenuOpen(false); onEdit() }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {user?.profilePhoto ? 'Cambiar foto' : 'Subir foto de perfil'}
            </button>
            {user?.profilePhoto && (
              <button
                onClick={() => { setMenuOpen(false); onRemove() }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-400 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
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
  const handleEditPhoto = () => fileInputRef.current?.click()
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    updateProfilePhoto(await toBase64(file))
    e.target.value = ''
  }

  const navLinks = [
    { to: '/', label: 'Galería', icon: Home },
    { to: '/calendar', label: 'Calendario', icon: CalendarDays },
    { to: '/upload', label: 'Subir', icon: PlusCircle },
  ]

  return (
    <div className="relative min-h-screen bg-[#f8f7f5]">
      {isSilvia && <HeartsBackground />}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900 text-base tracking-tight hidden sm:block">
              {isSilvia ? 'Nuestra Galería 💕' : 'Nuestra Galería'}
            </span>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Derecha */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <ProfileAvatar user={user} onEdit={handleEditPhoto} onRemove={() => updateProfilePhoto(null)} />
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.username}
            </span>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="sm:hidden flex border-t border-gray-100 bg-white">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  active ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                {label}
              </Link>
            )
          })}
        </div>
      </header>

      {/* Contenido */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {children}
      </main>

      <footer className="relative z-10 text-center py-6 text-xs text-gray-300">
        {isSilvia ? '💕 Hecho con mucho amor para Silvia 💕' : 'Hecho con 💕 para Yeray y Silvia'}
      </footer>
    </div>
  )
}
