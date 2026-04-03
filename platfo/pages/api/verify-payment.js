import crypto from "crypto";
import { getRestaurantById } from "../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { restaurantId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!restaurantId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "All payment fields required." });
  }

  try {
    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found." });

    const keySecret = restaurant.razorpayKeySecret;
    if (!keySecret) return res.status(400).json({ error: "Payment not configured." });

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true, paymentId: razorpay_payment_id });
    } else {
      return res.status(400).json({ error: "Payment verification failed." });
    }
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: err.message });
  }
}
