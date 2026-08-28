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

// ── Root Welcome Page ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Food Delivery API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      background: #1a1a2e;
      border: 1px solid #2d2d4e;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 620px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-block;
      background: #22c55e22;
      color: #22c55e;
      border: 1px solid #22c55e55;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.4rem; }
    h1 span { color: #f97316; }
    p.sub { color: #94a3b8; margin-bottom: 2rem; font-size: 0.95rem; }
    h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 0.8rem; }
    .routes { list-style: none; margin-bottom: 2rem; }
    .routes li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #0f0f1a;
      border-radius: 8px;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }
    .method {
      font-weight: 700;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #3b82f622;
      color: #60a5fa;
      border: 1px solid #3b82f644;
      min-width: 48px;
      text-align: center;
    }
    .path { color: #a5b4fc; font-family: monospace; }
    .desc { color: #64748b; margin-left: auto; font-size: 0.82rem; }
    .links { display: flex; gap: 10px; flex-wrap: wrap; }
    a.btn {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    a.btn:hover { opacity: 0.85; }
    .btn-primary { background: #f97316; color: #fff; }
    .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #2d3748; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">● API RUNNING</div>
    <h1>🍕 Food<span>Kart</span> API</h1>
    <p class="sub">Express + SQLite backend for the Food Delivery System</p>

    <h2>Available Endpoints</h2>
    <ul class="routes">
      <li><span class="method">GET</span><span class="path">/api/health</span><span class="desc">Health check</span></li>
      <li><span class="method">POST</span><span class="path">/api/auth/login</span><span class="desc">User login</span></li>
      <li><span class="method">POST</span><span class="path">/api/auth/register</span><span class="desc">User register</span></li>
      <li><span class="method">GET</span><span class="path">/api/restaurants</span><span class="desc">List restaurants</span></li>
      <li><span class="method">GET</span><span class="path">/api/cart</span><span class="desc">View cart</span></li>
      <li><span class="method">GET</span><span class="path">/api/orders</span><span class="desc">Order history</span></li>
      <li><span class="method">GET</span><span class="path">/api/admin</span><span class="desc">Admin panel</span></li>
    </ul>

    <div class="links">
      <a href="http://localhost:5173" class="btn btn-primary">🌐 Open Frontend App</a>
      <a href="/api/health" class="btn btn-secondary">🩺 Health Check</a>
    </div>
  </div>
</body>
</html>`);
});

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
