import type {
  ParentChildLink,
  ParentKind,
  Person,
  PersonDto,
  SpouseLink,
  TreeGraphDto,
} from "./types";

export interface PersonLinks {
  fatherId: string | null;
  motherId: string | null;
  parentKind: ParentKind | null;
  spouseIds: string[];
}

export function emptyPersonLinks(): PersonLinks {
  return {
    fatherId: null,
    motherId: null,
    parentKind: null,
    spouseIds: [],
  };
}

/** Joins the flat graph relationships onto each person id. */
export function buildPersonLinks(
  personIds: Iterable<string>,
  graph: TreeGraphDto,
): Map<string, PersonLinks> {
  const links = new Map<string, PersonLinks>();

  for (const id of personIds) {
    links.set(id, emptyPersonLinks());
  }

  for (const link of graph.parentChild) {
    const entry = links.get(link.childId);
    if (!entry) continue;

    if (link.parentRole === "FATHER") {
      if (!entry.fatherId) {
        entry.fatherId = link.parentId;
        entry.parentKind = entry.parentKind ?? link.kind;
      }
    } else if (!entry.motherId) {
      entry.motherId = link.parentId;
      entry.parentKind = entry.parentKind ?? link.kind;
    }
  }

  for (const link of graph.spouses) {
    const personA = links.get(link.personAId);
    if (personA && !personA.spouseIds.includes(link.personBId)) {
      personA.spouseIds.push(link.personBId);
    }

    const personB = links.get(link.personBId);
    if (personB && !personB.spouseIds.includes(link.personAId)) {
      personB.spouseIds.push(link.personAId);
    }
  }

  return links;
}

export function computeGenerations(
  personIds: string[],
  graph: TreeGraphDto,
): Map<string, number> {
  const parentsByChild = new Map<string, string[]>();
  for (const link of graph.parentChild) {
    const parents = parentsByChild.get(link.childId) ?? [];
    parents.push(link.parentId);
    parentsByChild.set(link.childId, parents);
  }

  const spouseById = new Map<string, string[]>();
  for (const link of graph.spouses) {
    spouseById.set(link.personAId, [
      ...(spouseById.get(link.personAId) ?? []),
      link.personBId,
    ]);
    spouseById.set(link.personBId, [
      ...(spouseById.get(link.personBId) ?? []),
      link.personAId,
    ]);
  }

  const generation = new Map<string, number>();
  const maxGeneration = Math.max(1, personIds.length);

  personIds.forEach((id) => {
    if (!parentsByChild.get(id)?.length) {
      generation.set(id, 1);
    }
  });

  const relax = () => {
    let changed = false;

    for (const id of personIds) {
      let candidate = generation.get(id) ?? 0;

      for (const parentId of parentsByChild.get(id) ?? []) {
        const parentGeneration = generation.get(parentId);
        if (parentGeneration !== undefined) {
          candidate = Math.max(candidate, parentGeneration + 1);
        }
      }

      for (const spouseId of spouseById.get(id) ?? []) {
        const spouseGeneration = generation.get(spouseId);
        if (spouseGeneration !== undefined) {
          candidate = Math.max(candidate, spouseGeneration);
        }
      }

      candidate = Math.min(candidate, maxGeneration);

      if (candidate > 0 && candidate !== generation.get(id)) {
        generation.set(id, candidate);
        changed = true;
      }
    }

    return changed;
  };

  for (let round = 0; round <= personIds.length; round += 1) {
    if (!relax()) break;
  }

  personIds.forEach((id) => {
    if (!generation.has(id)) generation.set(id, 1);
  });

  relax();

  return generation;
}

export function toPerson(
  dto: PersonDto,
  links: PersonLinks,
  generation: number,
): Person {
  return {
    id: dto.id,
    fullName: dto.fullName,
    commonName: dto.commonName,
    gender: dto.gender,
    avatarUrl: dto.avatarUrl,
    generation,
    birthOrder: dto.birthOrder,
    birthDate: dto.birthDate,
    birthDatePrecision: dto.birthDatePrecision,
    deathDate: dto.deathDate,
    deathDatePrecision: dto.deathDatePrecision,
    deathLunarDate: dto.deathLunarDate,
    isDeceased: dto.isDeceased,
    hometown: dto.hometown,
    currentAddress: dto.currentAddress,
    phone: dto.phone,
    occupation: dto.occupation,
    bio: dto.bio,
    burialPlace: dto.burialPlace,
    notes: dto.notes,
    fatherId: links.fatherId,
    motherId: links.motherId,
    parentKind: links.parentKind,
    spouseIds: links.spouseIds,
  };
}

export function mapParentChildLinks(graph: TreeGraphDto): ParentChildLink[] {
  return graph.parentChild.map((link) => ({
    id: link.id,
    parentId: link.parentId,
    childId: link.childId,
    kind: link.kind,
    parentRole: link.parentRole,
  }));
}

export function mapSpouseLinks(graph: TreeGraphDto): SpouseLink[] {
  return graph.spouses.map((link) => ({
    id: link.id,
    personAId: link.personAId,
    personBId: link.personBId,
    marriageDate: link.marriageDate,
    endDate: null,
    endReason: link.endReason,
  }));
}
