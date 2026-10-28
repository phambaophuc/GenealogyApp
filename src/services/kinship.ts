import type { Person } from "./types";

export type RelationSide = "noi" | "ngoai" | "vo-chong" | "ho";

export interface Relation {
  label: string;
  reverse: string;
  side: RelationSide;
  distance: number;
  note?: string;
}

export interface KinContext {
  byId: Map<string, Person>;
  childrenByParent: Map<string, string[]>;
}

export function buildKinContext(people: Person[]): KinContext {
  const byId = new Map(people.map((person) => [person.id, person]));
  const childrenByParent = new Map<string, string[]>();

  people.forEach((person) => {
    [person.fatherId, person.motherId].forEach((parentId) => {
      if (!parentId) return;
      childrenByParent.set(parentId, [
        ...(childrenByParent.get(parentId) ?? []),
        person.id,
      ]);
    });
  });

  return { byId, childrenByParent };
}

const lookup = (id: string | null, ctx: KinContext): Person | null =>
  id ? (ctx.byId.get(id) ?? null) : null;

export const parentIdsOf = (person: Person): string[] =>
  [person.fatherId, person.motherId].filter((id): id is string => Boolean(id));

export const parentsOf = (person: Person, ctx: KinContext): Person[] =>
  parentIdsOf(person)
    .map((id) => lookup(id, ctx))
    .filter((parent): parent is Person => Boolean(parent));

export const childrenOf = (person: Person, ctx: KinContext): Person[] =>
  (ctx.childrenByParent.get(person.id) ?? [])
    .map((id) => ctx.byId.get(id))
    .filter((child): child is Person => Boolean(child));

export const spousesOf = (person: Person, ctx: KinContext): Person[] =>
  person.spouseIds
    .map((id) => ctx.byId.get(id))
    .filter((item): item is Person => Boolean(item));

export function siblingsOf(person: Person, ctx: KinContext): Person[] {
  const ids = new Set<string>();
  parentsOf(person, ctx).forEach((parent) => {
    (ctx.childrenByParent.get(parent.id) ?? []).forEach((id) => {
      if (id !== person.id) ids.add(id);
    });
  });
  return Array.from(ids)
    .map((id) => ctx.byId.get(id))
    .filter((item): item is Person => Boolean(item));
}

export function isOlder(a: Person, b: Person): boolean {
  if (a.birthDate && b.birthDate) return a.birthDate < b.birthDate;
  if (a.birthOrder !== null && b.birthOrder !== null)
    return a.birthOrder < b.birthOrder;
  return false;
}

export function sortByAge(list: Person[]): Person[] {
  return [...list].sort((a, b) => {
    if (a.birthDate && b.birthDate) return a.birthDate < b.birthDate ? -1 : 1;
    return (a.birthOrder ?? 99) - (b.birthOrder ?? 99);
  });
}

export interface AncestorInfo {
  depth: number;
  side: RelationSide;
}

export function ancestorMap(
  person: Person,
  ctx: KinContext,
  maxDepth = 6,
): Map<string, AncestorInfo> {
  const found = new Map<string, AncestorInfo>();
  let frontier: Array<{ id: string; side: RelationSide }> = [];

  if (person.fatherId) frontier.push({ id: person.fatherId, side: "noi" });
  if (person.motherId) frontier.push({ id: person.motherId, side: "ngoai" });

  for (let depth = 1; depth <= maxDepth && frontier.length > 0; depth += 1) {
    const next: Array<{ id: string; side: RelationSide }> = [];
    frontier.forEach((item) => {
      if (item.id === person.id || found.has(item.id)) return;
      const relative = ctx.byId.get(item.id);
      if (!relative) return;
      found.set(item.id, { depth, side: item.side });
      parentIdsOf(relative).forEach((id) => next.push({ id, side: item.side }));
    });
    frontier = next;
  }

  return found;
}

export function descendantMap(
  person: Person,
  ctx: KinContext,
  maxDepth = 6,
): Map<string, number> {
  const found = new Map<string, number>();
  let frontier: Person[] = [person];

  for (let depth = 1; depth <= maxDepth && frontier.length > 0; depth += 1) {
    const next: Person[] = [];
    frontier.forEach((current) => {
      childrenOf(current, ctx).forEach((child) => {
        if (child.id === person.id || found.has(child.id)) return;
        found.set(child.id, depth);
        next.push(child);
      });
    });
    frontier = next;
  }

  return found;
}

const sideWord = (side: RelationSide) => (side === "noi" ? "nội" : "ngoại");

function ancestorLabel(
  relative: Person,
  info: AncestorInfo,
): Pick<Relation, "label" | "reverse"> {
  const male = relative.gender === "MALE";

  if (info.depth === 1) {
    return {
      label: relative.gender === "FEMALE" ? "Mẹ" : "Cha",
      reverse: "Con",
    };
  }
  if (info.depth === 2) {
    return {
      label: `${male ? "Ông" : "Bà"} ${sideWord(info.side)}`,
      reverse: "Cháu",
    };
  }
  if (info.depth === 3) {
    return {
      label: `${male ? "Cụ ông" : "Cụ bà"} ${sideWord(info.side)}`,
      reverse: "Cháu",
    };
  }
  if (info.depth === 4) {
    return {
      label: `${male ? "Kỵ ông" : "Kỵ bà"} ${sideWord(info.side)}`,
      reverse: "Cháu",
    };
  }
  return {
    label: `Tổ đời ${info.depth} (${sideWord(info.side)})`,
    reverse: `Cháu đời ${info.depth}`,
  };
}

function descendantLabel(
  depth: number,
  center: Person,
): Pick<Relation, "label" | "reverse"> {
  const up = center.gender === "MALE" ? "Ông" : "Bà";

  if (depth === 1)
    return { label: "Con", reverse: center.gender === "MALE" ? "Cha" : "Mẹ" };
  if (depth === 2) return { label: "Cháu", reverse: up };
  if (depth === 3)
    return {
      label: "Chắt",
      reverse: `Cụ ${center.gender === "MALE" ? "ông" : "bà"}`,
    };
  if (depth === 4)
    return {
      label: "Chít",
      reverse: `Kỵ ${center.gender === "MALE" ? "ông" : "bà"}`,
    };
  return { label: `Cháu đời ${depth}`, reverse: `Tổ đời ${depth}` };
}

function uncleAunt(
  relative: Person,
  parent: Person,
  side: RelationSide,
): Relation {
  let label: string;

  if (parent.gender === "MALE") {
    if (relative.gender === "FEMALE") label = "Cô";
    else label = isOlder(relative, parent) ? "Bác" : "Chú";
  } else {
    label = relative.gender === "MALE" ? "Cậu" : "Dì";
  }

  return { label, reverse: "Cháu", side, distance: 3 };
}

const spouseWord = (person: Person) =>
  person.gender === "MALE" ? "Chồng" : "Vợ";

export function describeRelation(
  center: Person,
  other: Person,
  ctx: KinContext,
  depth = 0,
): Relation {
  if (center.id === other.id) {
    return {
      label: "Chính mình",
      reverse: "Chính mình",
      side: "ho",
      distance: 0,
    };
  }

  if (center.spouseIds.includes(other.id)) {
    return {
      label: spouseWord(other),
      reverse: spouseWord(center),
      side: "vo-chong",
      distance: 1,
    };
  }

  const ancestors = ancestorMap(center, ctx);
  const asAncestor = ancestors.get(other.id);
  if (asAncestor) {
    return {
      ...ancestorLabel(other, asAncestor),
      side: asAncestor.side,
      distance: asAncestor.depth,
    };
  }

  const descendants = descendantMap(center, ctx);
  const asDescendant = descendants.get(other.id);
  if (asDescendant) {
    return {
      ...descendantLabel(asDescendant, center),
      side: "ho",
      distance: asDescendant,
    };
  }

  const sharedParents = parentIdsOf(other).filter((id) =>
    parentIdsOf(center).includes(id),
  );
  if (sharedParents.length > 0) {
    const older = isOlder(other, center);
    const label =
      other.gender === "FEMALE" ? (older ? "Chị" : "Em") : older ? "Anh" : "Em";
    const reverse =
      center.gender === "FEMALE"
        ? older
          ? "Em"
          : "Chị"
        : older
          ? "Em"
          : "Anh";
    return {
      label,
      reverse,
      side: sharedParents.includes(center.fatherId ?? "") ? "noi" : "ngoai",
      distance: 2,
    };
  }

  const parents = parentsOf(center, ctx);
  for (const parent of parents) {
    const parentSibling = siblingsOf(parent, ctx).find(
      (item) => item.id === other.id,
    );
    if (parentSibling) {
      return uncleAunt(
        other,
        parent,
        parent.gender === "MALE" ? "noi" : "ngoai",
      );
    }
  }

  for (const sibling of siblingsOf(center, ctx)) {
    if (childrenOf(sibling, ctx).some((child) => child.id === other.id)) {
      const reverse = uncleAunt(
        center,
        sibling,
        sibling.gender === "MALE" ? "noi" : "ngoai",
      );
      return { label: "Cháu", reverse: reverse.label, side: "ho", distance: 3 };
    }
  }

  for (const parent of parents) {
    const side: RelationSide = parent.gender === "MALE" ? "noi" : "ngoai";
    for (const uncle of siblingsOf(parent, ctx)) {
      if (!childrenOf(uncle, ctx).some((child) => child.id === other.id))
        continue;
      const older = isOlder(other, center);
      const label =
        other.gender === "FEMALE"
          ? older
            ? "Chị họ"
            : "Em họ"
          : older
            ? "Anh họ"
            : "Em họ";
      const reverse =
        center.gender === "FEMALE"
          ? older
            ? "Em họ"
            : "Chị họ"
          : older
            ? "Em họ"
            : "Anh họ";
      return { label, reverse, side, distance: 4 };
    }
  }

  for (const spouse of spousesOf(center, ctx)) {
    if (other.id === spouse.fatherId || other.id === spouse.motherId) {
      const word = spouseWord(spouse);
      return {
        label: `${other.gender === "MALE" ? "Bố" : "Mẹ"} ${word.toLowerCase()}`,
        reverse: center.gender === "MALE" ? "Con rể" : "Con dâu",
        side: "vo-chong",
        distance: 2,
      };
    }
    const spouseSibling = siblingsOf(spouse, ctx).find(
      (item) => item.id === other.id,
    );
    if (spouseSibling) {
      const older = isOlder(other, spouse);
      const word = spouseWord(spouse).toLowerCase();
      const label =
        other.gender === "FEMALE"
          ? older
            ? "Chị"
            : "Em"
          : older
            ? "Anh"
            : "Em";
      const reverse =
        center.gender === "FEMALE"
          ? older
            ? "Em dâu"
            : "Chị dâu"
          : older
            ? "Em rể"
            : "Anh rể";
      return {
        label: `${label} ${word}`,
        reverse,
        side: "vo-chong",
        distance: 2,
      };
    }
  }

  for (const child of childrenOf(center, ctx)) {
    if (child.spouseIds.includes(other.id)) {
      return {
        label: other.gender === "FEMALE" ? "Con dâu" : "Con rể",
        reverse: center.gender === "MALE" ? "Bố chồng" : "Mẹ chồng",
        side: "vo-chong",
        distance: 2,
      };
    }
  }

  for (const sibling of siblingsOf(center, ctx)) {
    if (sibling.spouseIds.includes(other.id)) {
      const older = isOlder(sibling, center);
      return {
        label:
          other.gender === "FEMALE"
            ? older
              ? "Chị dâu"
              : "Em dâu"
            : older
              ? "Anh rể"
              : "Em rể",
        reverse: center.gender === "FEMALE" ? "Em chồng" : "Em vợ",
        side: "vo-chong",
        distance: 3,
      };
    }
  }

  if (depth === 0) {
    for (const spouse of spousesOf(other, ctx)) {
      const base = describeRelation(center, spouse, ctx, depth + 1);
      if (base.distance > 6) continue;
      return {
        label: `${spouseWord(other)} của ${base.label.toLowerCase()}`,
        reverse: base.reverse,
        side: "vo-chong",
        distance: base.distance + 1,
        note: `Quan hệ đi qua hôn nhân với ${spouse.fullName}.`,
      };
    }
  }

  const otherAncestors = ancestorMap(other, ctx);
  const shared = Array.from(ancestors.entries()).filter(([id]) =>
    otherAncestors.has(id),
  );
  if (shared.length > 0) {
    const closest = shared.sort(
      (a, b) =>
        a[1].depth +
        (otherAncestors.get(a[0])?.depth ?? 0) -
        (b[1].depth + (otherAncestors.get(b[0])?.depth ?? 0)),
    )[0];
    const total =
      closest[1].depth + (otherAncestors.get(closest[0])?.depth ?? 0);
    return {
      label: "Họ hàng",
      reverse: "Họ hàng",
      side: "ho",
      distance: total,
      note: `Cùng một cụ tổ, cách nhau ${total} đời.`,
    };
  }

  return {
    label: "Chưa rõ quan hệ",
    reverse: "Chưa rõ quan hệ",
    side: "ho",
    distance: 99,
    note: "Hai người chưa nối được với nhau trong phả hiện có.",
  };
}

export function relationshipPath(
  a: Person,
  b: Person,
  ctx: KinContext,
): Person[] {
  const paths = new Map<string, Person[]>();

  const walk = (person: Person, trail: Person[]) => {
    if (paths.has(person.id)) return;
    paths.set(person.id, trail);
    parentsOf(person, ctx).forEach((parent) =>
      walk(parent, [...trail, parent]),
    );
  };
  walk(a, [a]);

  const find = (person: Person, trail: Person[]): Person[] | null => {
    if (paths.has(person.id)) {
      const up = paths.get(person.id) ?? [];
      return [...up, ...[...trail].reverse().slice(1)];
    }
    for (const parent of parentsOf(person, ctx)) {
      const found = find(parent, [...trail, parent]);
      if (found) return found;
    }
    return null;
  };

  return find(b, [b]) ?? [];
}

export function ancestryChain(
  person: Person,
  ctx: KinContext,
  maxDepth = 6,
): Person[] {
  const chain: Person[] = [person];
  let current = person;

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const parent = parentsOf(current, ctx)[0];
    if (!parent || chain.some((item) => item.id === parent.id)) break;
    chain.unshift(parent);
    current = parent;
  }

  return chain;
}
