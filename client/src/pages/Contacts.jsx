import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import { Shell } from "./CrmPages";

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const errorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.errors?.join(", ") ||
  "Something went wrong. Please try again.";

export function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    let ignore = false;
    API.get("/contacts", {
      params: { page, limit: 10, search: query.trim() },
    })
      .then((res) => {
        if (!ignore) {
          setContacts(res.data.data || []);
          setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
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
  }, [page, query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  return (
    <Shell>
      <div className="section-head">
        <div>
          <h1>Customer Contacts</h1>
          <p>Directory of converted customers won from deals</p>
        </div>
      </div>

      <div className="table-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="search"
            placeholder="Search by name, company, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="secondary">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setSearch("");
                setQuery("");
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading">Loading contacts…</div>
      ) : contacts.length === 0 ? (
        <div className="empty">
          <p>No converted customer contacts found.</p>
          <small>Contacts are automatically created when leads are marked as WON.</small>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned To</th>
                  <th>Converted Date</th>
                  <th>Original Lead</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <Link to={`/contacts/${c._id}`} className="contact-link">
                        <strong>{c.name}</strong>
                      </Link>
                    </td>
                    <td>{c.company || "—"}</td>
                    <td>
                      <a href={`mailto:${c.email}`}>{c.email}</a>
                    </td>
                    <td>
                      <a href={`tel:${c.phone}`}>{c.phone || "—"}</a>
                    </td>
                    <td>{c.assignedTo?.name || "Unassigned"}</td>
                    <td>{shortDate(c.createdAt)}</td>
                    <td>
                      {c.convertedFromLead ? (
                        <Link
                          to={`/leads/${c.convertedFromLead._id || c.convertedFromLead}`}
                          className="lead-chip-link"
                          title="View original lead"
                        >
                          🔗 Lead
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <Link to={`/contacts/${c._id}`} className="button secondary small">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="page-btns">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="secondary small"
              >
                ← Prev
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="secondary small"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}

export function ContactDetails() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: "",
    type: "CALL",
    scheduledFor: "",
    notes: "",
  });
  const [savingActivity, setSavingActivity] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([
      API.get(`/contacts/${id}`),
      API.get(`/contacts/${id}/notes`),
      API.get(`/scheduled-activities`, { params: { contactId: id } }),
    ])
      .then(([contactRes, notesRes, activitiesRes]) => {
        if (!ignore) {
          setContact(contactRes.data.data);
          setNotes(notesRes.data.data || []);
          setActivities(activitiesRes.data.data || []);
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
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await API.post(`/contacts/${id}/notes`, { text: noteText.trim() });
      setNotes((prev) => [res.data.data, ...prev]);
      setNoteText("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAddingNote(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.title.trim() || !activityForm.scheduledFor) {
      setModalError("Title and Scheduled Date/Time are required.");
      return;
    }
    setSavingActivity(true);
    setModalError("");
    try {
      const payload = {
        ...activityForm,
        relatedContact: id,
      };
      const res = await API.post("/scheduled-activities", payload);
      setActivities((prev) => [res.data.data, ...prev]);
      setShowScheduleModal(false);
      setActivityForm({ title: "", type: "CALL", scheduledFor: "", notes: "" });
    } catch (err) {
      setModalError(errorMessage(err));
    } finally {
      setSavingActivity(false);
    }
  };

  const toggleActivityCompleted = async (activity) => {
    try {
      const res = await API.put(`/scheduled-activities/${activity._id}`, {
        completed: !activity.completed,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === activity._id ? res.data.data : a))
      );
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="loading">Loading contact details…</div>
      </Shell>
    );
  }

  if (error && !contact) {
    return (
      <Shell>
        <div className="alert error">{error}</div>
        <Link to="/contacts" className="button secondary">
          ← Back to Contacts
        </Link>
      </Shell>
    );
  }

  const upcomingActivities = activities.filter((a) => !a.completed);
  const completedActivities = activities.filter((a) => a.completed);

  return (
    <Shell>
      <header className="detail-head">
        <div>
          <Link className="back" to="/contacts">
            ← All contacts
          </Link>
          <div className="title-row">
            <h1>{contact.name}</h1>
            <span className="badge-customer">Customer</span>
          </div>
          <p>
            {contact.company ? `${contact.company} · ` : ""}Converted on {shortDate(contact.createdAt)}
          </p>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="primary"
            onClick={() => {
              setShowScheduleModal(true);
              setModalError("");
            }}
          >
            📅 Schedule Activity
          </button>
          {contact.convertedFromLead && (
            <Link
              className="secondary"
              to={`/leads/${contact.convertedFromLead._id || contact.convertedFromLead}`}
            >
              View Original Lead →
            </Link>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="details-grid">
        <section className="stack">
          {/* Contact Information */}
          <article className="panel info-panel">
            <h2>Customer Information</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${contact.phone}`}>{contact.phone || "—"}</a>
                </dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{contact.company || "—"}</dd>
              </div>
              <div>
                <dt>Account Manager</dt>
                <dd>{contact.assignedTo?.name || "Unassigned"}</dd>
              </div>
            </dl>
          </article>

          {/* Notes Panel */}
          <article className="panel">
            <div className="panel-head">
              <div>
                <h2>Customer Notes</h2>
                <p>Ongoing relationship and account notes</p>
              </div>
            </div>
            <form className="note-form" onSubmit={handleAddNote}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a customer note…"
                rows="3"
                disabled={addingNote}
              />
              <button className="primary" disabled={addingNote || !noteText.trim()}>
                {addingNote ? "Adding…" : "Add note"}
              </button>
            </form>
            {notes.length ? (
              <div className="notes">
                {notes.map((n) => (
                  <div className="note" key={n._id}>
                    <div className="avatar small">
                      {n.userId?.name?.[0] || "U"}
                    </div>
                    <div>
                      <strong>{n.userId?.name || "Team member"}</strong>
                      <p>{n.text}</p>
                      <small>{date(n.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">No notes for this customer yet.</div>
            )}
          </article>
        </section>

        <aside className="stack">
          {/* Scheduled Calls & Meetings */}
          <article className="panel">
            <div className="panel-head">
              <div>
                <h2>Upcoming Activities</h2>
                <p>Scheduled calls and meetings</p>
              </div>
              <button
                type="button"
                className="ghost small"
                onClick={() => setShowScheduleModal(true)}
              >
                ＋ Add
              </button>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="empty">No upcoming activities scheduled.</div>
            ) : (
              <div className="activity-list">
                {upcomingActivities.map((act) => (
                  <div key={act._id} className="scheduled-card">
                    <div className="scheduled-head">
                      <span className={`activity-badge badge-${act.type.toLowerCase()}`}>
                        {act.type === "CALL" ? "📞 Call" : "👥 Meeting"}
                      </span>
                      <button
                        type="button"
                        className="button small secondary"
                        onClick={() => toggleActivityCompleted(act)}
                        title="Mark as completed"
                      >
                        ✓ Complete
                      </button>
                    </div>
                    <strong>{act.title}</strong>
                    <div className="scheduled-time">
                      📅 {date(act.scheduledFor)}
                    </div>
                    {act.notes && <p className="scheduled-note">{act.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {completedActivities.length > 0 && (
              <div className="completed-activities-section">
                <h3>Completed Activities</h3>
                <div className="activity-list">
                  {completedActivities.map((act) => (
                    <div key={act._id} className="scheduled-card completed">
                      <div className="scheduled-head">
                        <span className="activity-badge badge-completed">✓ Done</span>
                        <button
                          type="button"
                          className="ghost small"
                          onClick={() => toggleActivityCompleted(act)}
                        >
                          Reopen
                        </button>
                      </div>
                      <strong>{act.title}</strong>
                      <div className="scheduled-time">
                        Done {date(act.completedAt || act.updatedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </aside>
      </div>

      {/* Schedule Activity Modal */}
      {showScheduleModal && (
        <div className="modal-backdrop" onClick={() => !savingActivity && setShowScheduleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Schedule Activity with {contact.name}</h2>
              <button
                type="button"
                className="modal-close"
                disabled={savingActivity}
                onClick={() => setShowScheduleModal(false)}
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
                  placeholder="e.g. Account Onboarding Review"
                  value={activityForm.title}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, title: e.target.value })
                  }
                  disabled={savingActivity}
                  autoFocus
                />
              </label>
              <div className="form-row">
                <label>
                  Type
                  <select
                    value={activityForm.type}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, type: e.target.value })
                    }
                    disabled={savingActivity}
                  >
                    <option value="CALL">📞 Call</option>
                    <option value="MEETING">👥 Meeting</option>
                  </select>
                </label>
                <label>
                  Date & Time
                  <input
                    type="datetime-local"
                    required
                    value={activityForm.scheduledFor}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        scheduledFor: e.target.value,
                      })
                    }
                    disabled={savingActivity}
                  />
                </label>
              </div>
              <label>
                Notes / Agenda (optional)
                <textarea
                  rows="3"
                  placeholder="Agenda items or call link..."
                  value={activityForm.notes}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, notes: e.target.value })
                  }
                  disabled={savingActivity}
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={savingActivity}
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={savingActivity}>
                  {savingActivity ? "Scheduling…" : "Save Schedule →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
