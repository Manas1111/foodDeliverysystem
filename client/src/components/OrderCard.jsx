import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

const STATUS_METADATA = {
  pending:          { label: 'Order Placed',      step: 0, color: 'bg-amber-100 text-amber-800 border-amber-300',   icon: '⏳', desc: 'Sent to restaurant, awaiting confirmation' },
  confirmed:        { label: 'Accepted',          step: 1, color: 'bg-blue-100 text-blue-800 border-blue-300',     icon: '✅', desc: 'Restaurant confirmed your order' },
  preparing:        { label: 'Cooking',           step: 2, color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '👨‍🍳', desc: 'Chef is preparing your meal' },
  out_for_delivery: { label: 'Out for Delivery',  step: 3, color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🛵', desc: 'Delivery partner is on the way' },
  delivered:        { label: 'Delivered',         step: 4, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🎉', desc: 'Enjoy your meal!' },
  cancelled:        { label: 'Cancelled',         step: -1, color: 'bg-rose-100 text-rose-800 border-rose-300',     icon: '❌', desc: 'Order was cancelled' },
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderCard({ order, onRefresh }) {
  const meta = STATUS_METADATA[order.status] || STATUS_METADATA.pending
  const isCancelled = order.status === 'cancelled'
  const isDelivered = order.status === 'delivered'
  const currentStep = meta.step

  const [showTracking, setShowTracking] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { addToCart, clearCart } = useCart()
  const navigate = useNavigate()

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await api.patch(`/orders/${order.id}/cancel`)
      toast.success('Order cancelled successfully')
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = async () => {
    try {
      await clearCart(false)
      for (const item of order.items || []) {
        await addToCart(item.menu_item_id, item.quantity)
      }
      toast.success('Items added to cart!')
      navigate('/cart')
    } catch {
      toast.error('Failed to reorder items')
    }
  }

  return (
    <div className="card p-5 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <img
              src={order.restaurant_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
              alt={order.restaurant_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
              {order.restaurant_name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Order #{order.id} • {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`badge border ${meta.color} font-bold text-xs px-3 py-1`}>
            {meta.icon} {meta.label}
          </span>
        </div>
      </div>

      {/* Visual Stepper Progress Bar (for active orders) */}
      {!isCancelled && (
        <div className="my-6 px-2">
          <div className="relative flex items-center justify-between">
            {/* Progress line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-500 to-amber-500 z-0 rounded-full transition-all duration-500"
              style={{ width: `${(Math.max(0, currentStep) / 4) * 100}%` }}
            />

            {STATUS_FLOW.map((statusKey, idx) => {
              const stepMeta = STATUS_METADATA[statusKey]
              const isCompleted = idx <= currentStep
              const isCurrent = idx === currentStep

              return (
                <div key={statusKey} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${
                      isCurrent
                        ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110'
                        : isCompleted
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {stepMeta.icon}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-bold whitespace-nowrap hidden sm:block ${
                    isCurrent ? 'text-orange-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {stepMeta.label}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs font-medium text-slate-500 mt-4 bg-slate-50 py-1.5 px-3 rounded-lg">
            ℹ️ {meta.desc}
          </p>
        </div>
      )}

      {/* Items Breakdown */}
      <div className="bg-slate-50/70 rounded-xl p-3.5 mb-4 space-y-2 border border-slate-100 text-xs sm:text-sm">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-slate-700">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                item.is_veg ? 'border-emerald-600' : 'border-rose-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                }`} />
              </span>
              <span className="font-medium">{item.name}</span>
              <span className="text-slate-400 font-bold">× {item.quantity}</span>
            </div>
            <span className="font-semibold text-slate-900">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        {/* Order total & breakdown */}
        <div className="pt-2 mt-2 border-t border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-500">
          <div className="flex gap-3">
            <span>Payment: <strong className="uppercase text-slate-700">{order.payment_method || 'UPI'}</strong></span>
            {order.discount_amount > 0 && <span className="text-emerald-600 font-bold">Saved ₹{order.discount_amount}</span>}
          </div>
          <div className="text-sm font-extrabold text-slate-900">
            Total Paid: ₹{order.total_amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>📍</span>
          <span className="line-clamp-1">{order.delivery_address}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tracking button for active orders */}
          {!isCancelled && !isDelivered && (
            <button
              onClick={() => setShowTracking(true)}
              className="btn-primary text-xs py-2 px-3.5"
            >
              📍 Track Live
            </button>
          )}

          {/* Cancel button if still pending */}
          {order.status === 'pending' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="btn-danger text-xs py-2 px-3.5"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {/* Reorder button */}
          {(isDelivered || isCancelled) && (
            <button
              onClick={handleReorder}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              🔄 Reorder Items
            </button>
          )}
        </div>
      </div>

      {/* Live Tracking Modal */}
      {showTracking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <span>🛵</span> Live Order Tracking
              </h3>
              <button
                onClick={() => setShowTracking(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated Live Map Visual */}
            <div className="bg-slate-100 h-44 rounded-2xl relative overflow-hidden mb-5 border border-slate-200 flex items-center justify-center">
              {/* Map grid background */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Route line */}
              <div className="absolute top-1/2 left-12 right-12 h-1 bg-dashed border-t-2 border-dashed border-orange-400" />
              
              {/* Restaurant pin */}
              <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-2xl animate-bounce">🏪</span>
                <span className="text-[10px] font-extrabold bg-white px-2 py-0.5 rounded shadow-sm mt-1">Kitchen</span>
              </div>

              {/* Delivery Driver */}
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center animate-pulse">
                <span className="text-3xl">🛵</span>
                <span className="text-[10px] font-extrabold bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-md mt-1">Rider on way</span>
              </div>

              {/* Delivery destination pin */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-2xl">📍</span>
                <span className="text-[10px] font-extrabold bg-white px-2 py-0.5 rounded shadow-sm mt-1">You</span>
              </div>
            </div>

            {/* Driver Profile */}
            <div className="flex items-center justify-between p-3.5 bg-orange-50 rounded-2xl border border-orange-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-base">
                  RK
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Rahul Kumar</p>
                  <p className="text-xs text-orange-700 font-semibold">⭐ 4.9 (Vaccinated & Sanitized)</p>
                </div>
              </div>
              <a
                href="tel:9876543210"
                onClick={(e) => { e.preventDefault(); toast('Simulated Call: +91 98765 43210 📞') }}
                className="bg-white hover:bg-orange-100 text-orange-600 font-bold text-xs py-2 px-3.5 rounded-xl border border-orange-200 shadow-xs"
              >
                📞 Call Rider
              </a>
            </div>

            {/* ETA Counter */}
            <div className="text-center py-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Arrival</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">18 - 25 Minutes</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">Status: {meta.label} ({meta.desc})</p>
            </div>

            <button
              onClick={() => setShowTracking(false)}
              className="btn-primary w-full py-3 mt-4"
            >
              Back to Orders
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
