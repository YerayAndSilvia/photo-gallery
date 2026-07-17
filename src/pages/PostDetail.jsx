import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, X, Calendar, Images } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'

// Hero con efecto parallax al hacer scroll
function ParallaxHero({ photo, gradient, onClick }) {
  const heroRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current || !imgRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const offset = (rect.top / window.innerHeight) * 40
      imgRef.current.style.transform = `scale(1.15) translateY(${offset}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={heroRef}
      className="relative w-full overflow-hidden rounded-3xl cursor-zoom-in shadow-2xl"
      style={{ height: 'clamp(280px, 55vh, 520px)' }}
      onClick={onClick}
    >
      {photo ? (
        <>
          <img
            ref={imgRef}
            src={photo}
            alt="portada"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scale(1.15)', transition: 'transform 0.05s linear', willChange: 'transform' }}
          />
          {/* Gradiente inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Gradiente lateral sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
      )}

      {/* Hint de click */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/20">
        <Images className="w-3.5 h-3.5" />
        Ver en grande
      </div>
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

  if (!post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-gray-500">Post no encontrado</p>
          <Link to="/" className="text-pink-500 hover:underline text-sm">← Volver a la galería</Link>
        </div>
      </Layout>
    )
  }

  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]
  const monthName = MONTHS[monthIdx]
  const photos = post.photos || []

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (photos.length > 0) {
        const paths = photos.map((url) => {
          const marker = `/object/public/${STORAGE_BUCKET}/`
          const idx = url.indexOf(marker)
          return idx !== -1 ? url.slice(idx + marker.length) : null
        }).filter(Boolean)
        if (paths.length > 0) {
          await supabase.storage.from(STORAGE_BUCKET).remove(paths)
        }
      }
      await deletePost(id)
      navigate('/')
      window.location.reload()
    } catch (err) {
      console.error('Error eliminando el post:', err)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const prevPhoto = () => setLightbox((i) => (i > 0 ? i - 1 : photos.length - 1))
  const nextPhoto = () => setLightbox((i) => (i < photos.length - 1 ? i + 1 : 0))

  // Navegar lightbox con teclado
  useEffect(() => {
    if (lightbox === null) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Barra superior */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">¿Eliminar este post?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Eliminando...
                  </>
                ) : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>

        {/* Hero parallax con foto activa */}
        {photos.length > 0 && (
          <ParallaxHero
            photo={photos[activeThumb]}
            gradient={gradient}
            onClick={() => setLightbox(activeThumb)}
          />
        )}

        {/* Info del post */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{monthName} {post.year}</span>
              </div>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{photos.length} foto{photos.length !== 1 ? 's' : ''}</span>
            </div>
            {post.description && (
              <p className="text-gray-600 leading-relaxed pt-1">{post.description}</p>
            )}
          </div>
          {/* Pill de mes */}
          <div className={`flex-shrink-0 self-start px-4 py-2 rounded-2xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-md`}>
            {monthName} {post.year}
          </div>
        </div>

        {/* Thumbnails horizontales */}
        {photos.length > 1 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Todas las fotos
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveThumb(idx); setLightbox(idx) }}
                  className={`flex-shrink-0 snap-start rounded-xl overflow-hidden transition-all duration-200 ${
                    activeThumb === idx
                      ? 'ring-2 ring-pink-400 ring-offset-2 shadow-lg scale-[1.03]'
                      : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'
                  }`}
                  style={{ width: 100, height: 72 }}
                >
                  <img src={photo} alt={`foto ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
            {lightbox + 1} / {photos.length}
          </div>

          {photos.length > 1 && (
            <button
              className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prevPhoto() }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <img
            src={photos[lightbox]}
            alt={`foto ${lightbox + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {photos.length > 1 && (
            <button
              className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); nextPhoto() }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnails en lightbox */}
          {photos.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === lightbox ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
