/**
 * app.js — Express application entry point
 * Database initialisation is async (sql.js), so we start the server after DB is ready.
 */

const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { initDB }   = require('./db');

const authRoutes       = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const cartRoutes       = require('./routes/cart');
const orderRoutes      = require('./routes/orders');
const adminRoutes      = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Allow requests from any local network origin (WiFi, mobile devices, localhost)
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/admin',       adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Food Delivery API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────────
async function start() {
  await initDB();  // initialise sql.js DB first
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Food Delivery API → http://localhost:${PORT}`);
    console.log(`   Health check   → http://localhost:${PORT}/api/health`);
    console.log(`\n   Demo logins:`);
    console.log(`     Customer: customer@demo.com / demo123`);
    console.log(`     Admin:    admin@demo.com    / admin123\n`);
  });
}

start().catch(err => { console.error(err); process.exit(1); });

module.exports = app;
