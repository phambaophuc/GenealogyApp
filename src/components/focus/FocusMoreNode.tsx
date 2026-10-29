import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown } from "lucide-react";
import type { FocusNodeData } from "./FocusPersonNode";

function FocusMoreNode({ data }: NodeProps) {
  const { card, onMore } = data as unknown as FocusNodeData & {
    onMore: () => void;
  };

  return (
    <div style={{ width: 158 }}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={false}
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onMore();
        }}
        className="orn-plaque flex min-h-[72px] w-full items-center justify-center gap-1 bg-card px-2 text-sm font-semibold"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
        {card.label}
      </button>
    </div>
  );
}

export default React.memo(FocusMoreNode);
