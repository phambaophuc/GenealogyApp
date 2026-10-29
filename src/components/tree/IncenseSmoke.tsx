import { cn } from "../../lib/utils";

export default function IncenseSmoke({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 32"
      aria-hidden="true"
      className={cn(
        "orn-smoke orn-decor pointer-events-none absolute -top-2 right-4 h-8 w-6",
        className,
      )}
    >
      <rect x="11" y="23" width="2" height="9" rx="1" fill="hsl(var(--seal))" />
      <circle cx="12" cy="22" r="1.6" fill="hsl(var(--gold))" />
      <path
        d="M12 20c-3-3 3-5 0-9"
        fill="none"
        stroke="hsl(var(--gold))"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15 21c-2.5-2.5 2.5-4.5 0-8"
        fill="none"
        stroke="hsl(var(--gold))"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
