import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

const AVAILABLE_COUPONS = {
  HUNGRY50: {
    code: 'HUNGRY50',
    description: '50% OFF up to ₹100 on orders above ₹200',
    type: 'percent',
    value: 50,
    maxDiscount: 100,
    minOrder: 200,
  },
  WELCOME100: {
    code: 'WELCOME100',
    description: 'Flat ₹100 OFF on orders above ₹300',
    type: 'flat',
    value: 100,
    maxDiscount: 100,
    minOrder: 300,
  },
  FREEDEL: {
    code: 'FREEDEL',
    description: 'Free Delivery on any order',
    type: 'free_delivery',
    value: 30,
    maxDiscount: 30,
    minOrder: 0,
  },
  TASTY20: {
    code: 'TASTY20',
    description: '20% OFF on all gourmet meals',
    type: 'percent',
    value: 20,
    maxDiscount: 150,
    minOrder: 150,
  },
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart]       = useState([])
  const [total, setTotal]     = useState(0)
  const [coupon, setCoupon]   = useState(null)
  const [tip, setTip]         = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCart([]); setTotal(0); return }
    try {
      const { data } = await api.get('/cart')
      setCart(data.cart || [])
      setTotal(data.total || 0)
    } catch {
      setCart([])
      setTotal(0)
    }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const getItemQuantity = useCallback((menuItemId) => {
    const item = cart.find(i => i.menu_item_id === menuItemId)
    return item ? item.quantity : 0
  }, [cart])

  const addToCart = async (menuItemId, quantity = 1) => {
    if (!user) return
    setLoading(true)
    try {
      await api.post('/cart', { menu_item_id: menuItemId, quantity })
      await fetchCart()
      toast.success('Added to cart! 🛒')
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.differentRestaurant) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-800">Switch Restaurant?</p>
            <p className="text-xs text-slate-500">Your cart has items from another restaurant. Clear and replace?</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={async () => {
                  toast.dismiss(t.id)
                  await clearCart(false)
                  await addToCart(menuItemId, quantity)
                }}
                className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-orange-600"
              >
                Clear & Add
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ), { duration: 6000 })
      } else {
        toast.error(err.response?.data?.error || 'Failed to add to cart')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateQty = async (menuItemId, quantity) => {
    if (!user) return
    const cartItem = cart.find(i => i.menu_item_id === menuItemId)
    if (quantity < 1) {
      if (cartItem) {
        return removeFromCart(cartItem.cart_id)
      }
      return
    }

    try {
      await api.post('/cart', { menu_item_id: menuItemId, quantity })
      await fetchCart()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update cart')
    }
  }

  const removeFromCart = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`)
      await fetchCart()
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async (showToast = true) => {
    try {
      await api.delete('/cart')
      setCart([])
      setTotal(0)
      setCoupon(null)
      setTip(0)
      if (showToast) toast.success('Cart cleared')
    } catch {
      if (showToast) toast.error('Failed to clear cart')
    }
  }

  const applyCoupon = (code) => {
    const upper = code.trim().toUpperCase()
    const found = AVAILABLE_COUPONS[upper]
    if (!found) {
      toast.error('Invalid coupon code')
      return false
    }
    if (total < found.minOrder) {
      toast.error(`Minimum order value of ₹${found.minOrder} required for ${upper}`)
      return false
    }
    setCoupon(found)
    toast.success(`Coupon ${upper} applied! 🎉`)
    return true
  }

  const removeCoupon = () => {
    setCoupon(null)
    toast.success('Coupon removed')
  }

  // Delivery fee calculation: free if total > 299 or FREEDEL coupon applied
  const baseDeliveryFee = total > 299 || total === 0 ? 0 : 35
  const deliveryFee = coupon?.type === 'free_delivery' ? 0 : baseDeliveryFee

  // Discount calculation
  let discountAmount = 0
  if (coupon) {
    if (coupon.type === 'percent') {
      discountAmount = Math.min(Math.round((total * coupon.value) / 100), coupon.maxDiscount)
    } else if (coupon.type === 'flat') {
      discountAmount = Math.min(coupon.value, total)
    }
  }

  const grandTotal = Math.max(0, Math.round((total + deliveryFee + tip - discountAmount) * 100) / 100)
  const cartCount  = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart,
      total,
      cartCount,
      loading,
      coupon,
      tip,
      setTip,
      deliveryFee,
      discountAmount,
      grandTotal,
      availableCoupons: Object.values(AVAILABLE_COUPONS),
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      fetchCart,
      getItemQuantity,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
