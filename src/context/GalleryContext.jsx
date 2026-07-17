import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const GalleryContext = createContext(null)

export function GalleryProvider({ children }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Carga inicial de posts
  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setPosts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()

    // Suscripción en tiempo real — cualquier INSERT, UPDATE o DELETE actualiza la lista
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
    const { error } = await supabase.from('posts').insert([post])
    if (error) throw error
  }, [])

  const deletePost = useCallback(async (id) => {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
  }, [])

  const updatePost = useCallback(async (id, changes) => {
    const { error } = await supabase.from('posts').update(changes).eq('id', id)
    if (error) throw error
  }, [])

  // Agrupa posts por año y mes
  const getPostsByYear = useCallback(() => {
    const grouped = {}
    posts.forEach((post) => {
      const year = post.year
      const month = post.month
      if (!grouped[year]) grouped[year] = {}
      if (!grouped[year][month]) grouped[year][month] = []
      grouped[year][month].push(post)
    })
    return grouped
  }, [posts])

  const getPostById = useCallback(
    (id) => posts.find((p) => p.id === id),
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
