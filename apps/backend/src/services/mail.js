const nodemailer = require("nodemailer");
const { env } = require("../config/env");

function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_FROM);
}

/**
 * Sends password reset email when SMTP_* env vars are set.
 * If not configured: logs reset URL in non-production; in production logs a warning only.
 */
async function sendPasswordResetEmail(toEmail, resetUrl) {
  if (!isSmtpConfigured()) {
    if (env.NODE_ENV !== "production") {
      console.warn("[mail] SMTP not configured; password reset link (dev):", resetUrl);
    } else {
      console.warn(
        "[mail] SMTP not configured; set SMTP_HOST, SMTP_FROM, and auth vars to send reset emails."
      );
    }
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } } : {}),
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: toEmail,
    subject: "Reset your Voxvertex Connect password",
    text: `Reset your password (link expires in 1 hour):\n\n${resetUrl}\n`,
    html: `<p>Reset your password (link expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  return { sent: true };
}

module.exports = { sendPasswordResetEmail, isSmtpConfigured };
