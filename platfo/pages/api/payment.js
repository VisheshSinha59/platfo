import Razorpay from "razorpay";
import { getRestaurantById } from "../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { restaurantId, amount } = req.body;
  if (!restaurantId || !amount) {
    return res.status(400).json({ error: "restaurantId and amount required." });
  }

  try {
    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found." });

    const keyId = restaurant.razorpayKeyId;
    const keySecret = restaurant.razorpayKeySecret;

    if (!keyId || !keySecret) {
      return res.status(400).json({ error: "Restaurant has not set up payment. Please pay by cash." });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "platfo_" + Date.now(),
    });

    return res.status(200).json({ success: true, order, keyId });
  } catch (err) {
    console.error("Payment error:", err);
    return res.status(500).json({ error: err.message });
  }
}
