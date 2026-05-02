'use client';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
}

export default function NijaSearchLogo({ size = 'hero', showTagline = true }: Props) {

  /* ─────────────────────────────────────────────────────────────
     HERO — single-line wordmark:
     "9j" [magnifier-as-a] "search"
     All on ONE baseline. Magnifier sits where "a" would be,
     slightly raised so its top aligns with the cap-height.
  ───────────────────────────────────────────────────────────── */
  if (size === 'hero') {
    /*
      Layout plan (viewBox 0 0 520 130):
        "9"       x=0,   fontSize=100  → approx right edge x≈68
        "j"       x=68,  fontSize=100  → approx right edge x≈98
        lime wedge under tail of 9
        magnifier cx=138, cy=38, r=30  (sits where "a" would be, raised)
        handle    from (162,62) to (182,82)
        "search"  x=196, fontSize=100  → fills to ~x=510
        baseline  y=110
    */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg
          viewBox="0 0 520 120"
          width="520"
          height="120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ maxWidth: '92vw', height: 'auto' }}
          aria-label="9jaSearch"
          role="img"
        >
          <defs>
            <linearGradient id="hg9" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#3a9e50" />
              <stop offset="100%" stopColor="#0d5c20" />
            </linearGradient>
            <linearGradient id="hgtxt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d8a3e" />
              <stop offset="100%" stopColor="#0a4a18" />
            </linearGradient>
            <filter id="hsh">
              <feDropShadow dx="1" dy="2" stdDeviation="2.5"
                floodColor="#062e0e" floodOpacity="0.3" />
            </filter>
            <clipPath id="hmc">
              <circle cx="138" cy="42" r="26" />
            </clipPath>
          </defs>

          {/* ── "9" ── */}
          <text x="2" y="105"
            fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
            fontWeight="900" fontSize="100"
            fill="url(#hg9)" filter="url(#hsh)">9</text>

          {/* lime accent wedge under tail of 9 */}
          <polygon points="50,105 70,105 57,120" fill="#8BC34A" opacity="0.9" />

          {/* ── "j" ── */}
          <text x="68" y="105"
            fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
            fontWeight="900" fontSize="100"
            fill="url(#hgtxt)" filter="url(#hsh)">j</text>

          {/* ── Magnifying glass (replaces "a", raised to top-right of "j") ── */}
          {/* Ring */}
          <circle cx="138" cy="42" r="30"
            stroke="url(#hgtxt)" strokeWidth="9"
            fill="white" filter="url(#hsh)" />

          {/* Nigeria map inside ring */}
          <g clipPath="url(#hmc)">
            <g transform="translate(138,42) scale(1.2)">
              <path
                d="M-14,-16 L-18,-8 L-20,2 L-16,10 L-10,16
                   L-2,20 L6,18 L14,12 L18,4 L18,-6
                   L14,-14 L8,-18 L0,-20 L-8,-20 Z"
                fill="#1a6b28" opacity="0.95" />
              <path d="M-6,-6 L-2,4 L4,8 L10,2 L8,-6 L2,-12 Z"
                fill="#0d4a1a" opacity="0.5" />
              <circle cx="1" cy="-1" r="2.5" fill="#FFD100" />
            </g>
          </g>

          {/* Handle — goes bottom-right */}
          <line x1="160" y1="64" x2="182" y2="86"
            stroke="url(#hgtxt)" strokeWidth="10"
            strokeLinecap="round" filter="url(#hsh)" />

          {/* ── "search" — starts right after the magnifier handle ── */}
          <text x="188" y="105"
            fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
            fontWeight="900" fontSize="100"
            fill="url(#hgtxt)" filter="url(#hsh)"
            letterSpacing="-1">search</text>
        </svg>

        {/* Tagline */}
        {showTagline && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: '6px',
          }}>
            <div style={{ width: '28px', height: '2.5px', background: '#8BC34A' }} />
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontWeight: '700',
              fontSize: '12px',
              letterSpacing: '3px',
              color: '#0d5c20',
              whiteSpace: 'nowrap',
            }}>
              SEARCH NAIJA, FIND MORE.
            </span>
            <div style={{ width: '28px', height: '2.5px', background: '#8BC34A' }} />
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     SM — compact single-line for search bar header
  ───────────────────────────────────────────────────────────── */
  if (size === 'sm') {
    return (
      <svg viewBox="0 0 160 38" width="160" height="38" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-label="9jaSearch"
        style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sg9" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#3a9e50" />
            <stop offset="100%" stopColor="#0d5c20" />
          </linearGradient>
          <linearGradient id="sgtxt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d8a3e" />
            <stop offset="100%" stopColor="#0a4a18" />
          </linearGradient>
          <clipPath id="smc">
            <circle cx="42" cy="13" r="8" />
          </clipPath>
        </defs>
        {/* "9" */}
        <text x="0" y="32" fontFamily="'Arial Black',Arial,sans-serif"
          fontWeight="900" fontSize="32" fill="url(#sg9)">9</text>
        {/* lime wedge */}
        <polygon points="16,32 22,32 18,38" fill="#8BC34A" opacity="0.9" />
        {/* "j" */}
        <text x="20" y="32" fontFamily="'Arial Black',Arial,sans-serif"
          fontWeight="900" fontSize="32" fill="url(#sgtxt)">j</text>
        {/* magnifier ring */}
        <circle cx="42" cy="13" r="9" stroke="url(#sgtxt)" strokeWidth="3" fill="white" />
        <g clipPath="url(#smc)">
          <g transform="translate(42,13) scale(0.38)">
            <path d="M-14,-16 L-18,-8 L-20,2 L-16,10 L-10,16 L-2,20 L6,18 L14,12 L18,4 L18,-6 L14,-14 L8,-18 L0,-20 L-8,-20 Z"
              fill="#1a6b28" opacity="0.95" />
            <circle cx="1" cy="-1" r="3" fill="#FFD100" />
          </g>
        </g>
        {/* handle */}
        <line x1="49" y1="20" x2="56" y2="27"
          stroke="url(#sgtxt)" strokeWidth="3.5" strokeLinecap="round" />
        {/* "search" */}
        <text x="58" y="32" fontFamily="'Arial Black',Arial,sans-serif"
          fontWeight="900" fontSize="32" fill="url(#sgtxt)">search</text>
      </svg>
    );
  }

  /* ── MD / LG fallback ── */
  const scale = size === 'lg' ? 0.6 : 0.42;
  const W = Math.round(520 * scale);
  const H = Math.round(120 * scale);
  return (
    <svg viewBox="0 0 520 120" width={W} height={H} fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="9jaSearch">
      <defs>
        <linearGradient id={`${size}g9`} x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#3a9e50" />
          <stop offset="100%" stopColor="#0d5c20" />
        </linearGradient>
        <linearGradient id={`${size}gtxt`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d8a3e" />
          <stop offset="100%" stopColor="#0a4a18" />
        </linearGradient>
        <clipPath id={`${size}mc`}><circle cx="138" cy="42" r="26" /></clipPath>
      </defs>
      <text x="2" y="105" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="100" fill={`url(#${size}g9)`}>9</text>
      <polygon points="50,105 70,105 57,120" fill="#8BC34A" opacity="0.9" />
      <text x="68" y="105" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="100" fill={`url(#${size}gtxt)`}>j</text>
      <circle cx="138" cy="42" r="30" stroke={`url(#${size}gtxt)`}
        strokeWidth="9" fill="white" />
      <g clipPath={`url(#${size}mc)`}>
        <g transform="translate(138,42) scale(1.2)">
          <path d="M-14,-16 L-18,-8 L-20,2 L-16,10 L-10,16 L-2,20 L6,18 L14,12 L18,4 L18,-6 L14,-14 L8,-18 L0,-20 L-8,-20 Z"
            fill="#1a6b28" opacity="0.95" />
          <circle cx="1" cy="-1" r="2.5" fill="#FFD100" />
        </g>
      </g>
      <line x1="160" y1="64" x2="182" y2="86"
        stroke={`url(#${size}gtxt)`} strokeWidth="10" strokeLinecap="round" />
      <text x="188" y="105" fontFamily="'Arial Black',Arial,sans-serif"
        fontWeight="900" fontSize="100" fill={`url(#${size}gtxt)`}
        letterSpacing="-1">search</text>
    </svg>
  );
}
