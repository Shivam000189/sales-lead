const Lead = require("../models/Lead");
const User = require("../models/User");


const getDashboardStats = async () => {

  const totalLeads = await Lead.countDocuments();


  const newLeads = await Lead.countDocuments({
    status: "NEW",
  });


  const qualifiedLeads = await Lead.countDocuments({
    status: "QUALIFIED",
  });


  const wonLeads = await Lead.countDocuments({
    status: "WON",
  });


  const lostLeads = await Lead.countDocuments({
    status: "LOST",
  });



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
    qualified: qualifiedLeads,
    won: wonLeads,
    lost: lostLeads,
    assignedLeads,
    monthlyLeads,
  };

};


module.exports = {
  getDashboardStats,
};