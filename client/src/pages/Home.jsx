import { useState, useEffect } from 'react'
import api from '../api/client'
import RestaurantCard from '../components/RestaurantCard'
import toast from 'react-hot-toast'

const CUISINES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Italian', icon: '🍕' },
  { name: 'Chinese', icon: '🥢' },
  { name: 'American', icon: '🍔' },
  { name: 'Japanese', icon: '🍣' },
  { name: 'Mexican', icon: '🌮' },
]

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [cuisine, setCuisine]         = useState('All')
  const [sortBy, setSortBy]           = useState('rating')
  const [openOnly, setOpenOnly]       = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (cuisine !== 'All') params.cuisine = cuisine
        if (sortBy) params.sort = sortBy
        if (openOnly) params.open_only = 'true'

        const { data } = await api.get('/restaurants', { params })
        setRestaurants(data.restaurants || [])
      } catch {
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetch, 250)
    return () => clearTimeout(debounce)
  }, [search, cuisine, sortBy, openOnly])

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code)
    toast.success(`Coupon code ${code} copied! 🎉`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner with Gourmet Visuals & Deals */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-6 sm:p-10 shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-white/30">
            ⚡ Ultra-Fast 25 Min Delivery
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Delicious Flavours Delivered to Your Doorstep
          </h1>
          <p className="text-white/90 text-sm sm:text-base font-medium mb-6 leading-relaxed">
            Explore authentic cuisines, artisanal wood-fired pizzas, sizzler grills, and street tacos from top culinary destinations.
          </p>

          {/* Quick promo coupon badges */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="text-xs font-bold text-white/80">Active Offers:</span>
            <button
              onClick={() => copyCoupon('HUNGRY50')}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              🏷️ <strong>HUNGRY50</strong> (50% OFF)
            </button>
            <button
              onClick={() => copyCoupon('WELCOME100')}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              🏷️ <strong>WELCOME100</strong> (₹100 OFF)
            </button>
            <button
              onClick={() => copyCoupon('FREEDEL')}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              🛵 <strong>FREEDEL</strong> (Free Delivery)
            </button>
          </div>
        </div>

        {/* Decorative backdrop graphics */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-8 hidden lg:block text-8xl opacity-85 select-none animate-pulse-subtle">
          🍕
        </div>
      </div>

      {/* Search & Cuisine Categories Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search dishes, restaurants, or cuisines (e.g. Biryani, Pizza, Ramen)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-11 pr-10 py-3 shadow-xs text-sm sm:text-base font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 w-5 h-5 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort & Filters Dropdown & Pill */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-xs cursor-pointer"
            >
              <option value="rating">⭐ Top Rated</option>
              <option value="delivery_time">⏱️ Fastest Delivery</option>
              <option value="min_order">🛵 Lowest Min Order</option>
            </select>

            <button
              onClick={() => setOpenOnly(!openOnly)}
              className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all shrink-0 flex items-center gap-1.5 shadow-xs ${
                openOnly
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${openOnly ? 'bg-white' : 'bg-emerald-500'}`}></span>
              Open Now
            </button>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CUISINES.map(c => (
            <button
              key={c.name}
              onClick={() => setCuisine(c.name)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
                cuisine === c.name
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {cuisine === 'All' ? 'Popular Restaurants' : `${cuisine} Spots`}
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'} available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="card p-4 h-80 animate-pulse bg-slate-100 flex flex-col justify-between">
                <div className="bg-slate-200 h-44 rounded-xl w-full" />
                <div className="space-y-2 mt-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="text-6xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">No restaurants match your filters</h3>
            <p className="text-sm text-slate-400 mb-6">Try clearing your search term or adjusting the cuisine filter.</p>
            <button
              onClick={() => { setSearch(''); setCuisine('All'); setOpenOnly(false); setSortBy('rating') }}
              className="btn-primary text-xs py-2.5 px-6"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
