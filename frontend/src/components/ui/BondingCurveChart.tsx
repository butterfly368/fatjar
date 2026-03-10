export function BondingCurveChart() {
  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="none" style={{ width: '100%', height: 180 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(247,147,26,0.15)" />
          <stop offset="100%" stopColor="rgba(247,147,26,0)" />
        </linearGradient>
      </defs>
      <line x1="0" y1="45" x2="400" y2="45" stroke="#D5D0C8" strokeWidth="0.5" />
      <line x1="0" y1="90" x2="400" y2="90" stroke="#D5D0C8" strokeWidth="0.5" />
      <line x1="0" y1="135" x2="400" y2="135" stroke="#D5D0C8" strokeWidth="0.5" />
      <path
        d="M 0 12 Q 60 13, 100 35 Q 180 75, 260 120 Q 320 148, 400 165 L 400 180 L 0 180 Z"
        fill="url(#cg)"
      />
      <path
        d="M 0 12 Q 60 13, 100 35 Q 180 75, 260 120 Q 320 148, 400 165"
        fill="none"
        stroke="#F7931A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="35" cy="13" r="5" fill="#F7931A" />
      <text
        x="35"
        y="6"
        textAnchor="middle"
        fill="#F7931A"
        fontSize="9"
        fontFamily="IBM Plex Mono"
        fontWeight="600"
      >
        YOU
      </text>
    </svg>
  );
}
