import { ChevronRight, Lock } from "lucide-react";
import { cn } from "../../lib/utils";
import type { VillageDoor } from "../../services/types";

interface LocationDoorProps {
  door: VillageDoor;
  active: boolean;
  onSelect: (door: VillageDoor) => void;
}

export default function LocationDoor({
  door,
  active,
  onSelect,
}: LocationDoorProps) {
  const Icon = door.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(door)}
      aria-pressed={active}
      className={cn(
        "orn-plaque orn-paper flex min-h-[92px] w-full items-start gap-3 p-3.5 text-left",
        active && "ring-4 ring-gold",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-wood/35 bg-secondary",
          door.accentClass,
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-lg font-semibold leading-snug">
          {door.name}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {door.desc}
        </span>
        {door.to ? (
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-jade">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            Đang mở — bấm để vào
          </span>
        ) : (
          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-seal">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Mở ở Giai đoạn {door.stage}
          </span>
        )}
      </span>
    </button>
  );
}
