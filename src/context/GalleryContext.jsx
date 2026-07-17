import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const GalleryContext = createContext(null)

export function GalleryProvider({ children }) {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchPosts = useCallback(async () => {
    setError(null)
    try {
      const { data, error: supaErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (supaErr) throw supaErr
      setPosts(data ?? [])
    } catch (err) {
      console.error('[GalleryContext] fetchPosts:', err)
      setError(err?.message ?? 'Error al cargar los posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()

    // Tiempo real: cualquier cambio en la tabla recarga los posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchPosts])

  const addPost = useCallback(async (post) => {
    const { error: supaErr } = await supabase.from('posts').insert([post])
    if (supaErr) throw supaErr
  }, [])

  const deletePost = useCallback(async (id) => {
    const { error: supaErr } = await supabase.from('posts').delete().eq('id', id)
    if (supaErr) throw supaErr
    // Actualizar estado local sin esperar al canal de tiempo real
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updatePost = useCallback(async (id, changes) => {
    const { error: supaErr } = await supabase.from('posts').update(changes).eq('id', id)
    if (supaErr) throw supaErr
  }, [])

  // Agrupa posts por año → mes
  const getPostsByYear = useCallback(() => {
    const grouped = {}
    posts.forEach((post) => {
      const { year, month } = post
      if (!grouped[year]) grouped[year] = {}
      if (!grouped[year][month]) grouped[year][month] = []
      grouped[year][month].push(post)
    })
    return grouped
  }, [posts])

  const getPostById = useCallback(
    (id) => posts.find((p) => String(p.id) === String(id)),
    [posts]
  )

  const getPostsByMonth = useCallback(
    (year, month) => posts.filter((p) => p.year === year && p.month === month),
    [posts]
  )

  return (
    <GalleryContext.Provider
      value={{
        posts,
        loading,
        error,
        refetch: fetchPosts,
        addPost,
        deletePost,
        updatePost,
        getPostsByYear,
        getPostById,
        getPostsByMonth,
      }}
    >
      {children}
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider')
  return ctx
}
