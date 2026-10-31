import { useEffect, useState } from "react";
import { Check, Flame, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { getTodayMissions } from "../../services/api";
import type { Mission } from "../../services/types";
import PaperPanel from "../ornaments/PaperPanel";

const todayKey = () => new Date().toISOString().slice(0, 10);
const storageKey = () => `giapha.missions.${todayKey()}`;

export default function DailyMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey()) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let alive = true;

    getTodayMissions().then(
      (list) => {
        if (alive) {
          setMissions(list);
        }
      },
      () => {
        if (alive) {
          setMissions([]);
        }
      },
    );

    return () => {
      alive = false;
    };
  }, []);

  const toggle = (id: string) => {
    const next = done.includes(id)
      ? done.filter((item) => item !== id)
      : [...done, id];
    setDone(next);
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify(next));
    } catch {
      /* không lưu được thì chỉ giữ trong phiên */
    }
  };

  return (
    <PaperPanel className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-semibold">Nhiệm vụ hôm nay</h2>
        <p className="text-sm text-muted-foreground">
          Đã xong{" "}
          {done.filter((id) => missions.some((m) => m.id === id)).length}/
          {missions.length}
        </p>
      </div>

      <ul className="mt-3 space-y-2">
        {missions.map((mission) => {
          const checked = done.includes(mission.id);
          return (
            <li key={mission.id}>
              <button
                type="button"
                onClick={() => toggle(mission.id)}
                aria-pressed={checked}
                className={cn(
                  "orn-plaque flex w-full items-start gap-3 border-2 p-3 text-left",
                  checked ? "bg-jade/15" : "bg-card",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-wood/40",
                    checked ? "bg-jade text-paper" : "bg-secondary",
                  )}
                >
                  {checked ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : mission.tag === "gio" ? (
                    <Flame className="h-4 w-4 text-seal" aria-hidden="true" />
                  ) : (
                    <Sparkles
                      className="h-4 w-4 text-bronze"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block font-medium",
                      checked && "line-through opacity-70",
                    )}
                  >
                    {mission.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {mission.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </PaperPanel>
  );
}
