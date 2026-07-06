import { useState } from "react";

/* Cash collected per week, last 10 weeks, area + line in the brand hue.
   KES '000. Static mock until Daraja settlement data lands. */

const DATA = [
  { week: "4 May", value: 78 },
  { week: "11 May", value: 86 },
  { week: "18 May", value: 102 },
  { week: "25 May", value: 94 },
  { week: "1 Jun", value: 121 },
  { week: "8 Jun", value: 108 },
  { week: "15 Jun", value: 132 },
  { week: "22 Jun", value: 118 },
  { week: "29 Jun", value: 141 },
  { week: "6 Jul", value: 155 },
];

const W = 680;
const H = 260;
const TOP = 26;
const BOTTOM = 32;
const LEFT = 46;
const RIGHT = 44;
const MAX = 160;
const TICKS = [0, 40, 80, 120, 160];

const plotW = W - LEFT - RIGHT;
const plotH = H - TOP - BOTTOM;
const x = (i) => LEFT + (i * plotW) / (DATA.length - 1);
const y = (v) => TOP + plotH - (v / MAX) * plotH;

const linePath = DATA.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
const areaPath = `${linePath} L${x(DATA.length - 1)},${TOP + plotH} L${x(0)},${TOP + plotH} Z`;

export default function CollectionsArea() {
  const [hover, setHover] = useState(null);

  function onMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.max(
      0,
      Math.min(DATA.length - 1, Math.round(((px - LEFT) / plotW) * (DATA.length - 1)))
    );
    const card = svg.closest(".chart-card").getBoundingClientRect();
    const cx = (x(i) / W) * rect.width + rect.left - card.left;
    const cy = (y(DATA[i].value) / H) * rect.height + rect.top - card.top;
    setHover({ i, tipX: cx, tipY: cy - 14 });
  }

  const last = DATA.length - 1;

  return (
    <div className="ut-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Cash collected per week over the last 10 weeks, in thousands of shillings"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {TICKS.map((t) => (
          <g key={t}>
            <line className="ut-grid" x1={LEFT} y1={y(t)} x2={W - RIGHT} y2={y(t)} />
            <text className="ut-tick" x={LEFT - 8} y={y(t) + 3.5} textAnchor="end">
              {t === 0 ? "0" : `${t}K`}
            </text>
          </g>
        ))}

        {DATA.map(
          (d, i) =>
            i % 2 === 0 && (
              <text key={d.week} className="ut-tick" x={x(i)} y={H - 10} textAnchor="middle">
                {d.week}
              </text>
            )
        )}

        <path className="ut-area" d={areaPath} />
        <path className="ut-line" d={linePath} />

        <circle className="ut-dot" cx={x(last)} cy={y(DATA[last].value)} r="4.5" />
        <text className="ut-value" x={x(last) + 10} y={y(DATA[last].value) + 4}>
          {DATA[last].value}K
        </text>

        {hover && (
          <>
            <line className="ut-cross" x1={x(hover.i)} y1={TOP} x2={x(hover.i)} y2={TOP + plotH} />
            <circle className="ut-dot" cx={x(hover.i)} cy={y(DATA[hover.i].value)} r="5.5" />
          </>
        )}
      </svg>

      {hover && (
        <div className="chart-tip" style={{ left: hover.tipX, top: hover.tipY }}>
          <strong>KES {DATA[hover.i].value},000</strong>
          <span>Week of {DATA[hover.i].week}</span>
        </div>
      )}
    </div>
  );
}
