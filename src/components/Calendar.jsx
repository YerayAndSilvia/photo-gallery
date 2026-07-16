import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import { MONTHS, MONTH_COLORS, CURRENT_YEAR, YEARS } from '../utils/constants'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'

export default function Calendar() {
  const { getPostsByYear } = useGallery()
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const grouped = getPostsByYear()
  const yearData = grouped[selectedYear] || {}

  const prevYear = () => setSelectedYear((y) => y - 1)
  const nextYear = () => setSelectedYear((y) => y + 1)

  return (
    <div className="space-y-6">
      {/* Selector de año */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevYear}
          className="w-10 h-10 rounded-full bg-white shadow hover:shadow-md flex items-center justify-center text-gray-500 hover:text-pink-500 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-3xl font-bold text-gray-800 w-20 text-center">{selectedYear}</span>
        <button
          onClick={nextYear}
          className="w-10 h-10 rounded-full bg-white shadow hover:shadow-md flex items-center justify-center text-gray-500 hover:text-pink-500 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Grid de 12 meses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {MONTHS.map((month, idx) => {
          const monthPosts = yearData[idx + 1] || []
          const hasPosts = monthPosts.length > 0
          const gradient = MONTH_COLORS[idx]

          return (
            <div
              key={month}
              className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
                hasPosts
                  ? 'border-transparent shadow-lg hover:shadow-xl hover:-translate-y-1'
                  : 'border-gray-100 bg-white/50'
              }`}
            >
              {/* Cabecera del mes */}
              <div
                className={`px-4 py-3 ${
                  hasPosts
                    ? `bg-gradient-to-r ${gradient}`
                    : 'bg-gray-50'
                }`}
              >
                <p className={`text-sm font-bold ${hasPosts ? 'text-white' : 'text-gray-400'}`}>
                  {month}
                </p>
              </div>

              {/* Lista de posts o vacío */}
              <div className="bg-white p-3 min-h-[80px]">
                {hasPosts ? (
                  <ul className="space-y-1.5">
                    {monthPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={`/post/${post.id}`}
                          className="flex items-center gap-2 text-xs text-gray-600 hover:text-pink-500 transition-colors group"
                        >
                          <ImageIcon className="w-3 h-3 flex-shrink-0 text-pink-300 group-hover:text-pink-500" />
                          <span className="truncate">{post.title}</span>
                          <span className="ml-auto text-gray-300 flex-shrink-0">{post.photos?.length || 0}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-300 text-center mt-2">Sin recuerdos aún</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
