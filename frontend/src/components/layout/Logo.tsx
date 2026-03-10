export function PiggyIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" width={size} height={size}>
      <ellipse cx="13" cy="15.5" rx="9.5" ry="7" fill="#F7931A" />
      <circle cx="20" cy="13" r="3.5" fill="#F7931A" />
      <ellipse cx="22.5" cy="13.5" rx="1.5" ry="1.2" fill="#111" opacity="0.25" />
      <circle cx="19" cy="11.5" r="0.8" fill="#111" />
      <path d="M16.5 9.5L17.5 7L19.5 9.5" fill="#F7931A" />
      <rect x="7" y="21" width="2.5" height="3.5" rx="1" fill="#F7931A" />
      <rect x="12" y="21" width="2.5" height="3.5" rx="1" fill="#F7931A" />
      <rect x="16.5" y="21" width="2.5" height="3.5" rx="1" fill="#F7931A" />
      <path
        d="M4.5 13 Q3 11 3.5 9"
        stroke="#F7931A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 160 28" width={160} height={28} aria-label="FatJar">
      {/* Piggy icon — bottom-aligned with text baseline */}
      <g transform="translate(0, 0)">
        <ellipse cx="13" cy="15.5" rx="9.5" ry="7" fill="#F7931A" />
        <circle cx="20" cy="13" r="3.5" fill="#F7931A" />
        <ellipse cx="22.5" cy="13.5" rx="1.5" ry="1.2" fill="#111" opacity="0.25" />
        <circle cx="19" cy="11.5" r="0.8" fill="#111" />
        <path d="M16.5 9.5L17.5 7L19.5 9.5" fill="#F7931A" />
        <rect x="7" y="21" width="2.5" height="3.5" rx="1" fill="#F7931A" />
        <rect x="12" y="21" width="2.5" height="3.5" rx="1" fill="#F7931A" />
        <rect x="16.5" y="21" width="2.5" height="3.5" rx="1" fill="#F7931A" />
        <path d="M4.5 13 Q3 11 3.5 9" stroke="#F7931A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
      {/* Wordmark — single text node, no gaps */}
      <text
        x="34"
        y="22"
        fontFamily="'Syne', sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="-0.7"
      >
        <tspan fill="var(--text, #111)">Fat</tspan>
        <tspan fill="var(--accent, #F7931A)">Jar.</tspan>
      </text>
    </svg>
  );
}
