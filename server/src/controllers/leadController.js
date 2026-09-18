const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  assignLead,
  deleteLead,
} = require("../services/leadService");
const Activity = require("../models/Activity");
const User = require("../models/User");
const {
  emitLeadStatusChanged,
  emitLeadAssigned,
} = require("../services/socketEvents");


// Create Lead
const create = async (req, res) => {
  try {

    const lead = await createLead(req.body, req.user?.id);

    res.status(201).json({
      success:true,
      message:"Lead created successfully",
      data:lead,
    });

  } catch(error){

    res.status(400).json({
      success:false,
      message:error.message,
    });

  }
};



// Get All Leads
const getAll = async (req, res) => {

  try {

    const result = await getLeads(req.query);


    res.json({
      success: true,
      ...result,
    });


  } catch(error) {

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};



// Get Single Lead
const getOne = async(req,res)=>{

  try{

    const lead = await getLeadById(req.params.id);


    if(!lead){
      return res.status(404).json({
        success:false,
        message:"Lead not found",
      });
    }


    res.json({
      success:true,
      data:lead,
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};


const assign = async (req, res) => {

  try {

    const { assignedTo } = req.body;


    if (!assignedTo) {
      return res.status(400).json({
        success:false,
        message:"assignedTo is required",
      });
    }


    const lead = await assignLead(
      req.params.id,
      assignedTo,
      req.user.id
    );


    if (!lead) {
      return res.status(404).json({
        success:false,
        message:"Lead not found",
      });
    }

    await lead.populate("assignedTo", "name email role");

    const activity = await Activity.findOne({ leadId: lead._id })
      .sort({ createdAt: -1 })
      .populate("performedBy", "name email role");

    const assigner = await User.findById(req.user.id).select("name");
    emitLeadAssigned(lead._id, lead, assignedTo, activity, assigner?.name);

    res.json({
      success:true,
      message:"Lead assigned successfully",
      data:lead,
    });


  } catch(error) {

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Update Lead
const update = async(req,res)=>{

  try{

    const lead = await updateLead(
      req.params.id,
      req.body
    );


    if(!lead){
      return res.status(404).json({
        success:false,
        message:"Lead not found",
      });
    }


    res.json({
      success:true,
      message:"Lead updated successfully",
      data:lead,
    });


  }catch(error){

    res.status(400).json({
      success:false,
      message:error.message,
    });

  }

};


const updateStatus = async (req, res) => {

  try {

    const { status } = req.body;


    const allowedStatus = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "WON",
      "LOST",
    ];


    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status",
      });
    }


    const lead = await updateLeadStatus(
      req.params.id,
      status,
      req.user.id
    );


    if (!lead) {
      return res.status(404).json({
        success:false,
        message:"Lead not found",
      });
    }

    await lead.populate("assignedTo", "name email role");

    const activity = await Activity.findOne({ leadId: lead._id })
      .sort({ createdAt: -1 })
      .populate("performedBy", "name email role");

    emitLeadStatusChanged(lead._id, lead, activity);

    res.json({
      success:true,
      message:"Lead status updated successfully",
      data:lead,
    });


  } catch(error) {

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};


// Delete Lead
const remove = async(req,res)=>{

  try{

    const lead = await deleteLead(req.params.id, req.user?.id);


    if(!lead){
      return res.status(404).json({
        success:false,
        message:"Lead not found",
      });
    }


    res.json({
      success:true,
      message:"Lead deleted successfully",
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};



module.exports = {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  assign,
  remove,
};
