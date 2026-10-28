import { cn } from "../../lib/utils";

export default function DrumPattern({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn("orn-decor pointer-events-none absolute", className)}
    >
      <g
        fill="none"
        stroke="hsl(var(--bronze))"
        strokeWidth="1.4"
        opacity="0.28"
      >
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="62" />
        <circle cx="100" cy="100" r="46" />
        <circle cx="100" cy="100" r="30" />
        {Array.from({ length: 24 }).map((_, index) => {
          const angle = (index * Math.PI * 2) / 24;
          return (
            <line
              key={index}
              x1={100 + Math.cos(angle) * 48}
              y1={100 + Math.sin(angle) * 48}
              x2={100 + Math.cos(angle) * 62}
              y2={100 + Math.sin(angle) * 62}
            />
          );
        })}
      </g>
    </svg>
  );
}
