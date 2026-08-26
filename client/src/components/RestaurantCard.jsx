import { Link } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  const isClosed = !restaurant.is_open

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className={`group card-hover flex flex-col h-full overflow-hidden ${
        isClosed ? 'opacity-60' : ''
      }`}
    >
      {/* ── Banner Image ── */}
      <div className="relative h-48 w-full overflow-hidden bg-dark-700">
        <img
          src={
            restaurant.image_url ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
          }
          alt={restaurant.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            isClosed ? 'grayscale-[40%]' : ''
          }`}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent" />

        {/* Promo tag */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-crave-500 to-amber-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-glow-sm flex items-center gap-1">
          🔥 50% OFF
        </div>

        {/* Open/Closed badge */}
        {isClosed ? (
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-xl border border-red-400/30 shadow-lg">
              Currently Closed
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
            Open
          </div>
        )}

        {/* Bottom info strip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-dark-900/70 backdrop-blur-md text-white/80 text-[11px] font-semibold px-2 py-1 rounded-lg border border-white/[0.08] flex items-center gap-1">
            ⏱️ {restaurant.delivery_time_min} min
          </span>
          <span className="bg-dark-900/70 backdrop-blur-md text-white/80 text-[11px] font-semibold px-2 py-1 rounded-lg border border-white/[0.08]">
            Min ₹{restaurant.min_order}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Name + Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-base leading-snug group-hover:text-crave-400 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-black text-xs px-2 py-0.5 rounded-lg shrink-0">
              ★ {restaurant.rating}
            </div>
          </div>

          {/* Cuisine tags */}
          <p className="text-xs font-semibold text-crave-500 mb-1">
            {restaurant.cuisine}{restaurant.tags ? ` · ${restaurant.tags}` : ''}
          </p>

          <p className="text-xs text-white/35 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
          <span className="text-white/30 line-clamp-1 flex items-center gap-1">
            <span>📍</span> {restaurant.address}
          </span>
          <span className="text-crave-500 font-bold group-hover:text-crave-400 transition-colors flex items-center gap-0.5">
            Menu
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
