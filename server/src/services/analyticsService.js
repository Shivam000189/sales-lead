const Lead = require("../models/Lead");
const User = require("../models/User");

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"];

/**
 * Funnel metrics: Lead count and proportion across all pipeline stages
 */
const getFunnelMetrics = async () => {
  const aggregated = await Lead.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  STAGES.forEach((s) => {
    countMap[s] = 0;
  });

  let totalLeads = 0;
  aggregated.forEach((item) => {
    if (item._id && countMap[item._id] !== undefined) {
      countMap[item._id] = item.count;
    }
    totalLeads += item.count;
  });

  const stages = STAGES.map((stage) => ({
    stage,
    label: stage.replace("_", " "),
    count: countMap[stage] || 0,
    percentage: totalLeads > 0 ? Number(((countMap[stage] / totalLeads) * 100).toFixed(1)) : 0,
  }));

  return {
    totalLeads,
    stages,
  };
};

/**
 * Conversion rate metrics: overall conversion and stage progression
 */
const getConversionRateMetrics = async () => {
  const aggregated = await Lead.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  STAGES.forEach((s) => {
    countMap[s] = 0;
  });

  let totalLeads = 0;
  aggregated.forEach((item) => {
    if (item._id && countMap[item._id] !== undefined) {
      countMap[item._id] = item.count;
    }
    totalLeads += item.count;
  });

  const wonLeads = countMap.WON || 0;
  const lostLeads = countMap.LOST || 0;
  const inProgressLeads =
    (countMap.NEW || 0) +
    (countMap.CONTACTED || 0) +
    (countMap.QUALIFIED || 0) +
    (countMap.PROPOSAL_SENT || 0);

  const overallConversionRate =
    totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;

  // Progression funnel (active to won)
  const progressionOrder = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON"];
  const stageBreakdown = progressionOrder.map((stage, idx) => {
    const currentCount = countMap[stage] || 0;
    const prevStage = idx > 0 ? progressionOrder[idx - 1] : null;
    const prevCount = prevStage ? countMap[prevStage] || 0 : 0;
    const dropOff =
      prevCount > 0 && currentCount < prevCount
        ? Number((((prevCount - currentCount) / prevCount) * 100).toFixed(1))
        : 0;

    return {
      stage,
      label: stage.replace("_", " "),
      count: currentCount,
      percentageOfTotal: totalLeads > 0 ? Number(((currentCount / totalLeads) * 100).toFixed(1)) : 0,
      dropOff,
    };
  });

  return {
    totalLeads,
    wonLeads,
    lostLeads,
    inProgressLeads,
    overallConversionRate,
    stageBreakdown,
  };
};

/**
 * Team member performance metrics
 */
const getMemberPerformance = async () => {
  const memberMetrics = await Lead.aggregate([
    {
      $group: {
        _id: "$assignedTo",
        total: { $sum: 1 },
        won: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
        inProgress: {
          $sum: {
            $cond: [
              { $in: ["$status", ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT"]] },
              1,
              0,
            ],
          },
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
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        userId: "$_id",
        userName: { $ifNull: ["$user.name", "Unassigned"] },
        userEmail: { $ifNull: ["$user.email", ""] },
        userRole: { $ifNull: ["$user.role", ""] },
        total: 1,
        won: 1,
        lost: 1,
        inProgress: 1,
        conversionRate: {
          $cond: [
            { $gt: ["$total", 0] },
            { $round: [{ $multiply: [{ $divide: ["$won", "$total"] }, 100] }, 1] },
            0,
          ],
        },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  // Ensure all registered users are represented even if 0 leads assigned
  const allUsers = await User.find().select("_id name email role").lean();
  const resultMap = new Map();

  memberMetrics.forEach((m) => {
    const key = m.userId ? m.userId.toString() : "unassigned";
    resultMap.set(key, m);
  });

  allUsers.forEach((user) => {
    const key = user._id.toString();
    if (!resultMap.has(key)) {
      resultMap.set(key, {
        _id: user._id,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        total: 0,
        won: 0,
        lost: 0,
        inProgress: 0,
        conversionRate: 0,
      });
    }
  });

  const sortedMembers = Array.from(resultMap.values()).sort((a, b) => b.total - a.total);

  return {
    members: sortedMembers,
  };
};

/**
 * Lead creation and win volume timeseries grouped by week or month
 */
const getLeadTimeseries = async ({ range = "week", from, to } = {}) => {
  const match = {};

  if (from || to) {
    match.createdAt = {};
    if (from) {
      match.createdAt.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      if (!to.includes("T")) {
        toDate.setHours(23, 59, 59, 999);
      }
      match.createdAt.$lte = toDate;
    }
  }

  const format = range === "month" ? "%Y-%m" : "%Y-W%V";

  const timeseries = await Lead.aggregate([
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    {
      $group: {
        _id: {
          $dateToString: {
            format,
            date: "$createdAt",
          },
        },
        created: { $sum: 1 },
        won: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        period: "$_id",
        created: 1,
        won: 1,
        lost: 1,
      },
    },
  ]);

  return {
    range,
    data: timeseries,
  };
};

module.exports = {
  getFunnelMetrics,
  getConversionRateMetrics,
  getMemberPerformance,
  getLeadTimeseries,
};
