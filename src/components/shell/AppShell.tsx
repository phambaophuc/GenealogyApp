import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { usePrefs } from "../../hooks/usePrefs";
import { getClan } from "../../services/api";
import type { ClanInfo } from "../../services/types";
import ClanEmblem from "../ornaments/ClanEmblem";
import GameControls from "./GameControls";
import { Link, Outlet } from "react-router-dom";
import { MotionConfig } from "framer-motion";

export default function AppShell() {
  const { simpleUI } = usePrefs();
  const [clan, setClan] = useState<ClanInfo | null>(null);

  useEffect(() => {
    let alive = true;
    getClan().then((info) => {
      if (alive) setClan(info);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <MotionConfig reducedMotion={simpleUI ? "always" : "user"}>
      <div
        data-simple={simpleUI ? "true" : "false"}
        className="relative min-h-screen"
      >
        <header className="orn-wood sticky top-0 z-30 border-b-4 border-wood">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <ClanEmblem className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg leading-tight sm:text-xl">
                Gia phả số dòng họ
              </p>
              <p className="truncate text-xs opacity-85 sm:text-sm">
                {clan
                  ? `${clan.familyName} · ${clan.village}`
                  : "Đang mở sổ phả hệ…"}
              </p>
            </div>
            <Link
              to="/"
              className="orn-plaque flex min-h-[44px] shrink-0 items-center gap-2 bg-card px-3 text-sm font-semibold text-foreground"
            >
              <ScrollText className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cổng làng</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-44 pt-5 sm:pb-36">
          <Outlet />
        </main>

        <GameControls />
      </div>
    </MotionConfig>
  );
}
