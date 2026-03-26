export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });
  try {
    const { default: clientPromise } = await import("../../lib/mongodb");
    const client = await clientPromise;
    const db = client.db("restaurant");
    const restaurant = await db.collection("restaurants").findOne({ email: email.trim().toLowerCase() });
    if (!restaurant) {
      return res.status(200).json({ success: true, message: "If this email is registered, a reset link has been sent." });
    }
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expireAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.collection("password_resets").deleteMany({ email: email.trim().toLowerCase() });
    await db.collection("password_resets").insertOne({ email: email.trim().toLowerCase(), restaurantId: restaurant.id, token, expireAt, createdAt: new Date() });
    const resetUrl = process.env.APP_URL + "/reset-password?token=" + token;
    const { sendResetEmail } = await import("../../lib/email");
    await sendResetEmail({ to: email, restaurantName: restaurant.name, resetUrl });
    return res.status(200).json({ success: true, message: "Reset link sent to your email!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
