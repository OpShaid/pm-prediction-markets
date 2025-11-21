import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, User, LogOut, Plus } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

export function AnimatedHeader() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const headerRef = useRef<HTMLDivElement>(null)
  const { y: scrollY } = useScrollPosition()
  const [isFixed, setIsFixed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!headerRef.current) return

    // Animate header in on mount
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    )
  }, [])

  useEffect(() => {
    // Handle sticky header on scroll
    if (scrollY > window.innerHeight * 0.3) {
      setIsFixed(true)
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsFixed(false)
      setIsVisible(false)
    }
  }, [scrollY])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div
      ref={headerRef}
      className={cn(
        'w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
        isFixed ? 'fixed top-0 z-50 shadow-lg' : 'relative',
        isFixed && isVisible ? 'translate-y-0' : isFixed ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <BarChart3 className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PredictMarkets
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/markets"
                className="text-sm font-medium transition-all hover:text-primary hover:translate-y-[-2px]"
              >
                Markets
              </Link>
              <Link
                to="/portfolio"
                className="text-sm font-medium transition-all hover:text-primary hover:translate-y-[-2px]"
              >
                Portfolio
              </Link>
              <Link to="/create-market">
                <Button size="sm" className="gap-2 transition-transform hover:scale-105">
                  <Plus className="h-4 w-4" />
                  Create Market
                </Button>
              </Link>
              <div className="flex items-center space-x-4 border-l pl-6">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-sm font-semibold bg-gradient-to-r from-success to-success/60 bg-clip-text text-transparent">
                    {formatCurrency(user?.balance || 0)}
                  </span>
                </div>
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="transition-transform hover:scale-110"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
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
            <>
              <Link to="/login">
                <Button variant="ghost" className="transition-transform hover:scale-105">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="transition-transform hover:scale-105">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
