const { getIO } = require("../config/socket");

/**
 * Emit status change event to the lead's room and global dashboard
 */
const emitLeadStatusChanged = (leadId, lead, activity) => {
  try {
    const io = getIO();
    const strLeadId = leadId.toString();

    // Notify users actively viewing this specific lead
    io.to(`lead:${strLeadId}`).emit("lead:status-changed", {
      leadId: strLeadId,
      status: lead.status,
      lead,
      activity,
    });

    // Notify all dashboard viewers to patch the row in-place
    io.emit("dashboard:lead-updated", {
      leadId: strLeadId,
      status: lead.status,
      assignedTo: lead.assignedTo,
      updatedAt: lead.updatedAt,
      lead,
    });
  } catch (error) {
    console.warn("WebSocket emission failed (lead:status-changed):", error.message);
  }
};

/**
 * Emit assignment event to the lead's room and direct notification to assigned user
 */
const emitLeadAssigned = (leadId, lead, assignedUserId, activity, assignerName) => {
  try {
    const io = getIO();
    const strLeadId = leadId.toString();
    const strAssignedUserId = assignedUserId ? assignedUserId.toString() : null;

    // Notify users viewing this specific lead
    io.to(`lead:${strLeadId}`).emit("lead:assigned", {
      leadId: strLeadId,
      assignedTo: lead.assignedTo,
      lead,
      activity,
    });

    // Notify all dashboard viewers to patch the row in-place
    io.emit("dashboard:lead-updated", {
      leadId: strLeadId,
      status: lead.status,
      assignedTo: lead.assignedTo,
      updatedAt: lead.updatedAt,
      lead,
    });

    // Direct notification to newly assigned user
    if (strAssignedUserId) {
      io.to(`user:${strAssignedUserId}`).emit("notification:new", {
        title: "New Lead Assigned",
        message: `${assignerName || "An admin"} assigned you a new lead: ${lead.name}`,
        leadId: strLeadId,
        leadName: lead.name,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn("WebSocket emission failed (lead:assigned):", error.message);
  }
};

/**
 * Emit note creation event to the lead's room
 */
const emitLeadNoteAdded = (leadId, note) => {
  try {
    const io = getIO();
    const strLeadId = leadId.toString();

    io.to(`lead:${strLeadId}`).emit("lead:note-added", {
      leadId: strLeadId,
      note,
    });
  } catch (error) {
    console.warn("WebSocket emission failed (lead:note-added):", error.message);
  }
};

/**
 * Emit general activity creation (e.g. outbound email) to the lead's room
 */
const emitLeadActivityAdded = (leadId, activity) => {
  try {
    const io = getIO();
    const strLeadId = leadId.toString();

    io.to(`lead:${strLeadId}`).emit("lead:activity-added", {
      leadId: strLeadId,
      activity,
    });
  } catch (error) {
    console.warn("WebSocket emission failed (lead:activity-added):", error.message);
  }
};

module.exports = {
  emitLeadStatusChanged,
  emitLeadAssigned,
  emitLeadNoteAdded,
  emitLeadActivityAdded,
};
