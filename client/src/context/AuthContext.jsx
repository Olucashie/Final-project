import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
  }, [user])

  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://final-project-1-zwia.onrender.com/api'}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password, role, phone, cacUrl, hostelDocUrl, whatsapp, telegram) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://final-project-1-zwia.onrender.com/api'}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role, phone, cacUrl, hostelDocUrl, whatsapp, telegram })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Registration failed')
    }
    const data = await res.json()
    // Don't set token and user immediately for email verification
    return data
  }

  const logout = () => { setToken(''); setUser(null) }

  const value = useMemo(() => ({ token, user, isAuthenticated: !!token, login, register, logout }), [token, user])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
