import { useMemo, useState } from "react";

/* At-a-glance month calendar for the bookings page: each day is marked when
   a rental is picked up and/or returned that day, with today ringed. Derived
   from the live store, display-only. */

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n) => String(n).padStart(2, "0");
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// local-time today (avoid UTC rollover on UTC+3)
function todayLocalISO() {
  const d = new Date();
  return isoOf(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function BookingCalendar({ bookings }) {
  const today = todayLocalISO();
  const base = new Date(`${today}T00:00:00`);
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  // iso -> { pickups, returns } for the whole store
  const byDay = useMemo(() => {
    const map = new Map();
    const bump = (iso, key) => {
      const cur = map.get(iso) || { pickups: 0, returns: 0 };
      cur[key] += 1;
      map.set(iso, cur);
    };
    for (const b of bookings) {
      if (b.pickup) bump(b.pickup, "pickups");
      if (b.dropoff) bump(b.dropoff, "returns");
    }
    return map;
  }, [bookings]);

  const monthCount = useMemo(() => {
    let pickups = 0;
    let returns = 0;
    const prefix = `${view.y}-${pad(view.m + 1)}-`;
    for (const [iso, c] of byDay) {
      if (iso.startsWith(prefix)) {
        pickups += c.pickups;
        returns += c.returns;
      }
    }
    return { pickups, returns };
  }, [byDay, view]);

  function shift(delta) {
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const lead = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();

  return (
    <div className="bk-cal">
      <div className="bk-cal-head">
        <p className="bk-cal-title">
          {MONTHS[view.m]} {view.y}
        </p>
        <div className="bk-cal-nav">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bk-cal-grid">
        {WEEKDAYS.map((w, i) => (
          <span className="bk-cal-weekday" key={`${w}-${i}`}>
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`b-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const iso = isoOf(view.y, view.m, d);
          const c = byDay.get(iso);
          const isToday = iso === today;
          const title =
            c && (c.pickups || c.returns)
              ? `${c.pickups} pickup${c.pickups === 1 ? "" : "s"}, ${c.returns} return${c.returns === 1 ? "" : "s"}`
              : undefined;
          return (
            <span
              key={iso}
              className={"bk-cal-day" + (isToday ? " today" : "")}
              title={title}
            >
              <span className="bk-cal-num">{d}</span>
              {c && (c.pickups > 0 || c.returns > 0) && (
                <span className="bk-cal-dots">
                  {c.pickups > 0 && <i className="pickup" />}
                  {c.returns > 0 && <i className="return" />}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="bk-cal-foot">
        <span className="bk-cal-legend">
          <i className="pickup" /> {monthCount.pickups} pickups
        </span>
        <span className="bk-cal-legend">
          <i className="return" /> {monthCount.returns} returns
        </span>
      </div>
    </div>
  );
}
