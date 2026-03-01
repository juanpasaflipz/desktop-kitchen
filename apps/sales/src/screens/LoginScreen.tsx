import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // AuthProvider triggers re-render, App routes handle redirect
      const rep = JSON.parse(localStorage.getItem('sales_rep') || '{}')
      navigate(rep.is_manager ? '/manager' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600/20 rounded-2xl mb-4">
            <BarChart3 className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-white">Desktop Kitchen</h1>
          <p className="text-sm text-neutral-400 mt-1">Sales Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 placeholder-neutral-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 placeholder-neutral-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
