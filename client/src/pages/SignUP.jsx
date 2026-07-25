import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/register", formData);
      const payload = response.data.data || response.data;
      const user = payload.user || payload;
      const token = response.data.token || payload.token;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "member",
          })
        );
        navigate("/dashboard");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-side">
        <Link to="/" className="brand">
          <span>H</span> HeroCRM
        </Link>
        <div>
          <p className="eyebrow">JOIN YOUR WORKSPACE</p>
          <h1>Keep every new lead moving forward.</h1>
          <p>Capture, qualify, and follow up from one focused CRM dashboard.</p>
        </div>
      </div>

      <section className="auth-card">
        <p className="eyebrow">Create account</p>
        <h2>Start managing leads</h2>
        <p className="muted">
          Add your CRM account, then continue straight to the dashboard.
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <label htmlFor="name">
            Full name
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
          </label>

          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              required
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              minLength={6}
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              required
            />
          </label>

          <button className="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
