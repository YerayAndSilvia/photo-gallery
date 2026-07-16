import { createContext, useContext, useState } from 'react'
import { authenticate } from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gallery_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (username, password) => {
    const found = authenticate(username, password)
    if (found) {
      // Recuperar foto de perfil guardada previamente para este usuario
      const profileKey = `gallery_profile_${found.id}`
      const savedProfile = localStorage.getItem(profileKey) || null

      const safeUser = {
        id: found.id,
        username: found.username,
        avatar: found.avatar,
        profilePhoto: savedProfile,
      }
      setUser(safeUser)
      localStorage.setItem('gallery_user', JSON.stringify(safeUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gallery_user')
  }

  const updateProfilePhoto = (base64OrNull) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, profilePhoto: base64OrNull }
      localStorage.setItem('gallery_user', JSON.stringify(updated))
      // Persistir también por usuario para que sobreviva al logout
      if (base64OrNull) {
        localStorage.setItem(`gallery_profile_${prev.id}`, base64OrNull)
      } else {
        localStorage.removeItem(`gallery_profile_${prev.id}`)
      }
      return updated
    })
  }

  const isSilvia = user?.username?.toLowerCase() === 'silvia'

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfilePhoto, isSilvia }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
