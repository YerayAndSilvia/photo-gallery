import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'

// ─── Parallax hero ────────────────────────────────────────────────────────
function ParallaxHero({ photo, gradient, onClick }) {
  const heroRef = useRef(null)
  const imgRef  = useRef(null)

  useEffect(() => {
    const handler = () => {
      if (!heroRef.current || !imgRef.current) return
      const { top } = heroRef.current.getBoundingClientRect()
      const offset = (top / window.innerHeight) * 35
      imgRef.current.style.transform = `scale(1.12) translateY(${offset}px)`
    }
    window.addEventListener('scroll', handler, { passive: true })
    // Calcular posición inicial
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div
      ref={heroRef}
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl cursor-zoom-in"
      style={{ height: 'clamp(260px, 52vh, 500px)' }}
      role="button"
      aria-label="Ver foto en pantalla completa"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {photo ? (
        <>
          <img
            ref={imgRef}
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scale(1.12)', transition: 'transform 0.06s linear', willChange: 'transform' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
      )}
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({ photos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex)

  const prev = useCallback(() => setIdx(i => (i > 0 ? i - 1 : photos.length - 1)), [photos.length])
  const next = useCallback(() => setIdx(i => (i < photos.length - 1 ? i + 1 : 0)), [photos.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, onClose])

  // Bloquear scroll del body mientras el lightbox está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${idx + 1} de ${photos.length}`}
    >
      {/* Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Contador */}
      <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/30 text-sm tabular-nums select-none">
        {idx + 1} / {photos.length}
      </p>

      {/* Anterior */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Imagen */}
      <img
        src={photos[idx]}
        alt={`Foto ${idx + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl select-none"
        onClick={e => e.stopPropagation()}
        draggable={false}
      />

      {/* Siguiente */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          aria-label="Foto siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Puntos de navegación */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i) }}
              aria-label={`Ir a foto ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === idx ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PostDetail ───────────────────────────────────────────────────────────
export default function PostDetail() {
  const { id }                   = useParams()
  const navigate                 = useNavigate()
  const { getPostById, deletePost } = useGallery()
  const post                     = getPostById(id)

  const [lightboxIdx, setLightboxIdx]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [activeThumb, setActiveThumb]     = useState(0)

  if (!post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p style={{ color: 'var(--text-muted)' }}>Post no encontrado</p>
          <Link to="/" className="text-pink-400 hover:text-pink-300 text-sm transition-colors">
            ← Volver a la galería
          </Link>
        </div>
      </Layout>
    )
  }

  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]
  const photos   = post.photos || []

  const handleDelete = async () => {
    setDeleting(true)
    try {
      // Borrar archivos del storage
      if (photos.length > 0) {
        const paths = photos
          .map(url => {
            const marker = `/object/public/${STORAGE_BUCKET}/`
            const i = url.indexOf(marker)
            return i !== -1 ? url.slice(i + marker.length) : null
          })
          .filter(Boolean)
        if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths)
      }
      await deletePost(String(id))
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Error al eliminar el post:', err)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Barra nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm transition-colors group"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            Volver
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>¿Eliminar?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-60 flex items-center gap-1.5 transition-colors"
              >
                {deleting && (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {deleting ? 'Borrando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all hover:text-red-400 hover:bg-red-500/10"
              style={{ color: 'var(--text-faint)' }}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Eliminar
            </button>
          )}
        </div>

        {/* Hero parallax */}
        {photos.length > 0 && (
          <ParallaxHero
            photo={photos[activeThumb]}
            gradient={gradient}
            onClick={() => setLightboxIdx(activeThumb)}
          />
        )}

        {/* Info del post */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display font-black text-3xl leading-tight" style={{ color: 'var(--text)' }}>
              {post.title}
            </h1>
            <span className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white font-semibold`}>
              {MONTHS[monthIdx]} {post.year}
            </span>
          </div>
          {post.description && (
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{post.description}</p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {photos.length} foto{photos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Miniaturas */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x" role="list" aria-label="Miniaturas de fotos">
            {photos.map((p, i) => (
              <button
                key={i}
                role="listitem"
                onClick={() => setActiveThumb(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={activeThumb === i}
                className="flex-shrink-0 snap-start rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  width: 90,
                  height: 64,
                  opacity: activeThumb === i ? 1 : 0.5,
                  outline: activeThumb === i ? '2px solid #f472b6' : 'none',
                  outlineOffset: '1px',
                  transform: activeThumb === i ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <img src={p} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — componente separado con su propio estado */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </Layout>
  )
}
