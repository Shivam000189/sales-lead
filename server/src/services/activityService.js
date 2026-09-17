const Activity = require("../models/Activity");


const createActivity = async (
  leadId,
  action,
  userId,
  type = "STATUS_CHANGE"
) => {

  return await Activity.create({
    leadId,
    action,
    performedBy: userId,
    type,
  });

};



const getLeadActivities = async (leadId) => {

  return await Activity.find({
    leadId,
  })
  .populate(
    "performedBy",
    "name email role"
  )
  .sort({
    createdAt:-1,
  });

};



module.exports = {
  createActivity,
  getLeadActivities,
};