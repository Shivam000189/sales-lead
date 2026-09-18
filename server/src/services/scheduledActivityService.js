const ScheduledActivity = require("../models/ScheduledActivity");

/**
 * Retrieves scheduled activities by date range or linked lead/contact.
 */
const getScheduledActivities = async (query = {}) => {
  const { from, to, leadId, contactId, completed, type } = query;
  const filter = {};

  if (from || to) {
    filter.scheduledFor = {};
    if (from) {
      filter.scheduledFor.$gte = new Date(from);
    }
    if (to) {
      filter.scheduledFor.$lte = new Date(to);
    }
  }

  if (leadId) {
    filter.relatedLead = leadId;
  }

  if (contactId) {
    filter.relatedContact = contactId;
  }

  if (completed !== undefined) {
    filter.completed = completed === "true" || completed === true;
  }

  if (type) {
    filter.type = type;
  }

  return await ScheduledActivity.find(filter)
    .populate("relatedLead", "name email company phone status")
    .populate("relatedContact", "name email company phone")
    .populate("createdBy", "name email role")
    .sort({ scheduledFor: 1 });
};

/**
 * Create a new scheduled call or meeting.
 */
const createScheduledActivity = async (data, userId) => {
  const activity = await ScheduledActivity.create({
    ...data,
    createdBy: userId,
  });

  return await ScheduledActivity.findById(activity._id)
    .populate("relatedLead", "name email company phone status")
    .populate("relatedContact", "name email company phone")
    .populate("createdBy", "name email role");
};

/**
 * Update an existing scheduled activity (e.g. mark complete or reschedule).
 */
const updateScheduledActivity = async (id, data) => {
  const updatePayload = { ...data };

  if (data.completed === true) {
    updatePayload.completedAt = new Date();
  } else if (data.completed === false) {
    updatePayload.completedAt = null;
  }

  return await ScheduledActivity.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .populate("relatedLead", "name email company phone status")
    .populate("relatedContact", "name email company phone")
    .populate("createdBy", "name email role");
};

/**
 * Delete / cancel a scheduled activity.
 */
const deleteScheduledActivity = async (id) => {
  return await ScheduledActivity.findByIdAndDelete(id);
};

module.exports = {
  getScheduledActivities,
  createScheduledActivity,
  updateScheduledActivity,
  deleteScheduledActivity,
};
