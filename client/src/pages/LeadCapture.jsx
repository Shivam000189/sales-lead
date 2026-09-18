import { Link } from "react-router-dom";
import LeadFormShared from "../embed/LeadFormShared";

export default function LeadCapture() {
  return (
    <div className="capture-page">
      <header className="capture-nav">
        <Link to="/" className="brand">
          <span>H</span> HeroCRM
        </Link>
        <Link to="/login">Team sign in →</Link>
      </header>
      <main className="capture-main">
        <section className="capture-copy">
          <p className="eyebrow">LET’S START A CONVERSATION</p>
          <h1>Big ideas deserve a brilliant next step.</h1>
          <p>
            Tell us a little about what you’re building. Our team will reach out
            with a thoughtful response, not a generic sales pitch.
          </p>
          <div className="capture-proof">
            <span>✓</span>
            <div>
              <strong>Human replies, quickly</strong>
              <small>Usually within one business day</small>
            </div>
          </div>
        </section>
        <LeadFormShared />
      </main>
    </div>
  );
}
