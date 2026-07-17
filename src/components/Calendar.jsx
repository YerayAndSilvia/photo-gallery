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
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-display font-black text-2xl text-white w-16 text-center tabular-nums">{year}</span>
        <button onClick={() => setYear(y => y + 1)}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
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
                has ? 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30' : ''
              }`}>
              <div className={`px-3 py-2.5 ${has ? `bg-gradient-to-r ${gradient}` : 'bg-white/[0.04]'}`}>
                <p className={`text-sm font-semibold ${has ? 'text-white' : 'text-white/20'}`}>{month}</p>
              </div>
              <div className={`p-2.5 min-h-[70px] ${has ? 'bg-white/[0.03]' : 'bg-white/[0.02]'}`}>
                {has ? (
                  <ul className="space-y-1">
                    {posts.map(p => (
                      <li key={p.id}>
                        <Link to={`/post/${p.id}`}
                          className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white transition-colors group">
                          <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`} />
                          <span className="truncate group-hover:text-white/80">{p.title}</span>
                          <span className="ml-auto text-white/20 flex-shrink-0 tabular-nums">{p.photos?.length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-white/15 text-center mt-1.5">—</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
