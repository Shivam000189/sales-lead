import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Shell } from "./CrmPages";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateKey = (year, month, day) => {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};

const errorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.errors?.join(", ") ||
  "Something went wrong. Please try again.";

export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null); // for detail/edit modal
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Target lists for dropdown
  const [leadsList, setLeadsList] = useState([]);
  const [contactsList, setContactsList] = useState([]);

  // Schedule form state
  const [form, setForm] = useState({
    title: "",
    type: "CALL",
    scheduledDate: "",
    scheduledTime: "10:00",
    entityType: "none", // 'none' | 'lead' | 'contact'
    relatedLead: "",
    relatedContact: "",
    notes: "",
  });

  // Calculate start and end of current month view
  const { daysInMonth, firstDayIndex, dateKeyMap } = useMemo(() => {
    const days = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Map activities by YYYY-MM-DD
    const map = {};
    activities.forEach((act) => {
      const actDate = new Date(act.scheduledFor);
      const key = `${actDate.getFullYear()}-${String(actDate.getMonth() + 1).padStart(2, "0")}-${String(actDate.getDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(act);
    });

    return { daysInMonth: days, firstDayIndex: firstDay, dateKeyMap: map };
  }, [currentYear, currentMonth, activities]);

  // Load activities for the visible month
  useEffect(() => {
    let ignore = false;
    const from = new Date(currentYear, currentMonth, 1).toISOString();
    const to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).toISOString();

    API.get("/scheduled-activities", {
      params: { from, to },
    })
      .then((res) => {
        if (!ignore) {
          setActivities(res.data.data || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(errorMessage(err));
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
  }, [currentYear, currentMonth]);

  const refreshActivities = useCallback(async () => {
    try {
      const from = new Date(currentYear, currentMonth, 1).toISOString();
      const to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).toISOString();
      const res = await API.get("/scheduled-activities", {
        params: { from, to },
      });
      setActivities(res.data.data || []);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [currentYear, currentMonth]);

  // Load leads and contacts for quick association in modal
  const loadAssociations = async () => {
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        API.get("/leads", { params: { limit: 100 } }),
        API.get("/contacts", { params: { limit: 100 } }),
      ]);
      setLeadsList(leadsRes.data.data || []);
      setContactsList(contactsRes.data.data || []);
    } catch {
      // Non-critical, dropdowns can fall back to empty
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const openQuickSchedule = (day) => {
    loadAssociations();
    const dateStr = formatDateKey(currentYear, currentMonth, day);
    setForm({
      title: "",
      type: "CALL",
      scheduledDate: dateStr,
      scheduledTime: "10:00",
      entityType: "none",
      relatedLead: "",
      relatedContact: "",
      notes: "",
    });
    setModalError("");
    setScheduleModalOpen(true);
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduledDate || !form.scheduledTime) {
      setModalError("Title, Date, and Time are required.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const scheduledFor = new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString();
      const payload = {
        title: form.title.trim(),
        type: form.type,
        scheduledFor,
        notes: form.notes.trim() || undefined,
      };

      if (form.entityType === "lead" && form.relatedLead) {
        payload.relatedLead = form.relatedLead;
      } else if (form.entityType === "contact" && form.relatedContact) {
        payload.relatedContact = form.relatedContact;
      }

      await API.post("/scheduled-activities", payload);
      setScheduleModalOpen(false);
      refreshActivities();
    } catch (err) {
      setModalError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompleted = async (activity) => {
    setSaving(true);
    try {
      const res = await API.put(`/scheduled-activities/${activity._id}`, {
        completed: !activity.completed,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === activity._id ? res.data.data : a))
      );
      if (selectedActivity && selectedActivity._id === activity._id) {
        setSelectedActivity(res.data.data);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scheduled activity?")) {
      return;
    }
    setSaving(true);
    try {
      await API.delete(`/scheduled-activities/${id}`);
      setActivities((prev) => prev.filter((a) => a._id !== id));
      setSelectedActivity(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div className="calendar-page-header">
        <div className="calendar-title-wrap">
          <h1>Activity Calendar</h1>
          <p>Schedule and track customer calls and meetings</p>
        </div>
        <div className="calendar-nav-controls">
          <button className="secondary small" onClick={handleToday}>
            Today
          </button>
          <button className="secondary small" onClick={handlePrevMonth} title="Previous Month">
            ‹ Prev
          </button>
          <span className="calendar-month-label">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button className="secondary small" onClick={handleNextMonth} title="Next Month">
            Next ›
          </button>
          <button
            className="primary small"
            onClick={() => {
              loadAssociations();
              const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
              setForm({
                title: "",
                type: "CALL",
                scheduledDate: todayStr,
                scheduledTime: "10:00",
                entityType: "none",
                relatedLead: "",
                relatedContact: "",
                notes: "",
              });
              setModalError("");
              setScheduleModalOpen(true);
            }}
          >
            ＋ Schedule Activity
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="loading">Loading calendar activities…</div>}

      <div className="calendar-container">
        {/* Weekday Headers */}
        <div className="calendar-weekdays-row">
          {WEEK_DAYS.map((w) => (
            <div key={w} className="calendar-weekday-title">
              {w}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="calendar-grid">
          {/* Empty prefix slots for day of week alignment */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-pre-${idx}`} className="calendar-cell empty-cell" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = formatDateKey(currentYear, currentMonth, dayNum);
            const dayActivities = dateKeyMap[dateKey] || [];
            const isToday =
              today.getFullYear() === currentYear &&
              today.getMonth() === currentMonth &&
              today.getDate() === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                className={`calendar-cell ${isToday ? "cell-today" : ""}`}
                onClick={() => openQuickSchedule(dayNum)}
              >
                <div className="calendar-cell-header">
                  <span className={`calendar-day-number ${isToday ? "today-badge" : ""}`}>
                    {dayNum}
                  </span>
                  {dayActivities.length > 0 && (
                    <span className="calendar-count-badge">
                      {dayActivities.length}
                    </span>
                  )}
                </div>

                <div className="calendar-chip-list">
                  {dayActivities.slice(0, 3).map((act) => (
                    <button
                      type="button"
                      key={act._id}
                      className={`calendar-chip chip-${act.type.toLowerCase()} ${
                        act.completed ? "chip-completed" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivity(act);
                      }}
                      title={`${act.title} (${formatTime(act.scheduledFor)})`}
                    >
                      <span className="chip-time">{formatTime(act.scheduledFor)}</span>
                      <span className="chip-title">{act.title}</span>
                    </button>
                  ))}
                  {dayActivities.length > 3 && (
                    <span className="chip-overflow">
                      +{dayActivities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Schedule Modal */}
      {scheduleModalOpen && (
        <div className="modal-backdrop" onClick={() => !saving && setScheduleModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Schedule Activity</h2>
              <button
                type="button"
                className="modal-close"
                disabled={saving}
                onClick={() => setScheduleModalOpen(false)}
              >
                ×
              </button>
            </div>
            {modalError && <div className="alert error">{modalError}</div>}
            <form onSubmit={handleCreateActivity} className="form-grid">
              <label>
                Activity Title
                <input
                  required
                  placeholder="e.g. Discovery Call or Product Demo"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={saving}
                  autoFocus
                />
              </label>

              <div className="form-row">
                <label>
                  Type
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    disabled={saving}
                  >
                    <option value="CALL">📞 Call</option>
                    <option value="MEETING">👥 Meeting</option>
                  </select>
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    required
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    disabled={saving}
                  />
                </label>
                <label>
                  Time
                  <input
                    type="time"
                    required
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    disabled={saving}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Link With
                  <select
                    value={form.entityType}
                    onChange={(e) => setForm({ ...form, entityType: e.target.value })}
                    disabled={saving}
                  >
                    <option value="none">General (No link)</option>
                    <option value="lead">Existing Lead</option>
                    <option value="contact">Converted Customer</option>
                  </select>
                </label>

                {form.entityType === "lead" && (
                  <label>
                    Select Lead
                    <select
                      value={form.relatedLead}
                      onChange={(e) => setForm({ ...form, relatedLead: e.target.value })}
                      disabled={saving}
                    >
                      <option value="">Select a lead…</option>
                      {leadsList.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name} {l.company ? `(${l.company})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {form.entityType === "contact" && (
                  <label>
                    Select Customer Contact
                    <select
                      value={form.relatedContact}
                      onChange={(e) => setForm({ ...form, relatedContact: e.target.value })}
                      disabled={saving}
                    >
                      <option value="">Select a customer…</option>
                      {contactsList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.company ? `(${c.company})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <label>
                Agenda / Notes
                <textarea
                  rows="3"
                  placeholder="Meeting agenda, discussion points, or zoom link..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={saving}
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={saving}
                  onClick={() => setScheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving}>
                  {saving ? "Scheduling…" : "Save Activity →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Details / Edit Modal */}
      {selectedActivity && (
        <div className="modal-backdrop" onClick={() => !saving && setSelectedActivity(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="title-row">
                <h2>{selectedActivity.title}</h2>
                <span className={`activity-badge badge-${selectedActivity.type.toLowerCase()}`}>
                  {selectedActivity.type === "CALL" ? "📞 Call" : "👥 Meeting"}
                </span>
              </div>
              <button
                type="button"
                className="modal-close"
                disabled={saving}
                onClick={() => setSelectedActivity(null)}
              >
                ×
              </button>
            </div>

            <div className="activity-detail-body">
              <p>
                <strong>Scheduled:</strong>{" "}
                {new Date(selectedActivity.scheduledFor).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {selectedActivity.relatedLead && (
                <p>
                  <strong>Linked Lead:</strong>{" "}
                  <Link
                    to={`/leads/${selectedActivity.relatedLead._id || selectedActivity.relatedLead}`}
                    className="lead-chip-link"
                  >
                    {selectedActivity.relatedLead.name || "View Lead"}
                  </Link>
                </p>
              )}

              {selectedActivity.relatedContact && (
                <p>
                  <strong>Linked Customer:</strong>{" "}
                  <Link
                    to={`/contacts/${selectedActivity.relatedContact._id || selectedActivity.relatedContact}`}
                    className="lead-chip-link"
                  >
                    {selectedActivity.relatedContact.name || "View Customer"}
                  </Link>
                </p>
              )}

              {selectedActivity.notes && (
                <div className="activity-modal-notes">
                  <strong>Notes:</strong>
                  <p>{selectedActivity.notes}</p>
                </div>
              )}

              <p>
                <strong>Status:</strong>{" "}
                {selectedActivity.completed ? (
                  <span className="badge-completed">✓ Completed</span>
                ) : (
                  <span className="badge-pending">⏳ Pending</span>
                )}
              </p>
            </div>

            <div className="form-actions space-between">
              <button
                type="button"
                className="button danger small"
                disabled={saving}
                onClick={() => handleDeleteActivity(selectedActivity._id)}
              >
                Delete
              </button>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary small"
                  disabled={saving}
                  onClick={() => handleToggleCompleted(selectedActivity)}
                >
                  {selectedActivity.completed ? "Mark as Incomplete" : "✓ Mark Completed"}
                </button>
                <button
                  type="button"
                  className="primary small"
                  onClick={() => setSelectedActivity(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
