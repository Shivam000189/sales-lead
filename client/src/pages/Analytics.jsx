import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import API from "../api/axios";
import { Shell } from "./CrmPages";
import { useTheme } from "../context/ThemeContext";

const STAGE_COLORS = {
  NEW: "#6366f1",
  CONTACTED: "#3b82f6",
  QUALIFIED: "#06b6d4",
  PROPOSAL_SENT: "#f59e0b",
  WON: "#10b981",
  LOST: "#ef4444",
};

export default function Analytics() {
  return (
    <Shell>
      <div className="analytics-page">
        <header className="page-head">
          <div>
            <h2>Analytics & Performance</h2>
            <p className="subtext">
              Real-time conversion funnels, stage drop-offs, team throughput, and volume trends.
            </p>
          </div>
        </header>

        <ConversionSummarySection />

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-header">
              <div>
                <h3>Pipeline Conversion Funnel</h3>
                <p className="card-desc">Volume and distribution across each sales stage</p>
              </div>
            </div>
            <FunnelWidget />
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <div>
                <h3>Lead Volume Over Time</h3>
                <p className="card-desc">Trends in lead generation and deal wins</p>
              </div>
            </div>
            <TimeseriesWidget />
          </div>
        </div>

        <div className="analytics-card full-width">
          <div className="card-header">
            <div>
              <h3>Team Member Performance</h3>
              <p className="card-desc">Breakdown of assigned leads, outcomes, and close rates</p>
            </div>
          </div>
          <MemberPerformanceWidget />
        </div>
      </div>
    </Shell>
  );
}

function ConversionSummarySection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    API.get("/analytics/conversion-rate")
      .then((res) => {
        if (mounted) setData(res.data.data);
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || "Failed to load conversion metrics");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="analytics-loading">Loading key metrics...</div>;
  }

  if (error || !data) {
    return <div className="analytics-error">{error || "Unable to display conversion metrics."}</div>;
  }

  return (
    <div className="analytics-kpi-grid">
      <div className="kpi-card highlight">
        <span className="kpi-label">Overall Conversion Rate</span>
        <span className="kpi-value">{data.overallConversionRate}%</span>
        <span className="kpi-sub">{data.wonLeads} won out of {data.totalLeads} total leads</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Active Pipeline</span>
        <span className="kpi-value">{data.inProgressLeads}</span>
        <span className="kpi-sub">Leads in active negotiation</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Deals Won</span>
        <span className="kpi-value won-color">{data.wonLeads}</span>
        <span className="kpi-sub">Successfully closed</span>
      </div>
      <div className="kpi-card">
        <span className="kpi-label">Deals Lost</span>
        <span className="kpi-value lost-color">{data.lostLeads}</span>
        <span className="kpi-sub">Closed without conversion</span>
      </div>
    </div>
  );
}

function FunnelWidget() {
  const { isDark } = useTheme();
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    API.get("/analytics/funnel")
      .then((res) => {
        if (mounted) {
          const stages = res.data.data?.stages || [];
          setFunnelData(stages);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || "Failed to load funnel data");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="analytics-loading">Loading funnel visualization...</div>;
  }

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  if (funnelData.length === 0 || funnelData.every((d) => d.count === 0)) {
    return <div className="analytics-empty">No lead data available to construct funnel.</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          layout="vertical"
          data={funnelData}
          margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
        >
          <XAxis type="number" allowDecimals={false} stroke={isDark ? "#94a3b8" : "#64748b"} />
          <YAxis
            dataKey="label"
            type="category"
            width={110}
            stroke={isDark ? "#94a3b8" : "#64748b"}
            tick={{ fill: isDark ? "#cbd5e1" : "#334155", fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="custom-tooltip">
                    <p className="tooltip-title">{item.label}</p>
                    <p className="tooltip-val">Leads: <strong>{item.count}</strong></p>
                    <p className="tooltip-val">Share: <strong>{item.percentage}%</strong></p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {funnelData.map((entry) => (
              <Cell key={`cell-${entry.stage}`} fill={STAGE_COLORS[entry.stage] || "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TimeseriesWidget() {
  const { isDark } = useTheme();
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [range, setRange] = useState("week");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const params = { range };
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;

    API.get("/analytics/timeseries", { params })
      .then((res) => {
        if (mounted) {
          setTimeseriesData(res.data.data?.data || []);
          setError("");
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.message || "Failed to load timeseries");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [range, fromDate, toDate]);

  return (
    <div>
      <div className="timeseries-controls">
        <div className="btn-toggle-group">
          <button
            type="button"
            className={`toggle-btn ${range === "week" ? "active" : ""}`}
            onClick={() => setRange("week")}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`toggle-btn ${range === "month" ? "active" : ""}`}
            onClick={() => setRange("month")}
          >
            Monthly
          </button>
        </div>
        <div className="date-filters">
          <input
            type="date"
            className="date-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="Start date"
          />
          <span className="date-sep">to</span>
          <input
            type="date"
            className="date-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="End date"
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              className="clear-date-btn"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading">Loading timeseries...</div>
      ) : error ? (
        <div className="analytics-error">{error}</div>
      ) : timeseriesData.length === 0 ? (
        <div className="analytics-empty">No activity recorded for this period.</div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeseriesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#243b33" : "#e2e8f0"} />
              <XAxis dataKey="period" stroke={isDark ? "#94a3b8" : "#64748b"} tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }} />
              <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p className="tooltip-title">Period: {label}</p>
                        {payload.map((p) => (
                          <p key={p.dataKey} className="tooltip-val" style={{ color: p.color }}>
                            {p.name}: <strong>{p.value}</strong>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? "#cbd5e1" : "#475569" }} />
              <Area
                type="monotone"
                dataKey="created"
                name="Leads Created"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#createdGrad)"
              />
              <Area
                type="monotone"
                dataKey="won"
                name="Deals Won"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#wonGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function MemberPerformanceWidget() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("total");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    let mounted = true;
    API.get("/analytics/by-member")
      .then((res) => {
        if (mounted) {
          setMembers(res.data.data?.members || []);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || "Failed to load member performance");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (typeof valA === "string") {
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === "asc" ? valA - valB : valB - valA;
  });

  if (loading) {
    return <div className="analytics-loading">Loading team member breakdown...</div>;
  }

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  if (members.length === 0) {
    return <div className="analytics-empty">No team members or assignments found.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="analytics-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("userName")}>
              Member {sortField === "userName" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("userRole")}>
              Role {sortField === "userRole" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("total")}>
              Total Assigned {sortField === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("inProgress")}>
              In Progress {sortField === "inProgress" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("won")}>
              Won {sortField === "won" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("lost")}>
              Lost {sortField === "lost" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("conversionRate")}>
              Win Rate {sortField === "conversionRate" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((m) => (
            <tr key={m._id || m.userId || m.userName}>
              <td>
                <div className="member-cell">
                  <div className="member-avatar">{(m.userName || "U")[0].toUpperCase()}</div>
                  <div>
                    <strong>{m.userName}</strong>
                    {m.userEmail && <small className="member-email">{m.userEmail}</small>}
                  </div>
                </div>
              </td>
              <td>
                <span className={`role-badge ${m.userRole}`}>{m.userRole || "Member"}</span>
              </td>
              <td className="bold">{m.total}</td>
              <td>{m.inProgress}</td>
              <td className="won-cell">{m.won}</td>
              <td className="lost-cell">{m.lost}</td>
              <td>
                <div className="rate-cell">
                  <span>{m.conversionRate}%</span>
                  <div className="rate-bar-bg">
                    <div
                      className="rate-bar-fill"
                      style={{ width: `${Math.min(m.conversionRate, 100)}%` }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
