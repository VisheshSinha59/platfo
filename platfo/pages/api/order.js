import {
  createOrder,
  updateOrderStatus,
  getOrdersByRestaurant,
  deductInventory,
} from "../../lib/store";
import { verifyToken, sanitizeString, sanitizeNumber } from "../../lib/auth";

export default async function handler(req, res) {

  // —— GET ORDERS ——
  if (req.method === "GET") {
    const { restaurantId, startDate, endDate } = req.query;
    if (!restaurantId) return res.status(400).json({ error: "restaurantId required." });
    try {
      const orders = await getOrdersByRestaurant(restaurantId, { startDate, endDate });
      const clean = orders.map(({ _id, ...o }) => o);
      return res.status(200).json({ orders: clean });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // —— CREATE ORDER ——
  if (req.method === "POST") {
    const {
      restaurantId, tableNumber, items,
      clientToken, customerName, customerPhone,
      paymentMethod, paymentId,
    } = req.body;

    if (!restaurantId || !tableNumber || !items?.length) {
      return res.status(400).json({ error: "restaurantId, tableNumber and items required." });
    }

    try {
      // Run order creation and inventory deduction in PARALLEL for speed
      const orderPromise = createOrder({
        restaurantId: sanitizeString(restaurantId),
        tableNumber: sanitizeNumber(tableNumber),
        items,
        clientToken,
        customerName: sanitizeString(customerName || ""),
        customerPhone: sanitizeString(customerPhone || ""),
        paymentMethod: paymentMethod || "cash",
        paymentId: paymentId || null,
      });

      const deductPromise = deductInventory(restaurantId, items).catch((err) => {
        console.log("Inventory deduction error:", err.message);
      });

      // Wait for order first (required), deduction runs in background
      const result = await orderPromise;

      if (result.error) return res.status(400).json({ error: result.error });
      if (result.duplicate) return res.status(409).json({ error: "Duplicate order." });

      // Also await deduction (already running in parallel)
      await deductPromise;

      console.log("Order + inventory deduction complete:", result.order?.id);
      return res.status(201).json({ success: true, order: result.order });
    } catch (err) {
      console.error("Order error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // —— UPDATE ORDER STATUS ——
  if (req.method === "PATCH") {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Unauthorized." });

    const { orderId, status } = req.body;
    if (!orderId || !status) return res.status(400).json({ error: "orderId and status required." });

    const validStatuses = ["New", "Preparing", "Ready", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    try {
      const result = await updateOrderStatus(orderId, status);
      if (!result) return res.status(404).json({ error: "Order not found." });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).end("Method Not Allowed");
}
