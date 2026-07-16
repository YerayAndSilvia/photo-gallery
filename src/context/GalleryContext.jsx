import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../utils/firebase'

const GalleryContext = createContext(null)

const POSTS_COLLECTION = 'posts'

export function GalleryProvider({ children }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Escucha en tiempo real — cualquier cambio en Firestore actualiza el estado
  useEffect(() => {
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      setPosts(docs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addPost = useCallback(async (post) => {
    await addDoc(collection(db, POSTS_COLLECTION), {
      ...post,
      createdAt: serverTimestamp(),
    })
  }, [])

  const deletePost = useCallback(async (id) => {
    await deleteDoc(doc(db, POSTS_COLLECTION, id))
  }, [])

  const updatePost = useCallback(async (id, changes) => {
    await updateDoc(doc(db, POSTS_COLLECTION, id), changes)
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
