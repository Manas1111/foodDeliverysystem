/**
 * routes/cart.js — Server-side cart management
 *
 * GET    /api/cart            — Get current user's cart
 * POST   /api/cart            — Add/update item in cart
 * DELETE /api/cart/:cartId    — Remove item from cart
 * DELETE /api/cart            — Clear entire cart
 */

const express          = require('express');
const db               = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ── GET /api/cart ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const cartItems = db.all(`
    SELECT
      c.id           AS cart_id,
      c.quantity,
      m.id           AS menu_item_id,
      m.name,
      m.description,
      m.price,
      m.category,
      m.available_qty,
      m.is_available,
      m.is_veg,
      m.image_url,
      r.id           AS restaurant_id,
      r.name         AS restaurant_name,
      r.image_url    AS restaurant_image
    FROM cart c
    JOIN menu_items m ON c.menu_item_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE c.user_id = ?
    ORDER BY c.id
  `, [req.user.id]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ cart: cartItems, total: Math.round(total * 100) / 100 });
});

// ── POST /api/cart ────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { menu_item_id, quantity = 1 } = req.body;

  if (!menu_item_id) {
    return res.status(400).json({ error: 'menu_item_id is required' });
  }

  const item = db.get('SELECT * FROM menu_items WHERE id = ? AND is_available = 1', [menu_item_id]);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found or unavailable' });
  }

  // Check if cart already has items from a different restaurant
  const existingCartOtherRest = db.get(`
    SELECT r.id, r.name FROM cart c
    JOIN menu_items m ON c.menu_item_id = m.id
    JOIN restaurants r ON m.restaurant_id = r.id
    WHERE c.user_id = ? AND r.id != ?
    LIMIT 1
  `, [req.user.id, item.restaurant_id]);

  if (existingCartOtherRest) {
    return res.status(409).json({
      error: `Your cart contains items from "${existingCartOtherRest.name}". Clear your cart to add items from a different restaurant.`,
      differentRestaurant: true,
    });
  }

  if (quantity <= 0) {
    db.run('DELETE FROM cart WHERE user_id = ? AND menu_item_id = ?', [req.user.id, menu_item_id]);
    return res.json({ message: 'Item removed from cart' });
  }

  // Check existing cart entry
  const existing = db.get(
    'SELECT id FROM cart WHERE user_id = ? AND menu_item_id = ?',
    [req.user.id, menu_item_id]
  );

  if (existing) {
    db.run('UPDATE cart SET quantity = ? WHERE user_id = ? AND menu_item_id = ?',
      [quantity, req.user.id, menu_item_id]);
  } else {
    db.insert('INSERT INTO cart (user_id, menu_item_id, quantity) VALUES (?, ?, ?)',
      [req.user.id, menu_item_id, quantity]);
  }

  res.json({ message: 'Cart updated' });
});

// ── DELETE /api/cart/:cartId ──────────────────────────────────────────────────
router.delete('/:cartId', (req, res) => {
  db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.cartId, req.user.id]);
  res.json({ message: 'Item removed from cart' });
});

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
router.delete('/', (req, res) => {
  db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
