import { Link } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  const isClosed = !restaurant.is_open

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className={`group card overflow-hidden flex flex-col h-full bg-white hover:-translate-y-1 transition-all duration-300 ${
        isClosed ? 'opacity-75 grayscale-[30%]' : ''
      }`}
    >
      {/* Banner / Food Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Promo Offer Tag */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
          <span>🔥</span> 50% OFF up to ₹100
        </div>

        {/* Closed Overlay or Open Tag */}
        {isClosed ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg border border-rose-400/30">
              Currently Closed
            </span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Open
          </div>
        )}

        {/* Delivery Time & Min Order on bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
            ⏱️ {restaurant.delivery_time_min} mins
          </span>
          <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
            🛵 Min ₹{restaurant.min_order}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0">
              <span>★</span>
              <span>{restaurant.rating}</span>
            </div>
          </div>

          {/* Cuisine & Tags */}
          <p className="text-xs font-medium text-orange-600 mb-1">
            {restaurant.cuisine} {restaurant.tags ? `• ${restaurant.tags}` : ''}
          </p>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {restaurant.description}
          </p>
        </div>

        {/* Address Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="line-clamp-1">📍 {restaurant.address}</span>
          <span className="text-orange-500 font-bold group-hover:translate-x-0.5 transition-transform">
            View Menu →
          </span>
        </div>
      </div>
    </Link>
  )
}
