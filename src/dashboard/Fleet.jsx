import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  subscribe,
  getVehicles,
  removeVehicle,
  expiringSoon,
} from "./fleetStore";
import "./fleet.css";

const STATUSES = ["All", "Available", "On booking", "In maintenance"];

const CHIP_CLASS = {
  Available: "available",
  "On booking": "booked",
  "In maintenance": "maintenance",
};

const fmtRate = (r) => r.toLocaleString("en-KE");

export default function Fleet() {
  const vehicles = useSyncExternalStore(subscribe, getVehicles);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [confirming, setConfirming] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (status !== "All" && v.status !== status) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.cat.toLowerCase().includes(q)
      );
    });
  }, [vehicles, query, status]);

  const counts = useMemo(() => {
    const c = { Available: 0, "On booking": 0, "In maintenance": 0 };
    vehicles.forEach((v) => c[v.status]++);
    return c;
  }, [vehicles]);

  return (
    <>
      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Total fleet</p>
          <p className="stat-value">{vehicles.length}</p>
          <p className="stat-note">vehicles registered</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Available</p>
          <p className="stat-value">{counts.Available}</p>
          <p className="stat-note">ready to book</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">On booking</p>
          <p className="stat-value">{counts["On booking"]}</p>
          <p className="stat-note">out with customers</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">In maintenance</p>
          <p className="stat-value">{counts["In maintenance"]}</p>
          <p className="stat-note">temporarily off fleet</p>
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
              placeholder="Search vehicle, plate or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search fleet"
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
          <Link to="/dashboard/fleet/new" className="btn btn-primary toolbar-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add vehicle
          </Link>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Category</th>
              <th className="num">Day rate</th>
              <th>Utilisation</th>
              <th>Insurance</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const soon = expiringSoon(v.ins);
              return (
                <tr key={v.plate}>
                  <td>
                    <p className="strong">{v.name}</p>
                    <p className="cell-sub">{v.plate}</p>
                  </td>
                  <td>{v.cat}</td>
                  <td className="num">{fmtRate(v.rate)}</td>
                  <td>
                    <span className="util-cell">
                      <span className="util-bar">
                        <i style={{ width: `${v.util}%` }} />
                      </span>
                      {v.util}%
                    </span>
                  </td>
                  <td>
                    {soon !== null ? (
                      <span className="ins-soon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                          <path d="M12 9v4M12 17h.01" />
                        </svg>
                        in {soon} days
                      </span>
                    ) : (
                      v.ins
                    )}
                  </td>
                  <td>
                    <span className={`chip ${CHIP_CLASS[v.status]}`}>{v.status}</span>
                  </td>
                  <td className="actions-cell">
                    {confirming === v.plate ? (
                      <span className="confirm-inline">
                        Delete?
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => {
                            removeVehicle(v.plate);
                            setConfirming(null);
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setConfirming(null)}
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <>
                        <Link
                          className="icon-btn"
                          to={`/dashboard/fleet/${encodeURIComponent(v.plate)}`}
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="icon-btn danger"
                          aria-label={`Delete ${v.name}`}
                          onClick={() => setConfirming(v.plate)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-block fleet-empty">
            <p>No vehicles match your search.</p>
          </div>
        )}
      </section>
    </>
  );
}
