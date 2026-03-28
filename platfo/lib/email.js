import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendVerificationEmail({ to, restaurantName, username, verificationToken }) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = appUrl + "/verify?token=" + verificationToken;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#111;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:2rem;font-weight:800;">Platfo</h1>
          <p style="color:#FF3008;margin:8px 0 0;font-weight:600;">Smart Restaurant Platform</p>
        </div>
        <div style="background:#fff;padding:32px;border-left:1px solid #eee;border-right:1px solid #eee;">
          <h2 style="color:#111;margin:0 0 16px;">Verify Your Email</h2>
          <p style="color:#555;margin-bottom:24px;line-height:1.6;">
            Hi <strong>${restaurantName}</strong>! Welcome to Platfo.
            Please verify your email to activate your account.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${verifyUrl}" style="background:#FF3008;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:700;font-size:1rem;display:inline-block;">
              Verify Email Address
            </a>
          </div>
          <div style="background:#FFF5F2;border:2px solid #FFE0D6;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:#555;font-size:0.9rem;"><strong>Your Login Details:</strong></p>
            <p style="margin:0 0 4px;color:#555;font-size:0.9rem;">Username: <strong>${username}</strong></p>
            <p style="margin:0;color:#555;font-size:0.9rem;">Login at: <a href="${appUrl}/admin" style="color:#FF3008;">${appUrl}/admin</a></p>
          </div>
          <p style="color:#aaa;font-size:0.82rem;margin:0;">
            This link expires in 24 hours. If you did not sign up, ignore this email.
          </p>
        </div>
        <div style="background:#111;border-radius:0 0 16px 16px;padding:16px;text-align:center;">
          <p style="color:#aaa;font-size:0.8rem;margin:0;">Powered by Platfo POS</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Platfo POS" <' + process.env.GMAIL_USER + '>',
      to,
      subject: "Verify your email - Welcome to Platfo!",
      html,
    });
    console.log("Verification email sent to:", to);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail({ to, restaurantName, username, password, restaurantId }) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const menuUrl = appUrl + "/menu?restaurantId=" + restaurantId + "&table=1";
  const dashboardUrl = appUrl + "/admin";

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#111;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:2rem;font-weight:800;">Platfo</h1>
          <p style="color:#FF3008;margin:8px 0 0;font-weight:600;">Smart Restaurant Platform</p>
        </div>
        <div style="background:#fff;padding:32px;border-left:1px solid #eee;border-right:1px solid #eee;">
          <h2 style="color:#111;margin:0 0 16px;">Account Activated!</h2>
          <p style="color:#555;margin-bottom:24px;line-height:1.6;">
            Congratulations <strong>${restaurantName}</strong>! Your account is now active.
          </p>
          <div style="background:#FFF5F2;border:2px solid #FFE0D6;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#555;font-size:0.9rem;width:40%;">Restaurant ID:</td>
                <td style="padding:8px 0;font-weight:700;color:#111;">${restaurantId}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#555;font-size:0.9rem;">Username:</td>
                <td style="padding:8px 0;font-weight:700;color:#111;">${username}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#555;font-size:0.9rem;">Password:</td>
                <td style="padding:8px 0;font-weight:700;color:#111;">${password}</td>
              </tr>
            </table>
          </div>
          <a href="${dashboardUrl}" style="display:block;background:#FF3008;color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;text-align:center;margin-bottom:12px;">
            Login to Dashboard
          </a>
          <a href="${menuUrl}" style="display:block;background:#111;color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;text-align:center;">
            View Customer Menu
          </a>
        </div>
        <div style="background:#111;border-radius:0 0 16px 16px;padding:16px;text-align:center;">
          <p style="color:#aaa;font-size:0.8rem;margin:0;">Powered by Platfo POS</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Platfo POS" <' + process.env.GMAIL_USER + '>',
      to,
      subject: "Welcome to Platfo - Your Account is Active!",
      html,
    });
    console.log("Welcome email sent to:", to);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendResetEmail({ to, restaurantName, resetUrl }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#111;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:2rem;font-weight:800;">Platfo</h1>
          <p style="color:#FF3008;margin:8px 0 0;font-weight:600;">Password Reset Request</p>
        </div>
        <div style="background:#fff;padding:32px;border-left:1px solid #eee;border-right:1px solid #eee;">
          <h2 style="color:#111;margin:0 0 16px;">Reset Your Password</h2>
          <p style="color:#555;margin-bottom:24px;line-height:1.6;">
            Hi <strong>${restaurantName}</strong>! Click the button below to reset your password.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${resetUrl}" style="background:#FF3008;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:700;font-size:1rem;display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color:#aaa;font-size:0.82rem;">
            This link expires in 1 hour. If you did not request this, ignore this email.
          </p>
        </div>
        <div style="background:#111;border-radius:0 0 16px 16px;padding:16px;text-align:center;">
          <p style="color:#aaa;font-size:0.8rem;margin:0;">Powered by Platfo POS</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"Platfo POS" <' + process.env.GMAIL_USER + '>',
      to,
      subject: "Reset Your Platfo Password",
      html,
    });
    console.log("Reset email sent to:", to);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}
