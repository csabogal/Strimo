import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Members } from './pages/Members'
import { Platforms } from './pages/Platforms'

const queryClient = new QueryClient()

import { AuthProvider } from './providers/AuthProvider'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" richColors theme="dark" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="platforms" element={<Platforms />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
