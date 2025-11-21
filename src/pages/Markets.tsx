import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { MarketCard } from '@/components/MarketCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, TrendingUp, Menu, X, Home, BarChart, User, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import gsap from 'gsap'

export function Markets() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isGuest, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['markets', { search, category }],
    queryFn: () =>
      apiClient.getMarkets({
        page: 1,
        pageSize: 20,
        search: search || undefined,
        category: category || undefined,
      }),
  })

  const categories = ['Sports', 'Politics', 'Crypto', 'Technology', 'Entertainment', 'Other']

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  useEffect(() => {
    if (menuOpen) {
      gsap.fromTo('.menu-item',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [menuOpen])

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://t4.ftcdn.net/jpg/09/17/32/77/360_F_917327795_YLhmTQeANcRigtyMjthLfxotWKyK3vzH.jpg)',
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Hamburger Menu */}
      <Button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 left-6 z-50 w-12 h-12 p-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300"
      >
        {menuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
      </Button>

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 transition-transform duration-500 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pt-24">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-2">MENU</h2>
            <p className="text-gray-400 text-sm">Navigate your dashboard</p>
          </div>

          <div className="space-y-3">
            <Link to="/home" className="menu-item block">
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer">
                <Home className="h-6 w-6 text-white group-hover:text-black transition-colors duration-300" />
                <span className="text-white group-hover:text-black font-semibold transition-colors duration-300">Home</span>
              </div>
            </Link>

            <Link to="/markets" className="menu-item block">
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white hover:scale-105 transition-all duration-300 cursor-pointer">
                <BarChart className="h-6 w-6 text-black transition-colors duration-300" />
                <span className="text-black font-semibold transition-colors duration-300">Markets</span>
              </div>
            </Link>

            {!isGuest && (
              <Link to="/profile" className="menu-item block">
                <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer">
                  <User className="h-6 w-6 text-white group-hover:text-black transition-colors duration-300" />
                  <span className="text-white group-hover:text-black font-semibold transition-colors duration-300">Profile</span>
                </div>
              </Link>
            )}

            <button onClick={handleLogout} className="menu-item w-full">
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500 hover:scale-105 transition-all duration-300 cursor-pointer">
                <LogOut className="h-6 w-6 text-white transition-colors duration-300" />
                <span className="text-white font-semibold transition-colors duration-300">Logout</span>
              </div>
            </button>
          </div>

          <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-gray-400 mb-1">{isGuest ? 'Demo Balance' : 'Your Balance'}</p>
            <p className="text-2xl font-black text-white">${user?.balance || 0}</p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="container py-4 space-y-4 relative">
        <div className="flex items-center gap-3 mb-4 ml-16">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-2xl">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tight">
              MARKETS
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Trade on real-world events
            </p>
          </div>
        </div>

        <Card className="group p-6 border border-white/10 bg-black/80 backdrop-blur-md hover:bg-black/90 hover:border-white/30 transition-all duration-500 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors duration-300" />
              <Input
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-white/20 bg-black/50 text-white placeholder:text-gray-500 focus:border-white focus:bg-black/70 transition-all duration-300 rounded-xl font-medium"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant={category === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory('')}
                className="h-12 px-5 text-sm font-bold transition-all hover:scale-110 bg-white text-black hover:bg-gray-200 rounded-xl shadow-lg"
              >
                <Filter className="mr-2 h-4 w-4" />
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className={`h-12 px-5 text-sm font-bold transition-all hover:scale-110 rounded-xl ${
                    category === cat
                      ? 'bg-white text-black hover:bg-gray-200 shadow-lg'
                      : 'border-2 border-white/20 text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {(isLoading || error || (data && data.data.length === 0)) && (
          <Card className="p-12 text-center border-2 border-white/10 bg-black/80 backdrop-blur-md hover:border-white/30 transition-all duration-500 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
              <img
                src="https://github.githubassets.com/images/mona-loading-dark.gif"
                alt="Loading..."
                className="w-32 h-32"
              />
              <div>
                <p className="text-white font-black text-2xl mb-2">NO DATA AVAILABLE</p>
                <p className="text-gray-400 text-base font-light">No markets found at the moment.</p>
              </div>
            </div>
          </Card>
        )}

        {data && data.data.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-light text-gray-400">
                  Showing {data.data.length} markets
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((market, index) => (
                <div
                  key={market.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MarketCard market={market} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
