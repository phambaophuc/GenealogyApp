import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Info, ShieldCheck, X } from "lucide-react";
import ClanSummary from "../components/home/ClanSummary";
import DailyMissions from "../components/home/DailyMissions";
import TreeCompleteness from "../components/home/TreeCompleteness";
import { VILLAGE_DOORS } from "../components/map/doors";
import LocationDoor from "../components/map/LocationDoor";
import VillageScene from "../components/map/VillageScene";
import DrumPattern from "../components/ornaments/DrumPattern";
import PaperPanel from "../components/ornaments/PaperPanel";
import { usePrefs } from "../hooks/usePrefs";
import { getClan, getClanStats, getUpcomingGio } from "../services/api";
import type {
  ClanInfo,
  ClanStats,
  UpcomingGio,
  VillageDoor,
} from "../services/types";

export default function VillageMap() {
  const { viewMode } = usePrefs();
  const navigate = useNavigate();
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [stats, setStats] = useState<ClanStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingGio[]>([]);
  const [selected, setSelected] = useState<VillageDoor | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getClan(), getClanStats(), getUpcomingGio(3)]).then(
      ([clanInfo, clanStats, gioList]) => {
        if (!alive) return;
        setClan(clanInfo);
        setStats(clanStats);
        setUpcoming(gioList);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  if (!clan || !stats) {
    return (
      <PaperPanel className="p-8 text-center">
        <p className="font-heading text-xl">Đang mở sổ phả hệ…</p>
      </PaperPanel>
    );
  }

  const doors = VILLAGE_DOORS.filter(
    (door) => !door.adminOnly || viewMode === "admin",
  );

  return (
    <div className="space-y-5">
      <PaperPanel className="relative overflow-hidden p-5 sm:p-7">
        <DrumPattern className="-right-14 -top-16 h-48 w-48" />
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-seal">
          Bản đồ dòng họ
        </p>
        <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
          Dòng họ {clan.familyName}
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          {clan.village} · {clan.region}
        </p>
        <p className="mt-3 max-w-2xl font-heading text-lg italic">
          {clan.motto}
        </p>
      </PaperPanel>

      <PaperPanel className="relative overflow-hidden p-4 sm:p-6">
        <VillageScene />
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sáu nơi trong làng — bấm vào bảng gỗ bên dưới để mở.
        </p>
      </PaperPanel>

      <section aria-labelledby="cua-trong-lang" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="cua-trong-lang"
            className="font-heading text-2xl font-semibold"
          >
            Các cửa trong làng
          </h2>
          <p className="text-sm text-muted-foreground">
            Bản dựng đang ở Giai đoạn 3 — cửa mở dần theo từng giai đoạn.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doors.map((door) => (
            <LocationDoor
              key={door.id}
              door={door}
              active={selected?.id === door.id}
              onSelect={(door) =>
                door.to ? navigate(door.to) : setSelected(door)
              }
            />
          ))}
        </div>

        <p className="flex items-start gap-2 rounded-xl border-2 border-wood/20 bg-secondary/60 px-3.5 py-2.5 text-sm">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-jade"
            aria-hidden="true"
          />
          {viewMode === "admin"
            ? "Đang ở chế độ Quản trị: cửa Kho Sách đã hiện. Chế độ này sẽ mở thêm thông tin nhạy cảm, hòm thư và trang quản trị ở các giai đoạn sau."
            : "Cửa Kho Sách chỉ hiện ở chế độ Quản trị — bật công tắc ở góc dưới màn hình để xem thử."}
        </p>
      </section>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <PaperPanel className="border-seal/50 p-4">
            <div className="flex items-start gap-3">
              <Info
                className="mt-0.5 h-5 w-5 shrink-0 text-seal"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg font-semibold">
                  {selected.name}
                </p>
                <p className="mt-1 text-sm">{selected.upcoming}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Đóng ghi chú"
                className="orn-plaque flex h-10 w-10 shrink-0 items-center justify-center bg-card"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </PaperPanel>
        </motion.div>
      )}

      <section aria-labelledby="bang-tin" className="grid gap-4 lg:grid-cols-3">
        <h2 id="bang-tin" className="sr-only">
          Sổ phả hệ và nhiệm vụ hôm nay
        </h2>
        <div className="lg:col-span-2">
          <ClanSummary clan={clan} stats={stats} upcoming={upcoming} />
        </div>
        <TreeCompleteness stats={stats} />
        <div className="lg:col-span-3">
          <DailyMissions />
        </div>
      </section>
    </div>
  );
}
