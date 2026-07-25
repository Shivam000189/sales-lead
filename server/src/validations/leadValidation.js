const { z } = require("zod");


const leadStatus = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
];


const createLeadSchema = z.object({

  name:z
    .string()
    .min(2,"Name is required"),


  email:z
    .string()
    .email("Invalid email"),


  phone:z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone must contain 10 digits"
    ),


  company:z
    .string()
    .optional(),


  message:z
    .string()
    .optional(),


  status:z
    .enum(leadStatus)
    .optional(),


  assignedTo:z
    .string()
    .optional(),

});



const updateStatusSchema = z.object({

  status:z.enum(leadStatus),

});



const assignLeadSchema = z.object({

  assignedTo:z
    .string()
    .min(1,"User ID required"),

});


module.exports = {
  createLeadSchema,
  updateStatusSchema,
  assignLeadSchema,
};