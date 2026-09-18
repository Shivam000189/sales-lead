const {
  getScheduledActivities,
  createScheduledActivity,
  updateScheduledActivity,
  deleteScheduledActivity,
} = require("../services/scheduledActivityService");
const {
  createScheduledActivitySchema,
  updateScheduledActivitySchema,
} = require("../validations/scheduledActivityValidation");

const list = async (req, res) => {
  try {
    const { from, to, leadId, contactId, completed, type } = req.query;
    const activities = await getScheduledActivities({
      from,
      to,
      leadId,
      contactId,
      completed,
      type,
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const parsed = createScheduledActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((i) => i.message),
      });
    }

    const activity = await createScheduledActivity(parsed.data, req.user.id);
    res.status(201).json({
      success: true,
      message: "Activity scheduled successfully",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const parsed = updateScheduledActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((i) => i.message),
      });
    }

    const activity = await updateScheduledActivity(req.params.id, parsed.data);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Scheduled activity not found",
      });
    }

    res.json({
      success: true,
      message: "Scheduled activity updated successfully",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const activity = await deleteScheduledActivity(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Scheduled activity not found",
      });
    }

    res.json({
      success: true,
      message: "Scheduled activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  list,
  create,
  update,
  remove,
};
