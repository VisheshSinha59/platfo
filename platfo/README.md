# QR Restaurant

# 🍽️ Platfo — QR Restaurant Ordering App

A mobile-friendly dine-in ordering system powered by QR codes. Built with Next.js (React + API Routes) and in-memory storage for MVP.

---

## 📁 Project Structure

```
qr-restaurant/
├── lib/
│   └── store.js              # In-memory storage + menu data (swap for DB later)
├── pages/
│   ├── _app.js               # Global app wrapper
│   ├── index.js              # Landing page with demo links
│   ├── menu.js               # Customer-facing menu page
│   ├── dashboard.js          # Kitchen/restaurant dashboard
│   └── api/
│       └── order.js          # API: GET / POST / PATCH orders
├── styles/
│   └── globals.css           # Global CSS reset
├── package.json
├── next.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```

### 3. Open in browser
- **Home:**      http://localhost:3000
- **Menu (Table 5):** http://localhost:3000/menu?table=5
- **Dashboard:** http://localhost:3000/dashboard

---

## 📱 QR Code Setup

Generate QR codes pointing to:
```
https://your-domain.com/menu?table=1
https://your-domain.com/menu?table=2
...
```

Print one QR code per table and place it on the table.

---

## 🔌 API Endpoints

| Method | Endpoint     | Description          |
|--------|-------------|----------------------|
| POST   | /api/order  | Create a new order   |
| GET    | /api/order  | Fetch all orders     |
| PATCH  | /api/order  | Update order status  |

### POST /api/order
```json
{
  "tableNumber": 5,
  "items": [
    { "id": 1, "name": "Burger", "price": 120, "qty": 2, "emoji": "🍔" }
  ]
}
```

### PATCH /api/order
```json
{
  "orderId": "ORD-0001",
  "status": "Preparing"
}
```

---

## 🗃️ Connecting a Real Database

All data access is isolated in `lib/store.js`. To connect a database (e.g. PostgreSQL, MongoDB):

1. Replace the 3 functions in `lib/store.js`:
   - `getAllOrders()` → DB query
   - `createOrder()` → DB insert
   - `updateOrderStatus()` → DB update

2. The API routes and UI pages require **zero changes**.

---

## 📋 Order Statuses

`New` → `Preparing` → `Ready` → `Delivered`

---

## 🍔 Menu Items

| Item   | Price |
|--------|-------|
| Burger | ₹120  |
| Pizza  | ₹250  |
| Fries  | ₹90   |
| Coke   | ₹60   |

Add/edit items in `lib/store.js` → `menuItems` array.
