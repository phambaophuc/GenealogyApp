import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertCircle } from "lucide-react";
import type { FocusNodeData } from "./FocusPersonNode";

function FocusPlaceholderNode({ data }: NodeProps) {
  const { card } = data as unknown as FocusNodeData;

  return (
    <div style={{ width: 158 }}>
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

      <div className="flex h-[104px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-seal/45 bg-card/40 px-2 text-center">
        <AlertCircle className="h-4 w-4 text-seal" aria-hidden="true" />
        <p className="text-[11px] font-semibold text-seal">{card.label}</p>
        <p className="text-[10px] text-muted-foreground">Phả chưa ghi</p>
      </div>
    </div>
  );
}

export default React.memo(FocusPlaceholderNode);
