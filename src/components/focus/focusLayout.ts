import {
  type Relation,
  type KinContext,
  describeRelation,
  sortByAge,
  childrenOf,
  siblingsOf,
  isOlder,
  parentIdsOf,
  spousesOf,
} from "../../services/kinship";
import type { Person } from "../../services/types";

export const CARD_W = 158;
export const CARD_H = 104;
const SLOT_W = CARD_W + 22;
const ROW_H = CARD_H + 66;

export type FocusCardKind = "person" | "placeholder" | "more";

export interface FocusCard {
  id: string;
  kind: FocusCardKind;
  x: number;
  y: number;
  person?: Person;
  relation?: Relation;
  center?: boolean;
  dim?: boolean;
  label?: string;
  note?: string;
  actionId?: string;
  actionLabel?: string;
}

export interface FocusEdge {
  id: string;
  source: string;
  target: string;
  kind: "blood" | "marriage" | "faint";
}

export interface FocusOptions {
  generations: number;
  showCollateral: boolean;
  siblingLimit: number;
}

export interface FocusGraph {
  cards: FocusCard[];
  edges: FocusEdge[];
  hiddenSiblings: number;
}

export function buildFocusGraph(
  center: Person,
  ctx: KinContext,
  options: FocusOptions,
): FocusGraph {
  const cards: FocusCard[] = [];
  const edges: FocusEdge[] = [];
  const left = (slot: number) => slot * SLOT_W - CARD_W / 2;
  const hasCard = (id: string) => cards.some((card) => card.id === id);

  const addPerson = (
    person: Person,
    slot: number,
    y: number,
    extra: Partial<FocusCard> = {},
  ) => {
    cards.push({
      id: person.id,
      kind: "person",
      x: left(slot),
      y,
      person,
      relation: describeRelation(center, person, ctx),
      ...extra,
    });
    return person.id;
  };

  let frontier: Array<{ slot: number; person: Person | null }> = [
    { slot: 0, person: center },
  ];

  for (let level = 1; level <= options.generations; level += 1) {
    const next: Array<{ slot: number; person: Person | null }> = [];

    frontier.forEach((item) => {
      const father = item.person
        ? (ctx.byId.get(item.person.fatherId ?? "") ?? null)
        : null;
      const mother = item.person
        ? (ctx.byId.get(item.person.motherId ?? "") ?? null)
        : null;
      next.push({ slot: item.slot * 2 - 0.5, person: father });
      next.push({ slot: item.slot * 2 + 0.5, person: mother });
    });

    if (level > 1 && next.every((item) => !item.person)) break;

    next.forEach((item, index) => {
      if (item.person) {
        addPerson(item.person, item.slot, -level * ROW_H);
        return;
      }
      cards.push({
        id: `ph-${level}-${index}`,
        kind: "placeholder",
        x: left(item.slot),
        y: -level * ROW_H,
        label: "Chưa có thông tin",
      });
    });

    frontier.forEach((item, index) => {
      const person = item.person;
      if (!person) return;
      [next[index * 2].person, next[index * 2 + 1].person].forEach((parent) => {
        if (!parent) return;
        edges.push({
          id: `e-${parent.id}-${person.id}`,
          source: parent.id,
          target: person.id,
          kind: "blood",
        });
      });
    });

    frontier = next;
  }

  let line: Person[] = [center];

  for (let level = 1; level <= options.generations; level += 1) {
    const row: Person[] = [];
    line.forEach((parent) =>
      sortByAge(childrenOf(parent, ctx)).forEach((child) => row.push(child)),
    );
    if (row.length === 0) break;

    row.forEach((person, index) =>
      addPerson(person, index - (row.length - 1) / 2, level * ROW_H),
    );

    line.forEach((parent) => {
      childrenOf(parent, ctx).forEach((child) => {
        if (!row.some((item) => item.id === child.id)) return;
        edges.push({
          id: `e-${parent.id}-${child.id}`,
          source: parent.id,
          target: child.id,
          kind: "blood",
        });
      });
    });

    line = row;
  }

  const siblings = sortByAge(siblingsOf(center, ctx));
  const older = siblings.filter((item) => isOlder(item, center));
  const younger = siblings.filter((item) => !isOlder(item, center));
  const half = Math.max(1, Math.round(options.siblingLimit / 2));
  const olderShown = older.slice(-half);
  const youngerShown = younger.slice(0, half);

  olderShown.forEach((sibling, index) => addPerson(sibling, -(index + 1), 0));
  addPerson(center, 0, 0, { center: true });

  const spouses = sortByAge(spousesOf(center, ctx));
  spouses.forEach((spouse, index) => {
    addPerson(spouse, index + 1, 0);
    edges.push({
      id: `m-${index === 0 ? center.id : spouses[index - 1].id}-${spouse.id}`,
      source: index === 0 ? center.id : spouses[index - 1].id,
      target: spouse.id,
      kind: "marriage",
    });

    if (spouse.lineage === "OUTSIDE") {
      const outerParent =
        [spouse.fatherId, spouse.motherId]
          .map((id) => (id ? (ctx.byId.get(id) ?? null) : null))
          .find((item): item is Person => Boolean(item)) ?? null;
      const card = cards[cards.length - 1];
      if (outerParent) {
        card.note = `Con nhà ${outerParent.fullName}`;
        card.actionId = outerParent.id;
        card.actionLabel = "Sang nhánh ngoại";
      }
    }
  });

  youngerShown.forEach((sibling, index) =>
    addPerson(sibling, spouses.length + 1 + index, 0),
  );

  const centerParentIds = parentIdsOf(center);
  [...olderShown, ...youngerShown].forEach((sibling) => {
    const shared = parentIdsOf(sibling).find((id) =>
      centerParentIds.includes(id),
    );
    if (!shared || !hasCard(shared)) return;
    edges.push({
      id: `e-${shared}-${sibling.id}`,
      source: shared,
      target: sibling.id,
      kind: "blood",
    });
  });

  const hiddenOlder = older.length - olderShown.length;
  const hiddenYounger = younger.length - youngerShown.length;

  if (hiddenOlder > 0) {
    cards.push({
      id: "more-older",
      kind: "more",
      x: left(-(olderShown.length + 1)),
      y: 0,
      label: `+${hiddenOlder} người`,
    });
  }
  if (hiddenYounger > 0) {
    cards.push({
      id: "more-younger",
      kind: "more",
      x: left(spouses.length + 1 + youngerShown.length),
      y: 0,
      label: `+${hiddenYounger} người`,
    });
  }

  if (options.showCollateral) {
    const addCollateral = (uncle: Person, slot: number, outward: 1 | -1) => {
      addPerson(uncle, slot, -ROW_H, { dim: true });
      parentIdsOf(uncle).forEach((parentId) => {
        if (!hasCard(parentId)) return;
        edges.push({
          id: `e-${parentId}-${uncle.id}`,
          source: parentId,
          target: uncle.id,
          kind: "faint",
        });
      });
      sortByAge(childrenOf(uncle, ctx))
        .slice(0, 3)
        .forEach((cousin, index) => {
          addPerson(cousin, slot + outward * index, 0, { dim: true });
          edges.push({
            id: `e-${uncle.id}-${cousin.id}`,
            source: uncle.id,
            target: cousin.id,
            kind: "faint",
          });
        });
    };

    const father = center.fatherId
      ? (ctx.byId.get(center.fatherId) ?? null)
      : null;
    if (father) {
      sortByAge(siblingsOf(father, ctx))
        .slice(0, 4)
        .forEach((uncle, index) =>
          addCollateral(uncle, -(olderShown.length + 1.5 + index), -1),
        );
    }

    const mother = center.motherId
      ? (ctx.byId.get(center.motherId) ?? null)
      : null;
    if (mother) {
      sortByAge(siblingsOf(mother, ctx))
        .slice(0, 4)
        .forEach((uncle, index) =>
          addCollateral(
            uncle,
            spouses.length + youngerShown.length + 1.5 + index,
            1,
          ),
        );
    }
  }

  return { cards, edges, hiddenSiblings: hiddenOlder + hiddenYounger };
}
