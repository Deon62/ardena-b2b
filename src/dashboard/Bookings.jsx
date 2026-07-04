import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  subscribe,
  getBookings,
  fmtRange,
  rentalDays,
} from "./bookingsStore";
import "./fleet.css";
import "./bookings.css";

const STATUSES = ["All", "Pending", "Confirmed", "Active", "Completed", "Cancelled"];

export const STATUS_CHIP = {
  Pending: "pending",
  Confirmed: "confirmed",
  Active: "active",
  Completed: "completed",
  Cancelled: "cancelled",
};

export const PAY_CHIP = {
  Paid: "active",
  "Prompt sent": "pending",
  Unpaid: "completed",
  Refunded: "cancelled",
};

const fmtAmount = (n) => n.toLocaleString("en-KE");

export default function Bookings() {
  const bookings = useSyncExternalStore(subscribe, getBookings);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== "All" && b.status !== status) return false;
      if (!q) return true;
      return (
        b.customer.toLowerCase().includes(q) ||
        b.ref.toLowerCase().includes(q) ||
        b.vehicle.toLowerCase().includes(q) ||
        b.plate.toLowerCase().includes(q)
      );
    });
  }, [bookings, query, status]);

  const stats = useMemo(() => {
    const count = (s) => bookings.filter((b) => b.status === s).length;
    const bookedValue = bookings
      .filter((b) => b.status === "Active" || b.status === "Confirmed")
      .reduce((sum, b) => sum + rentalDays(b.pickup, b.dropoff) * b.rate, 0);
    return {
      active: count("Active"),
      confirmed: count("Confirmed"),
      pending: count("Pending"),
      bookedValue,
    };
  }, [bookings]);

  return (
    <>
      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Active rentals</p>
          <p className="stat-value">{stats.active}</p>
          <p className="stat-note">vehicles out right now</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Upcoming pickups</p>
          <p className="stat-value">{stats.confirmed}</p>
          <p className="stat-note">confirmed reservations</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pending review</p>
          <p className="stat-value">{stats.pending}</p>
          <p className="stat-note">awaiting confirmation</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Booked value</p>
          <p className="stat-value">KES {fmtAmount(stats.bookedValue)}</p>
          <p className="stat-note">active &amp; upcoming rentals</p>
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
              aria-label="Search bookings"
            />
          </div>
          <div className="seg" role="group" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={s === status ? "active" : ""}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <Link to="/dashboard/bookings/new" className="btn btn-primary toolbar-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New booking
          </Link>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Dates</th>
              <th className="num">Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const days = rentalDays(b.pickup, b.dropoff);
              return (
                <tr key={b.ref}>
                  <td>
                    <p className="strong">{b.customer}</p>
                    <p className="cell-sub">{b.ref}</p>
                  </td>
                  <td>
                    <p className="strong">{b.vehicle}</p>
                    <p className="cell-sub">{b.plate}</p>
                  </td>
                  <td>
                    <p>{fmtRange(b.pickup, b.dropoff)}</p>
                    <p className="cell-sub">
                      {days} day{days > 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="num">{fmtAmount(days * b.rate)}</td>
                  <td>
                    <span className={`chip ${PAY_CHIP[b.payment]}`}>{b.payment}</span>
                  </td>
                  <td>
                    <span className={`chip ${STATUS_CHIP[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="actions-cell">
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
            <p>No bookings match your search.</p>
          </div>
        )}
      </section>
    </>
  );
}
