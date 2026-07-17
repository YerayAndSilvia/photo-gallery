import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ChevronDown, ChevronUp, ImageIcon, Plus, ChevronLeft, ChevronRight, X, Trash2, Calendar } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'

// ─── Hero intro animation ──────────────────────────────────────────────────
// Técnica: el título siempre está centrado con translate(-50%,-50%).
// Para "moverse" a arriba-izq usamos scaleX/scaleY + translate en el mismo
// transform, manteniendo las mismas unidades todo el tiempo.
// Fases: enter (fade-in) → hold (quieto) → exit (fade-out con leve upward drift) → done
function HeroIntro({ onDone }) {
  const [phase, setPhase] = useState('enter') // enter | hold | exit | done
  const [show, setShow] = useState(false)      // dispara el fade-in tras 1 frame

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    // enter → hold al terminar el fade-in (600ms)
    const t1 = setTimeout(() => setPhase('hold'), 600)
    // hold → exit después de 1.6s visible
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    // exit → done cuando termina el fade-out (800ms)
    const t3 = setTimeout(() => { setPhase('done'); onDone() }, 3100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  if (phase === 'done') return null

  const isExit = phase === 'exit'

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none" aria-hidden="true">
      {/* Overlay — misma transición que el título */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--bg)',
          opacity: isExit ? 0 : show ? 1 : 0,
          transition: isExit
            ? 'opacity 0.75s cubic-bezier(0.4,0,0.6,1)'
            : 'opacity 0.6s ease',
        }}
      />

      {/* Título centrado, se eleva ligeramente al salir */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: isExit
            ? 'translate(-50%, calc(-50% - 24px))'  // sube 24px al salir
            : 'translate(-50%, -50%)',
          opacity: isExit ? 0 : show ? 1 : 0,
          transition: isExit
            ? 'opacity 0.65s cubic-bezier(0.4,0,1,1), transform 0.75s cubic-bezier(0.4,0,0.2,1)'
            : 'opacity 0.6s ease',
          textAlign: 'center',
          zIndex: 10,
          willChange: 'opacity, transform',
        }}
      >
        <p className="font-semibold text-pink-400/80 uppercase tracking-[0.3em] mb-4"
          style={{ fontSize: '0.7rem' }}>
          Álbum personal
        </p>
        <span
          className="font-display font-black"
          style={{
            display: 'block',
            color: 'var(--text)',
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            lineHeight: 1.05,
          }}
        >
          Nuestra<br />Galería
        </span>
      </div>
    </div>
  )
}

// ─── Post modal ────────────────────────────────────────────────────────────
function PostModal({ post, onClose, onDelete }) {
  const [idx, setIdx] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imgVisible, setImgVisible] = useState(true)
  const photos = post.photos || []
  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, photos.length])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const goTo = (i) => {
    setImgVisible(false)
    setTimeout(() => { setIdx(i); setImgVisible(true) }, 180)
  }
  const prev = () => goTo(idx > 0 ? idx - 1 : photos.length - 1)
  const next = () => goTo(idx < photos.length - 1 ? idx + 1 : 0)

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
      await onDelete(post.id)
      onClose()
      window.location.reload()
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Ventana modal */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{
          maxHeight: '88vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Foto ── */}
        <div className="relative md:w-[58%] flex-shrink-0 bg-black flex items-center justify-center"
          style={{ minHeight: 240 }}>
          {photos.length > 0 ? (
            <img
              src={photos[idx]}
              alt={post.title}
              className="w-full h-full object-cover"
              style={{ opacity: imgVisible ? 1 : 0, transition: 'opacity 0.18s ease', maxHeight: '88vh' }}
            />
          ) : (
            <div className={`w-full h-full min-h-[240px] bg-gradient-to-br ${gradient}`} />
          )}

          {photos.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors border border-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors border border-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`} />
                ))}
              </div>
            </>
          )}

          {photos.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white/70 text-[11px] px-2 py-0.5 rounded-full border border-white/10 tabular-nums">
              {idx + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-black text-xl leading-tight" style={{ color: 'var(--text)' }}>
                {post.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                <span className="text-sm font-display" style={{ color: 'var(--text-muted)' }}>
                  {MONTHS[monthIdx]} {post.year}
                </span>
                {photos.length > 0 && (
                  <>
                    <span style={{ color: 'var(--text-faint)' }}>·</span>
                    <span className="text-sm tabular-nums" style={{ color: 'var(--text-faint)' }}>
                      {photos.length} foto{photos.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {post.description ? (
            <p className="leading-relaxed text-sm flex-1" style={{ color: 'var(--text-muted)' }}>{post.description}</p>
          ) : (
            <p className="text-sm italic flex-1" style={{ color: 'var(--text-faint)' }}>Sin descripción</p>
          )}

          {photos.length > 1 && (
            <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-150 ${
                    i === idx ? 'scale-[1.05]' : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    width: 52, height: 38,
                    outline: i === idx ? '2px solid #f472b6' : 'none',
                    outlineOffset: i === idx ? '1px' : '0',
                  }}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>¿Eliminar este post?</span>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-60 flex items-center gap-1.5 transition-colors">
                  {deleting && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>}
                  {deleting ? 'Borrando...' : 'Sí, eliminar'}
                </button>
                <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-sm transition-colors hover:text-red-400"
                style={{ color: 'var(--text-faint)' }}>
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar post
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Post card ─────────────────────────────────────────────────────────────
// Tamaños fijos: featured = 320px de alto, card normal = 220px.
// El efecto parallax mueve la imagen según la posición del cursor dentro
// de la tarjeta: translateX/Y hasta ±12px (featured) / ±8px (normal).
const CARD_HEIGHT_FEATURED = 320
const CARD_HEIGHT_NORMAL   = 220
const PARALLAX_RANGE       = 12  // px máx de desplazamiento de la imagen

function PostCard({ post, featured = false, onOpen }) {
  const photos    = post.photos || []
  const monthIdx  = (post.month || 1) - 1
  const gradient  = MONTH_COLORS[monthIdx]
  const cardRef   = useRef(null)
  const imgRef    = useRef(null)
  const rafRef    = useRef(null)
  const height    = featured ? CARD_HEIGHT_FEATURED : CARD_HEIGHT_NORMAL
  const range     = featured ? PARALLAX_RANGE : PARALLAX_RANGE * 0.65

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || !imgRef.current) return
    const rect   = cardRef.current.getBoundingClientRect()
    // Posición normalizada de -1 a 1 dentro de la tarjeta
    const nx = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2
    const ny = ((e.clientY - rect.top)   / rect.height - 0.5) * 2
    const tx = -(nx * range)
    const ty = -(ny * range)

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (imgRef.current) {
        // scale(1.10) para que haya margen al trasladar sin descubrir bordes
        imgRef.current.style.transform = `scale(1.10) translate(${tx}px, ${ty}px)`
      }
    })
  }, [range])

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (imgRef.current) {
      imgRef.current.style.transform = 'scale(1.10) translate(0px, 0px)'
    }
  }, [])

  // Limpiar raf al desmontar
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <button
      ref={cardRef}
      onClick={() => onOpen(post)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full overflow-hidden rounded-2xl text-left active:scale-[0.98]"
      style={{
        height,
        flexShrink: 0,
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
      }}
    >
      {photos[0] ? (
        <img
          ref={imgRef}
          src={photos[0]}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'scale(1.10) translate(0px, 0px)',
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
          }}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Gradiente base para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Overlay sutil en hover */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.08)', opacity: 0 }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
      />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display font-bold text-white text-sm leading-snug line-clamp-2">{post.title}</p>
        {featured && (
          <p className="text-white/50 text-xs mt-1">{MONTHS[monthIdx]} {post.year}</p>
        )}
      </div>

      {photos.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white/80 text-[10px] px-1.5 py-0.5 rounded-full tabular-nums">
          {photos.length}
        </div>
      )}
    </button>
  )
}

// ─── Secciones ────────────────────────────────────────────────────────────
function MonthSection({ monthNum, posts, gradient, onOpen }) {
  const [open, setOpen] = useState(true)
  const [first, ...rest] = posts

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 group w-full text-left">
        <div className={`w-0.5 h-5 rounded-full bg-gradient-to-b ${gradient}`} />
        <span className="text-xs font-semibold uppercase tracking-widest transition-colors font-display"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
          {MONTHS[monthNum - 1]}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded-full tabular-nums"
          style={{ color: 'var(--text-faint)', background: 'var(--bg-hover)' }}>
          {posts.length}
        </span>
        <span className="ml-auto" style={{ color: 'var(--text-faint)' }}>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {open && (
        <div className="space-y-3">
          <PostCard post={first} featured onOpen={onOpen} />
          {rest.length > 0 && (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
            >
              {rest.map(p => <PostCard key={p.id} post={p} onOpen={onOpen} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function YearSection({ year, months, onOpen }) {
  const [open, setOpen] = useState(true)

  return (
    <section className="space-y-8">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-4 w-full group">
        <span className="font-display font-black text-3xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          {year}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        {open
          ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
          : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />}
      </button>

      {open && (
        <div className="space-y-10">
          {Object.entries(months)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([mn, ps]) => (
              <MonthSection key={mn} monthNum={Number(mn)} posts={ps}
                gradient={MONTH_COLORS[Number(mn) - 1]} onOpen={onOpen} />
            ))}
        </div>
      )}
    </section>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { getPostsByYear, loading, deletePost } = useGallery()
  const grouped = getPostsByYear()
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  const [introDone, setIntroDone] = useState(false)
  const [openPost, setOpenPost] = useState(null)

  return (
    <Layout>
      {!introDone && <HeroIntro onDone={() => setIntroDone(true)} />}

      {openPost && (
        <PostModal post={openPost} onClose={() => setOpenPost(null)} onDelete={deletePost} />
      )}

      <div className="space-y-12">
        {/* Header */}
        <div className="flex items-end justify-between pt-2">
          <div style={{ opacity: introDone ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            <p className="text-[11px] font-semibold text-pink-400/80 uppercase tracking-[0.2em] mb-2">Álbum personal</p>
            <h1 className="font-display font-black text-4xl sm:text-5xl leading-none" style={{ color: 'var(--text)' }}>
              Nuestros<br />Recuerdos
            </h1>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl active:scale-95 transition-all shadow-lg"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            <Plus className="w-4 h-4" />
            Nuevo
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <span key={i} className="text-2xl"
                  style={{ animation: `heartbeat 1.2s ease-in-out ${i * 0.2}s infinite` }}>❤️</span>
              ))}
            </div>
            <p className="text-sm font-display" style={{ color: 'var(--text-faint)' }}>Cargando...</p>
            <style>{`@keyframes heartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}`}</style>
          </div>
        ) : years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
              <ImageIcon className="w-8 h-8" style={{ color: 'var(--text-faint)' }} />
            </div>
            <div>
              <p className="font-display font-bold text-xl" style={{ color: 'var(--text-muted)' }}>Sin recuerdos aún</p>
              <p className="text-sm mt-1 max-w-xs" style={{ color: 'var(--text-faint)' }}>
                Sube vuestras primeras fotos para empezar el álbum.
              </p>
            </div>
            <Link to="/upload"
              className="flex items-center gap-2 px-6 py-2.5 font-semibold rounded-xl transition-all"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              <Plus className="w-4 h-4" />
              Subir fotos
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {years.map(y => (
              <YearSection key={y} year={y} months={grouped[y]} onOpen={setOpenPost} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
