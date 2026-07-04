import { useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { subscribe as subscribeFleet, getVehicles } from "./fleetStore";
import { subscribe as subscribeStaff, getStaff, SEATS } from "./staffStore";
import "./fleet.css";
import "./bookings.css";
import "./workspace.css";

// Growth plan limits (mock — real limits come with the billing engine)
const PLAN = { vehicles: 50, verifications: 50, verificationsUsed: 5 };

const PREFS = [
  { key: "bookings", name: "Booking activity", desc: "New requests, confirmations and cancellations" },
  { key: "payments", name: "Payments", desc: "Prompts paid, failed or refunded" },
  { key: "verification", name: "Verification results", desc: "When a customer passes or fails a check" },
  { key: "documents", name: "Document expiry", desc: "Insurance and inspection reminders" },
  { key: "staff", name: "Staff changes", desc: "Invites accepted and roles changed" },
];

export default function Settings() {
  const vehicles = useSyncExternalStore(subscribeFleet, getVehicles);
  const staff = useSyncExternalStore(subscribeStaff, getStaff);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    bookings: true,
    payments: true,
    verification: true,
    documents: true,
    staff: false,
  });

  const usage = [
    { label: "Vehicles", used: vehicles.length, cap: PLAN.vehicles },
    { label: "Staff seats", used: staff.length, cap: SEATS },
    { label: "Verifications this month", used: PLAN.verificationsUsed, cap: PLAN.verifications },
  ];

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
                  <select id="set-currency" defaultValue="KES — Kenyan shilling">
                    <option>KES — Kenyan shilling</option>
                    <option>USD — US dollar</option>
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
              <p>Renews 1 Aug 2026 · billed via M-Pesa</p>
            </header>
            <p className="util-hero">Growth</p>
            <p className="plan-price">KES 9,500 / month</p>
            {usage.map((u) => (
              <div className="usage-row" key={u.label}>
                <div className="usage-head">
                  <span>{u.label}</span>
                  <span>
                    {u.used} / {u.cap}
                  </span>
                </div>
                <span className="util-bar util-bar-lg">
                  <i style={{ width: `${Math.min(100, (u.used / u.cap) * 100)}%` }} />
                </span>
              </div>
            ))}
            <Link to="/dashboard/billing" className="btn btn-ghost pay-btn">
              Manage plan &amp; billing
            </Link>
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
