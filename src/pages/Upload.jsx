import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, YEARS } from '../utils/constants'
import { Upload as UploadIcon, X, ImagePlus, CheckCircle2 } from 'lucide-react'

const MAX_PHOTOS = 10

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Upload() {
  const { addPost } = useGallery()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const today = new Date()
  const [form, setForm] = useState({
    title: '',
    description: '',
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  })
  const [photos, setPhotos] = useState([]) // { file, preview }
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const addFiles = useCallback(
    async (files) => {
      const remaining = MAX_PHOTOS - photos.length
      if (remaining <= 0) return
      const toAdd = Array.from(files).slice(0, remaining)
      const processed = await Promise.all(
        toAdd.map(async (file) => ({
          file,
          preview: await toBase64(file),
          id: `${Date.now()}-${Math.random()}`,
        }))
      )
      setPhotos((prev) => [...prev, ...processed])
    },
    [photos.length]
  )

  const handleFileChange = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const removePhoto = (id) => setPhotos((prev) => prev.filter((p) => p.id !== id))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título es obligatorio'
    if (photos.length === 0) errs.photos = 'Añade al menos una foto'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    // Pequeña pausa para mostrar el estado de carga
    await new Promise((r) => setTimeout(r, 400))
    addPost({
      title: form.title.trim(),
      description: form.description.trim(),
      month: Number(form.month),
      year: Number(form.year),
      photos: photos.map((p) => p.preview),
    })
    setLoading(false)
    setSuccess(true)
    await new Promise((r) => setTimeout(r, 1200))
    navigate('/')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-300/40">
            <UploadIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nuevo post</h1>
            <p className="text-sm text-gray-400">Comparte vuestros recuerdos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card formulario */}
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Título <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Escapada a la playa"
                className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition text-gray-800 ${
                  errors.title ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Cuenta algo sobre este momento..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition text-gray-800 resize-none"
              />
            </div>

            {/* Mes y Año */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Mes</label>
                <select
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition text-gray-800 cursor-pointer"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Año</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition text-gray-800 cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Zona de fotos */}
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600">
                Fotos <span className="text-pink-400">*</span>
                <span className="ml-2 text-gray-400 font-normal">({photos.length}/{MAX_PHOTOS})</span>
              </label>
              {errors.photos && <p className="text-xs text-red-400">{errors.photos}</p>}
            </div>

            {/* Dropzone */}
            {photos.length < MAX_PHOTOS && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
                  dragging
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-pink-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Arrastra fotos aquí o <span className="text-pink-400">haz clic</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    JPG, PNG, WebP · Máximo {MAX_PHOTOS} fotos
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Grid de previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={photo.preview}
                      alt={`foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow transition-all hover:scale-110"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-pink-400 text-white text-xs px-1.5 py-0.5 rounded-full">
                        Portada
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
            >
              {success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> ¡Guardado!
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Publicar post'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
