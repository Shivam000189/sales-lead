const WorkflowRule = require("../models/WorkflowRule");
const Activity = require("../models/Activity");
const { sendEmail } = require("./emailService");
const { renderWorkflowEmail } = require("../utils/emailTemplates");
const { createActivity } = require("./activityService");

/**
 * Executes active workflow rules triggered by a lead status change.
 * Wrapped with 1-hour anti-spam deduplication and per-rule error boundaries.
 */
const runWorkflowsForStatusChange = async (lead, newStatus, userId) => {
  if (!lead || !lead.email) {
    console.warn(
      `[WorkflowService] Lead has no email address. Skipping automated workflows for lead: ${lead?._id}`
    );
    return [];
  }

  try {
    const rules = await WorkflowRule.find({
      triggerStatus: newStatus,
      isActive: true,
    });

    if (!rules || rules.length === 0) {
      return [];
    }

    const results = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const rule of rules) {
      try {
        // Anti-spam deduplication guard: avoid firing identical rule for same lead within 60 mins
        const recentActivity = await Activity.findOne({
          leadId: lead._id,
          type: "WORKFLOW_TRIGGERED",
          action: rule.name,
          createdAt: { $gte: oneHourAgo },
        });

        if (recentActivity) {
          console.log(
            `[WorkflowService] Deduplication: Rule "${rule.name}" already fired for lead ${lead._id} within the last hour. Skipping.`
          );
          continue;
        }

        if (rule.action === "SEND_EMAIL") {
          const emailData = renderWorkflowEmail({
            templateKey: rule.emailTemplateKey,
            lead,
            senderName: "HeroCRM Automations",
          });

          await sendEmail({
            to: lead.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          });

          const actor =
            userId ||
            lead.assignedTo?._id ||
            lead.assignedTo ||
            rule.createdBy;

          const activity = await createActivity(
            lead._id,
            rule.name,
            actor,
            "WORKFLOW_TRIGGERED"
          );

          console.log(
            `[WorkflowService] Rule "${rule.name}" successfully executed for lead ${lead._id} (${lead.email})`
          );

          results.push({
            ruleId: rule._id,
            ruleName: rule.name,
            status: "EXECUTED",
            activityId: activity?._id,
          });
        }
      } catch (ruleError) {
        console.error(
          `[WorkflowService] Error executing rule "${rule.name}" for lead ${lead._id}:`,
          ruleError.message
        );
      }
    }

    return results;
  } catch (error) {
    console.error(
      `[WorkflowService] Unexpected error querying workflow rules for status "${newStatus}":`,
      error.message
    );
    return [];
  }
};

module.exports = {
  runWorkflowsForStatusChange,
};
