const Lead = require("../models/Lead");
const User = require("../models/User");
const Activity = require("../models/Activity");

const getDashboardStats = async () => {
  const [
    totalLeads,
    newLeads,
    contactedLeads,
    qualifiedLeads,
    proposalSentLeads,
    wonLeads,
    lostLeads,
    recentActivities,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: "NEW" }),
    Lead.countDocuments({ status: "CONTACTED" }),
    Lead.countDocuments({ status: "QUALIFIED" }),
    Lead.countDocuments({ status: "PROPOSAL_SENT" }),
    Lead.countDocuments({ status: "WON" }),
    Lead.countDocuments({ status: "LOST" }),
    Activity.find()
      .populate("performedBy", "name")
      .populate("leadId", "name")
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  // Leads assigned per user
  const assignedLeads = await Lead.aggregate([
    {
      $match: {
        assignedTo: {
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        total: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 0,
        user: "$user.name",
        email: "$user.email",
        total: 1,
      },
    },
  ]);

  // Monthly lead creation
  const monthlyLeads = await Lead.aggregate([
    {
      $group: {
        _id: {
          month: {
            $month: "$createdAt",
          },
          year: {
            $year: "$createdAt",
          },
        },
        total: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        year: "$_id.year",
        total: 1,
      },
    },
  ]);

  return {
    totalLeads,
    new: newLeads,
    contacted: contactedLeads,
    qualified: qualifiedLeads,
    proposalSent: proposalSentLeads,
    won: wonLeads,
    lost: lostLeads,
    recentActivities,
    assignedLeads,
    monthlyLeads,
  };
};

module.exports = {
  getDashboardStats,
};
