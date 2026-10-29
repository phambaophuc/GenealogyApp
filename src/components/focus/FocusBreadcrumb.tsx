import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface FocusBreadcrumbProps {
  items: Array<{ id: string; name: string }>;
  currentId: string;
  onPick: (id: string) => void;
}

export default function FocusBreadcrumb({
  items,
  currentId,
  onPick,
}: FocusBreadcrumbProps) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Đường về cội nguồn"
      className="flex items-center gap-1 overflow-x-auto rounded-xl border-2 border-wood/25 bg-card/70 px-2.5 py-2"
    >
      {items.map((item, index) => {
        const current = item.id === currentId;

        return (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-wood/40"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={() => onPick(item.id)}
              aria-current={current ? "true" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-1.5 py-1 text-xs font-semibold",
                current ? "bg-seal text-paper" : "text-wood hover:bg-secondary",
                index === 0 && !current && "text-bronze",
              )}
            >
              {current ? "Bạn" : item.name.split(" ").slice(-1)[0]}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
