import { createContext, useContext, useState, useCallback } from 'react'

const GalleryContext = createContext(null)

const STORAGE_KEY = 'gallery_posts'

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export function GalleryProvider({ children }) {
  const [posts, setPosts] = useState(loadPosts)

  const addPost = useCallback((post) => {
    setPosts((prev) => {
      const next = [
        ...prev,
        {
          ...post,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ]
      savePosts(next)
      return next
    })
  }, [])

  const deletePost = useCallback((id) => {
    setPosts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      savePosts(next)
      return next
    })
  }, [])

  const updatePost = useCallback((id, changes) => {
    setPosts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
      savePosts(next)
      return next
    })
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
      value={{ posts, addPost, deletePost, updatePost, getPostsByYear, getPostById, getPostsByMonth }}
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
