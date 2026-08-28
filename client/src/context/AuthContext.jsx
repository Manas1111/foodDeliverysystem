import { createContext, useContext, useState, useEffect } from 'react'
import { initStore, authLogin, authRegister } from '../store/store'

// Initialize localStorage with seed data on first load
initStore()

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fd_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const data = authLogin(email, password)
    localStorage.setItem('fd_token', data.token)
    localStorage.setItem('fd_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const data = authRegister(name, email, password)
    localStorage.setItem('fd_token', data.token)
    localStorage.setItem('fd_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('fd_token')
    localStorage.removeItem('fd_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
