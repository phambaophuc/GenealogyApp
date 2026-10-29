import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { buildKinContext, ancestryChain } from "../../services/kinship";
import type { Person } from "../../services/types";
import FocusBreadcrumb from "./FocusBreadcrumb";
import PersonSearch from "../search/PersonSearch";
import { CARD_H, buildFocusGraph } from "./focusLayout";
import FocusListView from "./FocusListView";
import FocusMoreNode from "./FocusMoreNode";
import FocusPersonNode from "./FocusPersonNode";
import FocusPlaceholderNode from "./FocusPlaceholderNode";
import FocusSelectedPanel from "./FocusSelectedPanel";
import FocusToolbar from "./FocusToolbar";

const NODE_TYPES = {
  person: FocusPersonNode,
  placeholder: FocusPlaceholderNode,
  more: FocusMoreNode,
};

interface FocusTreeProps {
  center: Person;
  people: Person[];
  myPerson: Person | null;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onCenter: (id: string) => void;
  onOverview: () => void;
}

function CameraOnCenter({
  centerId,
  width,
}: {
  centerId: string;
  width: number;
}) {
  const { setCenter } = useReactFlow();

  useEffect(() => {
    const zoom = Math.min(0.92, Math.max(0.45, 980 / (width + 80)));
    const timer = window.setTimeout(
      () => setCenter(0, CARD_H / 2, { zoom, duration: 700 }),
      90,
    );
    return () => window.clearTimeout(timer);
  }, [centerId, width, setCenter]);

  return null;
}

export default function FocusTree({
  center,
  people,
  myPerson,
  canBack,
  canForward,
  onBack,
  onForward,
  onCenter,
  onOverview,
}: FocusTreeProps) {
  const navigate = useNavigate();
  const ctx = useMemo(() => buildKinContext(people), [people]);

  const [generations, setGenerations] = useState(2);
  const [showCollateral, setShowCollateral] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [listMode, setListMode] = useState(false);
  const [siblingLimit, setSiblingLimit] = useState(6);

  const graph = useMemo(
    () =>
      buildFocusGraph(center, ctx, {
        generations,
        showCollateral,
        siblingLimit,
      }),
    [center, ctx, generations, showCollateral, siblingLimit],
  );

  const goTo = useCallback(
    (target: string) => {
      if (target.startsWith("/")) navigate(target);
      else onCenter(target);
    },
    [navigate, onCenter],
  );

  const nodes = useMemo(
    () =>
      graph.cards.map((card) => ({
        id: card.id,
        type: card.kind,
        position: { x: card.x, y: card.y },
        draggable: false,
        data: {
          card,
          showLabels,
          onNavigate: goTo,
          onMore: () => setSiblingLimit((value) => value + 6),
        },
      })),
    [graph.cards, showLabels, goTo],
  );

  const edges = useMemo(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.kind === "marriage" ? "right" : "bottom",
        targetHandle: edge.kind === "marriage" ? "left" : "top",
        type: edge.kind === "marriage" ? "straight" : "smoothstep",
        style:
          edge.kind === "marriage"
            ? {
                stroke: "hsl(var(--seal))",
                strokeWidth: 2,
                strokeDasharray: "5 4",
              }
            : edge.kind === "faint"
              ? { stroke: "hsl(var(--wood-light) / 0.45)", strokeWidth: 1.2 }
              : { stroke: "hsl(var(--wood))", strokeWidth: 2.2 },
      })),
    [graph.edges],
  );

  const breadcrumb = useMemo(
    () =>
      ancestryChain(center, ctx).map((person) => ({
        id: person.id,
        name: person.fullName,
      })),
    [center, ctx],
  );

  const graphWidth = useMemo(() => {
    if (graph.cards.length === 0) return CARD_H;
    const xs = graph.cards.map((card) => card.x);
    return Math.max(...xs) - Math.min(...xs);
  }, [graph.cards]);

  return (
    <div className="space-y-3">
      <PersonSearch
        onSelect={(person) => onCenter(person.id)}
        hint={(person) => (person.id === center.id ? "đang xem" : null)}
      />

      <FocusBreadcrumb
        items={breadcrumb}
        currentId={center.id}
        onPick={onCenter}
      />

      <FocusToolbar
        generations={generations}
        onGenerations={setGenerations}
        showCollateral={showCollateral}
        onShowCollateral={setShowCollateral}
        showLabels={showLabels}
        onShowLabels={setShowLabels}
        listMode={listMode}
        onListMode={setListMode}
        canBack={canBack}
        canForward={canForward}
        onBack={onBack}
        onForward={onForward}
        onHome={() => myPerson && onCenter(myPerson.id)}
        homeLabel={myPerson ? "Về tôi" : "Về tôi (chưa có)"}
        homeDisabled={!myPerson}
        onOverview={onOverview}
      />

      {listMode ? (
        <FocusListView center={center} people={people} onCenter={onCenter} />
      ) : (
        <div className="orn-flow h-[62vh] min-h-[420px] w-full overflow-hidden rounded-xl border-2 border-wood/30 bg-card/60">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={NODE_TYPES}
              nodesDraggable={false}
              nodesConnectable={false}
              fitView
              fitViewOptions={{ padding: 0.35 }}
              minZoom={0.15}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
              onNodeClick={(_, node) => {
                if (node.type !== "person" || node.id === center.id) return;
                onCenter(node.id);
              }}
            >
              <Background gap={26} size={1.4} color="hsl(var(--wood) / 0.3)" />
              <Controls showInteractive={false} />
              <CameraOnCenter centerId={center.id} width={graphWidth} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Bấm vào một thẻ để đổi người ở tâm; mũi tên nhỏ ở góc thẻ mở hồ sơ đầy
        đủ.
        {graph.hiddenSiblings > 0 &&
          ` Còn ${graph.hiddenSiblings} anh chị em đang gom ở nút “+N người”.`}
      </p>

      <FocusSelectedPanel person={center} />
    </div>
  );
}
