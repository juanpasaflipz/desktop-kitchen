import { LogOut, BarChart3, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Header({ actions }: { actions?: React.ReactNode }) {
  const { rep, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isManager = rep?.is_manager
  const onManagerView = location.pathname === '/manager'

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
        {isManager && (
          <button
            onClick={() => navigate(onManagerView ? '/dashboard' : '/manager')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg text-xs font-medium transition-colors"
            title={onManagerView ? 'Switch to My Pipeline' : 'Switch to Manager View'}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {onManagerView ? 'My Pipeline' : 'Manager'}
          </button>
        )}
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
