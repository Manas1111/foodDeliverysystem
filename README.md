# FoodRush — Gourmet Food Delivery System

A full-stack food delivery web application with real-time order tracking, gourmet restaurant browsing, cart management, and an admin operations command center. Created by Manas Sharma

## ✨ Features

### 🍽️ Customer Experience
- **Browse Restaurants** with high-resolution food photography, rating, delivery times, and cuisine filters
- **Smart Cart** with inline `+` / `−` quantity steppers on each dish card
- **Promo Coupons**: `HUNGRY50`, `WELCOME100`, `FREEDEL`, `TASTY20`
- **Rich Checkout** with address presets, delivery tips, payment method selection (UPI, Card, COD)
- **Itemized Bill**: subtotal, delivery fee, coupon savings, grand total
- **Live Order Tracking**: 5-stage visual progress stepper + interactive map modal with rider info
- **Order Actions**: Cancel pending orders · 1-Click reorder past favorites

### ⚙️ Admin Center
- Real-time KPI dashboard (Revenue, Orders, Kitchen Queue, Avg Order Value)
- Live order dispatch with instant status updates and customer search
- Restaurant open/close toggle controls
- Menu catalog stock and availability management

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 + Vite + Tailwind CSS v3 + Plus Jakarta Sans |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite via `sql.js` (pure JS, no native build needed) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **HTTP Client** | Axios |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/foodDeliverysystem.git
cd foodDeliverysystem

# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### Seed the Database

```bash
npm run seed
```

### Run the App

```bash
# Run both server and client simultaneously
npm run dev
```

Open your browser at:  
**→ [http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `demo123` |
| **Admin** | `admin@demo.com` | `admin123` |

> Click the auto-fill buttons on the Login page to sign in instantly.

---

## 🗂️ Project Structure

```
foodDeliverysystem/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios client with JWT interceptor
│   │   ├── components/     # Navbar, RestaurantCard, MenuItemCard, OrderCard, etc.
│   │   ├── context/        # AuthContext, CartContext (with coupon + tip logic)
│   │   └── pages/          # Home, Restaurant, Cart, Orders, AdminDashboard, Login, Register
│   ├── index.html
│   └── vite.config.js
├── server/                 # Express API server
│   ├── db/
│   │   ├── schema.sql      # Full SQLite schema with rich columns
│   │   └── seed.js         # Gourmet demo data seeder
│   ├── middleware/         # JWT auth + error handler
│   ├── routes/             # auth, restaurants, cart, orders, admin
│   ├── db.js               # sql.js wrapper with exclusive/immediate locking
│   └── app.js              # Express entry point
└── package.json            # Root scripts (dev, seed, build)
```

## 🎯 Available Promo Codes

| Code | Offer |
| :--- | :--- |
| `HUNGRY50` | 50% OFF up to ₹100 on orders above ₹200 |
| `WELCOME100` | Flat ₹100 OFF on orders above ₹300 |
| `FREEDEL` | Free Delivery on any order |
| `TASTY20` | 20% OFF up to ₹150 on orders above ₹150 |
