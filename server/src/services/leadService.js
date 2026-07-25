const Lead = require("../models/Lead");


// Create Lead
const createLead = async (data) => {
  return await Lead.create(data);
};


// Get All Leads
const getLeads = async (query) => {

  const {
    page = 1,
    limit = 10,
    status,
    assignedTo,
    search,
    company,
  } = query;


  const filter = {};


  
  if (status) {
    filter.status = status;
  }


  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }


  if (company) {
    filter.company = {
      $regex: company,
      $options: "i",
    };
  }



  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        company: {
          $regex: search,
          $options: "i",
        },
      },
      {
        message: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }


  const skip = (page - 1) * limit;


  const leads = await Lead.find(filter)
    .populate("assignedTo", "name email role")
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(Number(limit));


  const total = await Lead.countDocuments(filter);


  return {
    leads,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};


// Get Single Lead
const getLeadById = async (id) => {
  return await Lead.findById(id)
    .populate("assignedTo", "name email role");
};


// Update Lead
const updateLead = async (id, data) => {
  return await Lead.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
    }
  );
};

const updateLeadStatus = async (leadId, status) => {

  const lead = await Lead.findByIdAndUpdate(
    leadId,
    {
      status,
    },
    {
      new: true,
    }
  )
  .populate("assignedTo", "name email role");


  return lead;
};


const assignLead = async (leadId, userId) => {

  const lead = await Lead.findByIdAndUpdate(
    leadId,
    {
      assignedTo: userId,
    },
    {
      new: true,
    }
  )
  .populate("assignedTo", "name email role");


  return lead;
};



// Delete Lead
const deleteLead = async (id) => {
  return await Lead.findByIdAndDelete(id);
};


module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLead,
  assignLead,
  deleteLead,
};