import type { MeterType } from "@/lib/data";

interface Props {
  type: MeterType;
  value: number;
  className?: string;
}

/**
 * Realistic-looking meter "photo" rendered as SVG so we don't depend on
 * external images. Mimics the look of a captured meter face: warm vignette,
 * mechanical digit drum with shadowed edges, and meter housing chrome.
 */
export function MeterPhoto({ type, value, className }: Props) {
  const color =
    type === "water" ? "var(--color-water)" : type === "gas" ? "var(--color-gas)" : "var(--color-electricity)";

  const digits = formatDigits(value, type);
  const label = type === "water" ? "WATER METER" : type === "gas" ? "GAS METER" : "ENERGY METER";
  const unit = type === "electricity" ? "kWh" : "m³";

  return (
    <svg
      viewBox="0 0 600 380"
      className={className}
      role="img"
      aria-label={`${label} photo`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="1" stopColor="#0b1220" />
        </linearGradient>
        <radialGradient id="vignette" cx="50%" cy="45%" r="65%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cdd5df" />
          <stop offset="0.4" stopColor="#9aa4b2" />
          <stop offset="1" stopColor="#4b5563" />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5e6c8" />
          <stop offset="1" stopColor="#d9c39a" />
        </linearGradient>
        <linearGradient id="digit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fafafa" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* background (the wall/pipe area around the meter) */}
      <rect width="600" height="380" fill="url(#bg)" />
      <g opacity="0.18" stroke={color} strokeWidth="1">
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1={i * 40} y1="0" x2={i * 40 - 80} y2="380" />
        ))}
      </g>

      {/* meter body */}
      <g transform="translate(70 50)">
        <rect x="0" y="0" width="460" height="280" rx="22" fill="url(#metal)" />
        <rect x="6" y="6" width="448" height="268" rx="18" fill="#1f2a37" />
        <rect
          x="14"
          y="14"
          width="432"
          height="252"
          rx="14"
          fill="#111827"
          stroke={color}
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />

        {/* logo strip */}
        <g transform="translate(28 30)">
          <circle cx="14" cy="14" r="14" fill={color} opacity="0.85" />
          <text
            x="38"
            y="20"
            fill="#e5e7eb"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="16"
            fontWeight="700"
            letterSpacing="2"
          >
            {label}
          </text>
        </g>

        {/* mechanical digit window */}
        <g transform="translate(40 90)">
          <rect x="0" y="0" width="380" height="90" rx="10" fill="#0b1220" />
          <rect x="6" y="6" width="368" height="78" rx="6" fill="url(#screen)" />
          {/* digit cells */}
          {digits.map((d, i) => {
            const isDecimal = i >= digits.length - 3;
            const cellW = 50;
            const x = 18 + i * cellW;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={14}
                  width={cellW - 6}
                  height={62}
                  rx={4}
                  fill={isDecimal ? "#b91c1c" : "#0f172a"}
                />
                <rect
                  x={x}
                  y={14}
                  width={cellW - 6}
                  height={62}
                  rx={4}
                  fill="url(#digit)"
                  opacity={isDecimal ? 0.08 : 0.04}
                />
                <text
                  x={x + (cellW - 6) / 2}
                  y={62}
                  textAnchor="middle"
                  fontFamily="ui-monospace, 'SF Mono', Menlo, monospace"
                  fontSize="44"
                  fontWeight="800"
                  fill={isDecimal ? "#fef2f2" : "#f8fafc"}
                  filter="url(#soft)"
                >
                  {d}
                </text>
              </g>
            );
          })}
          <text
            x={370}
            y={108}
            textAnchor="end"
            fontFamily="ui-sans-serif"
            fontSize="13"
            fill="#cbd5e1"
            opacity="0.85"
          >
            {unit}
          </text>
        </g>

        {/* secondary dials / indicators */}
        <g transform="translate(40 210)">
          <circle cx="22" cy="22" r="18" fill="#0b1220" stroke={color} strokeOpacity="0.6" />
          <circle cx="22" cy="22" r="3" fill={color} />
          <line
            x1="22"
            y1="22"
            x2={22 + 12 * Math.cos(((value * 36) % 360) * (Math.PI / 180))}
            y2={22 + 12 * Math.sin(((value * 36) % 360) * (Math.PI / 180))}
            stroke={color}
            strokeWidth="2"
          />
          <text x="55" y="18" fontSize="11" fill="#94a3b8" fontFamily="ui-sans-serif">
            SN: OPT-{type.toUpperCase()}-{Math.floor(value * 13) % 9999}
          </text>
          <text x="55" y="34" fontSize="11" fill="#64748b" fontFamily="ui-sans-serif">
            {new Date().toISOString().split("T")[0]}
          </text>

          {/* battery */}
          <g transform="translate(310 12)">
            <rect x="0" y="0" width="40" height="18" rx="3" fill="none" stroke="#94a3b8" />
            <rect x="40" y="5" width="3" height="8" fill="#94a3b8" />
            <rect x="3" y="3" width="28" height="12" fill="#22c55e" />
          </g>
        </g>
      </g>

      {/* vignette */}
      <rect width="600" height="380" fill="url(#vignette)" pointerEvents="none" />

      {/* simulated timestamp like a camera */}
      <text
        x="585"
        y="368"
        textAnchor="end"
        fontFamily="ui-monospace, monospace"
        fontSize="12"
        fill="#fef08a"
        opacity="0.9"
      >
        OPTIMETER · {new Date().toLocaleString()}
      </text>
    </svg>
  );
}

function formatDigits(value: number, type: MeterType): string[] {
  // electricity uses 5 integer + 1 decimal style, water/gas 5 + 3 decimals
  if (type === "electricity") {
    const v = Math.round(value * 10) / 10;
    const s = v.toFixed(1).padStart(7, "0");
    return s.replace(".", "").split("");
  }
  const v = Math.round(value * 1000) / 1000;
  const s = v.toFixed(3).padStart(9, "0");
  return s.replace(".", "").split("");
}
