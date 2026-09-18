import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import API from "../api/axios";
import { useSocket } from "../context/SocketContext";

const STATUS_COLUMNS = [
  { id: "NEW", label: "New", tone: "indigo", dotColor: "#6366f1" },
  { id: "CONTACTED", label: "Contacted", tone: "blue", dotColor: "#3b82f6" },
  { id: "QUALIFIED", label: "Qualified", tone: "violet", dotColor: "#8b5cf6" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent", tone: "amber", dotColor: "#f59e0b" },
  { id: "WON", label: "Won", tone: "green", dotColor: "#10b981" },
  { id: "LOST", label: "Lost", tone: "rose", dotColor: "#ef4444" },
];

const formatDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(d);
};

export default function KanbanBoard() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLead, setActiveLead] = useState(null);
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const userId = user.id || user._id;

  const canDragLead = (lead) => {
    if (isAdmin) return true;
    const assignedId = lead.assignedTo?._id || lead.assignedTo;
    return assignedId && String(assignedId) === String(userId);
  };

  useEffect(() => {
    let ignore = false;
    API.get("/leads", { params: { limit: 500 } })
      .then((res) => {
        if (!ignore) {
          setLeads(res.data.leads || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load board leads");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Multi-user real-time synchronization
  useEffect(() => {
    if (!socket) return;

    const handleLeadUpdated = (updated) => {
      setLeads((prev) => {
        const index = prev.findIndex((l) => l._id === updated.leadId);
        if (index === -1) return prev;
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          ...(updated.lead || {}),
          status: updated.status || copy[index].status,
          assignedTo:
            updated.assignedTo !== undefined
              ? updated.assignedTo
              : copy[index].assignedTo,
          updatedAt: updated.updatedAt || copy[index].updatedAt,
        };
        return copy;
      });
    };

    socket.on("dashboard:lead-updated", handleLeadUpdated);
    return () => {
      socket.off("dashboard:lead-updated", handleLeadUpdated);
    };
  }, [socket]);

  // Pointer sensor with 5px distance constraint to allow card clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const lead = leads.find((l) => l._id === active.id);
    if (lead && canDragLead(lead)) {
      setActiveLead(lead);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const draggedLead = leads.find((l) => l._id === active.id);
    if (!draggedLead || !canDragLead(draggedLead)) return;

    // Over target can be a column container ID or a lead card ID
    let targetStatus = over.id;
    const overLead = leads.find((l) => l._id === over.id);
    if (overLead) {
      targetStatus = overLead.status;
    }

    const isValidStatus = STATUS_COLUMNS.some((col) => col.id === targetStatus);
    if (!isValidStatus || targetStatus === draggedLead.status) return;

    // Optimistic UI state update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l._id === draggedLead._id ? { ...l, status: targetStatus } : l))
    );

    try {
      await API.patch(`/leads/${draggedLead._id}/status`, { status: targetStatus });
    } catch (err) {
      // Rollback on failure
      setLeads(previousLeads);
      setError(err.response?.data?.message || "Failed to update lead status. Changes rolled back.");
    }
  };

  const filteredLeads = search.trim()
    ? leads.filter((l) => {
        const query = search.toLowerCase();
        return (
          l.name?.toLowerCase().includes(query) ||
          l.company?.toLowerCase().includes(query) ||
          l.email?.toLowerCase().includes(query)
        );
      })
    : leads;

  if (loading) {
    return <div className="loading">Loading pipeline board…</div>;
  }

  return (
    <div className="kanban-wrapper">
      {error && <div className="alert error">{error}</div>}

      <div className="kanban-toolbar">
        <label className="search">
          ⌕
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter board by name, company, email…"
          />
        </label>
        <span className="kanban-count-label">
          Showing <strong>{filteredLeads.length}</strong> of {leads.length} leads
        </span>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board-container">
          {STATUS_COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                leads={columnLeads}
                canDragLead={canDragLead}
                onCardClick={(leadId) => navigate(`/leads/${leadId}`)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="kanban-card kanban-card-overlay">
              <div className="card-top">
                <strong className="card-name">{activeLead.name}</strong>
              </div>
              <p className="card-company">{activeLead.company || "No company"}</p>
              <div className="card-footer">
                <span className="card-avatar">
                  {(activeLead.assignedTo?.name || "U")[0].toUpperCase()}
                </span>
                <span className="card-date">{formatDate(activeLead.createdAt)}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({ column, leads, canDragLead, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${column.tone} ${isOver ? "is-over" : ""}`}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <span
            className="column-dot"
            style={{ backgroundColor: column.dotColor }}
          />
          <h3 className="column-title">{column.label}</h3>
        </div>
        <span className="column-count-badge">{leads.length}</span>
      </div>

      <div className="column-cards">
        {leads.length === 0 ? (
          <div className="column-empty">No leads in {column.label.toLowerCase()}</div>
        ) : (
          leads.map((lead) => (
            <DraggableCard
              key={lead._id}
              lead={lead}
              canDrag={canDragLead(lead)}
              onClick={() => onCardClick(lead._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({ lead, canDrag, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead._id,
    disabled: !canDrag,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`kanban-card ${isDragging ? "is-dragging" : ""} ${
        !canDrag ? "locked" : ""
      }`}
      title={!canDrag ? "You can only drag leads assigned to you" : "Drag to change pipeline status"}
    >
      <div className="card-top">
        <strong className="card-name">{lead.name}</strong>
        {!canDrag && (
          <span className="card-lock-badge" title="Only assigned member or admin can move">
            🔒
          </span>
        )}
      </div>
      <p className="card-company">{lead.company || "No company"}</p>
      {lead.email && <small className="card-email">{lead.email}</small>}
      <div className="card-footer">
        <div className="card-assignee">
          <span className="card-avatar">
            {(lead.assignedTo?.name || "U")[0].toUpperCase()}
          </span>
          <span className="card-assignee-name">
            {lead.assignedTo?.name || "Unassigned"}
          </span>
        </div>
        <span className="card-date">{formatDate(lead.createdAt)}</span>
      </div>
    </div>
  );
}
