import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_BADGES = {
  pending:          'bg-amber-100 text-amber-800 border-amber-300',
  confirmed:        'bg-blue-100 text-blue-800 border-blue-300',
  preparing:        'bg-purple-100 text-purple-800 border-purple-300',
  out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
  delivered:        'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled:        'bg-rose-100 text-rose-800 border-rose-300',
}

const STATUS_ICONS = {
  pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
  out_for_delivery: '🛵', delivered: '🎉', cancelled: '❌',
}

function StatCard({ icon, label, value, subtext, color = 'text-slate-900', bg = 'bg-white' }) {
  return (
    <div className={`card p-5 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {subtext && <span className="text-[11px] font-bold text-slate-400">{subtext}</span>}
      </div>
      <div className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</div>
      <div className="text-xs font-semibold text-slate-500 mt-1">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]               = useState(null)
  const [orders, setOrders]             = useState([])
  const [restaurants, setRestaurants]   = useState([])
  const [menuItems, setMenuItems]       = useState([])
  const [tab, setTab]                   = useState('orders')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery]   = useState('')
  const [loading, setLoading]           = useState(true)
  const [updatingId, setUpdatingId]     = useState(null)

  const fetchAll = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const [statsRes, ordersRes, restRes, menuRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders', {
          params: {
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(searchQuery ? { search: searchQuery } : {}),
          },
        }),
        api.get('/admin/restaurants'),
        api.get('/admin/menu-items'),
      ])
      setStats(statsRes.data.stats)
      setOrders(ordersRes.data.orders || [])
      setRestaurants(restRes.data.restaurants || [])
      setMenuItems(menuRes.data.menuItems || [])
    } catch {
      toast.error('Failed to load admin management data')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => {
    fetchAll(true)
    const interval = setInterval(() => fetchAll(false), 5000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Order #${orderId} updated to ${newStatus.replace(/_/g, ' ')}`)
      fetchAll(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleRestaurant = async (r) => {
    try {
      await api.patch(`/admin/restaurants/${r.id}`, { is_open: !r.is_open })
      toast.success(`${r.name} is now ${!r.is_open ? 'OPEN' : 'CLOSED'}`)
      fetchAll(false)
    } catch {
      toast.error('Failed to update restaurant')
    }
  }

  const toggleMenuItem = async (item) => {
    try {
      await api.patch(`/admin/menu-items/${item.id}`, { is_available: !item.is_available })
      toast.success(`"${item.name}" availability updated`)
      fetchAll(false)
    } catch {
      toast.error('Failed to update menu item')
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="text-5xl animate-spin mb-3">⚙️</div>
      <p className="font-bold text-slate-600">Loading operations center...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>⚙️</span> Operations Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time kitchen dispatch, restaurant operational status & catalog controls
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Operations Feed</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="text-emerald-600" />
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} />
          <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="text-amber-600" />
          <StatCard icon="👨‍🍳" label="Cooking in Kitchen" value={stats.preparingOrders} color="text-purple-600" />
          <StatCard icon="🎉" label="Completed Deliveries" value={stats.deliveredOrders} color="text-emerald-600" />
          <StatCard icon="📊" label="Avg Order Value" value={`₹${stats.avgOrderValue}`} color="text-orange-600" />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          ['orders', '📦 Live Orders Dispatch', orders.length],
          ['restaurants', '🏪 Restaurant Outlets', restaurants.length],
          ['menu', '🍔 Catalog & Inventory', menuItems.length],
        ].map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
              tab === key
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              tab === key ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── 1. ORDERS TAB ── */}
      {tab === 'orders' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Email, or Restaurant..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2.5 text-xs sm:text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  statusFilter === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                All
              </button>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                    statusFilter === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{STATUS_ICONS[s]}</span>
                  <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders Feed */}
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <div className="text-5xl mb-2">📋</div>
              <p className="font-bold text-slate-800">No orders found matching the filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="card p-5 space-y-4">
                  {/* Order header row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-sm">
                        #{order.id}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {order.restaurant_name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          👤 <strong>{order.customer_name}</strong> ({order.customer_email}) • {new Date(order.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Status updater dropdown & badge */}
                    <div className="flex items-center gap-3">
                      <span className={`badge border ${STATUS_BADGES[order.status]} font-bold`}>
                        {STATUS_ICONS[order.status]} {order.status.replace(/_/g, ' ')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">Change:</span>
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                              {STATUS_ICONS[s]} {s.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order line items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                      <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Line Items</p>
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-700">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-semibold">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Delivery & Notes</p>
                        <p className="text-slate-600 mt-1">📍 {order.delivery_address}</p>
                        {order.notes && <p className="text-amber-700 font-medium mt-0.5">📝 Notes: "{order.notes}"</p>}
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-800 font-bold">
                        <span>Payment: {order.payment_method?.toUpperCase()}</span>
                        <span className="text-sm font-extrabold text-orange-600">Total: ₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2. RESTAURANTS TAB ── */}
      {tab === 'restaurants' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(r => (
            <div key={r.id} className="card overflow-hidden flex flex-col justify-between">
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={r.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`badge border font-extrabold text-xs px-2.5 py-1 ${
                    r.is_open ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600'
                  }`}>
                    {r.is_open ? '🟢 Open for Orders' : '🔴 Closed'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{r.name}</h3>
                  <p className="text-xs font-semibold text-orange-600 mt-0.5">{r.cuisine} • {r.tags}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{r.address}</p>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <span>⭐ {r.rating}</span>
                    <span>⏱️ {r.delivery_time_min} mins</span>
                    <span>Min ₹{r.min_order}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleRestaurant(r)}
                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                    r.is_open
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                  }`}
                >
                  {r.is_open ? '🔴 Close Restaurant Outlet' : '🟢 Open for Business'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. MENU & CATALOG TAB ── */}
      {tab === 'menu' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(item => (
              <div key={item.id} className="card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                        item.is_veg ? 'border-emerald-600' : 'border-rose-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`} />
                      </span>
                      <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</p>
                    </div>
                    <p className="text-[11px] text-orange-600 font-semibold">{item.restaurant_name}</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">₹{item.price} • Stock: {item.available_qty}</p>
                  </div>
                </div>

                {/* Stock Toggle Button */}
                <button
                  onClick={() => toggleMenuItem(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all shrink-0 ${
                    item.is_available
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {item.is_available ? 'In Stock' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
