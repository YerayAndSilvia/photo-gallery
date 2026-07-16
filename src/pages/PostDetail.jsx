import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPostById, deletePost } = useGallery()
  const post = getPostById(id)

  const [lightbox, setLightbox] = useState(null) // índice de la foto en lightbox
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const handleDelete = () => {
    deletePost(id)
    navigate('/')
  }

  const prevPhoto = () => setLightbox((i) => (i > 0 ? i - 1 : post.photos.length - 1))
  const nextPhoto = () => setLightbox((i) => (i < post.photos.length - 1 ? i + 1 : 0))

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navegación */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">¿Eliminar este post?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
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

        {/* Header del post */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${gradient}`} />
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{monthName} {post.year}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-sm text-gray-400">{post.photos?.length || 0} foto{post.photos?.length !== 1 ? 's' : ''}</span>
            </div>
            {post.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{post.description}</p>
            )}
          </div>
        </div>

        {/* Galería de fotos */}
        {post.photos?.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Fotos</h2>

            {/* Foto principal grande */}
            <div
              className="relative rounded-2xl overflow-hidden cursor-zoom-in shadow-lg mb-3 aspect-video bg-gray-100"
              onClick={() => setLightbox(0)}
            >
              <img
                src={post.photos[0]}
                alt="portada"
                className="w-full h-full object-cover"
              />
              {post.photos.length > 1 && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-end justify-end p-4">
                  <span className="bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    +{post.photos.length - 1} más
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {post.photos.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {post.photos.slice(1).map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightbox(idx + 1)}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform shadow"
                  >
                    <img src={photo} alt={`foto ${idx + 2}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Cerrar */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contador */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightbox + 1} / {post.photos.length}
          </div>

          {/* Prev */}
          {post.photos.length > 1 && (
            <button
              className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prevPhoto() }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Imagen */}
          <img
            src={post.photos[lightbox]}
            alt={`foto ${lightbox + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {post.photos.length > 1 && (
            <button
              className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); nextPhoto() }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </Layout>
  )
}
