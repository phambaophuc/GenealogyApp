import { Eye, ShieldCheck, Sparkles, Sun } from "lucide-react";
import {
  type ViewMode,
  setViewMode,
  usePrefs,
  setSimpleUI,
} from "../../hooks/usePrefs";
import { cn } from "../../lib/utils";

function ModeButton({
  active,
  mode,
  icon: Icon,
  label,
}: {
  active: boolean;
  mode: ViewMode;
  icon: typeof Eye;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      aria-pressed={active}
      className={cn(
        "flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-semibold",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function GameControls() {
  const { viewMode, simpleUI } = usePrefs();

  return (
    <div className="fixed bottom-3 left-1/2 z-40 w-[min(94vw,660px)] -translate-x-1/2 sm:left-auto sm:right-4 sm:w-auto sm:translate-x-0">
      <div className="orn-frame orn-paper p-2.5 shadow-2xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold whitespace-nowrap">
              Chế độ xem
            </span>
            <div className="flex overflow-hidden rounded-xl border-2 border-wood">
              <ModeButton
                active={viewMode === "member"}
                mode="member"
                icon={Eye}
                label="Thành viên"
              />
              <ModeButton
                active={viewMode === "admin"}
                mode="admin"
                icon={ShieldCheck}
                label="Quản trị"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSimpleUI(!simpleUI)}
            aria-pressed={simpleUI}
            className={cn(
              "orn-plaque flex min-h-[44px] items-center justify-center gap-2 border-2 px-3 text-sm font-semibold",
              simpleUI ? "bg-jade text-paper" : "bg-card",
            )}
          >
            {simpleUI ? (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
            Giao diện đơn giản: {simpleUI ? "đang bật" : "đang tắt"}
          </button>
        </div>
      </div>
    </div>
  );
}
