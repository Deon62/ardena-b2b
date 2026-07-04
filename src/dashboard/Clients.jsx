import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { subscribe, getClients } from "./clientsStore";
import {
  subscribe as subscribeBookings,
  getBookings,
  fmtDate,
  rentalDays,
} from "./bookingsStore";
import "./fleet.css";
import "./bookings.css";

const FILTERS = ["All", "Verified", "Pending", "Failed"];

export const VERIF_CHIP = {
  Verified: "active",
  Pending: "pending",
  Failed: "cancelled",
};

const fmtAmount = (n) => n.toLocaleString("en-KE");

export default function Clients() {
  const clients = useSyncExternalStore(subscribe, getClients);
  const bookings = useSyncExternalStore(subscribeBookings, getBookings);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  // per-client booking count, spend (non-cancelled) and most recent pickup
  const byClient = useMemo(() => {
    const m = new Map();
    bookings.forEach((b) => {
      const cur = m.get(b.customer) || { count: 0, spend: 0, last: null };
      cur.count += 1;
      if (b.status !== "Cancelled") {
        cur.spend += rentalDays(b.pickup, b.dropoff) * b.rate;
      }
      if (!cur.last || b.pickup > cur.last) cur.last = b.pickup;
      m.set(b.customer, cur);
    });
    return m;
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter !== "All" && c.verification !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [clients, query, filter]);

  const stats = useMemo(() => {
    const verified = clients.filter((c) => c.verification === "Verified").length;
    const pending = clients.filter((c) => c.verification !== "Verified").length;
    let value = 0;
    byClient.forEach((v) => {
      value += v.spend;
    });
    return { verified, pending, value };
  }, [clients, byClient]);

  return (
    <>
      <div className="page-head-row">
        <div className="page-head">
          <h1>Clients</h1>
          <p>{clients.length} customers on record</p>
        </div>
        <Link to="/dashboard/bookings/new" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New booking
        </Link>
      </div>

      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Total clients</p>
          <p className="stat-value">{clients.length}</p>
          <p className="stat-note">renters &amp; corporate accounts</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Verified</p>
          <p className="stat-value">{stats.verified}</p>
          <p className="stat-note">cleared to rent</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Needs verification</p>
          <p className="stat-value">{stats.pending}</p>
          <p className="stat-note">pending or failed checks</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Lifetime value</p>
          <p className="stat-value">KES {fmtAmount(stats.value)}</p>
          <p className="stat-note">all non-cancelled bookings</p>
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
              placeholder="Search name, phone or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search clients"
            />
          </div>
          <div className="seg" role="group" aria-label="Filter by verification">
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
              <th>Client</th>
              <th>Contact</th>
              <th>Verification</th>
              <th className="num">Bookings</th>
              <th className="num">Total spend</th>
              <th>Last pickup</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const agg = byClient.get(c.name);
              return (
                <tr key={c.id}>
                  <td>
                    <p className="strong">{c.name}</p>
                    <p className="cell-sub">{c.id}</p>
                  </td>
                  <td>
                    <p>{c.phone}</p>
                    <p className="cell-sub">{c.email}</p>
                  </td>
                  <td>
                    <span className={`chip ${VERIF_CHIP[c.verification]}`}>{c.verification}</span>
                  </td>
                  <td className="num">{agg ? agg.count : 0}</td>
                  <td className="num">{agg ? fmtAmount(agg.spend) : "—"}</td>
                  <td>{agg ? fmtDate(agg.last) : "—"}</td>
                  <td className="actions-cell">
                    <Link
                      className="icon-btn"
                      to={`/dashboard/clients/${encodeURIComponent(c.id)}`}
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
            <p>No clients match your search.</p>
          </div>
        )}
      </section>
    </>
  );
}
