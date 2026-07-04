import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fmtDate } from "./bookingsStore";
import "./fleet.css";
import "./bookings.css";

// Mock Dojah check log — read-only until the verification API is wired in.
// Growth plan includes 50 checks per month.
const QUOTA = 50;

const CHECKS = [
  { id: 1, customer: "Kevin Omondi", ref: "BK-2438", type: "ID lookup", result: "Pending", conf: null, date: "2026-07-03" },
  { id: 2, customer: "Esther Nyambura", ref: null, type: "ID lookup", result: "Failed", conf: 34, date: "2026-07-03" },
  { id: 3, customer: "Mercy Wambui", ref: "BK-2437", type: "ID lookup", result: "Pending", conf: null, date: "2026-07-02" },
  { id: 4, customer: "Dennis Mutua", ref: "BK-2436", type: "Selfie match", result: "Pending", conf: null, date: "2026-07-02" },
  { id: 5, customer: "Dennis Mutua", ref: "BK-2436", type: "ID lookup", result: "Passed", conf: 98, date: "2026-07-01" },
  { id: 6, customer: "Grace Achieng", ref: "BK-2435", type: "Selfie match", result: "Passed", conf: 96, date: "2026-06-30" },
  { id: 7, customer: "Grace Achieng", ref: "BK-2435", type: "ID lookup", result: "Passed", conf: 99, date: "2026-06-30" },
  { id: 8, customer: "James Otieno", ref: "BK-2434", type: "Licence check", result: "Passed", conf: 97, date: "2026-06-28" },
  { id: 9, customer: "James Otieno", ref: "BK-2434", type: "ID lookup", result: "Passed", conf: 99, date: "2026-06-28" },
  { id: 10, customer: "Wanjiku Kamau", ref: "BK-2431", type: "Selfie match", result: "Passed", conf: 95, date: "2026-06-25" },
  { id: 11, customer: "Wanjiku Kamau", ref: "BK-2431", type: "ID lookup", result: "Passed", conf: 98, date: "2026-06-25" },
  { id: 12, customer: "Brian Mwangi", ref: "BK-2429", type: "Licence check", result: "Passed", conf: 97, date: "2026-06-22" },
  { id: 13, customer: "Faith Njeri", ref: "BK-2426", type: "ID lookup", result: "Passed", conf: 98, date: "2026-06-20" },
  { id: 14, customer: "Samuel Kiptoo", ref: "BK-2424", type: "Selfie match", result: "Passed", conf: 95, date: "2026-06-19" },
  { id: 15, customer: "Samuel Kiptoo", ref: "BK-2424", type: "Selfie match", result: "Failed", conf: 41, date: "2026-06-18" },
  { id: 16, customer: "Samuel Kiptoo", ref: "BK-2424", type: "ID lookup", result: "Passed", conf: 99, date: "2026-06-18" },
];

const RESULTS = ["All", "Passed", "Failed", "Pending"];

const RESULT_CHIP = {
  Passed: "active",
  Failed: "cancelled",
  Pending: "pending",
};

export default function Verification() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHECKS.filter((c) => {
      if (result !== "All" && c.result !== result) return false;
      if (!q) return true;
      return (
        c.customer.toLowerCase().includes(q) ||
        (c.ref && c.ref.toLowerCase().includes(q)) ||
        c.type.toLowerCase().includes(q)
      );
    });
  }, [query, result]);

  const stats = useMemo(() => {
    const thisMonth = CHECKS.filter((c) => c.date.startsWith("2026-07")).length;
    const passed = CHECKS.filter((c) => c.result === "Passed").length;
    const failed = CHECKS.filter((c) => c.result === "Failed").length;
    const pending = CHECKS.filter((c) => c.result === "Pending").length;
    return {
      thisMonth,
      pending,
      passRate: Math.round((passed / (passed + failed)) * 100),
      remaining: QUOTA - thisMonth,
    };
  }, []);

  return (
    <>
      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Checks this month</p>
          <p className="stat-value">{stats.thisMonth}</p>
          <p className="stat-note">of {QUOTA} on the Growth plan</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pass rate</p>
          <p className="stat-value">{stats.passRate}%</p>
          <p className="stat-note">of completed checks</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Awaiting result</p>
          <p className="stat-value">{stats.pending}</p>
          <p className="stat-note">customer action needed</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Quota remaining</p>
          <p className="stat-value">{stats.remaining}</p>
          <p className="stat-note">resets 1 Aug 2026</p>
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
              placeholder="Search customer, booking or check type"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search verification checks"
            />
          </div>
          <div className="seg" role="group" aria-label="Filter by result">
            {RESULTS.map((r) => (
              <button
                key={r}
                type="button"
                className={r === result ? "active" : ""}
                onClick={() => setResult(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Check</th>
              <th>Result</th>
              <th className="num">Confidence</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <p className="strong">{c.customer}</p>
                  <p className="cell-sub">
                    {c.ref ? (
                      <Link className="spec-link" to={`/dashboard/bookings/${encodeURIComponent(c.ref)}`}>
                        {c.ref}
                      </Link>
                    ) : (
                      "No booking yet"
                    )}
                  </p>
                </td>
                <td>{c.type}</td>
                <td>
                  <span className={`chip ${RESULT_CHIP[c.result]}`}>{c.result}</span>
                </td>
                <td className="num">{c.conf !== null ? `${c.conf}%` : "—"}</td>
                <td>{fmtDate(c.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-block fleet-empty">
            <p>No checks match your search.</p>
          </div>
        )}
      </section>
    </>
  );
}
