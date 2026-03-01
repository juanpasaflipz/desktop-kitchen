import { LogOut, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({ actions }: { actions?: React.ReactNode }) {
  const { rep, logout } = useAuth()

  return (
    <header className="bg-neutral-900 border-b border-neutral-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-brand-500" />
        <div>
          <h1 className="text-sm font-semibold text-white">Desktop Kitchen Sales</h1>
          <p className="text-xs text-neutral-400">{rep?.full_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={logout}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
