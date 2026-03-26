import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("restaurant");

    const existing = await db.collection("restaurants").findOne({ id: "rest_1" });
    if (existing) {
      return res.status(200).json({
        message: "Already seeded!",
        restaurant: existing.name
      });
    }

    await db.collection("restaurants").insertOne({
      id: "rest_1",
      name: "Platfo",
      username: "Platfo",
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

    await db.collection("counters").insertMany([
      { _id: "restaurantId", seq: 2 },
      { _id: "orderId", seq: 1 },
      { _id: "menuId", seq: 100 },
    ]);

    await db.collection("orders").createIndex({ restaurantId: 1 });
    await db.collection("orders").createIndex({ timestamp: -1 });
    await db.collection("tokens").createIndex(
      { expireAt: 1 },
      { expireAfterSeconds: 0 }
    );

    return res.status(200).json({
      success: true,
      message: "Database seeded successfully!"
    });

  } catch (error) {
    console.error("Seed error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}