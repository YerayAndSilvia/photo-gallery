import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, YEARS } from '../utils/constants'
import { X, ImagePlus, CheckCircle2 } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../utils/supabase'

const MAX_PHOTOS = 10

const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-2"

export default function Upload() {
  const { addPost } = useGallery()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const today = new Date()

  const [form, setForm] = useState({
    title: '', description: '',
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  })
  const [photos, setPhotos] = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const addFiles = useCallback((files) => {
    const remaining = MAX_PHOTOS - photos.length
    if (!remaining) return
    const toAdd = Array.from(files).slice(0, remaining).map(file => ({
      file, preview: URL.createObjectURL(file), id: `${Date.now()}-${Math.random()}`
    }))
    setPhotos(p => [...p, ...toAdd])
  }, [photos.length])

  const removePhoto = (id) => setPhotos(prev => {
    const p = prev.find(x => x.id === id)
    if (p) URL.revokeObjectURL(p.preview)
    return prev.filter(x => x.id !== id)
  })

  const uploadOne = async (photo, i) => {
    const ext = photo.file.name.split('.').pop()
    const path = `posts/${Date.now()}-${i}.${ext}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, photo.file, { upsert: false })
    if (error) throw error
    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título es obligatorio'
    if (!photos.length) errs.photos = 'Añade al menos una foto'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setLoading(true)
    setProgress(0)

    try {
      const urls = []
      for (let i = 0; i < photos.length; i++) {
        urls.push(await uploadOne(photos[i], i))
        setProgress(Math.round(((i + 1) / photos.length) * 100))
      }
      await addPost({
        title: form.title.trim(), description: form.description.trim(),
        month: Number(form.month), year: Number(form.year), photos: urls,
      })
      setSuccess(true)
      photos.forEach(p => URL.revokeObjectURL(p.preview))
      await new Promise(r => setTimeout(r, 1000))
      navigate('/')
      window.location.reload()
    } catch {
      setErrors({ submit: 'Error al subir. Inténtalo de nuevo.' })
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <p className="text-[11px] font-semibold text-pink-400/80 uppercase tracking-[0.2em] mb-2">Crear</p>
          <h1 className="font-display font-black text-4xl leading-none" style={{ color: 'var(--text)' }}>Nuevo post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Título *</label>
            <input type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Escapada a la playa..."
              className={`input-theme w-full px-4 py-3 rounded-xl text-sm ${errors.title ? 'border-red-500/50' : ''}`} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Descripción</label>
            <textarea value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Cuenta algo sobre este momento..."
              rows={2} className="input-theme w-full px-4 py-3 rounded-xl text-sm resize-none" />
          </div>

          {/* Mes / Año */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Mes</label>
              <select value={form.month}
                onChange={e => setForm({ ...form, month: Number(e.target.value) })}
                className="input-theme w-full px-4 py-3 rounded-xl text-sm cursor-pointer">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Año</label>
              <select value={form.year}
                onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                className="input-theme w-full px-4 py-3 rounded-xl text-sm cursor-pointer">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Fotos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>
                Fotos * <span className="normal-case font-normal tracking-normal" style={{ color: 'var(--text-faint)' }}>
                  ({photos.length}/{MAX_PHOTOS})
                </span>
              </label>
              {errors.photos && <p className="text-red-400 text-xs">{errors.photos}</p>}
            </div>

            {photos.length < MAX_PHOTOS && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? 'rgba(236,72,153,0.6)' : 'var(--border-input)',
                  background: dragging ? 'rgba(236,72,153,0.05)' : 'transparent',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--bg-hover)' }}>
                  <ImagePlus className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Arrastra o <span className="text-pink-400">elige fotos</span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>JPG, PNG, WebP</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {photos.map((p, i) => (
                  <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden"
                    style={{ background: 'var(--bg-hover)' }}>
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <button type="button" onClick={() => removePhoto(p.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all hover:scale-110">
                        <X className="w-3 h-3 text-gray-800" />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-pink-500 text-white text-[10px] px-1 py-0.5 rounded-md font-semibold">
                        Portada
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

          {/* Progreso */}
          {loading && !success && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-faint)' }}>
                <span>Subiendo...</span><span>{progress}%</span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-40 text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Cancelar
            </button>
            <button type="submit" disabled={loading || success}
              className="flex-1 py-3 font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              {success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> ¡Guardado!
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Subiendo...
                </span>
              ) : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
