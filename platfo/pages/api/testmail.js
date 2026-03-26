export default async function handler(req, res) {
  try {
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.verify();

    return res.status(200).json({
      success: true,
      message: "Gmail connected!",
      user: process.env.GMAIL_USER,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      user: process.env.GMAIL_USER,
    });
  }
}
