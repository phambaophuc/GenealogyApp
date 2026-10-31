import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Person } from "../../services/types";
import PersonNode from "./PersonNode";
import { PERSON_NODE_TYPE, buildGraph, descendantsOf } from "./treeLayout";

const NODE_TYPES = { [PERSON_NODE_TYPE]: PersonNode };

function FitOnChange({ token }: { token: number }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = window.setTimeout(
      () => fitView({ padding: 0.2, duration: 400 }),
      60,
    );
    return () => window.clearTimeout(timer);
  }, [token, fitView]);

  return null;
}

export default function FamilyTree({ people }: { people: Person[] }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const { nodes, edges } = useMemo(
    () => buildGraph({ people, collapsed, onToggle: toggle }),
    [people, collapsed, toggle],
  );

  const collapseToGenerationOne = useCallback(() => {
    setCollapsed(
      people
        .filter(
          (person) =>
            person.generation > 1 &&
            descendantsOf(person.id, people).length > 0,
        )
        .map((person) => person.id),
    );
  }, [people]);

  return (
    <ReactFlowProvider>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2.5">
        <p className="text-sm text-muted-foreground">
          Bấm nút tròn dưới mỗi thẻ để thu gọn hoặc mở rộng nhánh.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCollapsed([])}
            className="orn-plaque min-h-[44px] bg-card px-3 text-sm font-semibold"
          >
            Mở hết nhánh
          </button>
          <button
            type="button"
            onClick={collapseToGenerationOne}
            className="orn-plaque min-h-[44px] bg-card px-3 text-sm font-semibold"
          >
            Thu gọn về đời 1
          </button>
        </div>
      </div>

      <div className="orn-flow h-[68vh] min-h-[480px] w-full overflow-hidden rounded-xl border-2 border-wood/30 bg-card/60">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => navigate(`/ho-so/${node.id}`)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={26}
            size={1.4}
            color="hsl(var(--wood) / 0.3)"
          />
          <Controls showInteractive={false} />
          <MiniMap
            className="hidden sm:block"
            pannable
            zoomable
            maskColor="hsl(var(--wood) / 0.06)"
            nodeColor={(node) =>
              (node.data as { alive?: boolean })?.alive
                ? "hsl(var(--jade))"
                : "hsl(var(--gold))"
            }
          />
          <FitOnChange token={collapsed.length} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
