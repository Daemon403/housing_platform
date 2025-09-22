import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

type User = {
  id: string
  name: string
  email: string
  role: 'student' | 'homeowner' | 'admin'
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: { name: string; email: string; password: string; role: 'student' | 'homeowner' }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
AuthContext.displayName = 'AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      // attempt to fetch profile
      fetch(`${api.baseUrl}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.text())))
        .then((d) => setUser(d.data))
        .catch(() => setUser(null))
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    const res = await fetch(`${api.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    setToken(data.token)
    // Redirect based on user role after successful login
    if (data.data?.role === 'homeowner') {
      navigate('/owner')
    } else {
      navigate('/')
    }
  }

  const register = async (payload: { name: string; email: string; password: string; role: 'student' | 'homeowner' }) => {
    const res = await fetch(`${api.baseUrl}/api/v1/auth/register`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    setToken(data.token)
    // Redirect based on user role after registration
    if (payload.role === 'homeowner') {
      navigate('/owner')
    } else {
      navigate('/')
    }
  }

  const logout = () => setToken(null)

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
