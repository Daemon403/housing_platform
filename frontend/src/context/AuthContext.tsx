import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

const AuthContext = createContext<AuthContextType>({} as any)

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

  const login = async (email: string, password: string) => {
    const res = await fetch(`${api.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    setToken(data.token)
  }

  const register = async (payload: { name: string; email: string; password: string; role: 'student' | 'homeowner' }) => {
    const res = await fetch(`${api.baseUrl}/api/v1/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    setToken(data.token)
  }

  const logout = () => setToken(null)

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
