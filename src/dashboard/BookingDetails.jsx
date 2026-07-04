import { useState, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import {
  subscribe,
  getBookings,
  getBooking,
  setStatus,
  setPayment,
  NEXT_STEP,
  CANCELLABLE,
  fmtDate,
  rentalDays,
} from "./bookingsStore";
import { STATUS_CHIP, PAY_CHIP } from "./Bookings";
import "./fleet.css";
import "./bookings.css";

const fmtAmount = (n) => n.toLocaleString("en-KE");

export default function BookingDetails() {
  useSyncExternalStore(subscribe, getBookings); // re-render on store changes
  const { ref } = useParams();
  const [cancelling, setCancelling] = useState(false);

  const b = getBooking(decodeURIComponent(ref));

  if (!b) {
    return (
      <>
        <Link to="/dashboard/bookings" className="back-link" aria-label="Back to bookings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="empty-block fleet-empty">
          <p>This booking doesn't exist.</p>
        </div>
      </>
    );
  }

  const days = rentalDays(b.pickup, b.dropoff);
  const total = days * b.rate;
  const next = NEXT_STEP[b.status];
  const canCancel = CANCELLABLE.includes(b.status);
  const canPrompt = b.payment !== "Paid" && b.payment !== "Refunded" && b.status !== "Cancelled" && b.status !== "Completed";

  return (
    <>
      <Link to="/dashboard/bookings" className="back-link" aria-label="Back to bookings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="page-head-row">
        <div className="page-head">
          <h1>{b.customer}</h1>
          <p>
            {b.ref} · {b.vehicle} ({b.plate}) ·{" "}
            <span className={`chip ${STATUS_CHIP[b.status]}`}>{b.status}</span>
          </p>
        </div>
        <div className="details-actions">
          {next && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStatus(b.ref, next.to)}
            >
              {next.label}
            </button>
          )}
          {canCancel &&
            (cancelling ? (
              <span className="confirm-inline">
                Cancel this booking?
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => {
                    setStatus(b.ref, "Cancelled");
                    setCancelling(false);
                  }}
                >
                  Yes
                </button>
                <button type="button" className="icon-btn" onClick={() => setCancelling(false)}>
                  No
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-ghost danger-btn"
                onClick={() => setCancelling(true)}
              >
                Cancel booking
              </button>
            ))}
        </div>
      </div>

      <div className="details-grid">
        <section className="panel-card">
          <header className="card-head">
            <h2>Booking information</h2>
            <p>Reservation record</p>
          </header>
          <dl className="spec-grid">
            <div className="spec">
              <dt>Customer</dt>
              <dd>{b.customer}</dd>
            </div>
            <div className="spec">
              <dt>Phone</dt>
              <dd>{b.phone}</dd>
            </div>
            <div className="spec">
              <dt>Vehicle</dt>
              <dd>
                <Link className="spec-link" to={`/dashboard/fleet/${encodeURIComponent(b.plate)}`}>
                  {b.vehicle} · {b.plate}
                </Link>
              </dd>
            </div>
            <div className="spec">
              <dt>Day rate</dt>
              <dd>KES {fmtAmount(b.rate)}</dd>
            </div>
            <div className="spec">
              <dt>Pickup</dt>
              <dd>{fmtDate(b.pickup)}</dd>
            </div>
            <div className="spec">
              <dt>Return</dt>
              <dd>{fmtDate(b.dropoff)}</dd>
            </div>
            <div className="spec">
              <dt>Duration</dt>
              <dd>
                {days} day{days > 1 ? "s" : ""}
              </dd>
            </div>
            <div className="spec">
              <dt>Pickup location</dt>
              <dd>{b.location}</dd>
            </div>
            <div className="spec">
              <dt>Created</dt>
              <dd>{fmtDate(b.created)}</dd>
            </div>
            {b.notes && (
              <div className="spec spec-full">
                <dt>Notes</dt>
                <dd>{b.notes}</dd>
              </div>
            )}
          </dl>
        </section>

        <div className="details-side">
          <section className="panel-card">
            <header className="card-head">
              <h2>Payment</h2>
              <p>Collected from the customer</p>
            </header>
            <p className="util-hero">KES {fmtAmount(total)}</p>
            <div className="pay-row">
              <span>Status</span>
              <span className={`chip ${PAY_CHIP[b.payment]}`}>{b.payment}</span>
            </div>
            {canPrompt && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost pay-btn"
                  onClick={() => setPayment(b.ref, "Prompt sent")}
                >
                  {b.payment === "Prompt sent" ? "Resend M-Pesa prompt" : "Send M-Pesa prompt"}
                </button>
                <p className="side-hint">
                  Sends an STK push to {b.phone}. Live payments arrive with the M-Pesa integration.
                </p>
              </>
            )}
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Identity verification</h2>
              <p>Checked via Dojah before pickup</p>
            </header>
            <div className="pay-row">
              <span>Status</span>
              <span className={`chip ${b.verification === "Verified" ? "active" : "pending"}`}>
                {b.verification}
              </span>
            </div>
            <p className="side-hint">
              {b.verification === "Verified"
                ? "ID and driver's licence matched. Safe to hand over keys."
                : "The customer hasn't completed the ID check yet."}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
