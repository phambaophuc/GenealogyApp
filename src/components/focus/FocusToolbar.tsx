import {
  ArrowLeft,
  ArrowRight,
  List,
  Network,
  Tags,
  UserRound,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface FocusToolbarProps {
  generations: number;
  onGenerations: (value: number) => void;
  showCollateral: boolean;
  onShowCollateral: (value: boolean) => void;
  showLabels: boolean;
  onShowLabels: (value: boolean) => void;
  listMode: boolean;
  onListMode: (value: boolean) => void;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  homeLabel: string;
  homeDisabled: boolean;
  onOverview: () => void;
}

const toggleClass = (active: boolean) =>
  cn(
    "orn-plaque flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-semibold",
    active ? "bg-gold/25 text-wood" : "bg-card",
  );

export default function FocusToolbar({
  generations,
  onGenerations,
  showCollateral,
  onShowCollateral,
  showLabels,
  onShowLabels,
  listMode,
  onListMode,
  canBack,
  canForward,
  onBack,
  onForward,
  onHome,
  homeLabel,
  homeDisabled,
  onOverview,
}: FocusToolbarProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          className={cn(toggleClass(false), "disabled:opacity-40")}
          aria-label="Quay lại người xem trước"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Quay lại
        </button>
        <button
          type="button"
          onClick={onForward}
          disabled={!canForward}
          className={cn(toggleClass(false), "disabled:opacity-40")}
          aria-label="Tiến tới người vừa xem sau"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          Tiến tới
        </button>
        <button
          type="button"
          onClick={onHome}
          disabled={homeDisabled}
          className={cn(toggleClass(false), "disabled:opacity-40")}
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          {homeLabel}
        </button>
        <button
          type="button"
          onClick={onOverview}
          className={toggleClass(false)}
        >
          <Network className="h-4 w-4" aria-hidden="true" />
          Xem toàn cảnh
        </button>
        <button
          type="button"
          onClick={() => onListMode(!listMode)}
          aria-pressed={listMode}
          className={toggleClass(listMode)}
        >
          <List className="h-4 w-4" aria-hidden="true" />
          Dạng danh sách
        </button>
        <button
          type="button"
          onClick={() => onShowCollateral(!showCollateral)}
          aria-pressed={showCollateral}
          className={toggleClass(showCollateral)}
        >
          Họ hàng bên cạnh
        </button>
        <button
          type="button"
          onClick={() => onShowLabels(!showLabels)}
          aria-pressed={showLabels}
          className={toggleClass(showLabels)}
        >
          <Tags className="h-4 w-4" aria-hidden="true" />
          Nhãn xưng hô
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-wood/20 bg-secondary/50 px-3 py-2">
        <label htmlFor="so-doi" className="text-sm font-semibold">
          Số đời hiển thị: {generations} trên · {generations} dưới
        </label>
        <input
          id="so-doi"
          type="range"
          min={1}
          max={4}
          step={1}
          value={generations}
          onChange={(event) => onGenerations(Number(event.target.value))}
          className="h-2 w-40 accent-[hsl(var(--seal))]"
        />

        <span className="ml-auto flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="rounded-md bg-wood px-1.5 py-0.5 text-paper">
            bên nội
          </span>
          <span className="rounded-md bg-jade px-1.5 py-0.5 text-paper">
            bên ngoại
          </span>
          <span className="rounded-md bg-seal px-1.5 py-0.5 text-paper">
            bên vợ/chồng
          </span>
          <span className="rounded-md bg-bronze px-1.5 py-0.5 text-wood">
            họ hàng
          </span>
        </span>
      </div>
    </div>
  );
}
