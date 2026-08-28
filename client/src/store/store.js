/**
 * store.js — Frontend-only localStorage data store
 * Replaces the Express + SQLite backend entirely.
 * All data is seeded on first load and persisted in localStorage.
 */

// ── Keys ──────────────────────────────────────────────────────────────────────
const K = {
  USERS:       'fd_users',
  RESTAURANTS: 'fd_restaurants',
  MENU_ITEMS:  'fd_menu_items',
  CARTS:       'fd_carts',      // { [userId]: CartItem[] }
  ORDERS:      'fd_orders',     // Order[]
  SEEDED:      'fd_seeded',
}

// ── Seed Data (from server/db/seed.js) ────────────────────────────────────────
const SEED_RESTAURANTS = [
  { id: 1, name: 'Spice Symphony & Grill',    cuisine: 'Indian',   description: 'Royal North Indian delicacies, aromatic biryanis & clay-oven tandoori grills',            address: '12 Indiranagar 100ft Road, Bengaluru',        rating: 4.8, rating_count: 450, delivery_time_min: 25, min_order: 100, is_open: true,  image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', banner_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', tags: 'Biryani, Curry, Mughlai, Tandoor' },
  { id: 2, name: 'Bella Napoli Trattoria',    cuisine: 'Italian',  description: 'Artisanal wood-fired pizzas, hand-rolled fresh pastas & decadent tiramisu',                address: '34 Lavelle Road, Bengaluru',                  rating: 4.7, rating_count: 380, delivery_time_min: 20, min_order: 150, is_open: true,  image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', tags: 'Woodfired Pizza, Pasta, Gourmet Desserts' },
  { id: 3, name: 'Golden Dragon Wok House',   cuisine: 'Chinese',  description: 'Sizzling wok stir-fries, handcrafted dim sums & authentic Sichuan street food',            address: '56 Koramangala 5th Block, Bengaluru',         rating: 4.6, rating_count: 290, delivery_time_min: 30, min_order: 120, is_open: true,  image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', banner_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', tags: 'Dim Sum, Wok Tossed, Noodles, Sichuan' },
  { id: 4, name: 'The Rustic Burger Bar',     cuisine: 'American', description: 'Gourmet smash burgers, crispy loaded waffle fries & thick handcrafted shakes',              address: '78 Church Street, Bengaluru',                 rating: 4.5, rating_count: 510, delivery_time_min: 20, min_order: 80,  is_open: true,  image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', banner_url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80', tags: 'Smash Burgers, Loaded Fries, Shakes, Wings' },
  { id: 5, name: 'Tokyo Ramen & Sushi Bar',   cuisine: 'Japanese', description: 'Slow-simmered rich ramen broths, premium sashimi & crispy tempura platters',               address: '89 MG Road, Bengaluru',                      rating: 4.9, rating_count: 620, delivery_time_min: 25, min_order: 200, is_open: true,  image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', banner_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80', tags: 'Ramen, Sushi, Gyoza, Japanese Bento' },
  { id: 6, name: 'Taqueria Mexico Lindo',     cuisine: 'Mexican',  description: 'Authentic street tacos, cheesy quesadillas, freshly made guacamole & churros',             address: '102 Kalyan Nagar, Bengaluru',                 rating: 4.6, rating_count: 240, delivery_time_min: 25, min_order: 120, is_open: true,  image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', banner_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', tags: 'Tacos, Burritos, Quesadilla, Salsa' },
]

const SEED_MENU_ITEMS = [
  // Spice Symphony & Grill (id:1)
  { id:1,  restaurant_id:1, name:'Royal Butter Chicken',                   description:'Charcoal-grilled boneless chicken in a velvety rich tomato, cream and cashew nut gravy',          price:340, category:'Main Course', available_qty:50, is_available:true, is_veg:false, calories:580, rating:4.9, image_url:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80' },
  { id:2,  restaurant_id:1, name:'Paneer Tikka Angara',                    description:'Fresh cottage cheese cubes marinated in fiery tandoori spices and smoked over embers',           price:280, category:'Starter',    available_qty:40, is_available:true, is_veg:true,  calories:380, rating:4.8, image_url:'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' },
  { id:3,  restaurant_id:1, name:'Slow-Cooked Dal Makhani',                description:'Overnight simmered black lentils laced with cultured butter and organic cream',                  price:240, category:'Main Course', available_qty:60, is_available:true, is_veg:true,  calories:420, rating:4.7, image_url:'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { id:4,  restaurant_id:1, name:'Dum Pukht Chicken Biryani',              description:'Fragrant aged basmati rice layered with saffron-infused succulent chicken cuts',                 price:360, category:'Main Course', available_qty:45, is_available:true, is_veg:false, calories:650, rating:4.9, image_url:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { id:5,  restaurant_id:1, name:'Butter Garlic Naan',                     description:'Soft clay-oven baked leavened bread brushed with garlic herb butter',                             price:70,  category:'Breads',     available_qty:80, is_available:true, is_veg:true,  calories:210, rating:4.6, image_url:'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { id:6,  restaurant_id:1, name:'Kesari Mango Lassi',                     description:'Chilled thick yogurt smoothie infused with premium Alphonso mango pulp and cardamom',           price:110, category:'Beverages',   available_qty:70, is_available:true, is_veg:true,  calories:190, rating:4.8, image_url:'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80' },
  // Bella Napoli Trattoria (id:2)
  { id:7,  restaurant_id:2, name:'Margherita di Bufala Pizza',             description:'San Marzano tomato base, fresh buffalo mozzarella, aromatic basil & extra virgin olive oil',   price:380, category:'Pizza',       available_qty:50, is_available:true, is_veg:true,  calories:620, rating:4.8, image_url:'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80' },
  { id:8,  restaurant_id:2, name:'Spicy Pepperoni & Jalapeno',             description:'Double layer pepperoni slices, melted mozzarella, picked jalapeños and hot honey drizzle',      price:460, category:'Pizza',       available_qty:40, is_available:true, is_veg:false, calories:740, rating:4.9, image_url:'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80' },
  { id:9,  restaurant_id:2, name:'Truffle Mushroom Fettuccine',            description:'Handmade egg fettuccine ribbons in creamy wild mushroom sauce with black truffle essence',       price:390, category:'Pasta',       available_qty:35, is_available:true, is_veg:true,  calories:580, rating:4.9, image_url:'https://images.unsplash.com/photo-1621996346565-e3d5d6281541?auto=format&fit=crop&w=600&q=80' },
  { id:10, restaurant_id:2, name:'Cheesy Stuffed Garlic Bread',            description:'Crispy baguette filled with roasted garlic butter, parsley and gooey mozzarella',               price:160, category:'Sides',       available_qty:60, is_available:true, is_veg:true,  calories:340, rating:4.6, image_url:'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80' },
  { id:11, restaurant_id:2, name:'Classic Venetian Tiramisu',              description:'Espresso-soaked ladyfingers layered with whipped mascarpone cream and Belgian cocoa dusting',  price:220, category:'Dessert',     available_qty:30, is_available:true, is_veg:true,  calories:320, rating:5.0, image_url:'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80' },
  // Golden Dragon Wok House (id:3)
  { id:12, restaurant_id:3, name:'Steamed Crystal Dim Sums (6pc)',         description:'Translucent dumplings packed with water chestnuts, shitake mushrooms & spring vegetables',      price:240, category:'Starter',    available_qty:50, is_available:true, is_veg:true,  calories:220, rating:4.7, image_url:'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80' },
  { id:13, restaurant_id:3, name:'Schezwan Fiery Chicken Wok',             description:'Tender chicken strips wok-tossed with roasted Sichuan peppers, scallions and red chillies',     price:320, category:'Main Course', available_qty:45, is_available:true, is_veg:false, calories:480, rating:4.8, image_url:'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80' },
  { id:14, restaurant_id:3, name:'Egg & Scallion Fried Rice',              description:'Wok-charred Jasmine rice tossed with fluffy scrambled eggs, garlic butter and spring greens',   price:260, category:'Rice',        available_qty:55, is_available:true, is_veg:false, calories:410, rating:4.6, image_url:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80' },
  { id:15, restaurant_id:3, name:'Crispy Veg Spring Rolls',                description:'Golden fried pastry rolls stuffed with crunchy glass noodles and vegetables with sweet chili dip',price:190, category:'Starter',    available_qty:60, is_available:true, is_veg:true,  calories:290, rating:4.5, image_url:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
  { id:16, restaurant_id:3, name:'Hong Kong Hakka Noodles',                description:'Classic wok noodles tossed with julienne capsicum, cabbage and umami dark soy sauce',            price:240, category:'Noodles',    available_qty:50, is_available:true, is_veg:true,  calories:380, rating:4.6, image_url:'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80' },
  // The Rustic Burger Bar (id:4)
  { id:17, restaurant_id:4, name:'Signature Double Smash Cheeseburger',    description:'Two 100% prime patties, double melted cheddar, caramelized onions and secret house sauce',     price:350, category:'Burgers',    available_qty:50, is_available:true, is_veg:false, calories:780, rating:4.9, image_url:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { id:18, restaurant_id:4, name:'Crispy Buttermilk Chicken Burger',       description:'Crisp herb-crusted chicken fillet with honey mustard slaw, dill pickles and spicy mayo',         price:320, category:'Burgers',    available_qty:45, is_available:true, is_veg:false, calories:690, rating:4.8, image_url:'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80' },
  { id:19, restaurant_id:4, name:'Truffle Parmesan Loaded Fries',          description:'Crispy skin-on fries tossed with white truffle oil, shaved parmesan and rosemary herbs',         price:190, category:'Sides',       available_qty:70, is_available:true, is_veg:true,  calories:410, rating:4.7, image_url:'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80' },
  { id:20, restaurant_id:4, name:'Smoky BBQ Wings (6pc)',                  description:'Crispy chicken wings glazed with tangy hickory barbecue sauce served with ranch dip',            price:260, category:'Sides',       available_qty:40, is_available:true, is_veg:false, calories:490, rating:4.8, image_url:'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80' },
  { id:21, restaurant_id:4, name:'Belgian Dark Chocolate Shake',           description:'Decadent hand-spun shake made with pure Belgian chocolate ganache and artisanal vanilla ice cream',price:180,category:'Beverages',  available_qty:50, is_available:true, is_veg:true,  calories:380, rating:4.9, image_url:'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80' },
  // Tokyo Ramen & Sushi Bar (id:5)
  { id:22, restaurant_id:5, name:'Tonkotsu Ramen Bowl',                    description:'Rich 12-hour broth with springy noodles, chashu slices, nitamago egg, menma & nori',             price:420, category:'Ramen',       available_qty:40, is_available:true, is_veg:false, calories:680, rating:5.0, image_url:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80' },
  { id:23, restaurant_id:5, name:'Salmon Avocado Roll (8pc)',              description:'Fresh Atlantic salmon, creamy avocado and cucumber wrapped in seasoned sushi rice',               price:480, category:'Sushi',       available_qty:35, is_available:true, is_veg:false, calories:360, rating:4.9, image_url:'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
  { id:24, restaurant_id:5, name:'Pan-Seared Gyoza (6pc)',                 description:'Crispy-bottomed Japanese dumplings filled with spiced chicken and scallions with ponzu dip',      price:240, category:'Starter',    available_qty:50, is_available:true, is_veg:false, calories:280, rating:4.7, image_url:'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80' },
  { id:25, restaurant_id:5, name:'Matcha Green Tea Ice Cream',             description:'Authentic stone-ground Uji matcha green tea ice cream topped with red bean paste',               price:160, category:'Dessert',     available_qty:30, is_available:true, is_veg:true,  calories:190, rating:4.8, image_url:'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80' },
  // Taqueria Mexico Lindo (id:6)
  { id:26, restaurant_id:6, name:'Carne Asada Street Tacos (3pc)',         description:'Grilled citrus-marinated steak on double warm corn tortillas with diced onion, cilantro and salsa verde',price:320,category:'Tacos',available_qty:40, is_available:true, is_veg:false, calories:460, rating:4.8, image_url:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80' },
  { id:27, restaurant_id:6, name:'Cheesy Chipotle Quesadilla',             description:'Crispy folded flour tortilla stuffed with melted Monterey Jack, grilled corn, peppers and sour cream',price:260,category:'Quesadillas',available_qty:45,is_available:true,is_veg:true,calories:490,rating:4.7, image_url:'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80' },
  { id:28, restaurant_id:6, name:'Fresh Guacamole & Tortilla Chips',       description:'Hand-mashed ripe Hass avocados with lime juice, sea salt, tomatoes, cilantro and fresh crispy chips', price:210,category:'Sides',available_qty:50,is_available:true,is_veg:true,calories:340,rating:4.9, image_url:'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80' },
  { id:29, restaurant_id:6, name:'Cinnamon Sugar Churros with Dulce de Leche',description:'Warm golden Mexican pastry sticks dusted in cinnamon sugar served with rich caramel dipping sauce',price:190,category:'Dessert',available_qty:35,is_available:true,is_veg:true,calories:310,rating:4.9, image_url:'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80' },
]

// Simple hash (not real bcrypt — just for demo)
function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return String(Math.abs(h))
}

function checkPassword(plain, hash) {
  return simpleHash(plain) === hash
}

// ── Init / Seeding ─────────────────────────────────────────────────────────────
export function initStore() {
  if (localStorage.getItem(K.SEEDED)) return

  // Seed restaurants (deep copy so mutations don't affect seed data)
  localStorage.setItem(K.RESTAURANTS, JSON.stringify(JSON.parse(JSON.stringify(SEED_RESTAURANTS))))
  localStorage.setItem(K.MENU_ITEMS,  JSON.stringify(JSON.parse(JSON.stringify(SEED_MENU_ITEMS))))

  // Seed hardcoded demo users
  const users = [
    { id: 1, name: 'Manas Sharma',  email: 'customer@demo.com', password_hash: simpleHash('demo123'),  role: 'customer', created_at: new Date().toISOString() },
    { id: 2, name: 'Admin Officer', email: 'admin@demo.com',    password_hash: simpleHash('admin123'), role: 'admin',    created_at: new Date().toISOString() },
  ]
  localStorage.setItem(K.USERS, JSON.stringify(users))

  // Seed sample orders for demo customer
  const sampleOrders = [
    {
      id: 1,
      user_id: 1,
      restaurant_id: 1,
      restaurant_name: 'Spice Symphony & Grill',
      restaurant_image: SEED_RESTAURANTS[0].image_url,
      status: 'delivered',
      total_amount: 620,
      subtotal: 680,
      delivery_fee: 0,
      discount_amount: 100,
      tip_amount: 40,
      payment_method: 'upi',
      delivery_address: '12 Indiranagar 100ft Road, Flat 402, Bengaluru',
      notes: 'Please leave at reception',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      items: [
        { menu_item_id: 1, name: 'Royal Butter Chicken', quantity: 1, unit_price: 340, is_veg: false },
        { menu_item_id: 2, name: 'Paneer Tikka Angara',  quantity: 1, unit_price: 280, is_veg: true  },
      ],
    },
    {
      id: 2,
      user_id: 1,
      restaurant_id: 2,
      restaurant_name: 'Bella Napoli Trattoria',
      restaurant_image: SEED_RESTAURANTS[1].image_url,
      status: 'preparing',
      total_amount: 460,
      subtotal: 460,
      delivery_fee: 0,
      discount_amount: 0,
      tip_amount: 0,
      payment_method: 'card',
      delivery_address: '12 Indiranagar 100ft Road, Flat 402, Bengaluru',
      notes: 'Extra chilli flakes please',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      items: [
        { menu_item_id: 8, name: 'Spicy Pepperoni & Jalapeno', quantity: 1, unit_price: 460, is_veg: false },
      ],
    },
  ]
  localStorage.setItem(K.ORDERS, JSON.stringify(sampleOrders))
  localStorage.setItem(K.CARTS, JSON.stringify({}))
  localStorage.setItem(K.SEEDED, '1')
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function readJSON(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) }
  catch { return fallback }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function authLogin(email, password) {
  const users = readJSON(K.USERS, [])
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user || !checkPassword(password, user.password_hash)) {
    const err = new Error('Invalid email or password')
    err.response = { data: { error: 'Invalid email or password' } }
    throw err
  }
  const { password_hash: _, ...safeUser } = user
  const token = btoa(JSON.stringify({ id: user.id, role: user.role, ts: Date.now() }))
  return { token, user: safeUser }
}

export function authRegister(name, email, password) {
  const users = readJSON(K.USERS, [])
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    const err = new Error('Email already registered')
    err.response = { data: { error: 'Email already registered' } }
    throw err
  }
  const newUser = {
    id: nextId(users),
    name,
    email,
    password_hash: simpleHash(password),
    role: 'customer',
    created_at: new Date().toISOString(),
  }
  users.push(newUser)
  writeJSON(K.USERS, users)
  const { password_hash: _, ...safeUser } = newUser
  const token = btoa(JSON.stringify({ id: newUser.id, role: newUser.role, ts: Date.now() }))
  return { token, user: safeUser }
}

// ── Restaurants ───────────────────────────────────────────────────────────────
export function getRestaurants({ search = '', cuisine = '', sort = 'rating', open_only = false } = {}) {
  let list = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)

  if (search) {
    const q = search.toLowerCase()
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      (r.tags || '').toLowerCase().includes(q)
    )
  }

  if (cuisine) {
    list = list.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase())
  }

  if (open_only) {
    list = list.filter(r => r.is_open)
  }

  if (sort === 'rating')        list = [...list].sort((a, b) => b.rating - a.rating)
  if (sort === 'delivery_time') list = [...list].sort((a, b) => a.delivery_time_min - b.delivery_time_min)
  if (sort === 'min_order')     list = [...list].sort((a, b) => a.min_order - b.min_order)

  return list
}

export function getRestaurantById(id) {
  const restaurants = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)
  const restaurant  = restaurants.find(r => r.id === Number(id))
  if (!restaurant) return null
  const menu = readJSON(K.MENU_ITEMS, SEED_MENU_ITEMS).filter(m => m.restaurant_id === Number(id))
  return { restaurant, menu }
}

// ── Cart ──────────────────────────────────────────────────────────────────────
function getUserCart(userId) {
  const all = readJSON(K.CARTS, {})
  return all[userId] || []
}

function saveUserCart(userId, cart) {
  const all = readJSON(K.CARTS, {})
  all[userId] = cart
  writeJSON(K.CARTS, all)
}

export function getCart(userId) {
  const cart      = getUserCart(userId)
  const menuItems = readJSON(K.MENU_ITEMS, SEED_MENU_ITEMS)
  const restaurants = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)

  const enriched = cart.map(ci => {
    const menuItem  = menuItems.find(m => m.id === ci.menu_item_id)
    const restaurant = menuItem ? restaurants.find(r => r.id === menuItem.restaurant_id) : null
    return {
      cart_id:          ci.cart_id,
      menu_item_id:     ci.menu_item_id,
      quantity:         ci.quantity,
      name:             menuItem?.name || 'Unknown',
      price:            menuItem?.price || 0,
      is_veg:           menuItem?.is_veg || false,
      image_url:        menuItem?.image_url || '',
      restaurant_name:  restaurant?.name || '',
      restaurant_image: restaurant?.image_url || '',
    }
  })

  const total = enriched.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return { cart: enriched, total }
}

export function addToCart(userId, menuItemId, quantity = 1) {
  const menuItems = readJSON(K.MENU_ITEMS, SEED_MENU_ITEMS)
  const menuItem  = menuItems.find(m => m.id === menuItemId)
  if (!menuItem) throw new Error('Menu item not found')

  const restaurants = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)
  const restaurant  = restaurants.find(r => r.id === menuItem.restaurant_id)

  let cart = getUserCart(userId)

  // Check if cart has items from a different restaurant
  if (cart.length > 0) {
    const currentMenuItemId = cart[0].menu_item_id
    const currentMenuItem   = menuItems.find(m => m.id === currentMenuItemId)
    if (currentMenuItem && currentMenuItem.restaurant_id !== menuItem.restaurant_id) {
      const err = new Error('Different restaurant')
      err.response = { status: 409, data: { differentRestaurant: true, error: 'Cart has items from another restaurant' } }
      throw err
    }
  }

  const existing = cart.find(i => i.menu_item_id === menuItemId)
  if (existing) {
    existing.quantity = quantity
  } else {
    cart.push({ cart_id: nextId(cart.map((_, i) => ({ id: i + 1 }))), menu_item_id: menuItemId, quantity })
  }

  saveUserCart(userId, cart)
  return getCart(userId)
}

export function removeCartItem(userId, cartId) {
  let cart = getUserCart(userId)
  cart = cart.filter(i => i.cart_id !== Number(cartId))
  saveUserCart(userId, cart)
}

export function clearCartForUser(userId) {
  saveUserCart(userId, [])
}

// ── Orders ────────────────────────────────────────────────────────────────────
export function getUserOrders(userId) {
  const orders = readJSON(K.ORDERS, [])
  return orders
    .filter(o => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function placeOrder(userId, { delivery_address, notes, payment_method, discount_amount, delivery_fee, tip_amount }) {
  const { cart, total } = getCart(userId)
  if (cart.length === 0) throw new Error('Cart is empty')

  const menuItems   = readJSON(K.MENU_ITEMS, SEED_MENU_ITEMS)
  const restaurants = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)
  const firstItem   = menuItems.find(m => m.id === cart[0].menu_item_id)
  const restaurant  = restaurants.find(r => r.id === firstItem?.restaurant_id)

  const grandTotal = Math.max(0, total + (delivery_fee || 0) + (tip_amount || 0) - (discount_amount || 0))

  const orders = readJSON(K.ORDERS, [])
  const newOrder = {
    id: nextId(orders),
    user_id: userId,
    restaurant_id: restaurant?.id,
    restaurant_name: restaurant?.name || 'Restaurant',
    restaurant_image: restaurant?.image_url || '',
    status: 'pending',
    total_amount: Math.round(grandTotal * 100) / 100,
    subtotal: total,
    delivery_fee: delivery_fee || 0,
    discount_amount: discount_amount || 0,
    tip_amount: tip_amount || 0,
    payment_method: payment_method || 'upi',
    delivery_address,
    notes: notes || '',
    created_at: new Date().toISOString(),
    items: cart.map(ci => ({
      menu_item_id: ci.menu_item_id,
      name: ci.name,
      quantity: ci.quantity,
      unit_price: ci.price,
      is_veg: ci.is_veg,
    })),
  }

  orders.push(newOrder)
  writeJSON(K.ORDERS, orders)
  clearCartForUser(userId)

  // Simulate order status progression (pending → confirmed → preparing)
  simulateOrderProgression(newOrder.id)

  return newOrder
}

function simulateOrderProgression(orderId) {
  const steps = ['confirmed', 'preparing', 'out_for_delivery', 'delivered']
  const delays = [4000, 12000, 25000, 45000] // ms
  steps.forEach((status, i) => {
    setTimeout(() => {
      try {
        const orders = readJSON(K.ORDERS, [])
        const order  = orders.find(o => o.id === orderId)
        if (order && order.status !== 'cancelled') {
          order.status = status
          writeJSON(K.ORDERS, orders)
        }
      } catch { /* ignore */ }
    }, delays[i])
  })
}

export function cancelOrder(userId, orderId) {
  const orders = readJSON(K.ORDERS, [])
  const order  = orders.find(o => o.id === Number(orderId) && o.user_id === userId)
  if (!order) throw new Error('Order not found')
  if (!['pending', 'confirmed'].includes(order.status)) {
    const err = new Error('Order cannot be cancelled at this stage')
    err.response = { data: { error: 'Order cannot be cancelled at this stage' } }
    throw err
  }
  order.status = 'cancelled'
  writeJSON(K.ORDERS, orders)
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export function adminGetStats() {
  const orders    = readJSON(K.ORDERS, [])
  const delivered = orders.filter(o => o.status === 'delivered')
  const revenue   = delivered.reduce((sum, o) => sum + o.total_amount, 0)
  return {
    totalOrders:     orders.length,
    totalRevenue:    Math.round(revenue),
    pendingOrders:   orders.filter(o => o.status === 'pending').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    deliveredOrders: delivered.length,
    avgOrderValue:   orders.length ? Math.round(revenue / Math.max(delivered.length, 1)) : 0,
  }
}

export function adminGetOrders({ status = '', search = '' } = {}) {
  const orders = readJSON(K.ORDERS, [])
  const users  = readJSON(K.USERS, [])
  let list = orders
    .map(o => {
      const user = users.find(u => u.id === o.user_id) || {}
      return {
        ...o,
        customer_name:  user.name || 'Unknown',
        customer_email: user.email || '',
      }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  if (status) list = list.filter(o => o.status === status)
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(o =>
      String(o.id).includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.restaurant_name.toLowerCase().includes(q)
    )
  }
  return list
}

export function adminUpdateOrderStatus(orderId, newStatus) {
  const orders = readJSON(K.ORDERS, [])
  const order  = orders.find(o => o.id === Number(orderId))
  if (!order) throw new Error('Order not found')
  order.status = newStatus
  writeJSON(K.ORDERS, orders)
}

export function adminGetRestaurants() {
  return readJSON(K.RESTAURANTS, SEED_RESTAURANTS)
}

export function adminToggleRestaurant(restaurantId, is_open) {
  const restaurants = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)
  const r = restaurants.find(r => r.id === Number(restaurantId))
  if (r) r.is_open = is_open
  writeJSON(K.RESTAURANTS, restaurants)
}

export function adminGetMenuItems() {
  const menuItems   = readJSON(K.MENU_ITEMS, SEED_MENU_ITEMS)
  const restaurants = readJSON(K.RESTAURANTS, SEED_RESTAURANTS)
  return menuItems.map(m => ({
    ...m,
    restaurant_name: restaurants.find(r => r.id === m.restaurant_id)?.name || '',
  }))
}

export function adminToggleMenuItem(menuItemId, is_available) {
  const menuItems = readJSON(K.MENU_ITEMS, SEED_MENU_ITEMS)
  const item = menuItems.find(m => m.id === Number(menuItemId))
  if (item) item.is_available = is_available
  writeJSON(K.MENU_ITEMS, menuItems)
}
