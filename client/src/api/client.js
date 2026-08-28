/**
 * client.js — Local API mock (replaces axios + Express backend)
 * All calls resolve to localStorage-backed store functions.
 * The API shape is kept identical so pages/contexts need minimal changes.
 */

import {
  authLogin, authRegister,
  getRestaurants, getRestaurantById,
  getCart, addToCart, removeCartItem, clearCartForUser,
  getUserOrders, placeOrder, cancelOrder,
  adminGetStats, adminGetOrders, adminUpdateOrderStatus,
  adminGetRestaurants, adminToggleRestaurant,
  adminGetMenuItems, adminToggleMenuItem,
} from '../store/store'

/** Get the current user id from localStorage (set by AuthContext) */
function currentUserId() {
  const raw = localStorage.getItem('fd_user')
  if (!raw) return null
  try { return JSON.parse(raw).id } catch { return null }
}

/** Wrap sync store calls in a resolved Promise so callers can await them */
function ok(data) {
  return Promise.resolve({ data })
}

function fail(message, status = 400) {
  const err    = new Error(message)
  err.response = { status, data: { error: message } }
  return Promise.reject(err)
}

// ── Mock API object ────────────────────────────────────────────────────────────
const api = {
  // GET /api/restaurants
  // GET /api/restaurants/:id
  // POST /api/auth/login | /api/auth/register
  // GET|POST|DELETE /api/cart
  // GET|POST /api/orders
  // PATCH /api/orders/:id/cancel
  // GET /api/admin/stats | orders | restaurants | menu-items
  // PATCH /api/admin/orders/:id/status | restaurants/:id | menu-items/:id

  get(path, config = {}) {
    const params = config.params || {}

    // ── Restaurants ──────────────────────────────────────────────────────────
    if (path === '/restaurants') {
      const list = getRestaurants({
        search:    params.search    || '',
        cuisine:   params.cuisine   || '',
        sort:      params.sort      || 'rating',
        open_only: params.open_only === 'true',
      })
      return ok({ restaurants: list })
    }

    const restMatch = path.match(/^\/restaurants\/(\d+)$/)
    if (restMatch) {
      const result = getRestaurantById(restMatch[1])
      if (!result) return fail('Restaurant not found', 404)
      return ok(result)
    }

    // ── Cart ─────────────────────────────────────────────────────────────────
    if (path === '/cart') {
      const uid = currentUserId()
      if (!uid) return fail('Unauthorized', 401)
      return ok(getCart(uid))
    }

    // ── Orders ───────────────────────────────────────────────────────────────
    if (path === '/orders') {
      const uid = currentUserId()
      if (!uid) return fail('Unauthorized', 401)
      return ok({ orders: getUserOrders(uid) })
    }

    // ── Admin ────────────────────────────────────────────────────────────────
    if (path === '/admin/stats') {
      return ok({ stats: adminGetStats() })
    }
    if (path === '/admin/orders') {
      return ok({ orders: adminGetOrders({ status: params.status, search: params.search }) })
    }
    if (path === '/admin/restaurants') {
      return ok({ restaurants: adminGetRestaurants() })
    }
    if (path === '/admin/menu-items') {
      return ok({ menuItems: adminGetMenuItems() })
    }

    return fail(`Unknown route GET ${path}`, 404)
  },

  post(path, body = {}) {
    // ── Auth ─────────────────────────────────────────────────────────────────
    if (path === '/auth/login') {
      try {
        return ok(authLogin(body.email, body.password))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    if (path === '/auth/register') {
      try {
        return ok(authRegister(body.name, body.email, body.password))
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // ── Cart ─────────────────────────────────────────────────────────────────
    if (path === '/cart') {
      const uid = currentUserId()
      if (!uid) return fail('Unauthorized', 401)
      try {
        return ok(addToCart(uid, body.menu_item_id, body.quantity))
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // ── Orders ───────────────────────────────────────────────────────────────
    if (path === '/orders') {
      const uid = currentUserId()
      if (!uid) return fail('Unauthorized', 401)
      try {
        const order = placeOrder(uid, body)
        return ok({ order, message: 'Order placed successfully' })
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return fail(`Unknown route POST ${path}`, 404)
  },

  delete(path) {
    const uid = currentUserId()
    if (!uid) return fail('Unauthorized', 401)

    // DELETE /cart — clear cart
    if (path === '/cart') {
      clearCartForUser(uid)
      return ok({ message: 'Cart cleared' })
    }

    // DELETE /cart/:cartId
    const cartMatch = path.match(/^\/cart\/(\d+)$/)
    if (cartMatch) {
      removeCartItem(uid, Number(cartMatch[1]))
      return ok({ message: 'Item removed' })
    }

    return fail(`Unknown route DELETE ${path}`, 404)
  },

  patch(path, body = {}) {
    // ── Cancel order ─────────────────────────────────────────────────────────
    const cancelMatch = path.match(/^\/orders\/(\d+)\/cancel$/)
    if (cancelMatch) {
      const uid = currentUserId()
      if (!uid) return fail('Unauthorized', 401)
      try {
        cancelOrder(uid, cancelMatch[1])
        return ok({ message: 'Order cancelled' })
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // ── Admin: update order status ────────────────────────────────────────────
    const adminOrderMatch = path.match(/^\/admin\/orders\/(\d+)\/status$/)
    if (adminOrderMatch) {
      try {
        adminUpdateOrderStatus(adminOrderMatch[1], body.status)
        return ok({ message: 'Status updated' })
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // ── Admin: toggle restaurant ──────────────────────────────────────────────
    const adminRestMatch = path.match(/^\/admin\/restaurants\/(\d+)$/)
    if (adminRestMatch) {
      adminToggleRestaurant(adminRestMatch[1], body.is_open)
      return ok({ message: 'Restaurant updated' })
    }

    // ── Admin: toggle menu item ───────────────────────────────────────────────
    const adminMenuMatch = path.match(/^\/admin\/menu-items\/(\d+)$/)
    if (adminMenuMatch) {
      adminToggleMenuItem(adminMenuMatch[1], body.is_available)
      return ok({ message: 'Menu item updated' })
    }

    return fail(`Unknown route PATCH ${path}`, 404)
  },
}

export default api
