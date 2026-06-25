import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('se_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('se_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('se_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('se_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
