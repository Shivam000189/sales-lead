const Contact = require("../models/Contact");

/**
 * Automatically converts a Lead to a Contact when lead status becomes WON.
 * Idempotent check ensures no duplicates are created.
 */
const autoConvertLeadToContact = async (lead, userId) => {
  if (!lead || !lead._id) return null;

  try {
    const existing = await Contact.findOne({ convertedFromLead: lead._id });
    if (existing) {
      return existing;
    }

    const assignedId = lead.assignedTo?._id || lead.assignedTo || null;

    const contact = await Contact.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || "",
      convertedFromLead: lead._id,
      assignedTo: assignedId,
    });

    console.log(
      `[ContactService] Lead "${lead.name}" (${lead._id}) successfully converted to Contact (${contact._id})`
    );

    return contact;
  } catch (error) {
    console.error(
      `[ContactService] Error converting lead ${lead._id} to contact:`,
      error.message
    );
    return null;
  }
};

/**
 * Query contacts with pagination, search, and assigned filters.
 */
const getContacts = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    assignedTo,
    company,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (company) {
    filter.company = { $regex: company, $options: "i" };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const contacts = await Contact.find(filter)
    .populate("assignedTo", "name email role")
    .populate("convertedFromLead", "name email company status")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Contact.countDocuments(filter);

  return {
    contacts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get single contact by ID with populated references.
 */
const getContactById = async (id) => {
  return await Contact.findById(id)
    .populate("assignedTo", "name email role")
    .populate("convertedFromLead", "name email phone company status createdAt");
};

/**
 * Update contact details.
 */
const updateContact = async (id, data) => {
  return await Contact.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("assignedTo", "name email role")
    .populate("convertedFromLead", "name email phone company status");
};

/**
 * Delete a contact by ID.
 */
const deleteContact = async (id) => {
  return await Contact.findByIdAndDelete(id);
};

module.exports = {
  autoConvertLeadToContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
};
