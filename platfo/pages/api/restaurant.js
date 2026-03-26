import {
  getAllRestaurants,
  getRestaurantById,
  loginRestaurant,
  createRestaurant,
  updateRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../lib/store";

import {
  generateToken,
  verifyToken,
  rateLimit,
  sanitizeString,
  sanitizeNumber,
  comparePassword,
} from "../../lib/auth";

export default async function handler(req, res) {

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  // ── LOGIN ──
  if (req.method === "POST" && req.query.action === "login") {
    if (!rateLimit("login_" + ip, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many login attempts. Try again in 1 hour." });
    }

    const username = (req.body.username || "").trim().toLowerCase();
    const password = req.body.password || "";

    console.log("Login attempt:", username);

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }

    try {
      const restaurant = await loginRestaurant(username, password);

      if (!restaurant) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      console.log("Found restaurant:", restaurant.name);
      console.log("Password hash:", restaurant.password ? restaurant.password.substring(0, 10) : "NONE");

      const isValid = await comparePassword(password, restaurant.password);
      console.log("Password valid:", isValid);

      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      const token = generateToken({
        id: restaurant.id,
        username: restaurant.username,
        name: restaurant.name,
      });

      const { password: _, _id, ...safe } = restaurant;
      return res.status(200).json({
        success: true,
        restaurant: safe,
        token,
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── CREATE RESTAURANT ──
  if (req.method === "POST" && req.query.action === "create") {
    const { name, username, password, tableCount, email } = req.body;
    const adminKey = sanitizeString(req.body.adminKey || "");

    if (adminKey !== process.env.SUPER_ADMIN_KEY) {
      return res.status(403).json({ error: "Invalid admin key." });
    }

    if (!name || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      const result = await createRestaurant({
        name: sanitizeString(name),
        username: sanitizeString(username),
        password,
        tableCount: sanitizeNumber(tableCount),
        email: sanitizeString(email || ""),
      });
      if (result.error) return res.status(400).json({ error: result.error });

      if (email) {
        try {
          const { sendWelcomeEmail } = await import("../../lib/email");
          await sendWelcomeEmail({
            to: email,
            restaurantName: name,
            username,
            password,
            restaurantId: result.restaurant.id,
          });
        } catch (emailErr) {
          console.log("Email failed:", emailErr.message);
        }
      }

      return res.status(201).json({ success: true, restaurant: result.restaurant });
    } catch (err) {
      console.error("Create error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── GET ALL RESTAURANTS ──
  if (req.method === "GET" && req.query.action === "all") {
    const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
    if (adminKey !== process.env.SUPER_ADMIN_KEY) {
      return res.status(403).json({ error: "Unauthorized." });
    }
    try {
      const all = await getAllRestaurants();
      const safe = all.map(({ password, _id, ...r }) => r);
      return res.status(200).json({ restaurants: safe });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── GET SINGLE RESTAURANT ──
  if (req.method === "GET" && req.query.id) {
    try {
      const r = await getRestaurantById(sanitizeString(req.query.id));
      if (!r) return res.status(404).json({ error: "Restaurant not found." });
      const { password, _id, ...safe } = r;
      return res.status(200).json({ restaurant: safe });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── UPDATE RESTAURANT ──
  if (req.method === "PATCH" && req.query.action === "update") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Unauthorized. Please login again." });

    const { id, name, tableCount } = req.body;
    if (!id) return res.status(400).json({ error: "Restaurant ID required." });
    if (decoded.id !== id) return res.status(403).json({ error: "Forbidden." });

    try {
      const updated = await updateRestaurant(id, {
        name: sanitizeString(name || ""),
        tableCount: sanitizeNumber(tableCount),
      });
      if (!updated) return res.status(404).json({ error: "Restaurant not found." });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── ADD MENU ITEM ──
  if (req.method === "POST" && req.query.action === "addItem") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Unauthorized. Please login again." });

    const { restaurantId, name, price, emoji, desc, tag } = req.body;
    if (!restaurantId || !name || !price) {
      return res.status(400).json({ error: "restaurantId, name and price required." });
    }
    if (decoded.id !== restaurantId) return res.status(403).json({ error: "Forbidden." });

    try {
      const item = await addMenuItem(restaurantId, {
        name: sanitizeString(name),
        price: sanitizeNumber(price),
        emoji: emoji || "🍽️",
        desc: sanitizeString(desc || ""),
        tag: sanitizeString(tag || ""),
      });
      if (!item) return res.status(404).json({ error: "Restaurant not found." });
      return res.status(201).json({ success: true, item });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── UPDATE MENU ITEM ──
  if (req.method === "PATCH" && req.query.action === "updateItem") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Unauthorized. Please login again." });

    const { restaurantId, itemId, name, price, emoji, desc, tag } = req.body;
    if (!restaurantId || !itemId) {
      return res.status(400).json({ error: "restaurantId and itemId required." });
    }
    if (decoded.id !== restaurantId) return res.status(403).json({ error: "Forbidden." });

    try {
      const item = await updateMenuItem(restaurantId, itemId, {
        name: sanitizeString(name || ""),
        price: sanitizeNumber(price),
        emoji: emoji || "",
        desc: sanitizeString(desc || ""),
        tag: sanitizeString(tag || ""),
      });
      if (!item) return res.status(404).json({ error: "Item not found." });
      return res.status(200).json({ success: true, item });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE MENU ITEM ──
  if (req.method === "DELETE" && req.query.action === "deleteItem") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Unauthorized. Please login again." });

    const { restaurantId, itemId } = req.body;
    if (!restaurantId || !itemId) {
      return res.status(400).json({ error: "restaurantId and itemId required." });
    }
    if (decoded.id !== restaurantId) return res.status(403).json({ error: "Forbidden." });

    try {
      const ok = await deleteMenuItem(restaurantId, itemId);
      if (!ok) return res.status(404).json({ error: "Item not found." });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  res.status(405).end("Method Not Allowed");
}