import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { SalesRep, RepStats } from '../types'
import * as api from '../api'

interface AuthState {
  token: string | null
  rep: SalesRep | null
  stats: RepStats | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('sales_token'),
    rep: (() => {
      try {
        const s = localStorage.getItem('sales_rep')
        return s ? JSON.parse(s) : null
      } catch {
        return null
      }
    })(),
    stats: null,
    loading: !!localStorage.getItem('sales_token'),
  })

  const refreshProfile = useCallback(async () => {
    try {
      const { rep, stats } = await api.getProfile()
      setState(prev => ({ ...prev, rep, stats, loading: false }))
      localStorage.setItem('sales_rep', JSON.stringify(rep))
    } catch {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    if (state.token) {
      refreshProfile()
    }
  }, [state.token, refreshProfile])

  const login = async (email: string, password: string) => {
    const { token, rep } = await api.login(email, password)
    localStorage.setItem('sales_token', token)
    localStorage.setItem('sales_rep', JSON.stringify(rep))
    setState({ token, rep, stats: null, loading: true })
  }

  const logout = () => {
    localStorage.removeItem('sales_token')
    localStorage.removeItem('sales_rep')
    setState({ token: null, rep: null, stats: null, loading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
