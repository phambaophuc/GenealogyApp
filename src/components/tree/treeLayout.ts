import type { Edge, Node } from "@xyflow/react";
import type { Person, PersonNodeData } from "../../services/types";

export const NODE_W = 168;
export const NODE_H = 100;
const COL_GAP = 26;
const ROW_GAP = 86;
export const PERSON_NODE_TYPE = "person";

export type Positions = Record<string, { x: number; y: number }>;

const mapById = (people: Person[]) =>
  new Map(people.map((person) => [person.id, person]));

export function spousesOf(person: Person, byId: Map<string, Person>): Person[] {
  return person.spouseIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
}

export function unitOf(person: Person, byId: Map<string, Person>): Person[] {
  return [person, ...spousesOf(person, byId)];
}

export function childrenOfUnit(
  person: Person,
  people: Person[],
  byId: Map<string, Person>,
): Person[] {
  const unitIds = new Set(unitOf(person, byId).map((member) => member.id));
  return people
    .filter(
      (child) =>
        (child.fatherId && unitIds.has(child.fatherId)) ||
        (child.motherId && unitIds.has(child.motherId)),
    )
    .sort(
      (a, b) =>
        (a.birthOrder ?? 99) - (b.birthOrder ?? 99) ||
        a.fullName.localeCompare(b.fullName),
    );
}

export function descendantsOf(
  id: string,
  people: Person[],
  byId: Map<string, Person> = mapById(people),
): string[] {
  const found: string[] = [];
  const walk = (personId: string) => {
    const person = byId.get(personId);
    if (!person) return;
    childrenOfUnit(person, people, byId).forEach((child) => {
      found.push(child.id);
      walk(child.id);
    });
  };
  walk(id);
  return found;
}

export function buildPositions(people: Person[]): Positions {
  const byId = mapById(people);
  const positions: Positions = {};
  const nextCol: number[] = [];

  const placeUnit = (person: Person): { first: number; last: number } => {
    const row = person.generation - 1;
    const unit = unitOf(person, byId);
    const kids = childrenOfUnit(person, people, byId);

    let first: number;
    if (kids.length === 0) {
      first = nextCol[row] ?? 0;
    } else {
      const spans = kids.map(placeUnit);
      const center = (spans[0].first + spans[spans.length - 1].last) / 2;
      first = Math.max(
        Math.round(center - (unit.length - 1) / 2),
        nextCol[row] ?? 0,
      );
    }

    const last = first + unit.length - 1;
    nextCol[row] = last + 1;

    unit.forEach((member, index) => {
      positions[member.id] = {
        x: (first + index) * (NODE_W + COL_GAP),
        y: row * (NODE_H + ROW_GAP),
      };
    });

    return { first, last };
  };

  const rootUnits = new Set<string>();
  people
    .filter((person) => person.generation === 1)
    .filter((person) => {
      const key = unitOf(person, byId)
        .map((member) => member.id)
        .sort()
        .join("|");
      if (rootUnits.has(key)) return false;
      rootUnits.add(key);
      return true;
    })
    .forEach(placeUnit);

  people
    .filter((person) => !positions[person.id])
    .forEach((person) => {
      const row = person.generation - 1;
      const col = nextCol[row] ?? 0;
      nextCol[row] = col + 1;
      positions[person.id] = {
        x: col * (NODE_W + COL_GAP),
        y: row * (NODE_H + ROW_GAP),
      };
    });

  return positions;
}

export function buildGraph({
  people,
  collapsed,
  onToggle,
}: {
  people: Person[];
  collapsed: string[];
  onToggle: (id: string) => void;
}): { nodes: Node<PersonNodeData>[]; edges: Edge[] } {
  const byId = mapById(people);
  const positions = buildPositions(people);
  const hidden = new Set<string>();
  collapsed.forEach((id) =>
    descendantsOf(id, people, byId).forEach((childId) => hidden.add(childId)),
  );

  const nodes: Node<PersonNodeData>[] = people
    .filter((person) => !hidden.has(person.id) && positions[person.id])
    .map((person) => ({
      id: person.id,
      type: PERSON_NODE_TYPE,
      position: positions[person.id],
      draggable: false,
      data: {
        person,
        alive: !person.isDeceased,
        childCount: childrenOfUnit(person, people, byId).length,
        hiddenCount: collapsed.includes(person.id)
          ? descendantsOf(person.id, people, byId).length
          : 0,
        collapsed: collapsed.includes(person.id),
        onToggle,
      },
    }));

  const edges: Edge[] = [];

  const seenUnits = new Set<string>();
  const unitLeaders = people.filter((person) => {
    const key = unitOf(person, byId)
      .map((member) => member.id)
      .sort()
      .join("|");
    if (seenUnits.has(key)) return false;
    seenUnits.add(key);
    return true;
  });

  unitLeaders.forEach((person) => {
    const unit = unitOf(person, byId);
    for (let index = 0; index < unit.length - 1; index += 1) {
      const left = unit[index];
      const right = unit[index + 1];
      if (hidden.has(left.id) || hidden.has(right.id)) continue;
      edges.push({
        id: `vo-chong-${left.id}-${right.id}`,
        source: left.id,
        target: right.id,
        sourceHandle: "right",
        targetHandle: "left",
        type: "straight",
        style: {
          stroke: "hsl(var(--seal))",
          strokeWidth: 1.6,
          strokeDasharray: "5 4",
        },
      });
    }
  });

  unitLeaders.forEach((person) => {
    const unitIds = new Set(unitOf(person, byId).map((member) => member.id));
    childrenOfUnit(person, people, byId).forEach((child) => {
      if (hidden.has(person.id) || hidden.has(child.id)) return;
      const childX = positions[child.id]?.x ?? 0;
      const candidates = [child.fatherId, child.motherId]
        .filter(
          (id): id is string =>
            Boolean(id) &&
            unitIds.has(id as string) &&
            Boolean(positions[id as string]),
        )
        .sort(
          (a, b) =>
            Math.abs(positions[a].x - childX) -
            Math.abs(positions[b].x - childX),
        );
      const source = candidates[0] ?? person.id;

      edges.push({
        id: `con-${source}-${child.id}`,
        source,
        target: child.id,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
        style: { stroke: "hsl(var(--wood-light))", strokeWidth: 1.8 },
      });
    });
  });

  return { nodes, edges };
}
