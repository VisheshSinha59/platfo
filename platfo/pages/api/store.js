// lib/store.js - MongoDB storage

async function getDB() {
  const { default: clientPromise } = await import("./mongodb");
  const client = await clientPromise;
  return client.db("restaurant");
}

// ── RESTAURANT FUNCTIONS ──

export async function getAllRestaurants() {
  const db = await getDB();
  const restaurants = await db.collection("restaurants").find({}).toArray();
  console.log("getAllRestaurants found:", restaurants.length);
  return restaurants;
}

export async function getRestaurantById(id) {
  const db = await getDB();
  console.log("getRestaurantById looking for:", id);
  const restaurant = await db.collection("restaurants").findOne(
    { id: String(id) },
    { projection: { _id: 0 } }
  );
  console.log("getRestaurantById result:", restaurant ? restaurant.name : "NOT FOUND");
  return restaurant;
}

export async function loginRestaurant(username, password) {
  if (!username || !password) return null;
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne(
    { username: username.trim().toLowerCase(), password },
    { projection: { _id: 0 } }
  );
  console.log("loginRestaurant:", username, "found:", restaurant ? restaurant.name : "NOT FOUND");
  return restaurant;
}

export async function createRestaurant({ name, username, password, tableCount, email }) {
  if (!name || !username || !password) {
    return { error: "All fields are required." };
  }
  const db = await getDB();
  const existing = await db.collection("restaurants").findOne({
    username: username.trim().toLowerCase(),
  });
  if (existing) return { error: "Username already exists." };

  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "restaurantId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const restaurant = {
    id: "rest_" + (counter.seq || 1),
    name: name.trim(),
    username: username.trim().toLowerCase(),
    password,
    email: email ? email.trim().toLowerCase() : "",
    tableCount: Math.min(Math.max(Number(tableCount) || 10, 1), 100),
    menu: [],
    createdAt: new Date().toISOString(),
  };

  await db.collection("restaurants").insertOne(restaurant);
  console.log("Restaurant created:", restaurant.id, restaurant.name);
  return { restaurant };
}

export async function updateRestaurant(id, updates) {
  const db = await getDB();
  const updateData = {};
  if (updates.name && updates.name.trim()) updateData.name = updates.name.trim();
  if (updates.tableCount) {
    updateData.tableCount = Math.min(Math.max(Number(updates.tableCount) || 10, 1), 100);
  }
  await db.collection("restaurants").updateOne(
    { id: String(id) },
    { $set: updateData }
  );
  return db.collection("restaurants").findOne(
    { id: String(id) },
    { projection: { _id: 0 } }
  );
}

// ── MENU FUNCTIONS ──

export async function addMenuItem(restaurantId, item) {
  if (!item.name || !item.price) return null;
  const db = await getDB();

  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "menuId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const newItem = {
    id: counter.seq || 1,
    name: item.name.trim(),
    price: Math.max(Number(item.price) || 0, 0),
    emoji: item.emoji || "🍽️",
    desc: (item.desc || "").trim(),
    tag: (item.tag || "").trim(),
  };

  await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $push: { menu: newItem } }
  );

  console.log("Menu item added:", newItem.name, "to:", restaurantId);
  return newItem;
}

export async function updateMenuItem(restaurantId, itemId, updates) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne(
    { id: String(restaurantId) },
    { projection: { _id: 0 } }
  );
  if (!restaurant) return null;

  const menu = restaurant.menu || [];
  const itemIndex = menu.findIndex((i) => i.id === Number(itemId));
  if (itemIndex === -1) return null;

  if (updates.name && updates.name.trim()) menu[itemIndex].name = updates.name.trim();
  if (updates.price) menu[itemIndex].price = Math.max(Number(updates.price) || 0, 0);
  if (updates.emoji) menu[itemIndex].emoji = updates.emoji;
  if (updates.desc !== undefined) menu[itemIndex].desc = updates.desc.trim();
  if (updates.tag !== undefined) menu[itemIndex].tag = updates.tag.trim();

  await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $set: { menu } }
  );

  return menu[itemIndex];
}

export async function deleteMenuItem(restaurantId, itemId) {
  const db = await getDB();
  const result = await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $pull: { menu: { id: Number(itemId) } } }
  );
  return result.modifiedCount > 0;
}

// ── ORDER FUNCTIONS ──

export async function getOrdersByRestaurant(restaurantId, filters = {}) {
  const db = await getDB();
  console.log("getOrdersByRestaurant for:", restaurantId, "filters:", filters);

  const query = { restaurantId: String(restaurantId) };

  if (filters.startDate || filters.endDate) {
    // Use dateIST field for accurate Indian date filtering
    query.dateIST = {};
    if (filters.startDate) {
      query.dateIST.$gte = filters.startDate;
      console.log("Filter from IST date:", filters.startDate);
    }
    if (filters.endDate) {
      query.dateIST.$lte = filters.endDate;
      console.log("Filter to IST date:", filters.endDate);
    }
  }

  console.log("Final query:", JSON.stringify(query));

  const orders = await db.collection("orders")
    .find(query)
    .sort({ timestamp: -1 })
    .toArray();

  console.log("Found orders:", orders.length);
  return orders;
}

export async function createOrder({ restaurantId, tableNumber, items, clientToken }) {
  const db = await getDB();

  // Verify restaurant exists
  const restaurant = await db.collection("restaurants").findOne({
    id: String(restaurantId)
  });
  if (!restaurant) {
    console.log("Restaurant not found:", restaurantId);
    return { error: "Restaurant not found." };
  }

  // Check duplicate token
  if (clientToken) {
    const existing = await db.collection("tokens").findOne({ token: clientToken });
    if (existing) return { duplicate: true };
  }

  // Calculate totals server-side
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  // Get current IST date
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const dateIST = istDate.toISOString().split("T")[0];

  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "orderId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const order = {
    id: "ORD-" + String(counter.seq || 1).padStart(4, "0"),
    restaurantId: String(restaurantId),
    tableNumber: Number(tableNumber),
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      emoji: i.emoji || "🍽️",
    })),
    subtotal,
    gst,
    total,
    status: "New",
    timestamp: now.toISOString(),
    dateIST, // Indian date for accurate filtering
  };

  await db.collection("orders").insertOne(order);
  console.log("Order saved:", order.id, "dateIST:", dateIST, "restaurant:", restaurantId);

  // Save token
  if (clientToken) {
    await db.collection("tokens").insertOne({
      token: clientToken,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  return { order };
}

export async function updateOrderStatus(orderId, status) {
  const db = await getDB();
  await db.collection("orders").updateOne(
    { id: String(orderId) },
    { $set: { status } }
  );
  return db.collection("orders").findOne(
    { id: String(orderId) },
    { projection: { _id: 0 } }
  );
}

export async function seedDefaultData() {
  const db = await getDB();
  const existing = await db.collection("restaurants").findOne({ id: "rest_1" });
  if (!existing) {
    await db.collection("restaurants").insertOne({
      id: "rest_1",
      name: "Platfo Demo",
      username: "platfo",
      password: "1234",
      tableCount: 10,
      menu: [
        { id: 1, name: "Burger", price: 120, emoji: "🍔", desc: "Juicy beef patty", tag: "Bestseller" },
        { id: 2, name: "Pizza", price: 250, emoji: "🍕", desc: "Wood-fired toppings", tag: "Chefs Pick" },
        { id: 3, name: "Fries", price: 90, emoji: "🍟", desc: "Crispy golden fries", tag: "" },
        { id: 4, name: "Coke", price: 60, emoji: "🥤", desc: "Ice cold drink", tag: "" },
      ],
      createdAt: new Date().toISOString(),
    });
    console.log("Default restaurant seeded!");
  }
}

// ── SIGNUP / VERIFICATION FUNCTIONS ──

export async function createPendingRestaurant({ name, username, password, email, tableCount }) {
  const db = await getDB();

  // Check existing username
  const existingUsername = await db.collection("restaurants").findOne({
    username: username.trim().toLowerCase()
  });
  if (existingUsername) return { error: "Username already exists." };

  // Check existing email
  const existingEmail = await db.collection("restaurants").findOne({
    email: email.trim().toLowerCase()
  });
  if (existingEmail) return { error: "Email already registered." };

  // Delete old pending if exists
  await db.collection("pending_restaurants").deleteOne({
    email: email.trim().toLowerCase()
  });

  // Generate verification token
  const token = Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36);

  const pending = {
    name: name.trim(),
    username: username.trim().toLowerCase(),
    password,
    email: email.trim().toLowerCase(),
    tableCount: Number(tableCount) || 10,
    token,
    createdAt: new Date().toISOString(),
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  await db.collection("pending_restaurants").insertOne(pending);
  console.log("Pending restaurant created:", pending.email);
  return { pending };
}

export async function verifyRestaurant(token) {
  const db = await getDB();

  const pending = await db.collection("pending_restaurants").findOne({ token });
  if (!pending) return { error: "Invalid or expired verification link." };

  // Check if expired
  if (new Date() > new Date(pending.expireAt)) {
    await db.collection("pending_restaurants").deleteOne({ token });
    return { error: "Verification link expired. Please sign up again." };
  }

  // Create actual restaurant
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "restaurantId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const restaurant = {
    id: "rest_" + (counter.seq || 1),
    name: pending.name,
    username: pending.username,
    password: pending.password,
    email: pending.email,
    tableCount: pending.tableCount,
    menu: [],
    createdAt: new Date().toISOString(),
    verified: true,
  };

  await db.collection("restaurants").insertOne(restaurant);
  await db.collection("pending_restaurants").deleteOne({ token });

  console.log("Restaurant verified:", restaurant.id, restaurant.name);
  return { restaurant };
}