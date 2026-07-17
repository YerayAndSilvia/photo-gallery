import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ChevronDown, ChevronUp, ImageIcon, Plus } from 'lucide-react'

function PostCard({ post, featured = false }) {
  const cardRef = useRef(null)
  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]
  const photo = post.photos?.[0]

  const onMouseMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12
    const y = ((e.clientY - r.top) / r.height - 0.5) * -12
    el.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-3px)`
    const img = el.querySelector('.pimg')
    if (img) img.style.transform = `scale(1.07) translate(${x * 0.35}px,${y * 0.35}px)`
  }
  const onMouseLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)'
    el.style.transition = 'transform 0.45s ease'
    const img = el.querySelector('.pimg')
    if (img) { img.style.transform = 'scale(1) translate(0,0)'; img.style.transition = 'transform 0.45s ease' }
  }
  const onMouseEnter = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'transform 0.08s ease'
    const img = el.querySelector('.pimg')
    if (img) img.style.transition = 'transform 0.08s ease'
  }

  return (
    <Link
      to={`/post/${post.id}`}
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      className="group block relative overflow-hidden rounded-2xl bg-[#1a1a1a]"
      style={{ willChange: 'transform', aspectRatio: featured ? '16/9' : '4/3' }}
    >
      {photo ? (
        <>
          <img src={photo} alt={post.title}
            className="pimg absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:brightness-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`} />
      )}

      {/* Número de fotos */}
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white/80 text-[11px] px-2 py-0.5 rounded-full border border-white/10 tabular-nums">
        {post.photos?.length || 0}
      </div>

      {/* Info inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <p className="font-display font-bold text-white leading-tight text-sm sm:text-base drop-shadow-lg">
          {post.title}
        </p>
        {post.description && (
          <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{post.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
          <span className="text-white/40 text-[11px]">{MONTHS[monthIdx]} {post.year}</span>
        </div>
      </div>
    </Link>
  )
}

function MonthSection({ monthNum, posts, gradient }) {
  const [open, setOpen] = useState(true)

  // Primera card más grande
  const [first, ...rest] = posts

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 group w-full text-left">
        <div className={`w-0.5 h-5 rounded-full bg-gradient-to-b ${gradient}`} />
        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest group-hover:text-white/70 transition-colors">
          {MONTHS[monthNum - 1]}
        </span>
        <span className="text-xs text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">{posts.length}</span>
        <span className="ml-auto text-white/20">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {open && (
        <div className="space-y-3">
          {/* Card featured (primera) */}
          <PostCard post={first} featured />
          {/* Resto en grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {rest.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function YearSection({ year, months }) {
  const [open, setOpen] = useState(true)

  return (
    <section className="space-y-8">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-4 w-full group">
        <span className="font-display font-black text-3xl text-white/80 group-hover:text-white transition-colors">
          {year}
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        {open ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
      </button>

      {open && (
        <div className="space-y-10">
          {Object.entries(months)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([mn, ps]) => (
              <MonthSection key={mn} monthNum={Number(mn)} posts={ps}
                gradient={MONTH_COLORS[Number(mn) - 1]} />
            ))}
        </div>
      )}
    </section>
  )
}

export default function Home() {
  const { getPostsByYear, loading } = useGallery()
  const grouped = getPostsByYear()
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <Layout>
      <div className="space-y-12">

        {/* Header */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-[11px] font-semibold text-pink-400/80 uppercase tracking-[0.2em] mb-2">Álbum personal</p>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white leading-none">
              Nuestra<br />Galería
            </h1>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg">
            <Plus className="w-4 h-4" />
            Nuevo
          </Link>
        </div>

        {/* Estados */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <span key={i} className="text-2xl"
                  style={{ animation: `heartbeat 1.2s ease-in-out ${i * 0.2}s infinite` }}>❤️</span>
              ))}
            </div>
            <p className="text-white/30 text-sm">Cargando...</p>
            <style>{`@keyframes heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}`}</style>
          </div>
        ) : years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white/20" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-white/60">Sin recuerdos aún</p>
              <p className="text-white/25 text-sm mt-1 max-w-xs">
                Sube vuestras primeras fotos para empezar el álbum.
              </p>
            </div>
            <Link to="/upload"
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all">
              <Plus className="w-4 h-4" />
              Subir fotos
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {years.map(y => <YearSection key={y} year={y} months={grouped[y]} />)}
          </div>
        )}
      </div>
    </Layout>
  )
}
