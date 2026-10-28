export default function ClanEmblem({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Ấn triện dòng họ"
    >
      <circle cx="50" cy="50" r="48" fill="hsl(var(--wood))" />
      <circle cx="50" cy="50" r="43" fill="hsl(var(--gold))" />
      <circle cx="50" cy="50" r="38" fill="hsl(var(--seal))" />
      <g stroke="hsl(var(--gold))" strokeWidth="1.6" opacity="0.9">
        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index * Math.PI * 2) / 16;
          return (
            <line
              key={index}
              x1={50 + Math.cos(angle) * 30}
              y1={50 + Math.sin(angle) * 30}
              x2={50 + Math.cos(angle) * 38}
              y2={50 + Math.sin(angle) * 38}
            />
          );
        })}
      </g>
      <circle
        cx="50"
        cy="50"
        r="27"
        fill="none"
        stroke="hsl(var(--gold))"
        strokeWidth="1.2"
      />
      <g fill="hsl(var(--gold))">
        <rect x="48" y="46" width="4" height="20" rx="2" />
        <circle cx="50" cy="40" r="9" />
        <circle cx="41" cy="46" r="6" />
        <circle cx="59" cy="46" r="6" />
      </g>
    </svg>
  );
}
