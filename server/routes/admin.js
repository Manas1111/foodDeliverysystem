/**
 * routes/admin.js — Admin-only management endpoints
 *
 * GET    /api/admin/stats                — Dashboard stats & metrics
 * GET    /api/admin/orders               — All orders (with search/filter)
 * PATCH  /api/admin/orders/:id/status    — Update order status
 * GET    /api/admin/restaurants          — All restaurants
 * PATCH  /api/admin/restaurants/:id      — Update restaurant info/open status
 * GET    /api/admin/menu-items           — All menu items
 * PATCH  /api/admin/menu-items/:id       — Update menu item stock/availability/price
 * POST   /api/admin/menu-items           — Create menu item
 */

const express                         = require('express');
const db                              = require('../db');
const { authenticate, requireAdmin }  = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

const VALID_STATUSES = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const totalOrders      = db.get("SELECT COUNT(*) AS count FROM orders").count;
  const pendingOrders    = db.get("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'").count;
  const preparingOrders  = db.get("SELECT COUNT(*) AS count FROM orders WHERE status = 'preparing'").count;
  const deliveredOrders  = db.get("SELECT COUNT(*) AS count FROM orders WHERE status = 'delivered'").count;
  const cancelledOrders  = db.get("SELECT COUNT(*) AS count FROM orders WHERE status = 'cancelled'").count;
  
  const revenueRow       = db.get("SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status != 'cancelled'");
  const totalRevenue     = revenueRow ? revenueRow.total : 0;
  
  const totalUsers       = db.get("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'").count;
  const totalRestaurants = db.get("SELECT COUNT(*) AS count FROM restaurants").count;
  const totalMenuItems   = db.get("SELECT COUNT(*) AS count FROM menu_items").count;

  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / (totalOrders - cancelledOrders || 1)) * 100) / 100 : 0;

  res.json({
    stats: {
      totalOrders,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: Math.round(Number(totalRevenue) * 100) / 100,
      avgOrderValue,
      totalUsers,
      totalRestaurants,
      totalMenuItems,
    },
  });
});

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', (req, res) => {
  const { status, search } = req.query;
  let query = `
    SELECT o.*, u.name AS customer_name, u.email AS customer_email,
           r.name AS restaurant_name, r.image_url AS restaurant_image
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (u.name LIKE ? OR u.email LIKE ? OR r.name LIKE ? OR CAST(o.id AS TEXT) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY o.created_at DESC';

  const orders = db.all(query, params);

  const ordersWithItems = orders.map(order => {
    const items = db.all(`
      SELECT oi.*, m.name, m.category, m.is_veg, m.image_url
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `, [order.id]);
    return { ...order, items };
  });

  res.json({ orders: ordersWithItems });
});

// ── PATCH /api/admin/orders/:id/status ───────────────────────────────────────
router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const updateStatus = db.runImmediate((orderId, newStatus) => {
      const order = db.get('SELECT id, status FROM orders WHERE id = ?', [orderId]);
      if (!order) {
        throw Object.assign(new Error('Order not found'), { status: 404 });
      }
      db.run(
        "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?",
        [newStatus, orderId]
      );
      return db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    });

    const updated = await updateStatus(req.params.id, status);
    res.json({ order: updated });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── GET /api/admin/restaurants ────────────────────────────────────────────────
router.get('/restaurants', (req, res) => {
  const restaurants = db.all('SELECT * FROM restaurants ORDER BY name');
  res.json({ restaurants });
});

// ── PATCH /api/admin/restaurants/:id ─────────────────────────────────────────
router.patch('/restaurants/:id', (req, res) => {
  const { is_open, name, cuisine, description, address, min_order } = req.body;
  const r = db.get('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Restaurant not found' });

  const updName    = name        ?? r.name;
  const updCuisine = cuisine     ?? r.cuisine;
  const updDesc    = description ?? r.description;
  const updAddress = address     ?? r.address;
  const updMinOrd  = min_order   !== undefined ? Number(min_order) : r.min_order;
  const updOpen    = is_open     !== undefined ? (is_open ? 1 : 0) : r.is_open;

  db.run(
    'UPDATE restaurants SET name=?, cuisine=?, description=?, address=?, min_order=?, is_open=? WHERE id=?',
    [updName, updCuisine, updDesc, updAddress, updMinOrd, updOpen, req.params.id]
  );

  res.json({ restaurant: db.get('SELECT * FROM restaurants WHERE id = ?', [req.params.id]) });
});

// ── GET /api/admin/menu-items ─────────────────────────────────────────────────
router.get('/menu-items', (req, res) => {
  const { restaurant_id } = req.query;
  let query = `
    SELECT m.*, r.name AS restaurant_name
    FROM menu_items m
    JOIN restaurants r ON m.restaurant_id = r.id
  `;
  const params = [];
  if (restaurant_id) {
    query += ' WHERE m.restaurant_id = ?';
    params.push(restaurant_id);
  }
  query += ' ORDER BY r.name, m.category, m.name';

  const menuItems = db.all(query, params);
  res.json({ menuItems });
});

// ── PATCH /api/admin/menu-items/:id ───────────────────────────────────────────
router.patch('/menu-items/:id', (req, res) => {
  const item = db.get('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  const { is_available, available_qty, price, name, description } = req.body;

  const updAvail = is_available !== undefined ? (is_available ? 1 : 0) : item.is_available;
  const updQty   = available_qty !== undefined ? Number(available_qty) : item.available_qty;
  const updPrice = price !== undefined ? Number(price) : item.price;
  const updName  = name ?? item.name;
  const updDesc  = description ?? item.description;

  db.run(
    'UPDATE menu_items SET is_available=?, available_qty=?, price=?, name=?, description=? WHERE id=?',
    [updAvail, updQty, updPrice, updName, updDesc, req.params.id]
  );

  res.json({ menuItem: db.get('SELECT * FROM menu_items WHERE id = ?', [req.params.id]) });
});

// ── POST /api/admin/menu-items ────────────────────────────────────────────────
router.post('/menu-items', (req, res) => {
  const { restaurant_id, name, description, price, category, available_qty = 50, is_veg = 1, image_url } = req.body;
  if (!restaurant_id || !name || !price || !category) {
    return res.status(400).json({ error: 'restaurant_id, name, price, and category are required' });
  }

  const result = db.insert(`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, available_qty, is_available, is_veg, image_url)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  `, [restaurant_id, name, description || null, Number(price), category, Number(available_qty), is_veg ? 1 : 0, image_url || null]);

  const newItem = db.get('SELECT * FROM menu_items WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json({ menuItem: newItem });
});

module.exports = router;
