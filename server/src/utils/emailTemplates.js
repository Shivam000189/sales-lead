const escapeHtml = (unsafe = "") => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Builds a clean, responsive, branded HTML email template for outbound lead communication.
 */
const buildLeadEmailHtml = ({
  subject = "",
  message = "",
  leadName = "",
  senderName = "The HeroCRM Team",
}) => {
  const safeLeadName = escapeHtml(leadName || "there");
  const safeSenderName = escapeHtml(senderName);
  const safeSubject = escapeHtml(subject);

  // Split lines and format paragraphs cleanly
  const paragraphs = message
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0f172a, #1e293b); color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
                    <span style="display: inline-block; background: #6366f1; color: #ffffff; width: 28px; height: 28px; line-height: 28px; text-align: center; border-radius: 6px; margin-right: 8px; font-weight: 800;">H</span> HeroCRM
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px; font-size: 15px; color: #334155;">
              <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Hi ${safeLeadName},</p>
              
              ${paragraphs || `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">${escapeHtml(message)}</p>`}

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">Best regards,</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${safeSenderName}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">Sent via <strong>HeroCRM</strong> · Keep every conversation moving forward.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

module.exports = {
  buildLeadEmailHtml,
};
