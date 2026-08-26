/**
 * routes/orders.js — Order placement, cancellation, and retrieval
 *
 * POST  /api/orders            — Place order (uses runExclusive lock)
 * GET   /api/orders            — Get user's order history
 * GET   /api/orders/:id        — Get single order with items
 * PATCH /api/orders/:id/cancel — Cancel pending order
 */

const express          = require('express');
const db               = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    delivery_address,
    notes,
    payment_method = 'upi',
    discount_amount = 0,
    delivery_fee = 0,
    tip_amount = 0,
  } = req.body;

  if (!delivery_address) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  try {
    const placeOrder = db.runExclusive((userId, address, userNotes, payMethod, discount, dFee, tip) => {
      // 1. Fetch cart
      const cartItems = db.all(`
        SELECT c.quantity, m.id AS menu_item_id, m.price,
               m.available_qty, m.name, m.restaurant_id, m.is_available
        FROM cart c
        JOIN menu_items m ON c.menu_item_id = m.id
        WHERE c.user_id = ?
      `, [userId]);

      if (cartItems.length === 0) {
        throw Object.assign(new Error('Your cart is empty'), { status: 400 });
      }

      // 2. Validate single restaurant
      const restaurantIds = [...new Set(cartItems.map(i => i.restaurant_id))];
      if (restaurantIds.length > 1) {
        throw Object.assign(new Error('Cart contains items from multiple restaurants'), { status: 400 });
      }
      const restaurantId = restaurantIds[0];

      // 3. Check restaurant is open
      const restaurant = db.get('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
      if (!restaurant || !restaurant.is_open) {
        throw Object.assign(new Error('Restaurant is currently closed'), { status: 400 });
      }

      // 4. Stock check (reading inside the exclusive section)
      for (const item of cartItems) {
        if (!item.is_available) {
          throw Object.assign(new Error(`"${item.name}" is currently unavailable`), { status: 400 });
        }
        if (item.available_qty < item.quantity) {
          throw Object.assign(
            new Error(`Insufficient stock for "${item.name}" (only ${item.available_qty} left)`),
            { status: 400 }
          );
        }
      }

      // 5. Calculate subtotal and total
      const subtotal = Math.round(
        cartItems.reduce((s, i) => s + i.price * i.quantity, 0) * 100
      ) / 100;

      const total = Math.max(0, Math.round((subtotal + Number(dFee) + Number(tip) - Number(discount)) * 100) / 100);

      // 6. Insert order
      const orderResult = db.insert(`
        INSERT INTO orders (
          user_id, restaurant_id, status, total_amount, subtotal,
          delivery_fee, discount_amount, tip_amount, payment_method,
          delivery_address, notes
        )
        VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        restaurantId,
        total,
        subtotal,
        Number(dFee) || 0,
        Number(discount) || 0,
        Number(tip) || 0,
        payMethod || 'upi',
        address,
        userNotes || null
      ]);

      const orderId = orderResult.lastInsertRowid;

      // 7. Insert order_items + decrement inventory
      for (const item of cartItems) {
        db.insert(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?,?,?,?)',
          [orderId, item.menu_item_id, item.quantity, item.price]
        );
        db.run(
          'UPDATE menu_items SET available_qty = available_qty - ? WHERE id = ?',
          [item.quantity, item.menu_item_id]
        );
      }

      // 8. Clear cart
      db.run('DELETE FROM cart WHERE user_id = ?', [userId]);

      return orderId;
    });

    const orderId = await placeOrder(
      req.user.id,
      delivery_address,
      notes,
      payment_method,
      discount_amount,
      delivery_fee,
      tip_amount
    );

    const order = db.get(`
      SELECT o.*, r.name AS restaurant_name, r.cuisine, r.image_url AS restaurant_image
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = ?
    `, [orderId]);

    const items = db.all(`
      SELECT oi.*, m.name, m.category, m.is_veg, m.image_url
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `, [orderId]);

    res.status(201).json({ order: { ...order, items } });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const orders = db.all(`
    SELECT o.*, r.name AS restaurant_name, r.cuisine, r.image_url AS restaurant_image,
           r.address AS restaurant_address
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `, [req.user.id]);

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

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const order = db.get(`
    SELECT o.*, r.name AS restaurant_name, r.cuisine, r.image_url AS restaurant_image,
           r.address AS restaurant_address
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = ? AND (o.user_id = ? OR ? = 'admin')
  `, [req.params.id, req.user.id, req.user.role]);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.all(`
    SELECT oi.*, m.name, m.category, m.is_veg, m.image_url
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `, [order.id]);

  res.json({ order: { ...order, items } });
});

// ── PATCH /api/orders/:id/cancel ──────────────────────────────────────────────
router.patch('/:id/cancel', (req, res) => {
  const order = db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending orders can be cancelled' });
  }

  // Restore inventory
  const items = db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  for (const item of items) {
    db.run('UPDATE menu_items SET available_qty = available_qty + ? WHERE id = ?', [item.quantity, item.menu_item_id]);
  }

  db.run("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?", [order.id]);

  const updated = db.get('SELECT * FROM orders WHERE id = ?', [order.id]);
  res.json({ order: updated, message: 'Order successfully cancelled' });
});

module.exports = router;
