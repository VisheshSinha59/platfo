export default async function handler(req, res) {

  if (req.method === "POST") {
    const { restaurantId, tableNumber, items, clientToken, customerName, customerPhone } = req.body;

    if (!restaurantId) return res.status(400).json({ error: "Restaurant ID required." });
    if (!tableNumber || isNaN(Number(tableNumber))) return res.status(400).json({ error: "Valid table number required." });
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Items required." });

    try {
      const { createOrder } = await import("../../lib/store");
      const result = await createOrder({
        restaurantId,
        tableNumber,
        items,
        clientToken,
        customerName: customerName || "",
        customerPhone: customerPhone || "",
      });

      if (result.duplicate) return res.status(409).json({ error: "Order already placed." });
      if (result.error) return res.status(400).json({ error: result.error });

      console.log("Order saved:", result.order.id, "Customer:", customerName, "Phone:", customerPhone);
      return res.status(201).json({ success: true, order: result.order });

    } catch (err) {
      console.error("Order error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    const { restaurantId, startDate, endDate } = req.query;
    if (!restaurantId) return res.status(400).json({ error: "restaurantId required." });
    try {
      const { getOrdersByRestaurant } = await import("../../lib/store");
      const orders = await getOrdersByRestaurant(restaurantId, { startDate, endDate });
      return res.status(200).json({ orders });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PATCH") {
    const { orderId, status } = req.body;
    const validStatuses = ["New", "Preparing", "Ready", "Delivered"];
    if (!orderId) return res.status(400).json({ error: "Order ID required." });
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status." });

    try {
      const { updateOrderStatus } = await import("../../lib/store");
      const updated = await updateOrderStatus(orderId, status);
      if (!updated) return res.status(404).json({ error: "Order not found." });
      return res.status(200).json({ success: true, order: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  res.status(405).end("Method Not Allowed");
}