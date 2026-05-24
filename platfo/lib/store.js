// lib/store.js - MongoDB storage

async function getDB() {
  const { default: clientPromise } = await import("./mongodb");
  const client = await clientPromise;
  return client.db("restaurant");
}

export async function getAllRestaurants() {
  const db = await getDB();
  return await db.collection("restaurants").find({}).toArray();
}

export async function getRestaurantById(id) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne(
    { id: String(id) },
    { projection: { _id: 0 } }
  );
  return restaurant;
}

export async function loginRestaurant(username, password) {
  if (!username || !password) return null;
  const db = await getDB();
  const trimmed = username.trim().toLowerCase();
  const restaurant = await db.collection("restaurants").findOne(
    { username: trimmed },
    { projection: { _id: 0 } }
  );
  console.log("loginRestaurant:", trimmed, "->", restaurant ? restaurant.name : "NOT FOUND");
  return restaurant;
}

export async function createRestaurant({ name, username, password, tableCount, email }) {
  if (!name || !username || !password) return { error: "All fields are required." };
  const db = await getDB();
  const existing = await db.collection("restaurants").findOne({ username: username.trim().toLowerCase() });
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
    sections: [],
    razorpayKeyId: "",
    razorpayKeySecret: "",
    createdAt: new Date().toISOString(),
  };
  await db.collection("restaurants").insertOne(restaurant);
  return { restaurant };
}

export async function updateRestaurant(id, updates) {
  const db = await getDB();
  const allowedFields = [
    "name", "tableCount", "razorpayKeyId", "razorpayKeySecret",
    "currency", "currencySymbol", "country", "taxName", "taxRate", "timezone"
  ];
  const updateData = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      if (key === "tableCount") {
        updateData.tableCount = Math.min(Math.max(Number(updates.tableCount) || 10, 1), 100);
      } else if (key === "taxRate") {
        updateData.taxRate = Number(updates.taxRate) || 18;
      } else if (key === "name") {
        if (updates.name && updates.name.trim()) updateData.name = updates.name.trim();
      } else {
        updateData[key] = updates[key];
      }
    }
  }
  await db.collection("restaurants").updateOne({ id: String(id) }, { $set: updateData });
  return db.collection("restaurants").findOne({ id: String(id) }, { projection: { _id: 0 } });
}

export async function updateRestaurantPayment(id, razorpayKeyId, razorpayKeySecret) {
  const db = await getDB();
  await db.collection("restaurants").updateOne(
    { id: String(id) },
    { $set: { razorpayKeyId: razorpayKeyId || "", razorpayKeySecret: razorpayKeySecret || "" } }
  );
  return true;
}

// ── SECTION FUNCTIONS ──

export async function addSection(restaurantId, sectionName) {
  if (!sectionName) return null;
  const db = await getDB();
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "sectionId_" + String(restaurantId) },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const section = {
    id: counter.seq || 1,
    name: sectionName.trim(),
    createdAt: new Date().toISOString(),
  };
  await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $push: { sections: section } }
  );
  console.log("Section added:", section.name, "to:", restaurantId);
  return section;
}

export async function updateSection(restaurantId, sectionId, newName) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne({ id: String(restaurantId) }, { projection: { _id: 0 } });
  if (!restaurant) return null;
  const sections = restaurant.sections || [];
  const idx = sections.findIndex((s) => s.id === Number(sectionId));
  if (idx === -1) return null;
  sections[idx].name = newName.trim();
  await db.collection("restaurants").updateOne({ id: String(restaurantId) }, { $set: { sections } });
  return sections[idx];
}

export async function deleteSection(restaurantId, sectionId) {
  const db = await getDB();
  await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $pull: { sections: { id: Number(sectionId) } } }
  );
  const restaurant = await db.collection("restaurants").findOne({ id: String(restaurantId) }, { projection: { _id: 0 } });
  if (restaurant) {
    const menu = (restaurant.menu || []).filter((item) => item.sectionId !== Number(sectionId));
    await db.collection("restaurants").updateOne({ id: String(restaurantId) }, { $set: { menu } });
  }
  return true;
}

// ── MENU FUNCTIONS ──

export async function addMenuItem(restaurantId, item) {
  if (!item.name || !item.price) return null;
  const db = await getDB();
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "menuId_" + String(restaurantId) },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const newItem = {
    id: counter.seq || 1,
    name: item.name.trim(),
    price: Math.max(Number(item.price) || 0, 0),
    desc: (item.desc || "").trim(),
    tag: (item.tag || "").trim(),
    sectionId: item.sectionId ? Number(item.sectionId) : null,
    recipe: [],
  };
  await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $push: { menu: newItem } }
  );
  return newItem;
}

export async function updateMenuItem(restaurantId, itemId, updates) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne({ id: String(restaurantId) }, { projection: { _id: 0 } });
  if (!restaurant) return null;
  const menu = restaurant.menu || [];
  const itemIndex = menu.findIndex((i) => i.id === Number(itemId));
  if (itemIndex === -1) return null;
  if (updates.name && updates.name.trim()) menu[itemIndex].name = updates.name.trim();
  if (updates.price) menu[itemIndex].price = Math.max(Number(updates.price) || 0, 0);
  if (updates.desc !== undefined) menu[itemIndex].desc = updates.desc.trim();
  if (updates.tag !== undefined) menu[itemIndex].tag = updates.tag.trim();
  if (updates.sectionId !== undefined) menu[itemIndex].sectionId = updates.sectionId ? Number(updates.sectionId) : null;
  await db.collection("restaurants").updateOne({ id: String(restaurantId) }, { $set: { menu } });
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
  const query = { restaurantId: String(restaurantId) };
  if (filters.startDate || filters.endDate) {
    if (filters.startDate && filters.endDate) {
      const startIST = new Date(filters.startDate + "T00:00:00.000+05:30");
      const endIST = new Date(filters.endDate + "T23:59:59.999+05:30");
      query.$or = [
        { dateIST: { $gte: filters.startDate, $lte: filters.endDate } },
        { dateIST: { $exists: false }, timestamp: { $gte: startIST.toISOString(), $lte: endIST.toISOString() } },
      ];
    } else if (filters.startDate) {
      const startIST = new Date(filters.startDate + "T00:00:00.000+05:30");
      query.$or = [
        { dateIST: { $gte: filters.startDate } },
        { dateIST: { $exists: false }, timestamp: { $gte: startIST.toISOString() } },
      ];
    } else if (filters.endDate) {
      const endIST = new Date(filters.endDate + "T23:59:59.999+05:30");
      query.$or = [
        { dateIST: { $lte: filters.endDate } },
        { dateIST: { $exists: false }, timestamp: { $lte: endIST.toISOString() } },
      ];
    }
  }
  const orders = await db.collection("orders").find(query).sort({ timestamp: -1 }).toArray();
  console.log("Found orders:", orders.length);
  return orders;
}

export async function createOrder({ restaurantId, tableNumber, items, clientToken, customerName, customerPhone, paymentMethod, paymentId }) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne({ id: String(restaurantId) });
  if (!restaurant) return { error: "Restaurant not found." };
  if (clientToken) {
    const existing = await db.collection("tokens").findOne({ token: clientToken });
    if (existing) return { duplicate: true };
  }
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const dateIST = istDate.toISOString().split("T")[0];
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "orderId_" + String(restaurantId) },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const orderNum = counter.seq || 1;
  const shortId = restaurantId.replace("rest_", "R");
  const order = {
    id: shortId + "-ORD-" + String(orderNum).padStart(4, "0"),
    restaurantId: String(restaurantId),
    tableNumber: Number(tableNumber),
    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    subtotal, gst, total,
    status: "New",
    timestamp: now.toISOString(),
    dateIST,
    customerName: customerName || "",
    customerPhone: customerPhone || "",
    paymentMethod: paymentMethod || "cash",
    paymentId: paymentId || null,
  };
  await db.collection("orders").insertOne(order);
  console.log("Order saved:", order.id);
  if (clientToken) {
    await db.collection("tokens").insertOne({ token: clientToken, createdAt: new Date(), expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
  }
  return { order };
}

export async function updateOrderStatus(orderId, status) {
  const db = await getDB();
  const result = await db.collection("orders").findOneAndUpdate(
    { id: String(orderId) },
    { $set: { status } },
    { returnDocument: "after", sort: { timestamp: -1 } }
  );
  return result;
}

export async function seedDefaultData() {
  const db = await getDB();
  const existing = await db.collection("restaurants").findOne({ id: "rest_1" });
  if (!existing) {
    await db.collection("restaurants").insertOne({
      id: "rest_1", name: "Platfo Demo", username: "platfo", password: "1234",
      tableCount: 10,
      razorpayKeyId: "",
      razorpayKeySecret: "",
      sections: [
        { id: 1, name: "Starters" },
        { id: 2, name: "Main Course" },
        { id: 3, name: "Beverages" },
      ],
      menu: [
        { id: 1, name: "Burger", price: 120, desc: "Juicy beef patty", tag: "Bestseller", sectionId: 1, recipe: [] },
        { id: 2, name: "Pizza", price: 250, desc: "Wood-fired toppings", tag: "Chefs Pick", sectionId: 2, recipe: [] },
        { id: 3, name: "Fries", price: 90, desc: "Crispy golden fries", tag: "", sectionId: 1, recipe: [] },
        { id: 4, name: "Coke", price: 60, desc: "Ice cold drink", tag: "", sectionId: 3, recipe: [] },
      ],
      createdAt: new Date().toISOString(),
    });
  }
}

export async function createPendingRestaurant({ name, username, password, email, tableCount }) {
  const db = await getDB();
  const existingUsername = await db.collection("restaurants").findOne({ username: username.trim().toLowerCase() });
  if (existingUsername) return { error: "Username already exists." };
  const existingEmail = await db.collection("restaurants").findOne({ email: email.trim().toLowerCase() });
  if (existingEmail) return { error: "Email already registered." };
  await db.collection("pending_restaurants").deleteOne({ email: email.trim().toLowerCase() });
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const pending = {
    name: name.trim(), username: username.trim().toLowerCase(), password,
    email: email.trim().toLowerCase(), tableCount: Number(tableCount) || 10,
    token, createdAt: new Date().toISOString(), expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  await db.collection("pending_restaurants").insertOne(pending);
  return { pending };
}

export async function verifyRestaurant(token) {
  const db = await getDB();
  const pending = await db.collection("pending_restaurants").findOne({ token });
  if (!pending) return { error: "Invalid or expired verification link." };
  if (new Date() > new Date(pending.expireAt)) {
    await db.collection("pending_restaurants").deleteOne({ token });
    return { error: "Verification link expired. Please sign up again." };
  }
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "restaurantId" }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" }
  );
  const restaurant = {
    id: "rest_" + (counter.seq || 1), name: pending.name, username: pending.username,
    password: pending.password, email: pending.email, tableCount: pending.tableCount,
    menu: [], sections: [],
    razorpayKeyId: "",
    razorpayKeySecret: "",
    createdAt: new Date().toISOString(), verified: true,
  };
  await db.collection("restaurants").insertOne(restaurant);
  await db.collection("pending_restaurants").deleteOne({ token });
  return { restaurant };
}

// ── INVENTORY FUNCTIONS ──

export async function getInventory(restaurantId) {
  const db = await getDB();
  const inventory = await db.collection("inventory").find({
    restaurantId: String(restaurantId)
  }).toArray();
  return inventory;
}

export async function addInventoryItem(restaurantId, item) {
  const db = await getDB();
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "inventoryId_" + String(restaurantId) },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const newItem = {
    id: "inv_" + (counter.seq || 1),
    restaurantId: String(restaurantId),
    name: item.name.trim(),
    quantity: Number(item.quantity) || 0,
    unit: item.unit || "kg",
    lowStockAlert: Number(item.lowStockAlert) || 1,
    createdAt: new Date().toISOString(),
  };
  await db.collection("inventory").insertOne(newItem);
  return newItem;
}

export async function updateInventoryItem(restaurantId, itemId, updates) {
  const db = await getDB();
  const updateData = {};
  if (updates.name) updateData.name = updates.name.trim();
  if (updates.quantity !== undefined) updateData.quantity = Number(updates.quantity);
  if (updates.unit) updateData.unit = updates.unit;
  if (updates.lowStockAlert !== undefined) updateData.lowStockAlert = Number(updates.lowStockAlert);
  await db.collection("inventory").updateOne(
    { id: String(itemId), restaurantId: String(restaurantId) },
    { $set: updateData }
  );
  return true;
}

export async function deleteInventoryItem(restaurantId, itemId) {
  const db = await getDB();
  await db.collection("inventory").deleteOne({
    id: String(itemId), restaurantId: String(restaurantId)
  });
  return true;
}

export async function deductInventory(restaurantId, items) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne({ id: String(restaurantId) });
  if (!restaurant) return;
  const menu = restaurant.menu || [];
  for (const orderItem of items) {
    const menuItem = menu.find(m => m.id === Number(orderItem.id));
    if (!menuItem || !menuItem.recipe || menuItem.recipe.length === 0) continue;
    for (const ingredient of menuItem.recipe) {
      const deductAmount = Number(ingredient.amount) * Number(orderItem.qty);
      await db.collection("inventory").updateOne(
        { id: String(ingredient.inventoryId), restaurantId: String(restaurantId) },
        { $inc: { quantity: -deductAmount } }
      );
    }
  }
}

export async function linkRecipeToMenuItem(restaurantId, menuItemId, recipe) {
  const db = await getDB();
  const restaurant = await db.collection("restaurants").findOne({ id: String(restaurantId) });
  if (!restaurant) return null;
  const menu = restaurant.menu || [];
  const idx = menu.findIndex(m => m.id === Number(menuItemId));
  if (idx === -1) return null;
  menu[idx].recipe = recipe;
  await db.collection("restaurants").updateOne(
    { id: String(restaurantId) },
    { $set: { menu } }
  );
  return menu[idx];
}
