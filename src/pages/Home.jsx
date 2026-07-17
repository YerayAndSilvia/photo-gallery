import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ChevronDown, ChevronUp, ImageIcon, PlusCircle, Calendar } from 'lucide-react'

// Parallax en hover para cada card
function PostCard({ post }) {
  const cardRef = useRef(null)
  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]
  const firstPhoto = post.photos?.[0]

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14
    card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`
    const img = card.querySelector('.parallax-img')
    if (img) {
      img.style.transform = `scale(1.08) translate(${x * 0.4}px, ${y * 0.4}px)`
    }
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    card.style.transition = 'transform 0.5s ease'
    const img = card.querySelector('.parallax-img')
    if (img) {
      img.style.transform = 'scale(1) translate(0,0)'
      img.style.transition = 'transform 0.5s ease'
    }
  }

  const handleMouseEnter = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'transform 0.1s ease, box-shadow 0.2s ease'
    const img = card.querySelector('.parallax-img')
    if (img) img.style.transition = 'transform 0.1s ease'
  }

  return (
    <Link
      to={`/post/${post.id}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 border border-white/40"
      style={{ willChange: 'transform' }}
    >
      {/* Imagen landscape 16/9 */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {firstPhoto ? (
          <>
            <img
              src={firstPhoto}
              alt={post.title}
              className="parallax-img w-full h-full object-cover transition-transform duration-300"
            />
            {/* Overlay degradado */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <ImageIcon className="w-12 h-12 text-white/40" />
          </div>
        )}

        {/* Badge fotos */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full border border-white/20">
          {post.photos?.length || 0} foto{post.photos?.length !== 1 ? 's' : ''}
        </div>

        {/* Info sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-base leading-tight drop-shadow">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-white/70 text-xs mt-1 line-clamp-1">{post.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`} />
            <span className="text-white/60 text-xs">{MONTHS[(post.month || 1) - 1]} {post.year}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function MonthSection({ monthNum, posts, gradient }) {
  const [open, setOpen] = useState(true)
  const monthName = MONTHS[monthNum - 1]

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 rounded-full bg-gradient-to-b ${gradient}`} />
          <span className="font-semibold text-gray-700 text-sm tracking-wide uppercase">
            {monthName}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {posts.length}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function YearSection({ year, months }) {
  const [open, setOpen] = useState(true)
  const totalPosts = Object.values(months).flat().length

  return (
    <div className="space-y-6">
      {/* Divisor de año */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 group"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
        <div className="flex items-center gap-2.5 px-5 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Calendar className="w-4 h-4 text-pink-400" />
          <span className="font-bold text-gray-700 text-xl tracking-tight">{year}</span>
          <span className="text-xs text-gray-400 bg-pink-50 px-2 py-0.5 rounded-full">
            {totalPosts} post{totalPosts !== 1 ? 's' : ''}
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
      </button>

      {open && (
        <div className="space-y-8 pl-0">
          {Object.entries(months)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([monthNum, posts]) => (
              <MonthSection
                key={monthNum}
                monthNum={Number(monthNum)}
                posts={posts}
                gradient={MONTH_COLORS[Number(monthNum) - 1]}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { getPostsByYear, loading } = useGallery()
  const grouped = getPostsByYear()
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-pink-400 uppercase mb-1">Álbum</p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
              Nuestra Galería
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Todos vuestros momentos especiales</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all duration-150 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Nuevo post
          </Link>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="text-2xl select-none"
                  style={{ animation: `heartPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                >
                  ❤️
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-sm">Cargando recuerdos...</p>
            <style>{`
              @keyframes heartPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.4); }
              }
            `}</style>
          </div>
        ) : years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-100 rounded-3xl flex items-center justify-center shadow-inner">
              <ImageIcon className="w-10 h-10 text-pink-300" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">Aún no hay recuerdos</h2>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                Empieza subiendo vuestras primeras fotos para crear un álbum lleno de momentos especiales.
              </p>
            </div>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              Subir primeras fotos
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {years.map((year) => (
              <YearSection key={year} year={year} months={grouped[year]} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
