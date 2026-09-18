import { useState } from "react";
import API from "../api/axios";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export default function LeadFormShared({
  apiUrl = "",
  onSuccess,
  title = "How can we help?",
  subtitle = "Share your details and we’ll take it from here.",
  isEmbed = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (form.phone && form.phone.length !== 10) {
      setError("Please provide a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    try {
      if (apiUrl) {
        const cleanBase = apiUrl.replace(/\/$/, "");
        const targetUrl = cleanBase.endsWith("/leads") ? cleanBase : `${cleanBase}/leads`;
        const res = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || `Submission failed (${res.status})`);
        }
      } else {
        await API.post("/leads", form);
      }

      setMessage("Thanks — we’ve received your details and will be in touch shortly.");
      setForm(initialForm);
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "We couldn't submit your request. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const wrapperClass = isEmbed ? "hero-lead-embed-card" : "capture-card";
  const formClass = isEmbed ? "hero-lead-form-grid" : "form-grid";
  const buttonClass = isEmbed ? "hero-lead-submit-btn" : "primary";

  return (
    <div className={wrapperClass}>
      <p className="eyebrow">GET IN TOUCH</p>
      <h2>{title}</h2>
      {subtitle && <p className="capture-subtitle">{subtitle}</p>}

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <form className={formClass} onSubmit={submit}>
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </label>

        <label>
          Work email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
          />
        </label>

        <label>
          Phone number
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            placeholder="10-digit phone number"
          />
        </label>

        <label>
          Company <em>(optional)</em>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Your company"
          />
        </label>

        <label>
          What are you looking for? <em>(optional)</em>
          <textarea
            rows="3"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us a bit about your project"
          />
        </label>

        <button className={buttonClass} disabled={loading}>
          {loading ? "Sending…" : "Send message"} <span>→</span>
        </button>
      </form>
    </div>
  );
}
