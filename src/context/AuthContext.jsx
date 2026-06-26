import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Saat app dimuat, cek apakah ada session cookie yang masih valid
  useEffect(() => {
    authAPI.getProfile()
      .then(({ data }) => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => {
        // Tidak ada session / cookie expired — user perlu login ulang
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
