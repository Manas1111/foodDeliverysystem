import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MenuItemCard({ item }) {
  const { addToCart, updateQty, getItemQuantity } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loadingAction, setLoadingAction] = useState(false)

  const inCartQty = getItemQuantity(item.id)
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
    <div className={`card p-4 sm:p-5 flex flex-col-reverse sm:flex-row justify-between gap-4 transition-all duration-200 ${
      isOutOfStock ? 'opacity-60 bg-slate-50' : 'hover:border-orange-200'
    }`}>
      {/* Left Info Column */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Veg / Non-Veg badge + Category */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                item.is_veg
                  ? 'border-emerald-600'
                  : 'border-rose-600'
              }`}
              title={item.is_veg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>
            <span className="badge bg-slate-100 text-slate-600">
              {item.category}
            </span>
            {item.calories && (
              <span className="text-[11px] text-slate-400 font-medium">
                🔥 {item.calories} kcal
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-1 leading-snug">
            {item.name}
          </h4>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-extrabold text-slate-900">
              ₹{item.price}
            </span>
            {item.rating && (
              <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                ★ {item.rating}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Stock status indicator */}
        <div className="mt-3 flex items-center gap-2">
          {item.available_qty < 10 && item.available_qty > 0 && (
            <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 animate-pulse-subtle">
              ⚠️ Only {item.available_qty} left!
            </span>
          )}
          {isOutOfStock && (
            <span className="badge bg-rose-100 text-rose-700">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* Right Image & Add to Cart Stepper */}
      <div className="relative flex flex-col items-center shrink-0 sm:w-36">
        <div className="w-full h-32 sm:h-28 rounded-xl overflow-hidden bg-slate-100 mb-2">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Action Button or Quantity Stepper */}
        {isOutOfStock ? (
          <button disabled className="btn-secondary text-xs py-1.5 px-4 w-full opacity-50 cursor-not-allowed">
            Unavailable
          </button>
        ) : inCartQty > 0 ? (
          <div className="flex items-center justify-between bg-orange-500 text-white rounded-xl shadow-md overflow-hidden w-full max-w-[130px] font-bold text-sm">
            <button
              onClick={() => handleQtyDelta(-1)}
              disabled={loadingAction}
              className="px-3 py-1.5 hover:bg-orange-600 active:bg-orange-700 transition-colors"
              title="Decrease quantity"
            >
              −
            </button>
            <span className="px-2 text-white font-extrabold text-sm">{inCartQty}</span>
            <button
              onClick={() => handleQtyDelta(1)}
              disabled={loadingAction || inCartQty >= item.available_qty}
              className="px-3 py-1.5 hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-40"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddFirst}
            disabled={loadingAction}
            className="btn-primary text-xs py-2 px-5 w-full max-w-[130px] font-bold shadow-sm"
          >
            {loadingAction ? '...' : '+ ADD'}
          </button>
        )}
      </div>
    </div>
  )
}
