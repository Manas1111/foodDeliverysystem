import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import MenuItemCard from '../components/MenuItemCard'
import { useCart } from '../context/CartContext'

export default function Restaurant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cartCount, total } = useCart()

  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [vegFilter, setVegFilter]   = useState('all') // 'all', 'veg', 'non-veg'
  const [menuSearch, setMenuSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/restaurants/${id}`)
        setRestaurant(data.restaurant)
        setMenu(data.menu || [])
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="text-5xl animate-bounce mb-3">🍽️</div>
      <p className="font-bold text-slate-600">Loading delicious menu...</p>
    </div>
  )

  if (!restaurant) return null

  const categories = ['All', ...new Set(menu.map(i => i.category))]

  const filteredMenu = menu.filter(item => {
    // Category filter
    if (activeCategory !== 'All' && item.category !== activeCategory) return false
    // Veg/non-veg filter
    if (vegFilter === 'veg' && !item.is_veg) return false
    if (vegFilter === 'non-veg' && item.is_veg) return false
    // Search filter
    if (menuSearch) {
      const q = menuSearch.toLowerCase()
      return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      
      {/* Back to Restaurants breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors">
        <span>←</span> Back to all restaurants
      </Link>

      {/* Restaurant Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-elevated bg-slate-900 text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={restaurant.banner_url || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
        </div>

        {/* Banner Details */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {restaurant.name}
              </h1>
              {!restaurant.is_open ? (
                <span className="bg-rose-500 text-white text-xs px-3 py-1 rounded-full font-extrabold uppercase">
                  Closed Now
                </span>
              ) : (
                <span className="bg-emerald-500 text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Open
                </span>
              )}
            </div>

            <p className="text-white/90 text-sm font-medium">
              {restaurant.cuisine} • {restaurant.tags || restaurant.description}
            </p>
            <p className="text-white/70 text-xs">
              📍 {restaurant.address}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold text-white">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1">
                ⭐ {restaurant.rating} ({restaurant.rating_count || 350}+ reviews)
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1">
                ⏱️ {restaurant.delivery_time_min} mins delivery
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1">
                🛵 Min order ₹{restaurant.min_order}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Filters and In-menu Search Bar */}
      <div className="space-y-3 sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Menu Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder={`Search in ${restaurant.name}...`}
              value={menuSearch}
              onChange={e => setMenuSearch(e.target.value)}
              className="input-field pl-9 py-2 text-xs sm:text-sm bg-white"
            />
            {menuSearch && (
              <button
                onClick={() => setMenuSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Veg / Non-veg Filter Toggle */}
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shrink-0">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                vegFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                vegFilter === 'veg' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              🟢 Pure Veg
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                vegFilter === 'non-veg' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              🔴 Non-Veg
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Cards */}
      <div className="space-y-4">
        {filteredMenu.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
            <div className="text-5xl mb-2">🍽️</div>
            <p className="font-bold text-slate-800">No dishes match your selected filters</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting 'All' or clearing your search keywords.</p>
          </div>
        ) : (
          filteredMenu.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 rounded-2xl shadow-glow flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
                {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart
              </p>
              <p className="text-lg font-extrabold text-white">
                ₹{total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-sm py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>View Cart & Checkout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
