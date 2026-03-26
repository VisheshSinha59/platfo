import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("restaurant");

    const restaurants = await db.collection("restaurants").find({}).toArray();
    const orders = await db.collection("orders").find({}).toArray();
    const counters = await db.collection("counters").find({}).toArray();

    return res.status(200).json({
      connected: true,
      databaseName: db.databaseName,
      restaurants: restaurants.length,
      orders: orders.length,
      counters,
      latestOrder: orders[0] || null,
      restaurantNames: restaurants.map((r) => r.name),
    });

  } catch (error) {
    return res.status(500).json({
      connected: false,
      error: error.message
    });
  }
}



