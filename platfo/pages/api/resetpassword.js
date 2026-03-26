export default async function handler(req, res) {
  if (req.method === "GET") {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required." });
    try {
      const { default: clientPromise } = await import("../../lib/mongodb");
      const client = await clientPromise;
      const db = client.db("restaurant");
      const reset = await db.collection("password_resets").findOne({ token });
      if (!reset) return res.status(400).json({ error: "Invalid or expired link." });
      if (new Date() > new Date(reset.expireAt)) {
        await db.collection("password_resets").deleteOne({ token });
        return res.status(400).json({ error: "Link expired. Please request a new one." });
      }
      return res.status(200).json({ success: true, email: reset.email });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and password required." });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
    try {
      const { default: clientPromise } = await import("../../lib/mongodb");
      const client = await clientPromise;
      const db = client.db("restaurant");
      const reset = await db.collection("password_resets").findOne({ token });
      if (!reset) return res.status(400).json({ error: "Invalid or expired link." });
      if (new Date() > new Date(reset.expireAt)) {
        await db.collection("password_resets").deleteOne({ token });
        return res.status(400).json({ error: "Link expired." });
      }
      const result = await db.collection("restaurants").updateOne(
        { id: reset.restaurantId },
        { $set: { password: newPassword } }
      );
      console.log("Password reset for:", reset.email, "modified:", result.modifiedCount);
      await db.collection("password_resets").deleteOne({ token });
      return res.status(200).json({ success: true, message: "Password reset successfully!" });
    } catch (err) {
      console.error("Reset error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).end();
}
