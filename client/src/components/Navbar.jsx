import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout, isAdmin, login } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

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
    } catch {
      // ignore
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-xl shadow-md group-hover:scale-105 group-hover:shadow-glow transition-all duration-200">
            🍔
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              FoodRush
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
              Gourmet
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              🍽️ Restaurants
            </Link>
            <Link
              to="/orders"
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                isActive('/orders')
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              📋 My Orders
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/admin')
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                ⚙️ Admin Center
              </Link>
            )}
          </nav>
        )}

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Role Switcher Pill for demo convenience */}
              <div className="hidden lg:flex items-center gap-1 bg-amber-50 border border-amber-200/80 rounded-full px-2 py-1 text-xs">
                <span className="text-amber-800 font-medium text-[11px]">Demo switch:</span>
                <button
                  onClick={() => switchRole('customer')}
                  className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                    !isAdmin ? 'bg-orange-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                    isAdmin ? 'bg-orange-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/80 text-orange-600 transition-all active:scale-95"
                title="View Shopping Cart"
              >
                <span className="text-xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[11px] font-extrabold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md animate-bounce">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</p>
                  <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Sign out"
                >
                  🚪
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
