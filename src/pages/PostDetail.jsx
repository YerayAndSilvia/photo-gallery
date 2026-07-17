import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'

function ParallaxHero({ photo, gradient, onClick }) {
  const heroRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const handler = () => {
      if (!heroRef.current || !imgRef.current) return
      const { top } = heroRef.current.getBoundingClientRect()
      imgRef.current.style.transform = `scale(1.12) translateY(${(top / window.innerHeight) * 35}px)`
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div ref={heroRef} onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl cursor-zoom-in"
      style={{ height: 'clamp(260px, 52vh, 500px)' }}>
      {photo ? (
        <>
          <img ref={imgRef} src={photo} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scale(1.12)', transition: 'transform 0.06s linear', willChange: 'transform' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
      )}
    </div>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPostById, deletePost } = useGallery()
  const post = getPostById(id)

  const [lightbox, setLightbox] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeThumb, setActiveThumb] = useState(0)

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e) => {
      const len = photos.length
      if (e.key === 'ArrowLeft') setLightbox(i => (i > 0 ? i - 1 : len - 1))
      if (e.key === 'ArrowRight') setLightbox(i => (i < len - 1 ? i + 1 : 0))
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  if (!post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p style={{ color: 'var(--text-muted)' }}>Post no encontrado</p>
          <Link to="/" className="text-pink-400 hover:text-pink-300 text-sm">← Volver</Link>
        </div>
      </Layout>
    )
  }

  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]
  const photos = post.photos || []

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (photos.length > 0) {
        const paths = photos.map(url => {
          const m = `/object/public/${STORAGE_BUCKET}/`
          const i = url.indexOf(m)
          return i !== -1 ? url.slice(i + m.length) : null
        }).filter(Boolean)
        if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths)
      }
      await deletePost(id)
      navigate('/')
      window.location.reload()
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Barra nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm transition-colors group"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Volver
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>¿Eliminar?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-60 flex items-center gap-1.5 transition-colors">
                {deleting
                  ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  : null}
                {deleting ? 'Borrando...' : 'Sí'}
              </button>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                No
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all hover:text-red-400 hover:bg-red-500/10"
              style={{ color: 'var(--text-faint)' }}>
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>

        {/* Hero parallax */}
        {photos.length > 0 && (
          <ParallaxHero photo={photos[activeThumb]} gradient={gradient}
            onClick={() => setLightbox(activeThumb)} />
        )}

        {/* Info */}
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

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
            {photos.map((p, i) => (
              <button key={i} onClick={() => { setActiveThumb(i); setLightbox(i) }}
                className="flex-shrink-0 snap-start rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  width: 90, height: 64,
                  opacity: activeThumb === i ? 1 : 0.5,
                  outline: activeThumb === i ? '2px solid #f472b6' : 'none',
                  outlineOffset: '1px',
                  transform: activeThumb === i ? 'scale(1.04)' : 'scale(1)',
                }}>
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
            <X className="w-4 h-4" />
          </button>

          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/30 text-sm tabular-nums">
            {lightbox + 1} / {photos.length}
          </p>

          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(i => i > 0 ? i - 1 : photos.length - 1) }}
              className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <img src={photos[lightbox]} alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl select-none"
            onClick={e => e.stopPropagation()} draggable={false} />

          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(i => i < photos.length - 1 ? i + 1 : 0) }}
              className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === lightbox ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'
                  }`} />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
