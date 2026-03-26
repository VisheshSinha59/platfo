export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token required." });
  }

  try {
    const { verifyRestaurant } = await import("../../lib/store");
    const result = await verifyRestaurant(token);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ success: true, restaurant: result.restaurant });

  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: err.message });
  }
}
