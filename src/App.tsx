import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { Layout } from '@/components/Layout'
import { Landing } from '@/pages/Landing'
import { Home } from '@/pages/Home'
import { Markets } from '@/pages/Markets'
import { MarketDetail } from '@/pages/MarketDetail'
import { CreateMarket } from '@/pages/CreateMarket'
import { Portfolio } from '@/pages/Portfolio'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGuest, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-primary/30" />
        </div>
      </div>
    )
  }

  return isAuthenticated || isGuest ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const { loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Landing page without layout */}
          <Route path="/" element={<Landing />} />

          {/* Main app with layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route
              path="/markets"
              element={
                <ProtectedRoute>
                  <Markets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/markets/:id"
              element={
                <ProtectedRoute>
                  <MarketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-market"
              element={
                <ProtectedRoute>
                  <CreateMarket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(142, 76%, 36%)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(0, 84.2%, 60.2%)',
              secondary: 'white',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
