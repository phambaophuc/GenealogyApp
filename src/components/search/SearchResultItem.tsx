import { Link } from "react-router-dom";
import { Network, UserRound } from "lucide-react";
import { personRoleLabel, genderLabel } from "../../lib/format";
import type { Person } from "../../services/types";

interface SearchResultItemProps {
  person: Person;
  relationLabel?: string | null;
}

export default function SearchResultItem({
  person,
  relationLabel,
}: SearchResultItemProps) {
  return (
    <li className="rounded-xl border-2 border-wood/20 bg-card/70 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold leading-tight">
            {person.fullName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {personRoleLabel(person)} · {genderLabel(person.gender)} ·{" "}
            {person.isDeceased ? "đã khuất" : "còn sống"}
          </p>
        </div>
        {relationLabel && (
          <span className="shrink-0 rounded-md bg-seal px-1.5 py-0.5 text-[11px] font-semibold text-paper">
            gọi là {relationLabel}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          to={`/ho-so/${person.id}`}
          className="orn-plaque inline-flex min-h-[38px] items-center gap-1.5 bg-card px-2.5 text-xs font-semibold"
        >
          <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
          Hồ sơ
        </Link>
        <Link
          to={`/cay-pha-he?tam=${person.id}`}
          className="orn-plaque inline-flex min-h-[38px] items-center gap-1.5 bg-card px-2.5 text-xs font-semibold"
        >
          <Network className="h-3.5 w-3.5" aria-hidden="true" />
          Xem góc nhìn
        </Link>
      </div>
    </li>
  );
}
