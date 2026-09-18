const WorkflowRule = require("../models/WorkflowRule");
const { getAvailableWorkflowTemplates } = require("../utils/emailTemplates");

// Get all workflow rules
const getRules = async (req, res) => {
  try {
    const rules = await WorkflowRule.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available email templates
const getTemplates = (req, res) => {
  try {
    const templates = getAvailableWorkflowTemplates();
    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new workflow rule
const createRule = async (req, res) => {
  try {
    const rule = await WorkflowRule.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await rule.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Workflow rule created successfully",
      data: rule,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update an existing workflow rule
const updateRule = async (req, res) => {
  try {
    const rule = await WorkflowRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Workflow rule not found",
      });
    }

    res.json({
      success: true,
      message: "Workflow rule updated successfully",
      data: rule,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a workflow rule
const deleteRule = async (req, res) => {
  try {
    const rule = await WorkflowRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Workflow rule not found",
      });
    }

    res.json({
      success: true,
      message: "Workflow rule deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRules,
  getTemplates,
  createRule,
  updateRule,
  deleteRule,
};
