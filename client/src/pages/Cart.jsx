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
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mb-6">Explore our curated restaurants and add some mouthwatering dishes!</p>
        <Link to="/" className="btn-primary px-8 py-3 text-sm">
          Browse Restaurants
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Order Summary & Checkout
        </h1>
        <button
          onClick={() => clearCart(true)}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
        >
          🗑️ Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items + Address + Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Restaurant header card */}
          <div className="card p-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={restaurantImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                  alt={restaurantName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Ordering from</p>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{restaurantName}</h3>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.cart_id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`w-3.5 h-3.5 rounded-xs border shrink-0 flex items-center justify-center ${
                      item.is_veg ? 'border-emerald-600' : 'border-rose-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">₹{item.price} each</p>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden text-xs font-bold">
                      <button
                        onClick={() => handleQtyChange(item, -1)}
                        className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-2 text-slate-900 font-extrabold">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, +1)}
                        className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-extrabold text-slate-900 text-sm w-16 text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Instructions */}
          <div className="card p-5 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
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
                      ? 'bg-orange-50 text-orange-600 border-orange-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
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
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>💳</span> Payment Method
            </h3>

            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'bg-orange-50/70 border-orange-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
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
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{method.icon}</span> {method.label}
                      </p>
                      <p className="text-xs text-slate-400">{method.desc}</p>
                    </div>
                  </div>
                  {paymentMethod === method.id && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
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
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span>🏷️</span> Apply Promo Coupon
            </h3>

            {coupon ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                    <span>🎉</span> {coupon.code} Applied!
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{coupon.description}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800"
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
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available for you:</p>
              {availableCoupons.map((c) => (
                <div
                  key={c.code}
                  onClick={() => applyCoupon(c.code)}
                  className="p-2 bg-slate-50 hover:bg-orange-50/60 rounded-xl border border-slate-100 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-extrabold text-xs text-orange-600">{c.code}</span>
                    <p className="text-[10px] text-slate-500">{c.description}</p>
                  </div>
                  <span className="text-[11px] font-bold text-orange-500 hover:underline">
                    Apply
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Tip */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>🚴</span> Rider Tip (100% goes to driver)
              </h3>
              {tip > 0 && (
                <button onClick={() => setTip(0)} className="text-xs text-slate-400 hover:text-slate-600">
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
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Itemized Bill Breakdown */}
          <div className="card p-5 space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base mb-2">Bill Details</h3>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal</span>
                <span className="font-semibold text-slate-800">₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Partner Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-800">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {tip > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Partner Tip</span>
                  <span className="font-semibold text-slate-800">₹{tip.toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline font-extrabold text-slate-900 text-lg">
                <span>Grand Total</span>
                <span className="text-xl text-orange-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn-primary w-full py-3.5 mt-4 text-base font-extrabold shadow-lg"
            >
              {placing ? 'Securing your order...' : `Pay & Place Order · ₹${grandTotal.toFixed(2)}`}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              🔒 Safe & Secure Checkout via Encrypted Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
