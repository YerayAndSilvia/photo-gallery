import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../context/GalleryContext'
import Layout from '../components/Layout'
import { MONTHS, MONTH_COLORS } from '../utils/constants'
import { ChevronDown, ChevronUp, ImageIcon, PlusCircle, Calendar } from 'lucide-react'

function PostCard({ post }) {
  const monthIdx = (post.month || 1) - 1
  const gradient = MONTH_COLORS[monthIdx]
  const firstPhoto = post.photos?.[0]

  return (
    <Link
      to={`/post/${post.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative">
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center opacity-30`}>
            <ImageIcon className="w-10 h-10 text-white" />
          </div>
        )}
        {/* Badge fotos */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {post.photos?.length || 0} foto{post.photos?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate group-hover:text-pink-500 transition-colors">
          {post.title}
        </h3>
        {post.description && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
          <span className="text-xs text-gray-400">{MONTHS[(post.month || 1) - 1]} {post.year}</span>
        </div>
      </div>
    </Link>
  )
}

function MonthSection({ monthNum, posts, gradient }) {
  const [open, setOpen] = useState(true)
  const monthName = MONTHS[monthNum - 1]

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient}`} />
          <span className="font-semibold text-gray-700">{monthName}</span>
          <span className="text-sm text-gray-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 group"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-purple-200" />
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border border-gray-100 hover:shadow-md transition-all">
          <Calendar className="w-4 h-4 text-pink-400" />
          <span className="font-bold text-gray-700 text-lg">{year}</span>
          <span className="text-xs text-gray-400">{totalPosts} post{totalPosts !== 1 ? 's' : ''}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-pink-200" />
      </button>

      {open && (
        <div className="space-y-3">
          {Object.entries(months)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([monthNum, posts]) => (
              <MonthSection
                key={monthNum}
                monthNum={Number(monthNum)}
                posts={posts}
                gradient={MONTH_COLORS[(Number(monthNum) - 1)]}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { getPostsByYear } = useGallery()
  const grouped = getPostsByYear()
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Nuestra Galería</h1>
            <p className="text-gray-400 mt-1">Todos vuestros momentos especiales</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            Nuevo post
          </Link>
        </div>

        {/* Contenido */}
        {years.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-9 h-9 text-pink-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-600">Aún no hay recuerdos</h2>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              Empieza subiendo vuestras primeras fotos para crear un álbum lleno de momentos especiales.
            </p>
            <Link
              to="/upload"
              className="mt-2 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-300/40 hover:scale-105 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Subir primeras fotos
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {years.map((year) => (
              <YearSection key={year} year={year} months={grouped[year]} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
