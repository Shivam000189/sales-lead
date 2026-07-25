const express = require("express");

const router = express.Router();
const validate = require("../middleware/validate");


const {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  assign,
  remove,
} = require("../controllers/leadController");

const {
  createLeadSchema,
  updateStatusSchema,
  assignLeadSchema,
} = require("../validations/leadValidation");


const {
  authenticate,
} = require("../middleware/authMiddleware");


const authorize = require("../middleware/authorize");



// Create Lead
router.post(
  "/",
  authenticate,
   validate(createLeadSchema),
  create
);


// View All Leads
router.get(
  "/",
  authenticate,
  getAll
);


// View Single Lead
router.get(
  "/:id",
  authenticate,
  getOne
);


// Update Lead
router.patch(
  "/:id",
  authenticate,
  validate(updateStatusSchema),
  update
);

router.patch(
  "/:id/assign",
  authenticate,
  authorize("admin"),
  validate(assignLeadSchema),
  assign
);

router.patch(
  "/:id/status",
  authenticate,
  updateStatus
);


// Delete Lead (Admin Only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  remove
);



module.exports = router;