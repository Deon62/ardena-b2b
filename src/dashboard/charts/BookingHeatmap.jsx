import { useState } from "react";

/* Booking activity by day and time. Sequential single-hue ramp from the
   brand blue; near-zero cells recede into the surface by design. */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = [6, 8, 10, 12, 14, 16, 18, 20];
const SLOT_LABELS = ["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p"];

const RAMP = ["#e4edf9", "#c2dbfa", "#8fbdf7", "#539df4", "#1a80ec", "#0060c4"];

function binColor(v) {
  if (v <= 0) return RAMP[0];
  if (v <= 1) return RAMP[1];
  if (v <= 3) return RAMP[2];
  if (v <= 5) return RAMP[3];
  if (v <= 7) return RAMP[4];
  return RAMP[5];
}

// Build 7×8 grid from API data: [{ day, hour, count }]
function buildGrid(data) {
  const grid = Object.fromEntries(DAYS.map((d) => [d, Object.fromEntries(SLOTS.map((s) => [s, 0]))]));
  for (const cell of data) {
    if (grid[cell.day] !== undefined && grid[cell.day][cell.hour] !== undefined) {
      grid[cell.day][cell.hour] = cell.count;
    }
  }
  return grid;
}

export default function BookingHeatmap({ data }) {
  const [tip, setTip] = useState(null);
  const grid = buildGrid(data || []);

  function show(e, day, slotLabel, v) {
    const card = e.currentTarget.closest(".chart-card").getBoundingClientRect();
    const cell = e.currentTarget.getBoundingClientRect();
    setTip({
      x: cell.left - card.left + cell.width / 2,
      y: cell.top - card.top,
      text: `${day} ${slotLabel}`,
      value: `${v} booking${v === 1 ? "" : "s"}`,
    });
  }

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        <span />
        {SLOT_LABELS.map((s) => (
          <span className="heatmap-axis" key={s}>{s}</span>
        ))}
        {DAYS.map((day) => (
          <div className="heatmap-row" key={day}>
            <span className="heatmap-axis heatmap-day">{day}</span>
            {SLOTS.map((slot, c) => {
              const v = grid[day][slot];
              return (
                <span
                  key={slot}
                  className="heatmap-cell"
                  style={{ background: binColor(v) }}
                  tabIndex={0}
                  aria-label={`${day} ${SLOT_LABELS[c]}: ${v} bookings`}
                  onMouseEnter={(e) => show(e, day, SLOT_LABELS[c], v)}
                  onFocus={(e) => show(e, day, SLOT_LABELS[c], v)}
                  onMouseLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="heatmap-scale" aria-hidden="true">
        <span>Fewer</span>
        {RAMP.map((c) => <i key={c} style={{ background: c }} />)}
        <span>More</span>
      </div>

      {tip && (
        <div className="chart-tip" style={{ left: tip.x, top: tip.y }}>
          <strong>{tip.value}</strong>
          <span>{tip.text}</span>
        </div>
      )}
    </div>
  );
}
