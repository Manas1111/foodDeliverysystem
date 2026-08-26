import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout, isAdmin, login } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const switchRole = async (targetRole) => {
    try {
      if (targetRole === 'admin') {
        await login('admin@demo.com', 'admin123')
        navigate('/admin')
      } else {
        await login('customer@demo.com', 'demo123')
        navigate('/')
      }
    } catch { /* ignore */ }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-dark-900/95 backdrop-blur-xl shadow-navbar border-b border-white/[0.06]'
            : 'bg-dark-950/80 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* ── Brand Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crave-500 to-amber-400 flex items-center justify-center text-lg shadow-glow-sm group-hover:shadow-glow-orange transition-all duration-300 group-hover:scale-105">
              🛺
            </div>
            <div className="leading-none">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-crave-400 to-amber-400 bg-clip-text text-transparent">
                CraveKart
              </span>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5 hidden sm:block">
                Satisfy Every Craving
              </div>
            </div>
          </Link>

          {/* ── Center Nav ── */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
              {[
                { path: '/',       label: '🍽️ Explore' },
                { path: '/orders', label: '📋 Orders'  },
                ...(isAdmin ? [{ path: '/admin', label: '⚙️ Admin' }] : []),
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-crave-500 text-white shadow-glow-sm'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Demo Role Switcher */}
                <div className="hidden lg:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-1 text-xs">
                  <span className="text-amber-400/70 font-medium text-[11px] mr-1">Demo:</span>
                  <button
                    onClick={() => switchRole('customer')}
                    className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                      !isAdmin ? 'bg-crave-500 text-white' : 'text-amber-400/60 hover:text-amber-400'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                      isAdmin ? 'bg-crave-500 text-white' : 'text-amber-400/60 hover:text-amber-400'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl bg-white/[0.05] hover:bg-crave-500/15 border border-white/[0.07] hover:border-crave-500/30 transition-all duration-200"
                  title="Cart"
                >
                  <span className="text-lg">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-crave-500 to-amber-400 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-0.5 flex items-center justify-center shadow-glow-sm animate-bounce-light">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* User */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/[0.07]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crave-500 to-amber-400 flex items-center justify-center font-black text-sm text-white shadow-glow-sm">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <p className="text-xs font-bold text-white/90 line-clamp-1">{user.name}</p>
                    <p className="text-[10px] font-bold text-crave-400 uppercase tracking-wider">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Sign out"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                  </button>
                </div>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(v => !v)}
                  className="md:hidden p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    }
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-ghost text-sm py-2 px-3">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Join Free</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {user && mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-dark-900/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-slide-up">
            {[
              { path: '/',       label: '🍽️ Explore Restaurants' },
              { path: '/orders', label: '📋 My Orders' },
              ...(isAdmin ? [{ path: '/admin', label: '⚙️ Admin Center' }] : []),
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(path)
                    ? 'bg-crave-500/20 text-crave-400 border border-crave-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {label}
              </Link>
            ))}
            {/* Mobile role switcher */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.06] mt-2">
              <button onClick={() => switchRole('customer')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${!isAdmin ? 'bg-crave-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                👤 Customer
              </button>
              <button onClick={() => switchRole('admin')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isAdmin ? 'bg-crave-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                ⚙️ Admin
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
