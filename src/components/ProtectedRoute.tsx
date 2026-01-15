import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export const ProtectedRoute = () => {
    const { session, loading } = useAuth()

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] text-white">
                Cargando...
            </div>
        )
    }

    if (!session) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
