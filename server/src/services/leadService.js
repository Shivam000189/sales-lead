const Lead = require("../models/Lead");
const { createActivity } = require("./activityService");
const { runWorkflowsForStatusChange } = require("./workflowService");
const { autoConvertLeadToContact } = require("./contactService");

// Create Lead
const createLead = async (data, userId) => {
  const lead = await Lead.create(data);

  // Public submissions have no authenticated actor to associate with an activity.
  if (userId) {
    await createActivity(lead._id, "Lead Created", userId, "LEAD_CREATED");
  }

  return lead;
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
    sortBy = "createdAt",
    sortOrder = "desc",
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
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const leads = await Lead.find(filter)
    .populate("assignedTo", "name email role")
    .sort(sort)
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
  return await Lead.findById(id).populate("assignedTo", "name email role");
};

// Update Lead
const updateLead = async (id, data) => {
  return await Lead.findByIdAndUpdate(id, data, {
    new: true,
  });
};

const updateLeadStatus = async (leadId, status, userId) => {
  const lead = await Lead.findByIdAndUpdate(
    leadId,
    {
      status,
    },
    {
      new: true,
    }
  );

  if (lead) {
    await createActivity(
      leadId,
      `Status Changed to ${status}`,
      userId,
      "STATUS_CHANGE"
    );

    // Auto-convert lead into a customer Contact when reaching WON
    if (status === "WON") {
      await autoConvertLeadToContact(lead, userId);
    }

    // Trigger rule-based automation workflows asynchronously (non-blocking)
    runWorkflowsForStatusChange(lead, status, userId).catch((err) => {
      console.error("[LeadService] Error running workflows on status change:", err.message);
    });
  }

  return lead;
};

const assignLead = async (leadId, userId, performedBy) => {
  const lead = await Lead.findByIdAndUpdate(
    leadId,
    {
      assignedTo: userId,
    },
    {
      new: true,
    }
  );

  if (lead) {
    await createActivity(leadId, "Lead Assigned", performedBy, "ASSIGNED");
  }

  return lead;
};

// Delete Lead
const deleteLead = async (leadId, userId) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    return null;
  }

  if (userId) {
    await createActivity(leadId, "Lead Deleted", userId, "LEAD_DELETED");
  }

  await Lead.findByIdAndDelete(leadId);

  return lead;
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  assignLead,
  deleteLead,
};
