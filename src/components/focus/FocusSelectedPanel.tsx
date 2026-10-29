import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { personRoleLabel, formatSolarDate, gioLabel } from "../../lib/format";
import type { Person } from "../../services/types";

export default function FocusSelectedPanel({ person }: { person: Person }) {
  return (
    <div className="rounded-xl border-2 border-wood/25 bg-card/80 p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-heading text-lg font-semibold">{person.fullName}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-seal">
          {personRoleLabel(person)}
        </p>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatSolarDate(person.birthDate) ?? "chưa rõ ngày sinh"}
          {person.isDeceased &&
            ` – ${formatSolarDate(person.deathDate) ?? "chưa rõ ngày mất"}`}
        </span>
        {person.isDeceased && gioLabel(person.deathLunarDate) && (
          <span>Giỗ {gioLabel(person.deathLunarDate)}</span>
        )}
        {person.hometown && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {person.hometown}
          </span>
        )}
      </div>

      <Link
        to={`/ho-so/${person.id}`}
        className="orn-plaque mt-2.5 inline-flex min-h-[40px] items-center bg-card px-3 text-sm font-semibold"
      >
        Mở hồ sơ đầy đủ
      </Link>
    </div>
  );
}
