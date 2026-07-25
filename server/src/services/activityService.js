const Activity = require("../models/Activity");


const createActivity = async (
  leadId,
  action,
  userId
) => {

  return await Activity.create({
    leadId,
    action,
    performedBy: userId,
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