import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { subscribe as subscribeFleet, getVehicles } from "./fleetStore";
import { CHECK_PRICE, WALLET_BALANCE } from "./verificationsStore";
import BillingTimeline from "./charts/BillingTimeline";
import EmptyState, { EMPTY_ICONS } from "./EmptyState";
import "./overview.css";
import "./fleet.css";
import "./billing.css";

// Live Paystack payment link (card or M-Pesa checkout)
const PAYSTACK_LINK = "https://paystack.shop/pay/f31jnsoutz";

const PLAN = { launchRate: 200 };

// Invoices, newest first — populated by the billing API when it ships
// (docs/backend-api.md §10).
const INVOICES = [];

const fmtAmount = (n) => n.toLocaleString("en-KE");

export default function Billing() {
  const vehicles = useSyncExternalStore(subscribeFleet, getVehicles);

  const wallet = WALLET_BALANCE;
  const checksUsed = 0;
  const monthly = vehicles.length * PLAN.launchRate;

  // the two bars that make up this month's spend
  const billed = [
    { label: "Vehicles on plan", detail: `${vehicles.length} × KES ${PLAN.launchRate}`, amount: monthly, color: "var(--brand)" },
    { label: "Renter checks", detail: `${checksUsed} × KES ${CHECK_PRICE} · from wallet`, amount: checksUsed * CHECK_PRICE, color: "#d97706" },
  ];
  const totalSpend = billed.reduce((s, b) => s + b.amount, 0);

  if (vehicles.length === 0) {
    return (
      <section className="panel-card">
        <EmptyState
          icon={EMPTY_ICONS.payments}
          title="No bill yet"
          message="Add vehicles to your fleet and your first monthly bill is generated once your trial ends."
          action={
            <Link to="/dashboard/fleet/new" className="btn btn-primary">
              Add a vehicle
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <>
      {/* ---- Two graphs on top: paid-over-time + this month's breakdown ---- */}
      <div className="chart-row">
        <section className="chart-card">
          <header className="card-head">
            <h2>What you've paid</h2>
            <p>Your monthly bill over time</p>
          </header>
          {INVOICES.length > 0 ? (
            <BillingTimeline />
          ) : (
            <EmptyState
              icon={EMPTY_ICONS.payments}
              title="No payments yet"
              message="Your paid invoices will chart here once your first billing cycle closes."
            />
          )}
        </section>

        <section className="chart-card">
          <header className="card-head">
            <h2>This month</h2>
            <p>KES {fmtAmount(totalSpend)} · what July is made of</p>
          </header>

          <div className="usage-list">
            {billed.map((b) => (
              <div className="usage-row" key={b.label}>
                <div className="usage-head">
                  <span className="usage-label">{b.label}</span>
                  <span className="usage-amount">KES {fmtAmount(b.amount)}</span>
                </div>
                <span className="usage-bar">
                  <i
                    style={{
                      width: totalSpend ? `${(b.amount / totalSpend) * 100}%` : "0%",
                      background: b.color,
                    }}
                  />
                </span>
                <span className="usage-detail">{b.detail}</span>
              </div>
            ))}
          </div>

          <div className="wallet-strip">
            <div>
              <p className="wallet-label">Check wallet</p>
              <p className="wallet-sub">
                KES {fmtAmount(wallet)} · ≈ {Math.floor(wallet / CHECK_PRICE)} checks left
              </p>
            </div>
            <a className="btn wallet-btn" href={PAYSTACK_LINK} target="_blank" rel="noreferrer">
              Top up
            </a>
          </div>
        </section>
      </div>

      {/* ---- Invoices as a plain horizontal list, pay button on the right ---- */}
      <section className="panel-card">
        <header className="card-head">
          <h2>Invoices</h2>
          <p>Pay what's due · past invoices below</p>
        </header>

        <div className="invoice-list">
          {INVOICES.length === 0 && (
            <p className="invoice-empty">
              No invoices yet — your first one is generated when your trial ends.
            </p>
          )}
          {INVOICES.map((inv) => {
            const due = inv.status === "Due";
            return (
              <div className={`invoice-row ${due ? "is-due" : ""}`} key={inv.ref}>
                <div className="invoice-main">
                  <p className="invoice-title">{inv.title}</p>
                  <p className="invoice-detail">{inv.detail} · {inv.when}</p>
                </div>
                <p className="invoice-amount">KES {fmtAmount(inv.amount)}</p>
                {due ? (
                  <a
                    className="btn btn-primary invoice-pay"
                    href={PAYSTACK_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pay now
                  </a>
                ) : (
                  <span className="invoice-status">
                    <span className="chip active">Paid</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
