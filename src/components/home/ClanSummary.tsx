import { Flame } from "lucide-react";
import type { ClanInfo, ClanStats, UpcomingGio } from "../../services/types";
import PaperPanel from "../ornaments/PaperPanel";

interface ClanSummaryProps {
  clan: ClanInfo;
  stats: ClanStats;
  upcoming: UpcomingGio[];
}

const formatDay = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border-2 border-wood/25 bg-secondary/70 px-3.5 py-2.5">
      <p className="font-heading text-2xl font-semibold leading-none">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function ClanSummary({
  clan,
  stats,
  upcoming,
}: ClanSummaryProps) {
  return (
    <PaperPanel className="h-full p-5">
      <h2 className="font-heading text-xl font-semibold">Sổ phả hệ</h2>
      <p className="mt-1 text-sm text-muted-foreground">{clan.foundedNote}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip value={stats.total} label="người trong phả" />
        <StatChip value={stats.generations} label="đời" />
        <StatChip value={stats.deceased} label="cụ đã khuất" />
        <StatChip value={stats.living} label="người còn sống" />
      </div>

      {stats.outsideClan > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Ngoài ra còn {stats.outsideClan} người bên ngoại (ông bà ngoại, thông
          gia) đã ghi trong phả.
        </p>
      )}

      <div className="mt-4 rounded-xl border-2 border-wood/25 bg-card/70 p-3.5">
        <p className="flex items-center gap-2 font-heading text-base font-semibold">
          <Flame className="h-4 w-4 text-seal" aria-hidden="true" />
          Ngày giỗ sắp tới
        </p>
        {upcoming.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted-foreground">
            Chưa có ngày giỗ nào trong dữ liệu mẫu.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {upcoming.map(({ person, daysLeft, nextGioDate }) => (
              <li
                key={person.id}
                className="flex flex-wrap items-baseline gap-x-2"
              >
                <span className="font-medium">Cụ {person.fullName}</span>
                <span className="text-muted-foreground">
                  giỗ {person.deathLunarDate} âm lịch · {formatDay(nextGioDate)}{" "}
                  · {daysLeft === 0 ? "hôm nay" : `còn ${daysLeft} ngày`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PaperPanel>
  );
}
