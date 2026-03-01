import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginScreen from './screens/LoginScreen'
import RepDashboard from './screens/RepDashboard'
import ManagerDashboard from './screens/ManagerDashboard'

function ProtectedRoute({ children, requireManager }: { children: React.ReactNode; requireManager?: boolean }) {
  const { token, rep, loading } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    )
  }
  if (requireManager && !rep?.is_manager) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

function AppRoutes() {
  const { token, rep } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to={rep?.is_manager ? '/manager' : '/dashboard'} replace /> : <LoginScreen />} />
      <Route path="/dashboard" element={<ProtectedRoute><RepDashboard /></ProtectedRoute>} />
      <Route path="/manager" element={<ProtectedRoute requireManager><ManagerDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={token ? (rep?.is_manager ? '/manager' : '/dashboard') : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
