import { useMemo, useSyncExternalStore } from "react";
import BookingHeatmap from "./charts/BookingHeatmap";
import RevenueDumbbell from "./charts/RevenueDumbbell";
import UtilisationTrend from "./charts/UtilisationTrend";
import OnboardingChecklist from "./OnboardingChecklist";
import EmptyState, { EMPTY_ICONS } from "./EmptyState";
import { subscribe as subscribeFleet, getVehicles, expiringSoon } from "./fleetStore";
import { subscribe as subscribeBookings, getBookings, rentalDays } from "./bookingsStore";
import "./overview.css";

const fmtKES = (n) => `KES ${n.toLocaleString("en-KE")}`;

const FLEET_STATUSES = ["Available", "On booking", "In maintenance"];

const STATUS_ICON = {
  warning: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  critical: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
};

export default function Overview() {
  const vehicles = useSyncExternalStore(subscribeFleet, getVehicles);
  const bookings = useSyncExternalStore(subscribeBookings, getBookings);

  const hasVehicles = vehicles.length > 0;
  const hasBookings = bookings.length > 0;

  const kpis = useMemo(() => {
    const collected = bookings
      .filter((b) => b.payment === "Paid")
      .reduce((s, b) => s + rentalDays(b.pickup, b.dropoff) * b.rate, 0);
    const active = bookings.filter((b) => b.status === "Active").length;
    const onBooking = vehicles.filter((v) => v.status === "On booking").length;
    const util = hasVehicles ? Math.round((onBooking / vehicles.length) * 100) : 0;
    return [
      {
        label: "Collected this month",
        value: fmtKES(collected),
        delta: collected ? "via M-Pesa" : "no payments yet",
        neutral: true,
      },
      {
        label: "Active bookings",
        value: String(active),
        delta: active ? "on the road" : "no rentals yet",
        neutral: true,
      },
      {
        label: "Fleet utilisation",
        value: `${util}%`,
        delta: hasVehicles ? "of fleet on booking" : "add vehicles",
        neutral: true,
      },
      {
        label: "Verifications run",
        value: "0",
        delta: "none yet",
        neutral: true,
      },
    ];
  }, [bookings, vehicles, hasVehicles]);

  const fleetRows = useMemo(
    () =>
      FLEET_STATUSES.map((label) => ({
        label,
        count: vehicles.filter((v) => v.status === label).length,
      })),
    [vehicles]
  );

  // expiring documents flag themselves; verification alerts come with the API
  const attention = useMemo(() => {
    const items = [];
    vehicles.forEach((v) => {
      const insDays = expiringSoon(v.ins);
      if (insDays !== null) {
        items.push({ kind: "warning", title: "Insurance expiring", meta: `${v.plate} · in ${insDays} days` });
      }
      const inspDays = expiringSoon(v.inspection);
      if (inspDays !== null) {
        items.push({ kind: "warning", title: "Inspection due", meta: `${v.plate} · in ${inspDays} days` });
      }
    });
    return items;
  }, [vehicles]);

  return (
    <>
      <OnboardingChecklist />

      {/* ---- KPI row ---- */}
      <div className="stat-grid">
        {kpis.map((k) => (
          <article className="stat-card" key={k.label}>
            <p className="stat-label">{k.label}</p>
            <p className="stat-value">{k.value}</p>
            <p className="stat-note">
              <span
                className={
                  "stat-delta" + (k.neutral ? "" : k.good ? " up" : " down")
                }
              >
                {k.delta}
              </span>{" "}
              {k.vs}
            </p>
          </article>
        ))}
      </div>

      {/* ---- Charts ---- */}
      <div className="chart-row">
        <section className="chart-card">
          <header className="card-head">
            <h2>Booking rhythm</h2>
            <p>Pickups by day and time, last 4 weeks</p>
          </header>
          {hasBookings ? (
            <BookingHeatmap />
          ) : (
            <EmptyState
              icon={EMPTY_ICONS.chart}
              title="No booking data yet"
              message="Your busiest days and times appear here once bookings start coming in."
            />
          )}
        </section>

        <section className="chart-card">
          <header className="card-head">
            <h2>Top earning vehicles</h2>
            <p>KES '000 by vehicle, last month vs this month</p>
          </header>
          {hasBookings ? (
            <RevenueDumbbell />
          ) : (
            <EmptyState
              icon={EMPTY_ICONS.chart}
              title="No revenue yet"
              message="Your top earning vehicles will rank here after your first paid bookings."
            />
          )}
        </section>
      </div>

      {/* ---- Utilisation trend + side widgets ---- */}
      <div className="overview-grid">
        <section className="chart-card">
          <header className="card-head">
            <h2>Fleet utilisation</h2>
            <p>% of vehicles out on booking, weekly, last 12 weeks</p>
          </header>
          {hasBookings ? (
            <UtilisationTrend />
          ) : (
            <EmptyState
              icon={EMPTY_ICONS.chart}
              title="No utilisation yet"
              message="Track how much of your fleet is earning once vehicles start going out on bookings."
            />
          )}
        </section>

        <div className="overview-side">
          <section className="panel-card">
            <header className="card-head">
              <h2>Fleet status</h2>
              <p>{hasVehicles ? `${vehicles.length} vehicles` : "No vehicles"}</p>
            </header>
            {hasVehicles ? (
              <div className="fleet-rows">
                {fleetRows.map((f) => (
                  <div className="fleet-row" key={f.label}>
                    <span className="fleet-label">{f.label}</span>
                    <span className="fleet-bar">
                      <i style={{ width: `${(f.count / vehicles.length) * 100}%` }} />
                    </span>
                    <span className="fleet-count">{f.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={EMPTY_ICONS.fleet}
                title="No vehicles yet"
                message="Add vehicles to see your fleet at a glance."
              />
            )}
          </section>

          <section className="panel-card">
            <header className="card-head">
              <h2>Needs attention</h2>
              <p>Documents and checks</p>
            </header>
            {attention.length > 0 ? (
              <ul className="attention-list">
                {attention.map((a) => (
                  <li key={a.title + a.meta}>
                    <span className={`attention-icon ${a.kind}`}>
                      {STATUS_ICON[a.kind]}
                    </span>
                    <div>
                      <p className="attention-title">{a.title}</p>
                      <p className="attention-meta">{a.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                icon={EMPTY_ICONS.verification}
                title="Nothing needs attention"
                message="Expiring documents and failed checks will flag here."
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
