import { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Camera, PlusCircle, Home, LogOut, CalendarDays, Pencil, Trash2, X } from 'lucide-react'
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
            className="w-9 h-9 rounded-full object-cover shadow ring-2 ring-pink-200 group-hover:ring-pink-400 transition-all"
          />
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow ring-2 ring-transparent group-hover:ring-pink-300 transition-all">
            {user?.avatar}
          </div>
        )}
        {/* Lápiz pequeño */}
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="w-2.5 h-2.5 text-pink-400" />
        </div>
      </button>

      {/* Menú desplegable */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-11 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-48">
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleEditPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await toBase64(file)
    updateProfilePhoto(base64)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    updateProfilePhoto(null)
  }

  const navLinks = [
    { to: '/', label: 'Galería', icon: Home },
    { to: '/calendar', label: 'Calendario', icon: CalendarDays },
    { to: '/upload', label: 'Subir fotos', icon: PlusCircle },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Fondo de corazones solo para Silvia */}
      {isSilvia && <HeartsBackground />}

      {/* Input oculto para foto de perfil */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm shadow-pink-100/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-300/40 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">
              Nuestra Galería{isSilvia ? ' 💕' : ''}
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md shadow-pink-300/40'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Usuario */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Avatar con edición de foto */}
              <ProfileAvatar
                user={user}
                onEdit={handleEditPhoto}
                onRemove={handleRemovePhoto}
              />
              <span className="hidden sm:block text-sm font-medium text-gray-600">
                {user?.username}
                {isSilvia && <span className="ml-1">💕</span>}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-gray-100">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-all ${
                  active ? 'text-pink-500' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </header>

      {/* Contenido */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-gray-300">
        {isSilvia ? '💕 Hecho con mucho amor para Silvia 💕' : 'Hecho con 💕 para Yeray y Silvia'}
      </footer>
    </div>
  )
}
