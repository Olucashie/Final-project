import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}
