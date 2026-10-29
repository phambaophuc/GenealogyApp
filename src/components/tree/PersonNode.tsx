import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { personRoleLabel } from "../../lib/format";
import type { PersonNodeData } from "../../services/types";
import PersonAvatar from "../people/PersonAvatar";
import IncenseSmoke from "./IncenseSmoke";

const GEN_BORDER: Record<number, string> = {
  1: "border-gen-1",
  2: "border-gen-2",
  3: "border-gen-3",
  4: "border-gen-4",
  5: "border-gen-5",
};

function PersonNode({ data }: NodeProps) {
  const node = data as unknown as PersonNodeData;
  const { person, alive, childCount, hiddenCount, collapsed, onToggle } = node;

  return (
    <div
      className={cn(
        "relative w-[168px] rounded-xl p-[3px]",
        alive ? "ring-2 ring-jade" : "ring-2 ring-gold",
      )}
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

      {!alive && <IncenseSmoke />}

      <div
        className={cn(
          "orn-plaque orn-paper border-2 p-2.5 transition-transform hover:-translate-y-1",
          GEN_BORDER[person.generation] ?? "border-wood",
        )}
      >
        <div className="flex items-center gap-2">
          <PersonAvatar person={person} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold leading-tight">
              {person.fullName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {personRoleLabel(person)}
            </p>
          </div>
        </div>
      </div>

      {childCount > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(person.id);
          }}
          aria-label={
            collapsed
              ? `Mở rộng nhánh của ${person.fullName}`
              : `Thu gọn nhánh của ${person.fullName}`
          }
          aria-expanded={!collapsed}
          className="orn-plaque absolute -bottom-4 left-1/2 z-10 flex h-8 min-w-8 -translate-x-1/2 items-center gap-1 bg-card px-2 text-[11px] font-semibold"
        >
          {collapsed ? (
            <>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              {hiddenCount}
            </>
          ) : (
            <>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              {childCount}
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default React.memo(PersonNode);
