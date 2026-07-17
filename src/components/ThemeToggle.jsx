import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Botón de cambio de tema.
 * compact=true → solo icono cuadrado (para topbar móvil y login)
 * compact=false → icono + texto (para sidebar desktop)
 */
export default function ThemeToggle({ compact = false }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={`relative flex items-center justify-center rounded-xl transition-colors duration-200 ${
        compact ? 'w-8 h-8' : 'w-full gap-2.5 px-3 py-2'
      }`}
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-hover)'
        e.currentTarget.style.color = 'var(--text)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ''
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
    >
      {/* Icono único que rota al cambiar de tema */}
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-30deg) scale(1)',
          transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {isDark
          ? <Sun className="w-4 h-4" />
          : <Moon className="w-4 h-4" />
        }
      </span>

      {!compact && (
        <span className="font-display font-bold text-sm">
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </span>
      )}
    </button>
  )
}
