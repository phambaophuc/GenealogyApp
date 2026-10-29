import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { RelationSide } from "../../services/kinship";
import PersonAvatar from "../people/PersonAvatar";
import IncenseSmoke from "../tree/IncenseSmoke";
import type { FocusCard } from "./focusLayout";

export interface FocusNodeData extends Record<string, unknown> {
  card: FocusCard;
  showLabels: boolean;
  onNavigate: (id: string) => void;
}

const GEN_BORDER: Record<number, string> = {
  1: "border-gen-1",
  2: "border-gen-2",
  3: "border-gen-3",
  4: "border-gen-4",
  5: "border-gen-5",
};

const SIDE_CHIP: Record<RelationSide, string> = {
  noi: "bg-wood text-paper",
  ngoai: "bg-jade text-paper",
  "vo-chong": "bg-seal text-paper",
  ho: "bg-bronze text-wood",
};

function FocusPersonNode({ data }: NodeProps) {
  const { card, showLabels, onNavigate } = data as unknown as FocusNodeData;
  const person = card.person;
  if (!person) return null;

  const alive = !person.isDeceased;
  const relation = card.relation;

  return (
    <div
      className={cn("relative", card.dim && "opacity-60")}
      style={{ width: 158 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={false}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={false}
      />

      {card.center && (
        <span
          aria-hidden="true"
          className="orn-decor pointer-events-none absolute -inset-3 rounded-3xl bg-gold/30 blur-lg"
        />
      )}
      {!alive && <IncenseSmoke />}

      <div
        className={cn(
          "orn-plaque orn-paper relative border-2 px-2.5 py-2",
          GEN_BORDER[person.generation] ?? "border-wood",
          alive ? "ring-2 ring-jade/60" : "ring-2 ring-gold/70",
          card.center && "scale-110 ring-4 ring-gold",
        )}
      >
        {showLabels && relation && !card.center && (
          <span
            className={cn(
              "absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-[1px] text-[10px] font-semibold",
              SIDE_CHIP[relation.side],
            )}
          >
            {relation.label}
          </span>
        )}

        <div className="flex items-center gap-2">
          <PersonAvatar person={person} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold leading-tight">
              {person.fullName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {card.center ? "Người đang xem" : `Đời ${person.generation}`}
            </p>
          </div>
        </div>

        {card.note && (
          <p className="mt-1 truncate text-[10px] text-muted-foreground">
            {card.note}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-1">
          {card.actionId ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onNavigate(card.actionId as string);
              }}
              className="text-[10px] font-semibold text-seal underline"
            >
              {card.actionLabel}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(`/ho-so/${person.id}`);
            }}
            aria-label={`Mở hồ sơ ${person.fullName}`}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-wood/25 bg-card/80 text-wood/80"
          >
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FocusPersonNode);
