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
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">${escapeHtml(
          p
        ).replace(/\n/g, "<br/>")}</p>`
    )
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

/**
 * Predefined workflow templates catalog mapped to trigger statuses.
 */
const WORKFLOW_TEMPLATES = {
  won_welcome: {
    key: "won_welcome",
    name: "Customer Onboarding & Welcome",
    triggerStatus: "WON",
    defaultSubject: "Welcome to HeroCRM! Next Steps",
    description: "Welcomes newly closed clients and initiates onboarding",
    buildMessage: (lead) =>
      `We're thrilled to welcome ${lead.company ? `${lead.company} and ` : ""}you as an official partner!\n\nOur customer success team is already preparing your account and onboarding resources. A dedicated representative will reach out shortly with access credentials and an introduction call invite.\n\nThank you for choosing HeroCRM to grow your business.`,
  },
  proposal_followup: {
    key: "proposal_followup",
    name: "Proposal Review Follow-up",
    triggerStatus: "PROPOSAL_SENT",
    defaultSubject: "Following up on your HeroCRM Proposal",
    description: "Follows up after sending a proposal to answer questions",
    buildMessage: (lead) =>
      `Thank you again for taking the time to review our proposal for ${lead.company || "your team"}.\n\nWe wanted to follow up and see if you had any questions regarding our recommended scope, implementation timeline, or pricing tiers.\n\nPlease let us know if you would like to schedule a quick 15-minute review session to address any feedback.`,
  },
  qualified_intro: {
    key: "qualified_intro",
    name: "Discovery Call Invitation",
    triggerStatus: "QUALIFIED",
    defaultSubject: "Next steps with HeroCRM: Scheduling your discovery call",
    description: "Invites qualified prospects to schedule a discovery demo",
    buildMessage: (lead) =>
      `Great news — your requirements match perfectly with the solutions we provide at HeroCRM.\n\nWe'd love to schedule a focused discovery call to dive deeper into your team's workflow and demonstrate how our platform can accelerate your sales pipeline.\n\nPlease reply with a few times that work best for you this week.`,
  },
  contact_touchpoint: {
    key: "contact_touchpoint",
    name: "Meeting Touchpoint Recap",
    triggerStatus: "CONTACTED",
    defaultSubject: "Great connecting with you today",
    description: "Sends a quick touchpoint note after initial contact",
    buildMessage: (lead) =>
      `Thank you for taking a few moments to connect with us today.\n\nIt was great learning more about ${lead.company || "your organization"} and your current objectives. We're assembling some relevant case studies and will follow up shortly with actionable recommendations.\n\nLooking forward to our continued conversation.`,
  },
  lead_acknowledgment: {
    key: "lead_acknowledgment",
    name: "Immediate Inquiry Receipt",
    triggerStatus: "NEW",
    defaultSubject: "Thank you for reaching out to HeroCRM",
    description: "Confirms receipt of new inbound lead submission",
    buildMessage: (lead) =>
      `Thanks for getting in touch with us!\n\nWe have successfully received your inquiry and our team has assigned a dedicated specialist to review your request. We will be in touch shortly to assist you.\n\nIn the meantime, feel free to explore our product guides and documentation.`,
  },
  lost_nurture: {
    key: "lost_nurture",
    name: "Nurture & Feedback Touchpoint",
    triggerStatus: "LOST",
    defaultSubject: "Staying in touch with HeroCRM",
    description: "Maintains goodwill with closed-lost leads for future re-engagement",
    buildMessage: (lead) =>
      `Thank you for considering HeroCRM for ${lead.company || "your business"}.\n\nWhile the timing may not be right today, we truly appreciated the opportunity to connect and understand your needs. We'd love to stay in touch and share product updates or relevant industry insights as your initiatives evolve.\n\nWishing you continued success.`,
  },
};

/**
 * Returns available workflow templates list for API and UI dropdowns.
 */
const getAvailableWorkflowTemplates = () => {
  return Object.values(WORKFLOW_TEMPLATES).map((tmpl) => ({
    key: tmpl.key,
    name: tmpl.name,
    triggerStatus: tmpl.triggerStatus,
    defaultSubject: tmpl.defaultSubject,
    description: tmpl.description,
  }));
};

/**
 * Renders an email based on a registered template key and lead object.
 */
const renderWorkflowEmail = ({
  templateKey,
  lead,
  senderName = "HeroCRM Automations",
}) => {
  const template = WORKFLOW_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unknown workflow email template key: "${templateKey}"`);
  }

  const subject = template.defaultSubject;
  const message = template.buildMessage(lead);
  const html = buildLeadEmailHtml({
    subject,
    message,
    leadName: lead.name,
    senderName,
  });

  return {
    subject,
    message,
    html,
    text: `${subject}\n\nHi ${lead.name || "there"},\n\n${message}\n\nBest regards,\n${senderName}`,
  };
};

module.exports = {
  buildLeadEmailHtml,
  WORKFLOW_TEMPLATES,
  getAvailableWorkflowTemplates,
  renderWorkflowEmail,
};
