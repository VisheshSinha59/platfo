// pages/api/db.js
// File-based storage — survives restarts, handles concurrent users

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "orders.json");

// Initialize file if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ orders: [], nextId: 1 }), "utf8");
  }
}

// Read all data
function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { orders: [], nextId: 1 };
  }
}

// Write all data
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

// Get all orders
export function getOrders() {
  const db = readDB();
  return db.orders;
}

// Create new order — safe for simultaneous users
export function addOrder(tableNumber, items, clientToken) {
  const db = readDB();

  // Check for duplicate clientToken
  if (clientToken && db.orders.some((o) => o.clientToken === clientToken)) {
    return { duplicate: true };
  }

  const order = {
    id: `ORD-${String(db.nextId++).padStart(4, "0")}`,
    tableNumber: Number(tableNumber),
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    status: "New",
    timestamp: new Date().toISOString(),
    clientToken: clientToken || null,
  };

  db.orders.unshift(order);
  writeDB(db);
  return { order };
}

// Update order status
export function updateStatus(orderId, status) {
  const db = readDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  writeDB(db);
  return order;
}