import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MenuItemCard({ item }) {
  const { addToCart, updateQty, getItemQuantity } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loadingAction, setLoadingAction] = useState(false)

  const inCartQty   = getItemQuantity(item.id)
  const isOutOfStock = !item.is_available || item.available_qty === 0

  const handleAddFirst = async () => {
    if (!user) { navigate('/login'); return }
    setLoadingAction(true)
    await addToCart(item.id, 1)
    setLoadingAction(false)
  }

  const handleQtyDelta = async (delta) => {
    if (!user) { navigate('/login'); return }
    setLoadingAction(true)
    await updateQty(item.id, inCartQty + delta)
    setLoadingAction(false)
  }

  return (
    <div
      className={`card group flex flex-col-reverse sm:flex-row justify-between gap-4 p-4 sm:p-5 transition-all duration-300 ${
        isOutOfStock
          ? 'opacity-50'
          : 'hover:border-crave-500/25 hover:shadow-card-hover'
      }`}
    >
      {/* ── Left: Info ── */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Veg/Non-veg + Category + Calories */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Veg dot indicator */}
            <span
              className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                item.is_veg ? 'border-emerald-500' : 'border-red-500'
              }`}
              title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </span>

            <span className="badge bg-white/[0.06] text-white/50 border border-white/[0.07] text-[10px] py-0.5">
              {item.category}
            </span>

            {item.calories && (
              <span className="text-[11px] text-white/30 font-medium">
                🔥 {item.calories} kcal
              </span>
            )}
          </div>

          {/* Dish name */}
          <h4 className="font-bold text-white text-base sm:text-lg mb-1.5 leading-snug group-hover:text-crave-400 transition-colors">
            {item.name}
          </h4>

          {/* Price + rating */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-black text-white">₹{item.price}</span>
            {item.rating && (
              <span className="text-xs font-bold text-amber-400">★ {item.rating}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-white/35 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Stock warning */}
        <div className="mt-3 flex flex-wrap gap-2">
          {item.available_qty < 10 && item.available_qty > 0 && (
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse-subtle text-[10px]">
              ⚠️ Only {item.available_qty} left!
            </span>
          )}
          {isOutOfStock && (
            <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Image + Cart Controls ── */}
      <div className="relative flex flex-col items-center shrink-0 sm:w-36">
        {/* Image */}
        <div className="w-full h-32 sm:h-28 rounded-xl overflow-hidden bg-dark-700 mb-3 border border-white/[0.05]">
          <img
            src={
              item.image_url ||
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'
            }
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Cart stepper / Add button */}
        {isOutOfStock ? (
          <button disabled className="w-full max-w-[130px] py-2 rounded-xl text-xs font-bold bg-white/[0.04] text-white/25 border border-white/[0.05] cursor-not-allowed">
            Unavailable
          </button>
        ) : inCartQty > 0 ? (
          <div className="flex items-center justify-between bg-crave-500 text-white rounded-xl overflow-hidden w-full max-w-[130px] font-black text-sm shadow-glow-sm">
            <button
              onClick={() => handleQtyDelta(-1)}
              disabled={loadingAction}
              className="px-3 py-2 hover:bg-crave-600 active:bg-crave-700 transition-colors disabled:opacity-50"
            >
              −
            </button>
            <span className="font-black text-sm min-w-[20px] text-center">
              {loadingAction ? '·' : inCartQty}
            </span>
            <button
              onClick={() => handleQtyDelta(1)}
              disabled={loadingAction || inCartQty >= item.available_qty}
              className="px-3 py-2 hover:bg-crave-600 active:bg-crave-700 transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddFirst}
            disabled={loadingAction}
            className="btn-primary w-full max-w-[130px] text-xs py-2 font-bold shadow-glow-sm"
          >
            {loadingAction ? '...' : '+ ADD'}
          </button>
        )}
      </div>
    </div>
  )
}
