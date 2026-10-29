import { precisionLabel, gioLabel, formatSolarDate } from "../../lib/format";
import type { DatePrecision } from "../../services/types";

export default function DatePair({
  label,
  solar,
  precision,
  lunar,
}: {
  label: string;
  solar: string | null;
  precision?: DatePrecision | null;
  lunar?: string | null;
}) {
  const note = precisionLabel(precision ?? null);
  const gio = gioLabel(lunar ?? null);

  return (
    <div className="grid grid-cols-[86px_1fr] items-baseline gap-x-3">
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-base">
        {formatSolarDate(solar) ?? "chưa ghi"}
        {solar && note && (
          <span className="ml-2 text-sm text-muted-foreground">· {note}</span>
        )}
        {gio && (
          <span className="ml-2 text-sm text-muted-foreground">
            · giỗ {gio}
          </span>
        )}
      </span>
    </div>
  );
}
