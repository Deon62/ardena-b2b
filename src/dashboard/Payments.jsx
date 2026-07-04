import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  subscribe,
  getBookings,
  setPayment,
  fmtRange,
  rentalDays,
} from "./bookingsStore";
import { PAY_CHIP } from "./Bookings";
import "./fleet.css";
import "./bookings.css";

const FILTERS = ["All", "Paid", "Prompt sent", "Unpaid", "Refunded"];

const fmtAmount = (n) => n.toLocaleString("en-KE");

// mock M-Pesa receipt code, deterministic per booking, until Daraja is wired in
const receiptFor = (ref) => `TG${ref.slice(-4)}${"KQXWLM"[Number(ref.slice(-1)) % 6]}J`;

export default function Payments() {
  const bookings = useSyncExternalStore(subscribe, getBookings);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "All" && b.payment !== filter) return false;
      if (!q) return true;
      return (
        b.customer.toLowerCase().includes(q) ||
        b.ref.toLowerCase().includes(q) ||
        b.vehicle.toLowerCase().includes(q) ||
        b.plate.toLowerCase().includes(q)
      );
    });
  }, [bookings, query, filter]);

  const stats = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let refunded = 0;
    let prompts = 0;
    bookings.forEach((b) => {
      const amount = rentalDays(b.pickup, b.dropoff) * b.rate;
      if (b.payment === "Paid") collected += amount;
      if (b.payment === "Refunded") refunded += amount;
      if (b.payment === "Prompt sent") prompts += 1;
      if (
        (b.payment === "Unpaid" || b.payment === "Prompt sent") &&
        b.status !== "Cancelled"
      ) {
        outstanding += amount;
      }
    });
    return { collected, outstanding, refunded, prompts };
  }, [bookings]);

  return (
    <>
      <div className="page-head">
        <h1>Payments</h1>
        <p>What you've collected from customers, and what's still out.</p>
      </div>

      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Collected</p>
          <p className="stat-value">KES {fmtAmount(stats.collected)}</p>
          <p className="stat-note">paid via M-Pesa</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Outstanding</p>
          <p className="stat-value">KES {fmtAmount(stats.outstanding)}</p>
          <p className="stat-note">on live bookings</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Prompts awaiting</p>
          <p className="stat-value">{stats.prompts}</p>
          <p className="stat-note">STK pushes not yet paid</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Refunded</p>
          <p className="stat-value">KES {fmtAmount(stats.refunded)}</p>
          <p className="stat-note">from cancelled bookings</p>
        </article>
      </div>

      <section className="panel-card">
        <div className="fleet-toolbar">
          <div className="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search customer, ref, vehicle or plate"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search payments"
            />
          </div>
          <div className="seg" role="group" aria-label="Filter by payment status">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={f === filter ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Booking dates</th>
              <th className="num">Amount</th>
              <th>Receipt</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const amount = rentalDays(b.pickup, b.dropoff) * b.rate;
              const canPrompt =
                b.payment !== "Paid" &&
                b.payment !== "Refunded" &&
                b.status !== "Cancelled" &&
                b.status !== "Completed";
              return (
                <tr key={b.ref}>
                  <td>
                    <p className="strong">{b.customer}</p>
                    <p className="cell-sub">{b.ref}</p>
                  </td>
                  <td>
                    <p>{b.vehicle}</p>
                    <p className="cell-sub">{b.plate}</p>
                  </td>
                  <td>{fmtRange(b.pickup, b.dropoff)}</td>
                  <td className="num">{fmtAmount(amount)}</td>
                  <td>
                    {b.payment === "Paid" || b.payment === "Refunded"
                      ? receiptFor(b.ref)
                      : "—"}
                  </td>
                  <td>
                    <span className={`chip ${PAY_CHIP[b.payment]}`}>{b.payment}</span>
                  </td>
                  <td className="actions-cell">
                    {canPrompt && (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setPayment(b.ref, "Prompt sent")}
                      >
                        {b.payment === "Prompt sent" ? "Resend prompt" : "Send prompt"}
                      </button>
                    )}
                    <Link
                      className="icon-btn"
                      to={`/dashboard/bookings/${encodeURIComponent(b.ref)}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-block fleet-empty">
            <p>No payments match your search.</p>
          </div>
        )}
      </section>
    </>
  );
}
