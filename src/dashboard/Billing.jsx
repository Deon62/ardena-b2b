import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSubscription, fetchInvoices, payInvoice, fetchBillingUsage } from "../lib/api";
import BillingTimeline from "./charts/BillingTimeline";
import EmptyState, { EMPTY_ICONS } from "./EmptyState";
import { toast } from "./toastStore";
import "./overview.css";
import "./fleet.css";
import "./billing.css";

const fmtAmount = (n) => Number(n).toLocaleString("en-KE");

const STATUS_CHIP = {
  trial: "pending",
  active: "active",
  past_due: "cancelled",
};

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-KE", { dateStyle: "medium" });
}

export default function Billing() {
  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingRef, setPayingRef] = useState(null);

  const load = useCallback(async () => {
    try {
      const [subData, invData, usageData] = await Promise.all([
        fetchSubscription(),
        fetchInvoices(),
        fetchBillingUsage(),
      ]);
      setSub(subData);
      setInvoices(invData.data || []);
      setUsage(usageData);
    } catch (err) {
      toast(err.message || "Failed to load billing", "danger");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePayInvoice(inv) {
    if (payingRef) return;
    setPayingRef(inv.ref);
    try {
      // Use existing checkout_url if available, otherwise initiate via API
      let checkout = inv.checkout_url;
      if (!checkout) {
        const result = await payInvoice(inv.ref);
        checkout = result.checkout_url;
        // Refresh to get updated checkout_url stored on invoice
        const updated = await fetchInvoices();
        setInvoices(updated.data || []);
      }
      window.open(checkout, "_blank", "noopener,noreferrer");
      toast("Paystack checkout opened — complete your payment there.");
    } catch (err) {
      toast(err.message || "Failed to initiate payment", "danger");
    } finally {
      setPayingRef(null);
    }
  }

  if (loading) {
    return <div className="empty-block fleet-empty"><p>Loading billing…</p></div>;
  }

  const totalSpend = usage ? usage.total : 0;
  const paidInvoices = invoices.filter((i) => i.status === "Paid");

  return (
    <>
      {/* ---- Subscription summary strip ---- */}
      {sub && (
        <div className="stat-grid fleet-stats" style={{ marginBottom: "1.5rem" }}>
          <article className="stat-card">
            <p className="stat-label">Plan</p>
            <p className="stat-value">{sub.plan}</p>
            <p className="stat-note">
              <span className={`chip ${STATUS_CHIP[sub.status] || "pending"}`} style={{ fontSize: "11px" }}>
                {sub.status === "trial" ? "Free trial" : sub.status === "past_due" ? "Past due" : "Active"}
              </span>
            </p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Vehicles on plan</p>
            <p className="stat-value">{sub.vehicle_count}</p>
            <p className="stat-note">KES {fmtAmount(sub.rate)} / vehicle / month</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Monthly total</p>
            <p className="stat-value">KES {fmtAmount(sub.monthly_total)}</p>
            <p className="stat-note">KES 2,000 minimum applies</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">
              {sub.status === "trial" ? "Trial ends" : "Launch rate until"}
            </p>
            <p className="stat-value" style={{ fontSize: "1.25rem" }}>
              {fmtDate(sub.status === "trial" ? sub.trial_ends : sub.launch_rate_until)}
            </p>
            <p className="stat-note">
              {sub.status === "trial"
                ? "No charge until trial ends"
                : `KES ${fmtAmount(400)} / vehicle after this`}
            </p>
          </article>
        </div>
      )}

      {/* ---- Charts ---- */}
      <div className="chart-row">
        <section className="chart-card">
          <header className="card-head">
            <h2>What you've paid</h2>
            <p>Your monthly bill over time</p>
          </header>
          {paidInvoices.length > 0 ? (
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
            <p>
              {usage
                ? `KES ${fmtAmount(totalSpend)} · what this month is made of`
                : "Loading usage…"}
            </p>
          </header>

          {usage && (
            <>
              <div className="usage-list">
                {usage.items.map((item) => (
                  <div className="usage-row" key={item.label}>
                    <div className="usage-head">
                      <span className="usage-label">{item.label}</span>
                      <span className="usage-amount">KES {fmtAmount(item.amount)}</span>
                    </div>
                    <span className="usage-bar">
                      <i
                        style={{
                          width: totalSpend ? `${(item.amount / totalSpend) * 100}%` : "0%",
                          background: item.color,
                        }}
                      />
                    </span>
                    <span className="usage-detail">{item.detail}</span>
                  </div>
                ))}
              </div>

              <div className="wallet-strip">
                <div>
                  <p className="wallet-label">Check wallet</p>
                  <p className="wallet-sub">
                    KES {fmtAmount(usage.wallet_balance)} · ≈{" "}
                    {Math.floor(usage.wallet_balance / usage.check_price)} checks left
                  </p>
                </div>
                <Link className="btn wallet-btn" to="/dashboard/verification">
                  Top up
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ---- Invoices ---- */}
      <section className="panel-card">
        <header className="card-head">
          <h2>Invoices</h2>
          <p>Pay what's due · past invoices below</p>
        </header>

        <div className="invoice-list">
          {invoices.length === 0 ? (
            <p className="invoice-empty">
              No invoices yet — your first one is generated when your trial ends.
            </p>
          ) : (
            invoices.map((inv) => {
              const due = inv.status === "Due";
              return (
                <div className={`invoice-row ${due ? "is-due" : ""}`} key={inv.ref}>
                  <div className="invoice-main">
                    <p className="invoice-title">{inv.title}</p>
                    <p className="invoice-detail">
                      {inv.detail} · Due {fmtDate(inv.due_date)}
                      {inv.paid_at ? ` · Paid ${fmtDate(inv.paid_at)}` : ""}
                    </p>
                  </div>
                  <p className="invoice-amount">KES {fmtAmount(inv.amount)}</p>
                  {due ? (
                    <button
                      type="button"
                      className="btn btn-primary invoice-pay"
                      disabled={payingRef === inv.ref}
                      onClick={() => handlePayInvoice(inv)}
                    >
                      {payingRef === inv.ref ? "Opening…" : "Pay now"}
                    </button>
                  ) : (
                    <span className="invoice-status">
                      <span className="chip active">Paid</span>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
