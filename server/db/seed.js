/**
 * seed.js — Populates the database with rich demo data and gourmet imagery
 * Run with: node db/seed.js
 */

process.chdir(require('path').join(__dirname, '..'));

const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcryptjs');

// Async because sql.js init is async
async function seed() {
  const DB_PATH = path.join(__dirname, '..', 'food_delivery.db');
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const { initDB, insert } = require('../db');
  await initDB();

  console.log('[SEED] Starting fresh rich seed...');

  // ── Users ────────────────────────────────────────────────────────────────────
  const pwHash    = bcrypt.hashSync('demo123',  10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  insert('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
    ['Manas Sharma', 'customer@demo.com', pwHash,    'customer']);
  insert('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
    ['Admin Officer', 'admin@demo.com',    adminHash, 'admin']);

  console.log('[SEED] Users created');

  // ── Restaurants ──────────────────────────────────────────────────────────────
  const r1 = insert(`
    INSERT INTO restaurants (name, cuisine, description, address, rating, rating_count, delivery_time_min, min_order, is_open, image_url, banner_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Spice Symphony & Grill',
    'Indian',
    'Royal North Indian delicacies, aromatic biryanis & clay-oven tandoori grills',
    '12 Indiranagar 100ft Road, Bengaluru',
    4.8,
    450,
    25,
    100,
    1,
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'Biryani, Curry, Mughlai, Tandoor'
  ]);

  const r2 = insert(`
    INSERT INTO restaurants (name, cuisine, description, address, rating, rating_count, delivery_time_min, min_order, is_open, image_url, banner_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Bella Napoli Trattoria',
    'Italian',
    'Artisanal wood-fired pizzas, hand-rolled fresh pastas & decadent tiramisu',
    '34 Lavelle Road, Bengaluru',
    4.7,
    380,
    20,
    150,
    1,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'Woodfired Pizza, Pasta, Gourmet Desserts'
  ]);

  const r3 = insert(`
    INSERT INTO restaurants (name, cuisine, description, address, rating, rating_count, delivery_time_min, min_order, is_open, image_url, banner_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Golden Dragon Wok House',
    'Chinese',
    'Sizzling wok stir-fries, handcrafted dim sums & authentic Sichuan street food',
    '56 Koramangala 5th Block, Bengaluru',
    4.6,
    290,
    30,
    120,
    1,
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'Dim Sum, Wok Tossed, Noodles, Sichuan'
  ]);

  const r4 = insert(`
    INSERT INTO restaurants (name, cuisine, description, address, rating, rating_count, delivery_time_min, min_order, is_open, image_url, banner_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'The Rustic Burger Bar',
    'American',
    'Gourmet smash burgers, crispy loaded waffle fries & thick handcrafted shakes',
    '78 Church Street, Bengaluru',
    4.5,
    510,
    20,
    80,
    1,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80',
    'Smash Burgers, Loaded Fries, Shakes, Wings'
  ]);

  const r5 = insert(`
    INSERT INTO restaurants (name, cuisine, description, address, rating, rating_count, delivery_time_min, min_order, is_open, image_url, banner_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Tokyo Ramen & Sushi Bar',
    'Japanese',
    'Slow-simmered rich ramen broths, premium sashimi & crispy tempura platters',
    '89 MG Road, Bengaluru',
    4.9,
    620,
    25,
    200,
    1,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    'Ramen, Sushi, Gyoza, Japanese Bento'
  ]);

  const r6 = insert(`
    INSERT INTO restaurants (name, cuisine, description, address, rating, rating_count, delivery_time_min, min_order, is_open, image_url, banner_url, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Taqueria Mexico Lindo',
    'Mexican',
    'Authentic street tacos, cheesy quesadillas, freshly made guacamole & churros',
    '102 Kalyan Nagar, Bengaluru',
    4.6,
    240,
    25,
    120,
    1,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'Tacos, Burritos, Quesadilla, Salsa'
  ]);

  console.log('[SEED] 6 Restaurants created');

  // ── Menu Items ────────────────────────────────────────────────────────────────
  const mi = (rid, name, desc, price, cat, qty, isVeg, cal, rating, img) =>
    insert(`
      INSERT INTO menu_items (restaurant_id, name, description, price, category, available_qty, is_available, is_veg, calories, rating, image_url)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `, [rid, name, desc, price, cat, qty, isVeg ? 1 : 0, cal, rating, img]);

  // 1. Spice Symphony & Grill
  mi(r1.lastInsertRowid, 'Royal Butter Chicken', 'Charcoal-grilled boneless chicken in a velvety rich tomato, cream and cashew nut gravy', 340, 'Main Course', 50, false, 580, 4.9, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80');
  mi(r1.lastInsertRowid, 'Paneer Tikka Angara', 'Fresh cottage cheese cubes marinated in fiery tandoori spices and smoked over embers', 280, 'Starter', 40, true, 380, 4.8, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80');
  mi(r1.lastInsertRowid, 'Slow-Cooked Dal Makhani', 'Overnight simmered black lentils laced with cultured butter and organic cream', 240, 'Main Course', 60, true, 420, 4.7, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80');
  mi(r1.lastInsertRowid, 'Dum Pukht Chicken Biryani', 'Fragrant aged basmati rice layered with saffron-infused succulent chicken cuts', 360, 'Main Course', 45, false, 650, 4.9, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80');
  mi(r1.lastInsertRowid, 'Butter Garlic Naan', 'Soft clay-oven baked leavened bread brushed with garlic herb butter', 70, 'Breads', 80, true, 210, 4.6, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80');
  mi(r1.lastInsertRowid, 'Kesari Mango Lassi', 'Chilled thick yogurt smoothie infused with premium Alphonso mango pulp and cardamom', 110, 'Beverages', 70, true, 190, 4.8, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80');

  // 2. Bella Napoli Trattoria
  mi(r2.lastInsertRowid, 'Margherita di Bufala Pizza', 'San Marzano tomato base, fresh buffalo mozzarella, aromatic basil & extra virgin olive oil', 380, 'Pizza', 50, true, 620, 4.8, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80');
  mi(r2.lastInsertRowid, 'Spicy Pepperoni & Jalapeno', 'Double layer pepperoni slices, melted mozzarella, picked jalapeños and hot honey drizzle', 460, 'Pizza', 40, false, 740, 4.9, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80');
  mi(r2.lastInsertRowid, 'Truffle Mushroom Fettuccine', 'Handmade egg fettuccine ribbons in creamy wild mushroom sauce with black truffle essence', 390, 'Pasta', 35, true, 580, 4.9, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281541?auto=format&fit=crop&w=600&q=80');
  mi(r2.lastInsertRowid, 'Cheesy Stuffed Garlic Bread', 'Crispy baguette filled with roasted garlic butter, parsley and gooey mozzarella', 160, 'Sides', 60, true, 340, 4.6, 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80');
  mi(r2.lastInsertRowid, 'Classic Venetian Tiramisu', 'Espresso-soaked ladyfingers layered with whipped mascarpone cream and Belgian cocoa dusting', 220, 'Dessert', 30, true, 320, 5.0, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80');

  // 3. Golden Dragon Wok House
  mi(r3.lastInsertRowid, 'Steamed Crystal Dim Sums (6pc)', 'Translucent dumplings packed with water chestnuts, shitake mushrooms & spring vegetables', 240, 'Starter', 50, true, 220, 4.7, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80');
  mi(r3.lastInsertRowid, 'Schezwan Fiery Chicken Wok', 'Tender chicken strips wok-tossed with roasted Sichuan peppers, scallions and red chillies', 320, 'Main Course', 45, false, 480, 4.8, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80');
  mi(r3.lastInsertRowid, 'Egg & Scallion Fried Rice', 'Wok-charred Jasmine rice tossed with fluffy scrambled eggs, garlic butter and spring greens', 260, 'Rice', 55, false, 410, 4.6, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80');
  mi(r3.lastInsertRowid, 'Crispy Veg Spring Rolls', 'Golden fried pastry rolls stuffed with crunchy glass noodles and vegetables with sweet chili dip', 190, 'Starter', 60, true, 290, 4.5, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80');
  mi(r3.lastInsertRowid, 'Hong Kong Hakka Noodles', 'Classic wok noodles tossed with julienne capsicum, cabbage and umami dark soy sauce', 240, 'Noodles', 50, true, 380, 4.6, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80');

  // 4. The Rustic Burger Bar
  mi(r4.lastInsertRowid, 'Signature Double Smash Cheeseburger', 'Two 100% prime patties, double melted cheddar, caramelized onions and secret house sauce in brioche', 350, 'Burgers', 50, false, 780, 4.9, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80');
  mi(r4.lastInsertRowid, 'Crispy Buttermilk Chicken Burger', 'Crisp herb-crusted chicken fillet with honey mustard slaw, dill pickles and spicy mayo', 320, 'Burgers', 45, false, 690, 4.8, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80');
  mi(r4.lastInsertRowid, 'Truffle Parmesan Loaded Fries', 'Crispy skin-on fries tossed with white truffle oil, shaved parmesan and rosemary herbs', 190, 'Sides', 70, true, 410, 4.7, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80');
  mi(r4.lastInsertRowid, 'Smoky BBQ Wings (6pc)', 'Crispy chicken wings glazed with tangy hickory barbecue sauce served with ranch dip', 260, 'Sides', 40, false, 490, 4.8, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80');
  mi(r4.lastInsertRowid, 'Belgian Dark Chocolate Shake', 'Decadent hand-spun shake made with pure Belgian chocolate ganache and artisanal vanilla ice cream', 180, 'Beverages', 50, true, 380, 4.9, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80');

  // 5. Tokyo Ramen & Sushi Bar
  mi(r5.lastInsertRowid, 'Tonkotsu Ramen Bowl', 'Rich 12-hour broth with springy noodles, chashu slices, nitamago egg, menma & nori', 420, 'Ramen', 40, false, 680, 5.0, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80');
  mi(r5.lastInsertRowid, 'Salmon Avocado Roll (8pc)', 'Fresh Atlantic salmon, creamy avocado and cucumber wrapped in seasoned sushi rice', 480, 'Sushi', 35, false, 360, 4.9, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80');
  mi(r5.lastInsertRowid, 'Pan-Seared Gyoza (6pc)', 'Crispy-bottomed Japanese dumplings filled with spiced chicken and scallions with ponzu dip', 240, 'Starter', 50, false, 280, 4.7, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80');
  mi(r5.lastInsertRowid, 'Matcha Green Tea Ice Cream', 'Authentic stone-ground Uji matcha green tea ice cream topped with red bean paste', 160, 'Dessert', 30, true, 190, 4.8, 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80');

  // 6. Taqueria Mexico Lindo
  mi(r6.lastInsertRowid, 'Carne Asada Street Tacos (3pc)', 'Grilled citrus-marinated steak on double warm corn tortillas with diced onion, cilantro and salsa verde', 320, 'Tacos', 40, false, 460, 4.8, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80');
  mi(r6.lastInsertRowid, 'Cheesy Chipotle Quesadilla', 'Crispy folded flour tortilla stuffed with melted Monterey Jack, grilled corn, peppers and sour cream', 260, 'Quesadillas', 45, true, 490, 4.7, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80');
  mi(r6.lastInsertRowid, 'Fresh Guacamole & Tortilla Chips', 'Hand-mashed ripe Hass avocados with lime juice, sea salt, tomatoes, cilantro and fresh crispy chips', 210, 'Sides', 50, true, 340, 4.9, 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80');
  mi(r6.lastInsertRowid, 'Cinnamon Sugar Churros with Dulce de Leche', 'Warm golden Mexican pastry sticks dusted in cinnamon sugar served with rich caramel dipping sauce', 190, 'Dessert', 35, true, 310, 4.9, 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80');

  console.log('[SEED] Rich menu items created across all restaurants');

  // Add 1 sample completed order and 1 active preparing order for customer
  const sampleOrder = insert(`
    INSERT INTO orders (user_id, restaurant_id, status, total_amount, subtotal, delivery_fee, discount_amount, tip_amount, payment_method, delivery_address, notes, created_at)
    VALUES (1, 1, 'delivered', 620, 680, 0, 100, 40, 'upi', '12 Indiranagar 100ft Road, Flat 402, Bengaluru', 'Please leave at reception', datetime('now', '-3 hours'))
  `);
  insert('INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, 1, 1, 340)', [sampleOrder.lastInsertRowid]);
  insert('INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, 2, 1, 280)', [sampleOrder.lastInsertRowid]);

  const activeOrder = insert(`
    INSERT INTO orders (user_id, restaurant_id, status, total_amount, subtotal, delivery_fee, discount_amount, tip_amount, payment_method, delivery_address, notes, created_at)
    VALUES (1, 2, 'preparing', 460, 460, 0, 0, 0, 'card', '12 Indiranagar 100ft Road, Flat 402, Bengaluru', 'Extra chilli flakes please', datetime('now', '-15 minutes'))
  `);
  insert('INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, 8, 1, 460)', [activeOrder.lastInsertRowid]);

  console.log('\n✅ Fresh Rich Seed complete!');
  console.log('\nDemo credentials:');
  console.log('  Customer → customer@demo.com  / demo123');
  console.log('  Admin    → admin@demo.com     / admin123');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
