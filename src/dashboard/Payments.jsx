import { useMemo, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { subscribe, getBookings, rentalDays } from "./bookingsStore";
import { PAY_CHIP } from "./Bookings";
import CollectionsArea from "./charts/CollectionsArea";
import PaymentDonut from "./charts/PaymentDonut";
import EmptyState, { EMPTY_ICONS } from "./EmptyState";
import "./fleet.css";
import "./bookings.css";
import "./payments.css";

export const fmtAmount = (n) => n.toLocaleString("en-KE");

// mock M-Pesa receipt code, deterministic per booking, until Daraja is wired in
export const receiptFor = (ref) =>
  `TG${ref.slice(-4)}${"KQXWLM"[Number(ref.slice(-1)) % 6]}J`;

const bookingAmount = (b) => rentalDays(b.pickup, b.dropoff) * b.rate;

export default function Payments() {
  const bookings = useSyncExternalStore(subscribe, getBookings);

  const stats = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let refunded = 0;
    let paidCount = 0;
    bookings.forEach((b) => {
      const amount = bookingAmount(b);
      if (b.payment === "Paid") {
        collected += amount;
        paidCount += 1;
      }
      if (b.payment === "Refunded") refunded += amount;
      if (
        (b.payment === "Unpaid" || b.payment === "Prompt sent") &&
        b.status !== "Cancelled"
      ) {
        outstanding += amount;
      }
    });
    return { collected, outstanding, refunded, net: collected - refunded, paidCount };
  }, [bookings]);

  const donutSegments = [
    { label: "Collected", value: stats.collected, color: "#0b7a37" },
    { label: "Outstanding", value: stats.outstanding, color: "#d97706" },
    { label: "Refunded", value: stats.refunded, color: "#94a3b8" },
  ];

  // processed cash: settled transactions, newest first
  const processed = bookings.filter(
    (b) => b.payment === "Paid" || b.payment === "Refunded"
  );
  const recent = processed.slice(0, 8);

  return (
    <>
      <div className="stat-grid finance-stats">
        <article className="stat-card">
          <p className="stat-label">Collected</p>
          <p className="stat-value">KES {fmtAmount(stats.collected)}</p>
          <p className="stat-note">{stats.paidCount} payments via M-Pesa</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Outstanding</p>
          <p className="stat-value">KES {fmtAmount(stats.outstanding)}</p>
          <p className="stat-note">owed on live bookings</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Refunded</p>
          <p className="stat-value">KES {fmtAmount(stats.refunded)}</p>
          <p className="stat-note">from cancelled bookings</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Net collected</p>
          <p className="stat-value">KES {fmtAmount(stats.net)}</p>
          <p className="stat-note">after refunds</p>
        </article>
      </div>

      <div className="payments-grid">
        <section className="chart-card">
          <header className="card-head">
            <h2>Collections over time</h2>
            <p>KES '000 settled per week, last 10 weeks</p>
          </header>
          {bookings.length === 0 ? (
            <EmptyState
              icon={EMPTY_ICONS.chart}
              title="No collections yet"
              message="Once customers pay for their bookings via M-Pesa, your weekly collections build up here."
            />
          ) : (
            <CollectionsArea />
          )}
        </section>

        <section className="chart-card">
          <header className="card-head">
            <h2>Where the money is</h2>
            <p>Collected, outstanding &amp; refunded</p>
          </header>
          {bookings.length === 0 ? (
            <EmptyState
              compact
              icon={EMPTY_ICONS.payments}
              title="Nothing billed yet"
              message="Your billing breakdown appears here after your first bookings."
            />
          ) : (
            <PaymentDonut segments={donutSegments} />
          )}
        </section>
      </div>

      <section className="panel-card">
        <header className="card-head mini-payments-head">
          <div>
            <h2>Processed payments</h2>
            <p>Cash settled across your bookings</p>
          </div>
          {processed.length > 0 && (
            <Link className="head-link" to="/dashboard/payments/all">
              View all
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </header>

        {processed.length === 0 ? (
          <EmptyState
            compact
            icon={EMPTY_ICONS.payments}
            title="No payments received yet"
            message="Settled M-Pesa payments and refunds land here with their receipt codes."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Booking</th>
                <th>Vehicle</th>
                <th>Method</th>
                <th className="num">Amount (KES)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.ref}>
                  <td>
                    <p className="strong">{receiptFor(b.ref)}</p>
                    <p className="cell-sub">{b.ref}</p>
                  </td>
                  <td>{b.customer}</td>
                  <td>
                    <p>{b.vehicle}</p>
                    <p className="cell-sub">{b.plate}</p>
                  </td>
                  <td>M-Pesa</td>
                  <td className="num">{fmtAmount(bookingAmount(b))}</td>
                  <td>
                    <span className={`chip ${PAY_CHIP[b.payment]}`}>{b.payment}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
