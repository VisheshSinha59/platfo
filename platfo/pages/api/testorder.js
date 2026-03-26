export default async function handler(req, res) {
  try {
    const { default: clientPromise } = await import("../../lib/mongodb");
    const client = await clientPromise;
    const db = client.db("restaurant");

    // Directly insert order into MongoDB
    const order = {
      id: "TEST-001",
      restaurantId: "rest_1",
      tableNumber: 5,
      items: [{ id: 1, name: "Burger", price: 120, qty: 1, emoji: "🍔" }],
      subtotal: 120,
      gst: 22,
      total: 142,
      status: "New",
      timestamp: new Date().toISOString(),
    };

    await db.collection("orders").insertOne(order);

    const orders = await db.collection("orders").find({}).toArray();

    return res.status(200).json({
      success: true,
      message: "Order inserted directly!",
      ordersInDB: orders.length,
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
