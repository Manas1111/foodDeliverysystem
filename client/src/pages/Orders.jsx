import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import OrderCard from '../components/OrderCard'

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('active') // 'active', 'all', 'completed'

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const { data } = await api.get('/orders')
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(true)
    // Auto-poll every 5 seconds for live status updates from the kitchen
    const timer = setInterval(() => {
      fetchOrders(false)
    }, 5000)

    return () => clearInterval(timer)
  }, [fetchOrders])

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status))
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status))

  const displayedOrders = tab === 'active'
    ? activeOrders
    : tab === 'completed'
    ? completedOrders
    : orders

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Live Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track live kitchen progress and review past orders
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live kitchen updates active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            tab === 'active'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
          }`}
        >
          <span>🔥 Active Orders</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'active' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {activeOrders.length}
          </span>
        </button>

        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            tab === 'completed'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
          }`}
        >
          <span>📋 Past Orders</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab === 'completed' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {completedOrders.length}
          </span>
        </button>

        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            tab === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
          }`}
        >
          All ({orders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3 animate-bounce">🛵</div>
          <p className="font-bold text-slate-600">Fetching your orders...</p>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center text-4xl">
            📋
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">
            {tab === 'active' ? 'No active orders in progress' : 'No orders found'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            {tab === 'active' ? 'Hungry? Place an order from our best gourmet restaurants!' : 'Your order history will appear here once you place orders.'}
          </p>
          <Link to="/" className="btn-primary text-xs py-2.5 px-6 font-bold">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedOrders.map(order => (
            <OrderCard key={order.id} order={order} onRefresh={() => fetchOrders(false)} />
          ))}
        </div>
      )}
    </div>
  )
}
