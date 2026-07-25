const {
  getLeadActivities,
} = require("../services/activityService");


const getActivities = async(req,res)=>{

  try {

    const activities =
      await getLeadActivities(
        req.params.id
      );


    res.json({
      success:true,
      data:activities,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};


module.exports = {
  getActivities,
};