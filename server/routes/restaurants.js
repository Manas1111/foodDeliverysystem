/**
 * routes/restaurants.js
 *
 * GET /api/restaurants       — List all restaurants (with search, cuisine, and sorting)
 * GET /api/restaurants/:id   — Get single restaurant with menu
 */

const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/restaurants ──────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { search, cuisine, sort, open_only } = req.query;

  let query  = 'SELECT * FROM restaurants WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR cuisine LIKE ? OR tags LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (cuisine && cuisine !== 'All') {
    query += ' AND cuisine = ?';
    params.push(cuisine);
  }
  if (open_only === 'true') {
    query += ' AND is_open = 1';
  }

  if (sort === 'delivery_time') {
    query += ' ORDER BY delivery_time_min ASC';
  } else if (sort === 'min_order') {
    query += ' ORDER BY min_order ASC';
  } else {
    query += ' ORDER BY is_open DESC, rating DESC';
  }

  const restaurants = db.all(query, params);
  res.json({ restaurants });
});

// ── GET /api/restaurants/:id ──────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const restaurant = db.get('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const menu = db.all(
    'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name',
    [req.params.id]
  );

  res.json({ restaurant, menu });
});

module.exports = router;
