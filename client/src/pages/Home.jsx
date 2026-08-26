import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import RestaurantCard from '../components/RestaurantCard'
import toast from 'react-hot-toast'

/* ── Food Categories ── */
const CATEGORIES = [
  { name: 'All',         icon: '🍽️', color: 'from-white/10 to-white/5' },
  { name: 'Burgers',     icon: '🍔', color: 'from-yellow-500/20 to-amber-500/10' },
  { name: 'Pizza',       icon: '🍕', color: 'from-red-500/20 to-orange-500/10' },
  { name: 'Biryani',     icon: '🍛', color: 'from-orange-500/20 to-yellow-500/10' },
  { name: 'Indian',      icon: '🫕', color: 'from-amber-500/20 to-yellow-500/10' },
  { name: 'Desserts',    icon: '🍰', color: 'from-pink-500/20 to-rose-500/10' },
  { name: 'Beverages',   icon: '🧋', color: 'from-teal-500/20 to-cyan-500/10' },
  { name: 'Healthy',     icon: '🥗', color: 'from-emerald-500/20 to-green-500/10' },
  { name: 'Chinese',     icon: '🥢', color: 'from-red-500/20 to-rose-500/10' },
  { name: 'Italian',     icon: '🍝', color: 'from-green-500/20 to-emerald-500/10' },
]

/* ── Promo offers ── */
const OFFERS = [
  {
    code: 'HUNGRY50',
    title: '50% OFF',
    sub: 'Up to ₹100 on orders above ₹200',
    icon: '🔥',
    gradient: 'from-crave-600 to-amber-600',
  },
  {
    code: 'WELCOME100',
    title: '₹100 OFF',
    sub: 'On your first order above ₹300',
    icon: '🎉',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    code: 'FREEDEL',
    title: 'FREE DELIVERY',
    sub: 'On any order, no minimum required',
    icon: '🛵',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    code: 'TASTY20',
    title: '20% OFF',
    sub: 'Up to ₹150 on orders above ₹150',
    icon: '⭐',
    gradient: 'from-blue-600 to-indigo-600',
  },
]

/* ── Testimonials ── */
const REVIEWS = [
  {
    name: 'Riya Sharma',
    avatar: 'R',
    color: 'from-pink-500 to-rose-500',
    rating: 5,
    text: 'CraveKart is hands-down the best food app I\'ve used. The UI is gorgeous and delivery is always on time!',
    dish: 'Butter Chicken Biryani',
    location: 'Bengaluru',
  },
  {
    name: 'Arjun Mehta',
    avatar: 'A',
    color: 'from-blue-500 to-indigo-500',
    rating: 5,
    text: 'Amazing variety of restaurants. The live tracking feature is super smooth. Ordered 3x this week already!',
    dish: 'Margherita Pizza',
    location: 'Mumbai',
  },
  {
    name: 'Priya Nair',
    avatar: 'P',
    color: 'from-emerald-500 to-teal-500',
    rating: 5,
    text: 'Love the dark theme! Finally a food delivery app that looks premium. The food quality is chef\'s kiss 🤌',
    dish: 'Mango Lassi & Samosas',
    location: 'Chennai',
  },
]

/* ── Stats ── */
const STATS = [
  { value: '50+',    label: 'Restaurants',      icon: '🏪' },
  { value: '500+',   label: 'Menu Items',        icon: '🍜' },
  { value: '25 min', label: 'Avg. Delivery',     icon: '⚡' },
  { value: '4.8★',   label: 'Average Rating',    icon: '⭐' },
]

export default function Home() {
  const [restaurants, setRestaurants]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [cuisine, setCuisine]           = useState('All')
  const [sortBy, setSortBy]             = useState('rating')
  const [openOnly, setOpenOnly]         = useState(false)
  const [heroVisible, setHeroVisible]   = useState(false)

  useEffect(() => {
    // Trigger hero animation
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = {}
        // Map category names to cuisine filter values
        const cuisineMap = {
          'Burgers': 'American', 'Pizza': 'Italian', 'Biryani': 'Indian',
          'Indian': 'Indian', 'Chinese': 'Chinese', 'Italian': 'Italian',
        }
        if (search) params.search = search
        if (cuisine !== 'All') params.cuisine = cuisineMap[cuisine] || cuisine
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
    const d = setTimeout(fetch, 250)
    return () => clearTimeout(d)
  }, [search, cuisine, sortBy, openOnly])

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code)
    toast.success(`${code} copied! Paste at checkout 🎉`, {
      style: { background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,107,0,0.3)' },
    })
  }

  return (
    <div className="min-h-screen bg-dark-950">

      {/* ═══════════════════════════════════════════════════════════════
           HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=90"
            alt="Food hero"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/85 to-dark-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-dark-950/30" />
        </div>

        {/* Orange glow orbs */}
        <div className="glow-orb w-96 h-96 bg-crave-600/20 top-1/4 -left-32" />
        <div className="glow-orb w-64 h-64 bg-amber-500/10 bottom-1/4 right-1/4" />

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 bg-crave-500/15 border border-crave-500/30 rounded-full px-4 py-1.5 mb-6 transition-all duration-700 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-crave-500 animate-pulse-subtle" />
              <span className="text-xs font-bold text-crave-400 uppercase tracking-wider">⚡ Ultra-Fast 25 Min Delivery</span>
            </div>

            {/* Headline */}
            <h1
              className={`text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Your Favorite Food,{' '}
              <span className="bg-gradient-to-r from-crave-400 to-amber-400 bg-clip-text text-transparent">
                Delivered Fast
              </span>
            </h1>

            {/* Subheading */}
            <p
              className={`text-white/60 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg transition-all duration-700 delay-200 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Authentic biryani, gourmet burgers, artisan pizzas, and more — from top-rated restaurants, straight to your door.
            </p>

            {/* Search Bar */}
            <div
              className={`relative mb-6 transition-all duration-700 delay-300 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search restaurants, dishes, cuisines..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-12 pr-4 py-4 text-base w-full bg-dark-900/80 border-white/10 shadow-card-dark"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 text-xs transition-all"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button className="btn-primary px-6 py-4 text-base shrink-0 shadow-glow-orange">
                  Search
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div
              className={`flex flex-wrap gap-6 transition-all duration-700 delay-[400ms] ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-white font-black text-base leading-none">{s.value}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating food emoji decoration */}
        <div className="absolute right-8 top-1/3 hidden xl:flex flex-col gap-4 animate-float">
          {['🍔','🍕','🍛','🧁'].map((emoji, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-3xl shadow-glass"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           FOOD CATEGORIES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Explore <span className="gradient-text">Categories</span></h2>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCuisine(cat.name)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 group ${
                cuisine === cat.name
                  ? 'border-crave-500/60 bg-gradient-to-b from-crave-500/20 to-crave-500/5 shadow-glow-sm'
                  : 'border-white/[0.06] bg-dark-800/40 hover:border-crave-500/30 hover:bg-dark-800/80'
              }`}
            >
              <span className={`text-2xl transition-transform duration-300 ${cuisine === cat.name ? 'scale-110' : 'group-hover:scale-110'}`}>
                {cat.icon}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                cuisine === cat.name ? 'text-crave-400' : 'text-white/40 group-hover:text-white/70'
              }`}>
                {cat.name}
              </span>
              {cuisine === cat.name && (
                <div className="absolute inset-x-2 bottom-1 h-0.5 bg-crave-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           SPECIAL OFFERS BANNER
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">🏷️ Special <span className="gradient-text">Offers</span></h2>
          <p className="text-white/30 text-sm">Click to copy code</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFERS.map((offer) => (
            <button
              key={offer.code}
              onClick={() => copyCoupon(offer.code)}
              className={`relative overflow-hidden rounded-2xl p-5 text-left group bg-gradient-to-br ${offer.gradient} border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <span className="text-3xl mb-3 block">{offer.icon}</span>
                <p className="font-black text-2xl text-white mb-1">{offer.title}</p>
                <p className="text-white/70 text-xs leading-relaxed mb-3">{offer.sub}</p>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
                  <span className="font-black text-xs text-white tracking-wider">{offer.code}</span>
                  <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           RESTAURANTS GRID
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center justify-between">
            <h2 className="section-title">
              {cuisine === 'All' ? 'Featured Restaurants' : `${cuisine} Spots`}
              <span className="ml-2 text-sm font-normal text-white/30">({restaurants.length})</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-dark-800/70 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white/70 focus:outline-none focus:ring-1 focus:ring-crave-500/40 cursor-pointer shrink-0"
            >
              <option value="rating">⭐ Top Rated</option>
              <option value="delivery_time">⚡ Fastest</option>
              <option value="min_order">💰 Lowest Min</option>
            </select>

            <button
              onClick={() => setOpenOnly(!openOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                openOnly
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-dark-800/70 text-white/50 border-white/10 hover:border-white/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${openOnly ? 'bg-emerald-400 animate-pulse-subtle' : 'bg-white/20'}`} />
              Open Now
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="card h-80 animate-pulse">
                <div className="h-48 bg-dark-700/60 rounded-t-2xl skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-24 glass-card mx-auto max-w-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-white mb-2">No restaurants found</h3>
            <p className="text-sm text-white/40 mb-6">Try clearing your filters.</p>
            <button
              onClick={() => { setSearch(''); setCuisine('All'); setOpenOnly(false); setSortBy('rating') }}
              className="btn-primary text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           CUSTOMER REVIEWS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">What Our <span className="gradient-text">Foodies Say</span></h2>
          <p className="text-white/40 text-base max-w-md mx-auto">Thousands of happy customers order daily from CraveKart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, i) => (
            <div key={i} className="glass-card p-6 group hover:border-crave-500/20 transition-all duration-300 hover:-translate-y-1">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(rev.rating)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-5 italic">"{rev.text}"</p>

              <div className="divider mb-4" />

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rev.color} flex items-center justify-center font-black text-white text-sm`}>
                  {rev.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{rev.name}</p>
                  <p className="text-white/30 text-xs">{rev.dish} · {rev.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           APP DOWNLOAD BANNER
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-crave-600 via-crave-500 to-amber-500 p-8 sm:p-12">
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute right-20 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-bold text-white mb-4">
                📱 Mobile App Coming Soon
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                Order on the go.<br />Download CraveKart.
              </h2>
              <p className="text-white/80 text-base max-w-sm">
                Get exclusive app-only discounts, real-time tracking, and instant notifications for your deliveries.
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <button className="flex items-center gap-3 bg-white text-dark-900 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all shadow-elevated hover:-translate-y-0.5">
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <p className="text-[10px] text-dark-600 font-semibold uppercase tracking-wide">Download on the</p>
                  <p className="text-base font-black leading-none">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white text-dark-900 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/90 transition-all shadow-elevated hover:-translate-y-0.5">
                <span className="text-2xl">▶️</span>
                <div className="text-left">
                  <p className="text-[10px] text-dark-600 font-semibold uppercase tracking-wide">Get it on</p>
                  <p className="text-base font-black leading-none">Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-dark-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-crave-500 to-amber-400 flex items-center justify-center text-base shadow-glow-sm">
                  🛺
                </div>
                <span className="font-black text-lg gradient-text">CraveKart</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                Delivering happiness to your doorstep, one delicious meal at a time.
              </p>
              <div className="flex gap-3">
                {['𝕏', 'IG', 'FB', 'YT'].map(s => (
                  <button key={s} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-crave-500/20 border border-white/[0.07] hover:border-crave-500/30 flex items-center justify-center text-white/40 hover:text-crave-400 text-xs font-black transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Blog', 'Press Kit'],
              },
              {
                title: 'Support',
                links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
              },
              {
                title: 'For Partners',
                links: ['List Your Restaurant', 'Become a Rider', 'Advertise', 'Business API'],
              },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-white/40 hover:text-crave-400 text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="divider pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/25 text-xs">© 2025 CraveKart Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-2 text-white/25 text-xs">
              <span>🔒 SSL Secured</span>
              <span>·</span>
              <span>🇮🇳 Made in India</span>
              <span>·</span>
              <span>♻️ Eco Packaging</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
