const {
  createNote,
  getNotesByLead,
  deleteNote,
} = require("../services/noteService");


// Create Note
const create = async (req, res) => {

  try {

    const { text } = req.body;


    if (!text) {
      return res.status(400).json({
        success:false,
        message:"Note text is required",
      });
    }


    const note = await createNote(
      req.params.id,
      req.user.id,
      text
    );


    res.status(201).json({
      success:true,
      message:"Note created successfully",
      data:note,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};



// Get Notes
const getAll = async (req,res)=>{

  try {

    const notes = await getNotesByLead(
      req.params.id
    );


    res.json({
      success:true,
      data:notes,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};



// Delete Note
const remove = async(req,res)=>{

  try {

    const note = await deleteNote(
      req.params.id
    );


    if(!note){
      return res.status(404).json({
        success:false,
        message:"Note not found",
      });
    }


    res.json({
      success:true,
      message:"Note deleted successfully",
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};


module.exports = {
  create,
  getAll,
  remove,
};  