import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const ADDRESS_PRESETS = [
  { label: '🏠 Home', address: '12 Indiranagar 100ft Road, Flat 402, Bengaluru' },
  { label: '🏢 Work', address: 'Tech Park Tower B, 4th Floor, Electronic City, Bengaluru' },
]

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / Google Pay / PhonePe', icon: '⚡', desc: 'Instant 0-fee payment' },
  { id: 'card', label: 'Credit or Debit Card', icon: '💳', desc: 'Visa, MasterCard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay via cash or UPI to rider' },
]

export default function Cart() {
  const {
    cart,
    total,
    deliveryFee,
    discountAmount,
    coupon,
    tip,
    setTip,
    grandTotal,
    availableCoupons,
    applyCoupon,
    removeCoupon,
    updateQty,
    removeFromCart,
    clearCart,
    fetchCart,
  } = useCart()

  const navigate = useNavigate()

  const [deliveryAddress, setDeliveryAddress] = useState(ADDRESS_PRESETS[0].address)
  const [notes, setNotes]                     = useState('')
  const [paymentMethod, setPaymentMethod]     = useState('upi')
  const [couponInput, setCouponInput]         = useState('')
  const [placing, setPlacing]                 = useState(false)

  const restaurantName  = cart[0]?.restaurant_name
  const restaurantImage = cart[0]?.restaurant_image

  const handleQtyChange = async (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) {
      await removeFromCart(item.cart_id)
    } else {
      await updateQty(item.menu_item_id, newQty)
    }
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    const ok = applyCoupon(couponInput)
    if (ok) setCouponInput('')
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please specify a delivery address')
      return
    }

    setPlacing(true)
    try {
      await api.post('/orders', {
        delivery_address: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        tip_amount: tip,
      })

      await fetchCart()
      toast.success('Order placed successfully! 🎉', { duration: 4000 })
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-5 bg-crave-500/10 rounded-full flex items-center justify-center text-5xl border border-crave-500/20">
            🛒
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Your cart is empty</h2>
          <p className="text-sm text-white/40 mb-6">Explore our restaurants and add some mouthwatering dishes!</p>
          <Link to="/" className="btn-primary px-8 py-3 text-sm">
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Order Summary & Checkout
        </h1>
        <button
          onClick={() => clearCart(true)}
          className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
        >
          🗑️ Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items + Address + Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Restaurant header card */}
          <div className="card p-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.06] mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-dark-700 shrink-0">
                <img
                  src={restaurantImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                  alt={restaurantName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-crave-500 font-bold uppercase tracking-wider">Ordering from</p>
                <h3 className="text-lg font-black text-white leading-tight">{restaurantName}</h3>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 divide-y divide-white/[0.05]">
              {cart.map((item) => (
                <div key={item.cart_id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`w-3.5 h-3.5 rounded-sm border-2 shrink-0 flex items-center justify-center ${
                      item.is_veg ? 'border-emerald-500' : 'border-red-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.is_veg ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-white/35">₹{item.price} each</p>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-crave-500 text-white rounded-xl overflow-hidden text-xs font-black shadow-glow-sm">
                      <button
                        onClick={() => handleQtyChange(item, -1)}
                        className="px-2.5 py-1.5 hover:bg-crave-600 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-2 font-black">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, +1)}
                        className="px-2.5 py-1.5 hover:bg-crave-600 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-black text-white text-sm w-16 text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Instructions */}
          <div className="card p-5 space-y-4">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <span>📍</span> Delivery Address & Notes
            </h3>

            {/* Quick preset chips */}
            <div className="flex gap-2 flex-wrap">
              {ADDRESS_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDeliveryAddress(p.address)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    deliveryAddress === p.address
                      ? 'bg-crave-500/20 text-crave-400 border-crave-500/40'
                      : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <textarea
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                rows={2}
                className="input-field text-xs sm:text-sm font-medium"
                placeholder="Enter complete delivery street address, apartment / floor number..."
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field text-xs sm:text-sm"
                placeholder="📝 Special instructions for driver or kitchen (e.g. Leave at door, extra spicy)..."
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="card p-5 space-y-3">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <span>💳</span> Payment Method
            </h3>

            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'bg-crave-500/10 border-crave-500/40'
                      : 'bg-white/[0.03] border-white/[0.07] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{method.icon}</span> {method.label}
                      </p>
                      <p className="text-xs text-white/35">{method.desc}</p>
                    </div>
                  </div>
                  {paymentMethod === method.id && (
                    <span className="text-xs font-bold text-crave-400 bg-crave-500/15 px-2 py-0.5 rounded-full border border-crave-500/30">
                      Selected
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Coupons, Tip & Bill Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Coupon Codes & Promotions */}
          <div className="card p-5 space-y-3">
            <h3 className="font-black text-white text-sm flex items-center gap-2">
              <span>🏷️</span> Apply Promo Coupon
            </h3>

            {coupon ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <span>🎉</span> {coupon.code} Applied!
                  </p>
                  <p className="text-[11px] text-emerald-400/70 font-semibold">{coupon.description}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. HUNGRY50)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  className="input-field text-xs uppercase font-bold py-2"
                />
                <button type="submit" className="btn-primary text-xs py-2 px-4 shrink-0 font-bold">
                  Apply
                </button>
              </form>
            )}

            {/* Quick Available Coupons list */}
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-bold text-white/25 uppercase tracking-wider">Available for you:</p>
              {availableCoupons.map((c) => (
                <div
                  key={c.code}
                  onClick={() => applyCoupon(c.code)}
                  className="p-2.5 bg-white/[0.03] hover:bg-crave-500/10 rounded-xl border border-white/[0.06] hover:border-crave-500/30 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-black text-xs text-crave-400">{c.code}</span>
                    <p className="text-[10px] text-white/30 mt-0.5">{c.description}</p>
                  </div>
                  <span className="text-[11px] font-bold text-crave-500">
                    Apply
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Tip */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <span>🚴</span> Rider Tip
              </h3>
              {tip > 0 && (
                <button onClick={() => setTip(0)} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  Clear
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {[20, 30, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTip(tip === amount ? 0 : amount)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    tip === amount
                      ? 'bg-crave-500 text-white border-crave-500 shadow-glow-sm'
                      : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:border-crave-500/30 hover:text-white'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Itemized Bill Breakdown */}
          <div className="card p-5 space-y-3">
            <h3 className="font-black text-white text-base mb-2">Bill Details</h3>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-white/50">
                <span>Item Subtotal</span>
                <span className="font-bold text-white/80">₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-white/50">
                <span>Delivery Partner Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-400">FREE</span>
                ) : (
                  <span className="font-bold text-white/80">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Coupon ({coupon?.code})</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {tip > 0 && (
                <div className="flex justify-between text-white/50">
                  <span>Rider Tip</span>
                  <span className="font-bold text-white/80">₹{tip.toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-white/[0.08] pt-3 flex justify-between items-baseline font-black text-lg">
                <span className="text-white">Grand Total</span>
                <span className="text-xl text-crave-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn-primary w-full py-4 mt-2 text-base font-black shadow-glow-orange"
            >
              {placing ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Placing order...
                </span>
              ) : `🚀 Pay & Order · ₹${grandTotal.toFixed(2)}`}
            </button>

            <p className="text-[11px] text-center text-white/25">
              🔒 SSL-Encrypted · Safe & Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
