import { useState } from "react";

/* Fleet utilisation, % of vehicles out on booking, weekly, last 10 weeks.
   Single-series line in the brand hue. Accepts data prop from the overview API. */

const W = 680;
const H = 260;
const TOP = 26;
const BOTTOM = 32;
const LEFT = 44;
const RIGHT = 40;
const TICKS = [0, 25, 50, 75, 100];

export default function UtilisationTrend({ data = [] }) {
  const [hover, setHover] = useState(null);

  if (data.length < 2) return null;

  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const x = (i) => LEFT + (i * plotW) / (data.length - 1);
  const y = (v) => TOP + plotH - (v / 100) * plotH;

  const linePath = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1)},${TOP + plotH} L${x(0)},${TOP + plotH} Z`;
  const last = data.length - 1;

  function onMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(last, Math.round(((px - LEFT) / plotW) * last)));
    const card = svg.closest(".chart-card").getBoundingClientRect();
    const cx = (x(i) / W) * rect.width + rect.left - card.left;
    const cy = (y(data[i].value) / H) * rect.height + rect.top - card.top;
    setHover({ i, tipX: cx, tipY: cy - 14 });
  }

  return (
    <div className="ut-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Fleet utilisation percentage per week over the last 10 weeks"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {TICKS.map((t) => (
          <g key={t}>
            <line className="ut-grid" x1={LEFT} y1={y(t)} x2={W - RIGHT} y2={y(t)} />
            <text className="ut-tick" x={LEFT - 8} y={y(t) + 3.5} textAnchor="end">{t}%</text>
          </g>
        ))}

        {data.map((d, i) =>
          i % 2 === 0 && (
            <text key={d.week} className="ut-tick" x={x(i)} y={H - 10} textAnchor="middle">
              {d.week}
            </text>
          )
        )}

        <path className="ut-area" d={areaPath} />
        <path className="ut-line" d={linePath} />

        <circle className="ut-dot" cx={x(last)} cy={y(data[last].value)} r="4.5" />
        <text className="ut-value" x={x(last) + 10} y={y(data[last].value) + 4}>
          {data[last].value}%
        </text>

        {hover && (
          <>
            <line className="ut-cross" x1={x(hover.i)} y1={TOP} x2={x(hover.i)} y2={TOP + plotH} />
            <circle className="ut-dot" cx={x(hover.i)} cy={y(data[hover.i].value)} r="5.5" />
          </>
        )}
      </svg>

      {hover && (
        <div className="chart-tip" style={{ left: hover.tipX, top: hover.tipY }}>
          <strong>{data[hover.i].value}% utilised</strong>
          <span>Week of {data[hover.i].week}</span>
        </div>
      )}
    </div>
  );
}
