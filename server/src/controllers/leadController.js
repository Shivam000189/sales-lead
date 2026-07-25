const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require("../services/leadService");


// Create Lead
const create = async (req, res) => {
  try {

    const lead = await createLead(req.body);

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



// Delete Lead
const remove = async(req,res)=>{

  try{

    const lead = await deleteLead(req.params.id);


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
  remove,
};