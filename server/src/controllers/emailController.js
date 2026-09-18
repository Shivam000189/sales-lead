const Lead = require("../models/Lead");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const { createActivity } = require("../services/activityService");
const { buildLeadEmailHtml } = require("../utils/emailTemplates");
const { emitLeadActivityAdded } = require("../services/socketEvents");

const sendLeadEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Role-based ownership check:
    // Admin can email any lead; Member can only email leads assigned to them.
    const isOwner = lead.assignedTo?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only email leads assigned to you",
      });
    }

    if (!lead.email) {
      return res.status(400).json({
        success: false,
        message: "This lead does not have a valid email address",
      });
    }

    // Retrieve sender's display name
    const sender = await User.findById(req.user.id).select("name");
    const senderName = sender?.name || "The HeroCRM Team";

    const html = buildLeadEmailHtml({
      subject,
      message,
      leadName: lead.name,
      senderName,
    });

    // Attempt email dispatch
    await sendEmail({
      to: lead.email,
      subject,
      html,
      text: message,
    });

    // Record activity only upon successful delivery
    const activity = await createActivity(
      lead._id,
      `Email sent: ${subject}`,
      req.user.id,
      "EMAIL_SENT"
    );

    await activity.populate("performedBy", "name email role");

    emitLeadActivityAdded(lead._id, activity);

    return res.status(200).json({
      success: true,
      message: `Email sent to ${lead.email} successfully`,
      data: activity,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
};

module.exports = {
  sendLeadEmail,
};
