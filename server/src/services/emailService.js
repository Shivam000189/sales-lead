const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Sends an email using configured SMTP or development fallback.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error("Recipient email address ('to') is required");
  }

  const activeTransporter = getTransporter();
  const from = process.env.SMTP_FROM || '"HeroCRM" <no-reply@herocrm.com>';

  if (!activeTransporter) {
    // Development fallback when SMTP credentials are not yet configured in .env
    console.warn(
      `[EmailService:DEV_MODE] SMTP credentials not configured. Mocking email delivery to: ${to} | Subject: "${subject}"`
    );

    return {
      success: true,
      messageId: `mock-${Date.now()}@herocrm.local`,
      isMock: true,
    };
  }

  try {
    const info = await activeTransporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      isMock: false,
    };
  } catch (error) {
    console.error("[EmailService:ERROR] Failed to send email:", error.message);
    throw new Error(`Email transmission failed: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
};
