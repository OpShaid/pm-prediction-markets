import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, User, LogOut, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { Chatbot } from '@/components/Chatbot'

export function Layout() {
  const { user, isAuthenticated, isGuest, logout } = useAuthStore()
  const navigate = useNavigate()
  const headerRef = useRef<HTMLDivElement>(null)
  const { y: scrollY } = useScrollPosition()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (!headerRef.current) return

    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    setIsScrolled(scrollY > 50)
  }, [scrollY])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Chatbot */}
      <Chatbot />

      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-lg border-b shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link to="/home" className="flex items-center space-x-2 group">
            <div className="relative">
              <BarChart3 className="h-7 w-7 text-white transition-transform group-hover:scale-110 group-hover:rotate-12" />
              {isScrolled && (
                <div className="absolute inset-0 blur-xl bg-white/30 animate-pulse" />
              )}
            </div>
            <span className="text-xl font-bold text-white">
              PredictMarkets
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {isGuest && (
                  <Badge variant="secondary" className="gap-2 animate-pulse">
                    <Sparkles className="h-3 w-3" />
                    Demo Mode
                  </Badge>
                )}

                <Link
                  to="/markets"
                  className="text-sm font-medium transition-all hover:text-white hover:-translate-y-0.5"
                >
                  Markets
                </Link>

                {!isGuest && (
                  <>
                    <Link
                      to="/portfolio"
                      className="text-sm font-medium transition-all hover:text-white hover:-translate-y-0.5"
                    >
                      Portfolio
                    </Link>
                    <Link to="/create-market">
                      <Button size="sm" className="gap-2 transition-transform hover:scale-105">
                        <Plus className="h-4 w-4" />
                        Create Market
                      </Button>
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4 border-l pl-6">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">
                      {isGuest ? 'Demo Balance' : 'Balance'}
                    </span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      {formatCurrency(user?.balance || 0)}
                    </span>
                  </div>

                  {!isGuest && (
                    <Link to="/profile">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="transition-transform hover:scale-110"
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="transition-transform hover:scale-110"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={() => {
                  const { setGuestMode } = useAuthStore.getState()
                  setGuestMode(true)
                  navigate('/markets')
                }}
                className="transition-transform hover:scale-105 bg-white text-black hover:bg-gray-100"
              >
                Get Started
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30 py-12 mt-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-white" />
                <span className="text-lg font-bold">PredictMarkets</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade prediction markets platform aggregating data from Kalshi and Polymarket.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/markets" className="hover:text-white transition-colors">
                    Markets
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 PredictMarkets. Built with enterprise-grade technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
