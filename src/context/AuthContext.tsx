'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Tenant {
  name: string
  slug: string
  subscription: 'FREE' | 'PRO'
}

interface User {
  id: string
  email: string
  tenant_id: string
  role: 'ADMIN' | 'MEMBER'
  tenant?: Tenant
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('supabase_token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token and fetch user data
      fetchUserProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('supabase_token')
        setToken(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      localStorage.removeItem('supabase_token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const { token: newToken, user: userData } = await response.json()
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('supabase_token', newToken)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('supabase_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
