import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  linkRecipeToMenuItem,
} from "../../lib/store";
import { verifyToken } from "../../lib/auth";

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Unauthorized." });

  const { restaurantId } = req.query;
  if (!restaurantId) return res.status(400).json({ error: "restaurantId required." });
  if (decoded.id !== restaurantId) return res.status(403).json({ error: "Forbidden." });

  // —— GET INVENTORY ——
  if (req.method === "GET") {
    try {
      const inventory = await getInventory(restaurantId);
      return res.status(200).json({ inventory });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // —— ADD ITEM ——
  if (req.method === "POST" && req.query.action === "add") {
    const { name, quantity, unit, lowStockAlert } = req.body;
    if (!name) return res.status(400).json({ error: "Name required." });
    try {
      const item = await addInventoryItem(restaurantId, {
        name,
        quantity: Number(quantity) || 0,
        unit: unit || "kg",
        lowStockAlert: Number(lowStockAlert) || 1,
      });
      return res.status(201).json({ success: true, item });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // —— UPDATE ITEM ——
  if (req.method === "PATCH" && req.query.action === "update") {
    const { itemId, name, quantity, unit, lowStockAlert } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId required." });
    try {
      await updateInventoryItem(restaurantId, itemId, {
        name,
        quantity: Number(quantity),
        unit,
        lowStockAlert: Number(lowStockAlert),
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // —— DELETE ITEM ——
  if (req.method === "DELETE") {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId required." });
    try {
      await deleteInventoryItem(restaurantId, itemId);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // —— LINK RECIPE TO MENU ITEM —— (BUG FIXED: amount now Number)
  if (req.method === "POST" && req.query.action === "linkRecipe") {
    const { menuItemId, recipe } = req.body;
    if (!menuItemId || !recipe) return res.status(400).json({ error: "menuItemId and recipe required." });
    try {
      const cleanRecipe = recipe
        .filter(r => r.inventoryId && r.amount)
        .map(r => ({
          inventoryId: String(r.inventoryId),
          amount: Number(r.amount),
        }));
      await linkRecipeToMenuItem(restaurantId, menuItemId, cleanRecipe);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).end("Method Not Allowed");
}
