import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import { MONTHS, MONTH_COLORS, CURRENT_YEAR } from '../utils/constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Calendar() {
  const { getPostsByYear } = useGallery()
  const [year, setYear] = useState(CURRENT_YEAR)
  const yearData = getPostsByYear()[year] || {}

  return (
    <div className="space-y-6">
      {/* Selector año */}
      <div className="flex items-center gap-4">
        <button onClick={() => setYear(y => y - 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-display font-black text-2xl w-16 text-center tabular-nums"
          style={{ color: 'var(--text)' }}>
          {year}
        </span>
        <button onClick={() => setYear(y => y + 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid meses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {MONTHS.map((month, idx) => {
          const posts = yearData[idx + 1] || []
          const has = posts.length > 0
          const gradient = MONTH_COLORS[idx]

          return (
            <div key={month}
              className={`rounded-xl overflow-hidden transition-all duration-200 ${
                has ? 'hover:-translate-y-0.5' : ''
              }`}
              style={{
                boxShadow: has ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
              }}>
              {/* Cabecera del mes */}
              <div className={`px-3 py-2.5 ${has ? `bg-gradient-to-r ${gradient}` : ''}`}
                style={!has ? { background: 'var(--bg-hover)' } : {}}>
                <p className={`text-sm font-semibold ${has ? 'text-white' : ''}`}
                  style={!has ? { color: 'var(--text-faint)' } : {}}>
                  {month}
                </p>
              </div>
              {/* Contenido */}
              <div className="p-2.5 min-h-[70px]"
                style={{ background: has ? 'var(--bg-card)' : 'var(--bg-surface)' }}>
                {has ? (
                  <ul className="space-y-1">
                    {posts.map(p => (
                      <li key={p.id}>
                        <Link to={`/post/${p.id}`}
                          className="flex items-center gap-1.5 text-[11px] transition-colors group"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                          <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`} />
                          <span className="truncate">{p.title}</span>
                          <span className="ml-auto flex-shrink-0 tabular-nums" style={{ color: 'var(--text-faint)' }}>
                            {p.photos?.length}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-center mt-1.5" style={{ color: 'var(--text-faint)' }}>—</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
