export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end("Method Not Allowed");
  }

  const { token } = req.query;
  console.log("Verify token received:", token);

  if (!token) {
    return res.status(400).json({ error: "Token is required." });
  }

  try {
    const { verifyRestaurant } = await import("../../lib/store");
    const result = await verifyRestaurant(token);
    console.log("Verify result:", result);

    if (result.error) {
      return res.redirect(
        302,
        "/verify-success?error=" + encodeURIComponent(result.error)
      );
    }

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import("../../lib/email");
      await sendWelcomeEmail({
        to: result.restaurant.email,
        restaurantName: result.restaurant.name,
        username: result.restaurant.username,
        password: result.restaurant.password,
        restaurantId: result.restaurant.id,
      });
    } catch (emailErr) {
      console.log("Welcome email failed:", emailErr.message);
    }

    return res.redirect(
      302,
      "/verify-success?name=" + encodeURIComponent(result.restaurant.name)
    );

  } catch (err) {
    console.error("Verify error:", err);
    return res.redirect(302, "/verify-success?error=Something went wrong");
  }
}