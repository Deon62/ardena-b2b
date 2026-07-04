import { useSyncExternalStore } from "react";
import { subscribe as subscribeFleet, getVehicles } from "./fleetStore";
import { subscribe as subscribeStaff, getStaff, SEATS } from "./staffStore";
import "./fleet.css";
import "./bookings.css";
import "./workspace.css";
import "./billing.css";

// Swap these slugs for the live Paystack payment links
const PAYSTACK = {
  payInvoice: "https://paystack.com/pay/ardena-growth-monthly",
  updateCard: "https://paystack.com/pay/ardena-update-card",
  upgrade: "https://paystack.com/pay/ardena-scale-monthly",
};

// Growth plan limits (mock — real numbers come with the billing engine)
const PLAN = {
  name: "Growth",
  price: 9500,
  vehicles: 50,
  verifications: 50,
  verificationsUsed: 5,
  prompts: 500,
  promptsUsed: 112,
};

const INVOICES = [
  { ref: "INV-2026-007", period: "July 2026", issued: "1 Jul 2026", amount: 9500, status: "Due" },
  { ref: "INV-2026-006", period: "June 2026", issued: "1 Jun 2026", amount: 9500, status: "Paid" },
  { ref: "INV-2026-005", period: "May 2026", issued: "1 May 2026", amount: 9500, status: "Paid" },
  { ref: "INV-2026-004", period: "April 2026", issued: "1 Apr 2026", amount: 9500, status: "Paid" },
  { ref: "INV-2026-003", period: "March 2026", issued: "1 Mar 2026", amount: 7000, status: "Paid" },
];

const fmtAmount = (n) => n.toLocaleString("en-KE");

export default function Billing() {
  const vehicles = useSyncExternalStore(subscribeFleet, getVehicles);
  const staff = useSyncExternalStore(subscribeStaff, getStaff);

  const usage = [
    { label: "Vehicles", used: vehicles.length, cap: PLAN.vehicles },
    { label: "Staff seats", used: staff.length, cap: SEATS },
    { label: "ID verifications", used: PLAN.verificationsUsed, cap: PLAN.verifications },
    { label: "M-Pesa prompts", used: PLAN.promptsUsed, cap: PLAN.prompts },
  ];

  const due = INVOICES.find((i) => i.status === "Due");

  return (
    <>
      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Current plan</p>
          <p className="stat-value">{PLAN.name}</p>
          <p className="stat-note">KES {fmtAmount(PLAN.price)} / month</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Balance due</p>
          <p className="stat-value">KES {fmtAmount(due ? due.amount : 0)}</p>
          <p className="stat-note">{due ? `${due.ref} · due 15 Jul 2026` : "all invoices settled"}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Seats used</p>
          <p className="stat-value">
            {staff.length} of {SEATS}
          </p>
          <p className="stat-note">on the {PLAN.name} plan</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Next renewal</p>
          <p className="stat-value">1 Aug</p>
          <p className="stat-note">2026 · billed monthly</p>
        </article>
      </div>

      <div className="details-grid">
        <div className="settings-main">
          <section className="panel-card">
            <header className="card-head">
              <h2>Usage this cycle</h2>
              <p>1 – 31 July 2026 · what you've used of the {PLAN.name} plan</p>
            </header>
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
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Invoices</h2>
              <p>Your billing history on Ardena</p>
            </header>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Issued</th>
                  <th className="num">Amount (KES)</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.ref}>
                    <td>
                      <p className="strong">{inv.ref}</p>
                      <p className="cell-sub">{inv.period}</p>
                    </td>
                    <td>{inv.issued}</td>
                    <td className="num">{fmtAmount(inv.amount)}</td>
                    <td>
                      <span className={`chip ${inv.status === "Paid" ? "active" : "pending"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {inv.status === "Due" ? (
                        <a
                          className="icon-btn prompt-green"
                          href={PAYSTACK.payInvoice}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Pay now
                        </a>
                      ) : (
                        <button type="button" className="icon-btn" disabled title="PDF receipts arrive with the billing engine">
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="details-side">
          <section className="panel-card">
            <header className="card-head">
              <h2>Pay with card</h2>
              <p>Settle the July invoice</p>
            </header>
            <p className="util-hero">KES {fmtAmount(due ? due.amount : 0)}</p>
            <p className="invoice-sub">{due ? `${due.ref} · due 15 Jul 2026` : "Nothing due right now"}</p>
            <a
              className="btn btn-primary pay-btn"
              href={PAYSTACK.payInvoice}
              target="_blank"
              rel="noreferrer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              Pay with card
            </a>
            <p className="paystack-note">
              You'll be redirected to Paystack's secure checkout. Visa,
              Mastercard and Verve accepted. M-Pesa billing is coming soon.
            </p>
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Billing details</h2>
              <p>Card and plan on file</p>
            </header>
            <div className="pay-row">
              <span>Plan</span>
              <span className="mini-amount">{PLAN.name}</span>
            </div>
            <div className="pay-row">
              <span>Card</span>
              <span className="mini-amount">Visa •••• 4081</span>
            </div>
            <div className="pay-row">
              <span>Billing email</span>
              <span className="mini-amount">hello@acmecarhire.co.ke</span>
            </div>
            <div className="action-stack">
              <a className="btn btn-ghost" href={PAYSTACK.updateCard} target="_blank" rel="noreferrer">
                Update card
              </a>
              <a className="btn btn-ghost" href={PAYSTACK.upgrade} target="_blank" rel="noreferrer">
                Upgrade to Scale — KES 18,000/mo
              </a>
            </div>
            <p className="side-hint">
              Card changes and upgrades are handled on secure Paystack pages —
              we never see your card number.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
