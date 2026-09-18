import { useEffect, useState } from "react";
import API from "../api/axios";
import { Shell } from "./CrmPages";

const STATUS_LIST = [
  { id: "NEW", label: "New", dot: "#6366f1" },
  { id: "CONTACTED", label: "Contacted", dot: "#3b82f6" },
  { id: "QUALIFIED", label: "Qualified", dot: "#8b5cf6" },
  { id: "PROPOSAL_SENT", label: "Proposal Sent", dot: "#f59e0b" },
  { id: "WON", label: "Won", dot: "#10b981" },
  { id: "LOST", label: "Lost", dot: "#ef4444" },
];

export default function WorkflowSettings() {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    triggerStatus: "WON",
    emailTemplateKey: "won_welcome",
  });

  useEffect(() => {
    let ignore = false;
    Promise.all([
      API.get("/workflows"),
      API.get("/workflows/templates"),
    ])
      .then(([rulesRes, templatesRes]) => {
        if (!ignore) {
          setRules(rulesRes.data.data || []);
          setTemplates(templatesRes.data.data || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load workflow rules");
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

  // When triggerStatus changes, suggest matching default template
  const handleStatusChange = (status) => {
    const matching = templates.find((t) => t.triggerStatus === status);
    setFormData((prev) => ({
      ...prev,
      triggerStatus: status,
      emailTemplateKey: matching ? matching.key : prev.emailTemplateKey,
    }));
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a descriptive rule name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/workflows", formData);
      setRules((prev) => [res.data.data, ...prev]);
      setSuccess(`Workflow rule "${formData.name}" created successfully.`);
      setFormData({
        name: "",
        triggerStatus: "WON",
        emailTemplateKey: "won_welcome",
      });
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create workflow rule");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rule) => {
    const updatedStatus = !rule.isActive;
    // Optimistic UI update
    setRules((prev) =>
      prev.map((r) =>
        r._id === rule._id ? { ...r, isActive: updatedStatus } : r
      )
    );

    try {
      await API.patch(`/workflows/${rule._id}`, { isActive: updatedStatus });
    } catch (err) {
      // Revert on failure
      setRules((prev) =>
        prev.map((r) =>
          r._id === rule._id ? { ...r, isActive: rule.isActive } : r
        )
      );
      setError(err.response?.data?.message || "Failed to update rule status");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Are you sure you want to delete this workflow rule?")) {
      return;
    }

    try {
      await API.delete(`/workflows/${ruleId}`);
      setRules((prev) => prev.filter((r) => r._id !== ruleId));
      setSuccess("Workflow rule deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete rule");
    }
  };

  const activeCount = rules.filter((r) => r.isActive).length;
  const selectedTemplate = templates.find(
    (t) => t.key === formData.emailTemplateKey
  );

  return (
    <Shell>
      <header className="page-head compact">
        <div>
          <p className="eyebrow">AUTOMATION & RULES</p>
          <h1>Workflow Rules</h1>
          <p>
            Trigger automated branded emails and timeline activity logs when leads transition statuses.
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-icon green">⚡</div>
          <div>
            <p>Active Automations</p>
            <strong>{activeCount}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon indigo">📋</div>
          <div>
            <p>Total Rules</p>
            <strong>{rules.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">✉️</div>
          <div>
            <p>Available Templates</p>
            <strong>{templates.length || 6}</strong>
          </div>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 380px) 1fr", gap: "24px", alignItems: "start" }}>
        {/* Create Rule Form */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Create New Rule</h2>
              <p>Configure a trigger and automated email action</p>
            </div>
          </div>

          <form onSubmit={handleCreateRule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#405148" }}>
              Rule Name
              <input
                type="text"
                placeholder="e.g. Won Customer Welcome Email"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#405148" }}>
              When Lead Status Becomes
              <select
                value={formData.triggerStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.id})
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#405148" }}>
              Action
              <input type="text" value="Send Outbound Email (Automated)" disabled style={{ background: "#f8fafc", color: "#64748b" }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#405148" }}>
              Email Template
              <select
                value={formData.emailTemplateKey}
                onChange={(e) => setFormData({ ...formData, emailTemplateKey: e.target.value })}
              >
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name} ({t.key})
                  </option>
                ))}
              </select>
            </label>

            {selectedTemplate && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e293b" }}>
                  Subject: {selectedTemplate.defaultSubject}
                </p>
                <p style={{ margin: 0, color: "#64748b" }}>
                  {selectedTemplate.description}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="primary"
              disabled={saving}
              style={{ marginTop: "8px", width: "100%", justifyContent: "center" }}
            >
              {saving ? "Creating Rule…" : "+ Create Workflow Rule"}
            </button>
          </form>
        </section>

        {/* Existing Rules Table */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Configured Workflow Automations</h2>
              <p>Rules that automatically execute when statuses are updated</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading workflow rules…</div>
          ) : rules.length === 0 ? (
            <div className="empty">
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#334155", margin: "0 0 6px" }}>
                No automation rules configured yet
              </p>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                Create your first rule above (e.g. send a welcome email when a lead status changes to WON).
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rule Name</th>
                    <th>Trigger Stage</th>
                    <th>Action / Template</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => {
                    const statusConfig = STATUS_LIST.find((s) => s.id === rule.triggerStatus) || {
                      label: rule.triggerStatus,
                    };
                    const tmpl = templates.find((t) => t.key === rule.emailTemplateKey);

                    return (
                      <tr key={rule._id} style={{ cursor: "default" }}>
                        <td>
                          <strong>{rule.name}</strong>
                          <small>Created by {rule.createdBy?.name || "Admin"}</small>
                        </td>
                        <td>
                          <span className={`status status-${rule.triggerStatus.toLowerCase()}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td>
                          <strong>✉️ {tmpl?.name || rule.emailTemplateKey}</strong>
                          <small>{tmpl?.defaultSubject || "Branded Email"}</small>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(rule)}
                            className={`workflow-toggle-badge ${rule.isActive ? "active" : "inactive"}`}
                            title="Click to toggle active/inactive"
                          >
                            <span className="toggle-indicator" />
                            {rule.isActive ? "Active" : "Paused"}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule._id)}
                            style={{
                              border: 0,
                              background: "transparent",
                              color: "#ef4444",
                              fontWeight: 700,
                              fontSize: "12px",
                              cursor: "pointer",
                              padding: "4px 8px",
                            }}
                            title="Delete rule"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
