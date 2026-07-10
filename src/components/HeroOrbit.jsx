/* Hero motif: a central hub with satellites slowly orbiting on concentric
   rings — "your whole operation, from one place." Pure SVG + CSS (the rings
   spin via keyframes), so it's crisp at any size and freezes gracefully under
   prefers-reduced-motion. Contained to the open space beside the copy. */
export default function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        {/* orbit rings */}
        <circle className="orbit-ring" cx="200" cy="200" r="64" />
        <circle className="orbit-ring" cx="200" cy="200" r="116" />
        <circle className="orbit-ring" cx="200" cy="200" r="172" />

        {/* satellites, each on its own slowly-rotating ring */}
        <g className="orbit orbit-1">
          <circle className="node" cx="200" cy="136" r="4.5" />
        </g>
        <g className="orbit orbit-2">
          <circle className="node node-blue" cx="200" cy="84" r="5.5" />
        </g>
        <g className="orbit orbit-3">
          <circle className="node node-soft" cx="200" cy="28" r="4" />
        </g>

        {/* the hub */}
        <circle className="orbit-hub-ring" cx="200" cy="200" r="13" />
        <circle className="orbit-hub" cx="200" cy="200" r="5.5" />
      </svg>
    </div>
  );
}
