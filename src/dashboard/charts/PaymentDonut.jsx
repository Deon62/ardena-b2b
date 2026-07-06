/* Money-state donut: how the fleet's billings split across collected,
   still outstanding and refunded. Derived from the live store. */

const R = 56;
const STROKE = 16;
const C = 2 * Math.PI * R;
const CX = 80;
const CY = 80;

const fmt = (n) => n.toLocaleString("en-KE");
// compact form for the ring centre, where space is tight
const compact = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : `${n}`;

export default function PaymentDonut({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const frac = total > 0 ? seg.value / total : 0;
    const arc = {
      ...seg,
      dash: frac * C,
      gap: C - frac * C,
      rot: (offset / C) * 360,
    };
    offset += frac * C;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 160 160" role="img" aria-label="Breakdown of billed money by state">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface)" strokeWidth={STROKE} />
          {total > 0 &&
            arcs.map((a) => (
              <circle
                key={a.label}
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${a.gap}`}
                strokeDashoffset={-((a.rot / 360) * C)}
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            ))}
        </svg>
        <div className="donut-center">
          <p className="donut-total">KES {compact(total)}</p>
          <p className="donut-cap">billed</p>
        </div>
      </div>

      <ul className="donut-legend">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <li key={seg.label}>
              <span className="donut-swatch" style={{ background: seg.color }} />
              <span className="donut-key">{seg.label}</span>
              <span className="donut-val">KES {fmt(seg.value)}</span>
              <span className="donut-pct">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
