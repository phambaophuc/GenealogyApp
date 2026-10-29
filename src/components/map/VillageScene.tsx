import { cn } from "../../lib/utils";

export default function VillageScene({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 210"
      role="img"
      aria-label="Toàn cảnh làng Cổ Điền: cây đại thụ, cổng làng, từ đường, sảnh xưng hô, kho sách và hòm thư"
      className={cn("h-auto w-full", className)}
    >
      <circle cx="345" cy="34" r="15" fill="hsl(var(--gold))" opacity="0.45" />
      <path
        d="M0 122C42 96 78 112 120 94c50-22 96 8 138-4 48-14 92 6 142-6v64H0z"
        fill="hsl(var(--wood))"
        opacity="0.10"
      />
      <path
        d="M0 152c58-12 116 10 176 0 62-10 130 8 224-4v26H0z"
        fill="hsl(var(--jade))"
        opacity="0.22"
      />
      <g stroke="hsl(var(--jade))" strokeWidth="1.4" opacity="0.45" fill="none">
        <path d="M28 162h20M64 168h16M300 160h22M338 168h18" />
      </g>
      <rect
        y="178"
        width="400"
        height="32"
        fill="hsl(var(--wood))"
        opacity="0.08"
      />
      <g stroke="hsl(var(--gold))" strokeWidth="1.6" opacity="0.5">
        <path d="M18 190h42M74 196h38M126 188h44M182 196h40M236 188h44M292 196h42M340 188h44" />
      </g>
      <g stroke="hsl(var(--jade))" strokeWidth="2.4" opacity="0.75">
        <path d="M10 178V142M18 178V136M26 178V146" />
      </g>
      <g fill="hsl(var(--jade))" opacity="0.65">
        <ellipse cx="22" cy="132" rx="17" ry="7" />
        <ellipse cx="36" cy="146" rx="13" ry="6" />
      </g>

      <g>
        <rect
          x="86"
          y="146"
          width="9"
          height="34"
          rx="3"
          fill="hsl(var(--wood))"
        />
        <circle cx="90" cy="118" r="26" fill="hsl(var(--jade))" />
        <circle cx="66" cy="132" r="16" fill="hsl(var(--jade))" />
        <circle cx="114" cy="132" r="17" fill="hsl(var(--jade))" />
        <circle cx="90" cy="104" r="14" fill="hsl(var(--jade))" opacity="0.8" />
      </g>

      <g>
        <path d="M146 150h56v-6h-56z" fill="hsl(var(--wood-light))" />
        <rect x="150" y="150" width="8" height="28" fill="hsl(var(--seal))" />
        <rect x="190" y="150" width="8" height="28" fill="hsl(var(--seal))" />
        <path d="M142 144l32-16 32 16z" fill="hsl(var(--seal))" />
        <rect
          x="164"
          y="156"
          width="20"
          height="22"
          fill="hsl(var(--wood))"
          opacity="0.7"
        />
      </g>

      <g>
        <path d="M206 138l44-24 44 24z" fill="hsl(var(--seal))" />
        <rect
          x="214"
          y="138"
          width="72"
          height="40"
          fill="hsl(var(--gold))"
          opacity="0.85"
        />
        <rect x="216" y="138" width="6" height="40" fill="hsl(var(--wood))" />
        <rect x="278" y="138" width="6" height="40" fill="hsl(var(--wood))" />
        <rect
          x="242"
          y="150"
          width="18"
          height="28"
          fill="hsl(var(--wood))"
          opacity="0.75"
        />
      </g>

      <g>
        <path d="M306 144l30-18 30 18z" fill="hsl(var(--seal))" />
        <rect
          x="312"
          y="144"
          width="48"
          height="34"
          fill="hsl(var(--paper))"
          stroke="hsl(var(--wood))"
          strokeWidth="1.6"
        />
        <rect
          x="330"
          y="156"
          width="14"
          height="22"
          fill="hsl(var(--seal))"
          opacity="0.8"
        />
      </g>

      <g>
        <path d="M348 118l18-12 18 12z" fill="hsl(var(--wood-light))" />
        <rect
          x="352"
          y="118"
          width="28"
          height="22"
          fill="hsl(var(--gold))"
          opacity="0.7"
        />
        <rect
          x="363"
          y="126"
          width="7"
          height="14"
          fill="hsl(var(--wood))"
          opacity="0.7"
        />
      </g>

      <g>
        <rect x="146" y="186" width="5" height="18" fill="hsl(var(--wood))" />
        <rect
          x="139"
          y="170"
          width="20"
          height="16"
          rx="3"
          fill="hsl(var(--jade))"
          opacity="0.85"
        />
        <path
          d="M139 172l10 7 10-7"
          fill="none"
          stroke="hsl(var(--paper))"
          strokeWidth="1.4"
        />
      </g>

      <g stroke="hsl(var(--ink))" strokeWidth="1.4" fill="none" opacity="0.5">
        <path d="M240 44l6-5 6 5M262 34l5-4 5 4M222 58l5-4 5 4" />
      </g>

      <g
        fill="hsl(var(--ink))"
        fontSize="9"
        fontFamily="serif"
        textAnchor="middle"
        opacity="0.7"
      >
        <text x="90" y="200">
          Cây Đại Thụ
        </text>
        <text x="174" y="140">
          Cổng Làng
        </text>
        <text x="250" y="196">
          Sảnh Xưng Hô
        </text>
        <text x="336" y="196">
          Từ Đường
        </text>
        <text x="366" y="112">
          Kho Sách
        </text>
        <text x="149" y="216">
          Hòm Thư
        </text>
      </g>
    </svg>
  );
}
