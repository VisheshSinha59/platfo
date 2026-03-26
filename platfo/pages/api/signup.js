export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { name, username, password, email, tableCount } = req.body;
    console.log("Signup request:", { name, username, email });

    if (!name || !username || !password || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const { createPendingRestaurant } = await import("../../lib/store");
    const result = await createPendingRestaurant({ name, username, password, email, tableCount });

    console.log("Pending restaurant result:", result);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const { sendVerificationEmail } = await import("../../lib/email");
    const emailResult = await sendVerificationEmail({
      to: email,
      restaurantName: name,
      username,
      verificationToken: result.pending.token,
    });

    console.log("Email result:", emailResult);

    if (!emailResult.success) {
      return res.status(500).json({ error: "Failed to send email: " + emailResult.error });
    }

    return res.status(201).json({
      success: true,
      message: "Verification email sent!",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message });
  }
}