import { useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { subscribe as subscribeFleet, getVehicles } from "./fleetStore";
import { subscribe as subscribePolicy, getPolicy, setPolicy, RETURN_HOUR } from "./policyStore";
import { CHECK_PRICE } from "./verificationsStore";
import VerifiedBadge from "../components/VerifiedBadge";
import "./fleet.css";
import "./bookings.css";
import "./workspace.css";

// Per-vehicle pricing (mock, real numbers come with the billing engine)
const PLAN = { launchRate: 200, minimum: 2000 };

const PREFS = [
  { key: "bookings", name: "Booking activity", desc: "New requests, confirmations and cancellations" },
  { key: "payments", name: "Payments", desc: "Prompts paid, failed or refunded" },
  { key: "verification", name: "Verification results", desc: "When a customer passes or fails a check" },
  { key: "documents", name: "Document expiry", desc: "Insurance and inspection reminders" },
  { key: "staff", name: "Staff changes", desc: "Invites accepted and roles changed" },
];

export default function Settings() {
  const vehicles = useSyncExternalStore(subscribeFleet, getVehicles);
  const policy = useSyncExternalStore(subscribePolicy, getPolicy);
  const [saved, setSaved] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);

  function handlePolicySave(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPolicy({
      deposit: Number(f.get("deposit")),
      lateFeePerHour: Number(f.get("lateFee")),
    });
    setPolicySaved(true);
  }
  const [prefs, setPrefs] = useState({
    bookings: true,
    payments: true,
    verification: true,
    documents: true,
    staff: false,
  });

  const monthly = Math.max(PLAN.minimum, vehicles.length * PLAN.launchRate);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <>
      <div className="details-grid">
        <div className="settings-main">
          <section className="panel-card">
            <header className="card-head">
              <h2>Business profile</h2>
              <p>Shown on customer-facing prompts and receipts</p>
            </header>
            <form onSubmit={handleSave} onChange={() => setSaved(false)}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="set-name">Business name</label>
                  <input id="set-name" type="text" defaultValue="Acme Car Hire" required />
                </div>
                <div className="field">
                  <label htmlFor="set-phone">Business phone</label>
                  <input id="set-phone" type="tel" defaultValue="0700 123 456" required />
                </div>
                <div className="field">
                  <label htmlFor="set-email">Contact email</label>
                  <input id="set-email" type="email" defaultValue="hello@acmecarhire.co.ke" required />
                </div>
                <div className="field">
                  <label htmlFor="set-city">Location</label>
                  <input id="set-city" type="text" defaultValue="Nairobi, Kenya" />
                </div>
                <div className="field">
                  <label htmlFor="set-currency">Currency</label>
                  <select id="set-currency" defaultValue="KES, Kenyan shilling">
                    <option>KES, Kenyan shilling</option>
                    <option>USD, US dollar</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
                {saved && <p className="save-note">Changes saved.</p>}
              </div>
            </form>
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Rental policy</h2>
              <p>Applied to agreements, deposits and late returns</p>
            </header>
            <form onSubmit={handlePolicySave} onChange={() => setPolicySaved(false)}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="pol-deposit">Security deposit (KES)</label>
                  <input
                    id="pol-deposit"
                    name="deposit"
                    type="number"
                    min="0"
                    step="500"
                    defaultValue={policy.deposit}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="pol-late">Late return penalty (KES per hour)</label>
                  <input
                    id="pol-late"
                    name="lateFee"
                    type="number"
                    min="0"
                    step="50"
                    defaultValue={policy.lateFeePerHour}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save policy
                </button>
                {policySaved && <p className="save-note">Policy saved.</p>}
              </div>
            </form>
            <p className="side-hint">
              Vehicles are due back by {RETURN_HOUR}:00 AM on the return date.
              Every started hour after that is charged at the hourly penalty,
              and both figures are written into every rental agreement.
            </p>
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Notification preferences</h2>
              <p>What lands in your inbox and notification feed</p>
            </header>
            {PREFS.map((p) => (
              <div className="pref-row" key={p.key}>
                <div>
                  <p className="pref-name">{p.name}</p>
                  <p className="pref-desc">{p.desc}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={prefs[p.key]}
                    onChange={(e) =>
                      setPrefs({ ...prefs, [p.key]: e.target.checked })
                    }
                    aria-label={`Toggle ${p.name}`}
                  />
                  <i />
                </label>
              </div>
            ))}
          </section>
        </div>

        <div className="details-side">
          <section className="panel-card">
            <header className="card-head">
              <h2>Plan &amp; billing</h2>
              <p>Renews 1 Aug 2026 · billed via Paystack</p>
            </header>
            <p className="util-hero">Fleet plan</p>
            <p className="plan-price">
              KES {PLAN.launchRate} / vehicle / month · launch price
            </p>
            <div className="pay-row">
              <span>Vehicles billed</span>
              <span className="mini-amount">
                {vehicles.length} · KES {monthly.toLocaleString("en-KE")}/mo
              </span>
            </div>
            <div className="pay-row">
              <span>Bookings, staff &amp; prompts</span>
              <span className="mini-amount">Included</span>
            </div>
            <div className="pay-row">
              <span>Renter checks</span>
              <span className="mini-amount">KES {CHECK_PRICE} · pay as you go</span>
            </div>
            <Link to="/dashboard/billing" className="btn btn-ghost pay-btn">
              Manage plan &amp; billing
            </Link>
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Business verification</h2>
              <p>Checked before this account was opened</p>
            </header>
            <div className="pay-row">
              <span>Status</span>
              <VerifiedBadge />
            </div>
            <div className="pay-row">
              <span>Registration</span>
              <span className="mini-amount">Confirmed</span>
            </div>
            <div className="pay-row">
              <span>KRA PIN</span>
              <span className="mini-amount">Matched</span>
            </div>
            <div className="pay-row">
              <span>Director ID</span>
              <span className="mini-amount">Verified</span>
            </div>
            <a
              className="btn btn-ghost pay-btn"
              href="/v/acme-car-hire"
              target="_blank"
              rel="noreferrer"
            >
              View public verification page
            </a>
            <p className="side-hint">
              Share that page with customers on WhatsApp or socials. It proves
              Acme Car Hire is a real, verified rental business.
            </p>
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Workspace</h2>
              <p>Tenant details</p>
            </header>
            <div className="pay-row">
              <span>Tenant ID</span>
              <span className="mini-amount">ACM-0042</span>
            </div>
            <div className="pay-row">
              <span>Region</span>
              <span className="mini-amount">Kenya (Nairobi)</span>
            </div>
            <div className="pay-row">
              <span>Created</span>
              <span className="mini-amount">12 Jan 2026</span>
            </div>
            <p className="side-hint">
              Data export and workspace transfer arrive with the platform admin console.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
