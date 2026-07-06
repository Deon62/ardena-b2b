import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { fmtDate } from "./bookingsStore";
import {
  SESSIONS,
  STATUS_CHIP,
  CHECK_PRICE,
  WALLET_BALANCE,
  WIDGET_URL,
} from "./verificationsStore";
import { markStep } from "./onboardingStore";
import { subscribe as subscribeDemo, getSampleData } from "./demoStore";
import EmptyState, { EMPTY_ICONS } from "./EmptyState";
import "./fleet.css";
import "./bookings.css";
import "./verification.css";

const OUTCOMES = [
  { key: "Verified", cls: "verified" },
  { key: "Failed", cls: "failed" },
  { key: "In progress", cls: "progress" },
  { key: "Abandoned", cls: "abandoned" },
];

const NO_SESSIONS = [];

export default function Verification() {
  const [copied, setCopied] = useState(false);
  const sampleData = useSyncExternalStore(subscribeDemo, getSampleData);
  const sessions = sampleData ? SESSIONS : NO_SESSIONS;
  const wallet = sampleData ? WALLET_BALANCE : 0;

  const stats = useMemo(() => {
    const thisMonth = sessions.filter((s) => s.date.startsWith("2026-07")).length;
    const verified = sessions.filter((s) => s.status === "Verified").length;
    const inProgress = sessions.filter((s) => s.status === "In progress").length;
    const counts = Object.fromEntries(
      OUTCOMES.map((o) => [o.key, sessions.filter((s) => s.status === o.key).length])
    );
    const reasons = {};
    sessions.forEach((s) => {
      if (s.status === "Failed" && s.reason) {
        reasons[s.reason] = (reasons[s.reason] || 0) + 1;
      }
    });
    return {
      thisMonth,
      inProgress,
      conversion: sessions.length ? Math.round((verified / sessions.length) * 100) : 0,
      counts,
      reasons: Object.entries(reasons).sort((a, b) => b[1] - a[1]),
    };
  }, [sessions]);

  function copyLink() {
    navigator.clipboard.writeText(WIDGET_URL).then(() => {
      setCopied(true);
      markStep("verify");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const recent = sessions.slice(0, 6);

  return (
    <>
      <div className="stat-grid fleet-stats">
        <article className="stat-card">
          <p className="stat-label">Checks this month</p>
          <p className="stat-value">{stats.thisMonth}</p>
          <p className="stat-note">
            KES {(stats.thisMonth * CHECK_PRICE).toLocaleString("en-KE")} from your wallet
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Wallet balance</p>
          <p className="stat-value">KES {wallet.toLocaleString("en-KE")}</p>
          <p className="stat-note">
            ≈ {Math.floor(wallet / CHECK_PRICE)} checks ·{" "}
            <Link className="spec-link" to="/dashboard/billing">
              top up
            </Link>
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Conversion</p>
          <p className="stat-value">{stats.conversion}%</p>
          <p className="stat-note">of sessions end verified</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">In progress</p>
          <p className="stat-value">{stats.inProgress}</p>
          <p className="stat-note">renters mid-verification</p>
        </article>
      </div>

      <div className="details-grid">
        <div className="settings-main">
          <section className="panel-card">
            <header className="card-head">
              <h2>Session outcomes</h2>
              <p>How renters fare in your Dojah verification flow</p>
            </header>

            {sessions.length === 0 ? (
              <EmptyState
                compact
                icon={EMPTY_ICONS.chart}
                title="No sessions to analyse yet"
                message="Once renters start running through your widget, their pass, fail and drop-off rates land here."
              />
            ) : (
              <>
                <div className="outcome-rows">
                  {OUTCOMES.map((o) => (
                    <div className="outcome-row" key={o.key}>
                      <span className="outcome-label">{o.key}</span>
                      <span className="outcome-bar">
                        <i
                          className={`bar-${o.cls}`}
                          style={{ width: `${(stats.counts[o.key] / sessions.length) * 100}%` }}
                        />
                      </span>
                      <span className="outcome-count">{stats.counts[o.key]}</span>
                    </div>
                  ))}
                </div>

                <div className="reason-block">
                  <p className="reason-title">Top failure reasons</p>
                  <ul className="reason-list">
                    {stats.reasons.map(([reason, count]) => (
                      <li key={reason}>
                        <span>{reason}</span>
                        <span className="mini-amount">{count}</span>
                      </li>
                    ))}
                    <li>
                      <span>Top drop-off step, selfie &amp; liveness</span>
                      <span className="mini-amount">{stats.counts.Abandoned}</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </section>

          <section className="panel-card">
            <div className="fleet-toolbar">
              <header className="card-head no-gap">
                <h2>Recent sessions</h2>
                <p>Latest renters through the widget</p>
              </header>
              {sessions.length > 0 && (
                <Link to="/dashboard/verification/all" className="btn btn-ghost toolbar-btn">
                  All verifications
                </Link>
              )}
            </div>
            {sessions.length === 0 ? (
              <EmptyState
                compact
                icon={EMPTY_ICONS.verification}
                title="No renters verified yet"
                message="Scan the QR with a renter's phone, or send them the widget link, to run your first ID check."
              />
            ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>ID</th>
                  <th>Selfie</th>
                  <th>Licence</th>
                  <th>Status</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <p className="strong">{s.customer}</p>
                      <p className="cell-sub">
                        {s.ref ? (
                          <Link className="spec-link" to={`/dashboard/bookings/${encodeURIComponent(s.ref)}`}>
                            {s.ref}
                          </Link>
                        ) : (
                          "Walk-in"
                        )}
                      </p>
                    </td>
                    {["id", "selfie", "licence"].map((step) => (
                      <td key={step}>
                        <StepMark value={s.steps[step]} />
                      </td>
                    ))}
                    <td>
                      <span className={`chip ${STATUS_CHIP[s.status]}`}>{s.status}</span>
                    </td>
                    <td>{fmtDate(s.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </section>
        </div>

        <div className="details-side">
          <section className="panel-card">
            <header className="card-head">
              <h2>Verify a renter</h2>
              <p>Scan with the renter's phone to start the check</p>
            </header>

            <div className="qr-wrap">
              <div className="qr-box">
                <QRCodeSVG value={WIDGET_URL} size={164} fgColor="#0a0d12" bgColor="#ffffff" />
              </div>
            </div>

            <p className="qr-steps">
              National ID lookup → selfie &amp; liveness → driver's licence.
              Results land on this page in seconds.
            </p>

            <div className="widget-link">
              <span title={WIDGET_URL}>{WIDGET_URL.replace("https://", "")}</span>
              <button type="button" className="icon-btn" onClick={copyLink}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <a
              className="btn btn-primary pay-btn"
              href={WIDGET_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => markStep("verify")}
            >
              Open verification widget
            </a>

            <p className="side-hint">
              The widget is configured from your Dojah dashboard. Checks,
              branding and retry rules update here automatically. You can also
              text the link to a renter before pickup.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export function StepMark({ value }) {
  if (value === "Passed") return <span className="step-mark pass">✓ Pass</span>;
  if (value === "Failed") return <span className="step-mark fail">✕ Fail</span>;
  if (value === "Pending") return <span className="step-mark wait">… Waiting</span>;
  return <span className="step-mark skip">—</span>;
}
