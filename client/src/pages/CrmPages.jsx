import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
];
const pretty = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
const errorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

function Status({ value }) {
  return (
    <span className={`status status-${value?.toLowerCase()}`}>
      {pretty(value)}
    </span>
  );
}
function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function RequireAuth({ children }) {
  return localStorage.getItem("token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

export function Shell({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      /* local logout still succeeds */
    }
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <span>H</span> HeroCRM
        </Link>
        <nav>
          <Link to="/dashboard">
            ▦ <span>Overview</span>
          </Link>
          <Link to="/leads">
            ◉ <span>Leads</span>
          </Link>
          <Link to="/leads/new">
            ＋ <span>New lead</span>
          </Link>
        </nav>
        <div className="profile">
          <div className="avatar">{(user.name || "U")[0]}</div>
          <div>
            <strong>{user.name || "Team member"}</strong>
            <small>{user.role || "Member"}</small>
          </div>
          <button onClick={logout} title="Log out">
            ↪
          </button>
        </div>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-side">
        <Link to="/" className="brand">
          <span>H</span> HeroCRM
        </Link>
        <div>
          <p className="eyebrow">A better way to follow up</p>
          <h1>Turn every conversation into a customer.</h1>
          <p>
            Keep your team aligned and your pipeline moving from the very first
            hello.
          </p>
        </div>
      </div>
      <section className="auth-card">
        <div>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>Use your admin or member account to continue.</p>
        </div>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </label>
          <button className="primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"} <span>→</span>
          </button>
        </form>
        <p className="auth-foot">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    API.get("/dashboard")
      .then((r) => setData(r.data.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);
  const stats = [
    ["Total leads", "totalLeads", "◎", "indigo"],
    ["New", "new", "✦", "blue"],
    ["Contacted", "contacted", "◌", "amber"],
    ["Qualified", "qualified", "✓", "violet"],
    ["Proposal sent", "proposalSent", "✉", "cyan"],
    ["Won", "won", "↗", "green"],
    ["Lost", "lost", "×", "rose"],
  ];
  return (
    <Shell>
      <header className="page-head">
        <div>
          <p className="eyebrow">PIPELINE OVERVIEW</p>
          <h1>
            Good morning,{" "}
            {JSON.parse(localStorage.getItem("user") || "{}").name?.split(
              " ",
            )[0] || "there"}
            .
          </h1>
          <p>Here’s what’s happening with your leads today.</p>
        </div>
        <Link className="primary" to="/leads/new">
          + Add lead
        </Link>
      </header>
      {error ? (
        <div className="alert error">{error}</div>
      ) : !data ? (
        <div className="loading">Loading your pipeline…</div>
      ) : (
        <>
          <section className="stat-grid">
            {stats.map(([label, key, icon, tone]) => (
              <article className="stat-card" key={key}>
                <div className={`stat-icon ${tone}`}>{icon}</div>
                <div>
                  <p>{label}</p>
                  <strong>{data[key] ?? 0}</strong>
                </div>
              </article>
            ))}
          </section>
          <section className="panel activity-panel">
            <div className="panel-head">
              <div>
                <h2>Recent activity</h2>
                <p>Latest movement across your pipeline</p>
              </div>
              <Link to="/leads">View all leads →</Link>
            </div>
            {data.recentActivities?.length ? (
              <div className="activity-list">
                {data.recentActivities.map((item) => (
                  <div className="activity" key={item._id}>
                    <div className="activity-dot">●</div>
                    <div>
                      <strong>
                        {item.performedBy?.name || "A team member"}
                      </strong>{" "}
                      {item.action.toLowerCase()}{" "}
                      {item.leadId?.name && (
                        <>
                          for{" "}
                          <Link to={`/leads/${item.leadId._id}`}>
                            {item.leadId.name}
                          </Link>
                        </>
                      )}
                      <small>{date(item.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                No activity yet. Add or update a lead to see it here.
              </Empty>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}

export function Leads() {
  const navigate = useNavigate();
  const [result, setResult] = useState({ leads: [], pagination: {} });
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== ""),
      );
      API.get("/leads", { params })
        .then((r) => {
          setResult(r.data);
          setError("");
        })
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);
  const change = (value) =>
    setQuery((q) => ({
      ...q,
      ...value,
      page:
        value.search !== undefined || value.status !== undefined ? 1 : q.page,
    }));
  const page = result.pagination;
  return (
    <Shell>
      <header className="page-head compact">
        <div>
          <p className="eyebrow">LEAD DIRECTORY</p>
          <h1>Leads</h1>
          <p>Track, prioritize, and nurture every opportunity.</p>
        </div>
        <Link className="primary" to="/leads/new">
          + New lead
        </Link>
      </header>
      <section className="panel">
        <div className="toolbar">
          <label className="search">
            ⌕
            <input
              value={query.search}
              onChange={(e) => change({ search: e.target.value })}
              placeholder="Search name, email, company…"
            />
          </label>
          <select
            value={query.status}
            onChange={(e) => change({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option value={s} key={s}>
                {pretty(s)}
              </option>
            ))}
          </select>
          <select
            value={`${query.sortBy}:${query.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(":");
              change({ sortBy, sortOrder });
            }}
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="name:asc">Name A–Z</option>
          </select>
        </div>
        {error ? (
          <div className="alert error">{error}</div>
        ) : loading ? (
          <div className="loading">Loading leads…</div>
        ) : result.leads.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                  >
                    <td>
                      <strong>{lead.name}</strong>
                      <small>{lead.company || "No company"}</small>
                    </td>
                    <td>
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {lead.email}
                      </a>
                      <small>{lead.phone}</small>
                    </td>
                    <td>
                      <Status value={lead.status} />
                    </td>
                    <td>
                      {lead.assignedTo ? (
                        <span className="assignee">
                          <i>{lead.assignedTo.name?.[0]}</i>
                          {lead.assignedTo.name}
                        </span>
                      ) : (
                        <span className="muted">Unassigned</span>
                      )}
                    </td>
                    <td className="muted">{date(lead.createdAt)}</td>
                    <td>
                      <Link
                        className="row-action"
                        to={`/leads/${lead._id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>No leads match these filters.</Empty>
        )}
        <footer className="pagination">
          <span>{page.total || 0} total leads</span>
          <div>
            <button
              disabled={page.page <= 1}
              onClick={() => change({ page: query.page - 1 })}
            >
              ← Previous
            </button>
            <span>
              Page {page.page || 1} of {page.totalPages || 1}
            </span>
            <button
              disabled={page.page >= page.totalPages}
              onClick={() => change({ page: query.page + 1 })}
            >
              Next →
            </button>
          </div>
        </footer>
      </section>
    </Shell>
  );
}

const blankLead = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
  status: "NEW",
};
export function LeadForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blankLead);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(edit);
  useEffect(() => {
    if (edit)
      API.get(`/leads/${id}`)
        .then((r) => setForm({ ...blankLead, ...r.data.data }))
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
  }, [edit, id]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = edit
        ? await API.patch(`/leads/${id}`, form)
        : await API.post("/leads", form);
      navigate(`/leads/${data.data._id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  if (loading && edit)
    return (
      <Shell>
        <div className="loading">Loading lead…</div>
      </Shell>
    );
  return (
    <Shell>
      <header className="page-head compact">
        <div>
          <Link className="back" to={edit ? `/leads/${id}` : "/leads"}>
            ← Back to leads
          </Link>
          <h1>{edit ? "Edit lead" : "Create a lead"}</h1>
          <p>
            {edit
              ? "Keep the details and pipeline stage up to date."
              : "Add an opportunity directly to your pipeline."}
          </p>
        </div>
      </header>
      <form className="form-card" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}
        <div className="form-section">
          <h2>Contact information</h2>
          <div className="form-grid two">
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Phone number
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                required
                placeholder="10-digit phone number"
              />
            </label>
            <label>
              Company
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
              />
            </label>
          </div>
        </div>
        <div className="form-section">
          <h2>Pipeline details</h2>
          <div className="form-grid two">
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Message / context
            <textarea
              rows="5"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What does this lead need?"
            />
          </label>
        </div>
        <div className="form-actions">
          <Link to={edit ? `/leads/${id}` : "/leads"}>Cancel</Link>
          <button className="primary" disabled={loading}>
            {loading ? "Saving…" : edit ? "Save changes" : "Create lead"}
          </button>
        </div>
      </form>
    </Shell>
  );
}

export function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    Promise.all([
      API.get(`/leads/${id}`),
      API.get(`/leads/${id}/notes`),
      API.get(`/leads/${id}/activities`),
    ])
      .then(([a, n, activity]) => {
        setLead(a.data.data);
        setNotes(n.data.data || n.data.notes || []);
        setActivities(activity.data.data || activity.data.activities || []);
      })
      .catch((e) => setError(errorMessage(e)));
  // `load` is deliberately recreated for the current lead id and also used after mutations.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [id]);
  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await API.post(`/leads/${id}/notes`, { text: note });
      setNote("");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const changeStatus = async (status) => {
    try {
      await API.patch(`/leads/${id}/status`, { status });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  if (!lead && !error)
    return (
      <Shell>
        <div className="loading">Loading lead…</div>
      </Shell>
    );
  if (!lead)
    return (
      <Shell>
        <div className="alert error">{error}</div>
      </Shell>
    );
  return (
    <Shell>
      <header className="detail-head">
        <div>
          <Link className="back" to="/leads">
            ← All leads
          </Link>
          <div className="title-row">
            <h1>{lead.name}</h1>
            <Status value={lead.status} />
          </div>
          <p>
            {lead.company || "Independent contact"} · Added{" "}
            {date(lead.createdAt)}
          </p>
        </div>
        <div className="head-actions">
          <Link className="secondary" to={`/leads/${id}/edit`}>
            Edit lead
          </Link>
          <select
            value={lead.status}
            onChange={(e) => changeStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>
      {error && <div className="alert error">{error}</div>}
      <div className="details-grid">
        <section className="stack">
          <article className="panel info-panel">
            <h2>Lead information</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${lead.email}`}>{lead.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{lead.company || "—"}</dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd>{lead.message || "No message provided."}</dd>
              </div>
            </dl>
          </article>
          <article className="panel">
            <div className="panel-head">
              <div>
                <h2>Notes</h2>
                <p>Context shared by your team</p>
              </div>
            </div>
            <form className="note-form" onSubmit={addNote}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                rows="3"
              />
              <button className="primary">Add note</button>
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
              <Empty>No notes yet.</Empty>
            )}
          </article>
        </section>
        <aside className="stack">
          <article className="panel assignment">
            <h2>Assignment</h2>
            {lead.assignedTo ? (
              <div className="assignee">
                <i>{lead.assignedTo.name?.[0]}</i>
                <span>
                  <strong>{lead.assignedTo.name}</strong>
                  <small>{lead.assignedTo.email}</small>
                </span>
              </div>
            ) : (
              <Empty>This lead hasn’t been assigned yet.</Empty>
            )}
          </article>
          <article className="panel">
            <h2>Activity timeline</h2>
            {activities.length ? (
              <div className="timeline">
                {activities.map((a) => (
                  <div key={a._id}>
                    <i></i>
                    <p>
                      <strong>{a.action}</strong>
                      <span>
                        {a.performedBy?.name || "Team member"} ·{" "}
                        {date(a.createdAt)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>No recorded activity yet.</Empty>
            )}
          </article>
        </aside>
      </div>
    </Shell>
  );
}
