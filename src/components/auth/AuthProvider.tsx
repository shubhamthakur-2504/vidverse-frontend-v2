"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authApi from '@/lib/api/client/authApi'

interface User {
  _id: string
  userName: string
  email: string
  fullName: string
  avatarUrl?: string
  coverImageUrl?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      setUser(response.data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (identifier: string, password: string) => {
    const response = await authApi.login({ identifier, password })
    setUser(response.data.data.user)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    router.push('/')
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}