import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Dropdown from "../components/Dropdown";
import usePageTitle from "../hooks/usePageTitle";
import "./auth.css";

const FLEET_SIZES = ["3 – 10 vehicles", "11 – 30 vehicles", "31 – 100 vehicles", "100+ vehicles"];

/* Access is by request: every business is verified before logins are sent. */
export default function Signup() {
  usePageTitle("Request access");
  const [sent, setSent] = useState(false);
  const [fleetSize, setFleetSize] = useState(FLEET_SIZES[0]);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth">
        <header className="auth-nav">
          <Logo />
        </header>

        <main className="auth-card">
          <span className="request-check" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <h1>Request received.</h1>
          <p>
            We verify every business before opening an account: registration,
            KRA PIN and director identity. Expect your logins by email or
            WhatsApp within 24 hours.
          </p>
          <p className="request-ref">Reference: REQ-2026-118</p>
          <Link to="/" className="btn btn-ghost">
            Back to home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="auth">
      <Link to="/" className="auth-back" aria-label="Back to home">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <header className="auth-nav">
        <Logo />
      </header>

      <main className="request-split">
        <div className="request-intro">
          <h1>Request access</h1>
          <p>
            Ardena for Business is for verified rental businesses only. Tell us
            about yours and we'll send your logins within 24 hours.
          </p>
          <p className="request-note">
            Every business on Ardena is verified before any logins go out, so
            renters and partners know your fleet is real.
          </p>
          <p className="auth-switch">
            Already have logins? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <form className="auth-form request-form" onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="field">
              <label htmlFor="r-business">Business name</label>
              <input id="r-business" type="text" placeholder="Acme Car Hire Ltd" autoComplete="organization" required />
            </div>
            <div className="field">
              <label htmlFor="r-fleet">Fleet size</label>
              <Dropdown
                id="r-fleet"
                value={fleetSize}
                onChange={setFleetSize}
                options={FLEET_SIZES}
              />
            </div>
          </div>
          <div className="auth-row">
            <div className="field">
              <label htmlFor="r-town">Town / county</label>
              <input id="r-town" type="text" placeholder="Nakuru" required />
            </div>
            <div className="field">
              <label htmlFor="r-name">Your name</label>
              <input id="r-name" type="text" placeholder="Wanjiku Kamau" autoComplete="name" required />
            </div>
          </div>
          <div className="auth-row">
            <div className="field">
              <label htmlFor="r-email">Work email</label>
              <input id="r-email" type="email" placeholder="you@company.co.ke" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="r-phone">Phone (WhatsApp)</label>
              <input id="r-phone" type="tel" placeholder="0700 000 000" autoComplete="tel" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="r-web">Website or Instagram · optional</label>
            <input id="r-web" type="text" placeholder="acmecarhire.co.ke" />
          </div>
          <button type="submit" className="btn btn-primary">
            Request access
          </button>
        </form>
      </main>
    </div>
  );
}
