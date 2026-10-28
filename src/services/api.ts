import rawClan from "../data/clan.json";
import rawMissions from "../data/missions.json";
import { apiGet } from "./apiClient";
import type {
  AppUser,
  ClanInfo,
  ClanStats,
  Lineage,
  Mission,
  ParentChildLink,
  Person,
  SpouseLink,
  UpcomingGio,
} from "./types";

const clanInfo = rawClan as unknown as ClanInfo;
const staticMissions = rawMissions.missions as unknown as Array<
  Omit<Mission, "tag">
>;

const DAY = 24 * 60 * 60 * 1000;

interface Dataset {
  people: Person[];
  byId: Map<string, Person>;
  clanPeople: Person[];
  users: AppUser[];
  parentLinks: ParentChildLink[];
  spouseLinks: SpouseLink[];
}

async function fetchDataset(): Promise<Dataset> {
  const [personRows, parentRows, spouseRows, userRows] = await Promise.all([
    apiGet("/persons"),
    apiGet("/parent_child"),
    apiGet("/spouses"),
    apiGet("/users"),
  ]);

  const parentLinks: ParentChildLink[] = parentRows.map((row) => ({
    id: row.id,
    parentId: row.parent_id,
    childId: row.child_id,
    kind: row.kind,
    parentRole: row.parent_role,
  }));

  const spouseLinks: SpouseLink[] = spouseRows.map((row) => ({
    id: row.id,
    personAId: row.person_a_id,
    personBId: row.person_b_id,
    marriageDate: row.marriage_date,
    endDate: row.end_date,
    endReason: row.end_reason,
  }));

  const parentsByChild = new Map<string, ParentChildLink[]>();
  parentLinks.forEach((link) => {
    parentsByChild.set(link.childId, [
      ...(parentsByChild.get(link.childId) ?? []),
      link,
    ]);
  });

  const spouseIdsByPerson = new Map<string, string[]>();
  spouseLinks.forEach((link) => {
    spouseIdsByPerson.set(link.personAId, [
      ...(spouseIdsByPerson.get(link.personAId) ?? []),
      link.personBId,
    ]);
    spouseIdsByPerson.set(link.personBId, [
      ...(spouseIdsByPerson.get(link.personBId) ?? []),
      link.personAId,
    ]);
  });

  const clanIds = new Set(
    personRows.filter((row) => row.is_blood_line).map((row) => row.id),
  );
  const marriedToClan = new Set<string>();
  spouseLinks.forEach((link) => {
    if (clanIds.has(link.personAId)) marriedToClan.add(link.personBId);
    if (clanIds.has(link.personBId)) marriedToClan.add(link.personAId);
  });

  const people: Person[] = personRows
    .filter((row) => !row.deleted_at)
    .map((row) => {
      const parents = parentsByChild.get(row.id) ?? [];
      const father = parents.find((link) => link.parentRole === "FATHER");
      const mother = parents.find((link) => link.parentRole === "MOTHER");
      const lineage: Lineage = row.is_blood_line
        ? "CLAN"
        : marriedToClan.has(row.id)
          ? "SPOUSE"
          : "OUTSIDE";

      return {
        id: row.id,
        fullName: row.full_name,
        commonName: row.common_name,
        gender: row.gender,
        avatarUrl: row.avatar_url,
        generation: row.generation ?? 1,
        birthOrder: row.birth_order,
        isBloodLine: row.is_blood_line,
        lineage,
        birthDate: row.birth_date,
        birthDatePrecision: row.birth_date_precision,
        deathDate: row.death_date,
        deathDatePrecision: row.death_date_precision,
        deathLunarDate: row.death_lunar_date,
        isDeceased: row.is_deceased,
        hometown: row.hometown,
        currentAddress: row.current_address,
        phone: row.phone,
        occupation: row.occupation,
        bio: row.bio,
        burialPlace: row.burial_place,
        notes: row.notes,
        fatherId: father?.parentId ?? null,
        motherId: mother?.parentId ?? null,
        parentKind: father?.kind ?? mother?.kind ?? null,
        spouseIds: spouseIdsByPerson.get(row.id) ?? [],
      };
    });

  const users: AppUser[] = userRows
    .filter((row) => row.is_active)
    .map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      personId: row.person_id,
      isActive: row.is_active,
      mustChangePassword: row.must_change_password,
    }));

  return {
    people,
    byId: new Map(people.map((person) => [person.id, person])),
    clanPeople: people.filter((person) => person.lineage !== "OUTSIDE"),
    users,
    parentLinks,
    spouseLinks,
  };
}

let datasetRequest: Promise<Dataset> | null = null;

function loadDataset(): Promise<Dataset> {
  if (!datasetRequest) datasetRequest = fetchDataset();
  return datasetRequest;
}

export const isAlive = (person: Person): boolean => !person.isDeceased;

export function missingFields(person: Person): string[] {
  const missing: string[] = [];
  if (!person.birthDate) missing.push("ngày sinh");
  if (!person.hometown) missing.push("quê quán");
  if (!person.bio) missing.push("tiểu sử");
  if (person.isDeceased && !person.deathLunarDate)
    missing.push("ngày giỗ âm lịch");
  if (
    person.generation > 1 &&
    person.isBloodLine &&
    !person.fatherId &&
    !person.motherId
  ) {
    missing.push("cha mẹ");
  }
  return missing;
}

export async function getClan(): Promise<ClanInfo> {
  return clanInfo;
}

export async function getPeople(): Promise<Person[]> {
  return (await loadDataset()).people;
}

export async function getClanPeople(): Promise<Person[]> {
  return (await loadDataset()).clanPeople;
}

export async function getPersonById(id: string): Promise<Person | null> {
  return (await loadDataset()).byId.get(id) ?? null;
}

export async function searchPeople(
  query: string,
  limit = 8,
): Promise<Person[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [rows, data] = await Promise.all([
    apiGet("/persons", { q: trimmed }),
    loadDataset(),
  ]);
  return rows
    .map((row) => data.byId.get(row.id))
    .filter((person): person is Person => Boolean(person))
    .slice(0, limit);
}

export async function getParents(id: string): Promise<{
  father: Person | null;
  mother: Person | null;
}> {
  const data = await loadDataset();
  const links = data.parentLinks.filter((link) => link.childId === id);
  const byRole = (role: "FATHER" | "MOTHER") => {
    const link = links.find((item) => item.parentRole === role);
    return link ? (data.byId.get(link.parentId) ?? null) : null;
  };
  return { father: byRole("FATHER"), mother: byRole("MOTHER") };
}

export async function getChildren(id: string): Promise<Person[]> {
  const data = await loadDataset();
  const childIds = new Set(
    data.parentLinks
      .filter((link) => link.parentId === id)
      .map((link) => link.childId),
  );
  return data.people.filter((person) => childIds.has(person.id));
}

export async function getSpouseLinks(id: string): Promise<SpouseLink[]> {
  const data = await loadDataset();
  return data.spouseLinks.filter(
    (link) => link.personAId === id || link.personBId === id,
  );
}

export async function getUsers(): Promise<AppUser[]> {
  return (await loadDataset()).users;
}

export async function getDemoUserPerson(): Promise<Person | null> {
  const data = await loadDataset();
  const account = data.users.find(
    (user) => user.role === "MEMBER" && user.personId,
  );
  return account?.personId ? (data.byId.get(account.personId) ?? null) : null;
}

export async function getClanStats(): Promise<ClanStats> {
  const data = await loadDataset();
  const people = data.clanPeople;
  const deceased = people.filter((person) => person.isDeceased).length;
  const generations = people.reduce(
    (max, person) => Math.max(max, person.generation),
    1,
  );
  const checks = people.reduce(
    (total, person) =>
      total +
      3 +
      (person.generation > 1 && person.isBloodLine ? 1 : 0) +
      (person.isDeceased ? 1 : 0),
    0,
  );
  const missingInfo = people.reduce(
    (total, person) => total + missingFields(person).length,
    0,
  );

  return {
    total: people.length,
    generations,
    deceased,
    living: people.length - deceased,
    outsideClan: data.people.length - people.length,
    missingInfo,
    completeness: Math.round(((checks - missingInfo) / checks) * 100),
  };
}

export function nextGioDate(deathLunarDate: string, from = new Date()): Date {
  const [day, month] = deathLunarDate.replace("N", "").split("/").map(Number);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  let next = new Date(start.getFullYear(), month - 1, day);
  if (next.getTime() < start.getTime()) {
    next = new Date(start.getFullYear() + 1, month - 1, day);
  }
  return next;
}

export async function getUpcomingGio(limit = 3): Promise<UpcomingGio[]> {
  const data = await loadDataset();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data.clanPeople
    .filter((person) => person.isDeceased && person.deathLunarDate)
    .map((person) => {
      const next = nextGioDate(person.deathLunarDate as string, today);
      return {
        person,
        daysLeft: Math.round((next.getTime() - today.getTime()) / DAY),
        nextGioDate: next.toISOString(),
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);
}

export async function getTodayMissions(): Promise<Mission[]> {
  const upcoming = await getUpcomingGio(1);
  const missions: Mission[] = [];

  if (upcoming.length > 0) {
    const { person, daysLeft } = upcoming[0];
    missions.push({
      id: `m-gio-${person.id}`,
      label: `Dâng hương ngày giỗ ${person.gender === "FEMALE" ? "cụ bà" : "cụ ông"} ${person.fullName}`,
      hint:
        daysLeft === 0
          ? `Hôm nay là ngày giỗ — mời con cháu ${clanInfo.village.split(",")[0]} về từ đường.`
          : `Còn ${daysLeft} ngày — ngày giỗ ${person.deathLunarDate} âm lịch ghi trong phả.`,
      tag: "gio",
    });
  }

  staticMissions.forEach((mission) => {
    missions.push({ ...mission, tag: "chung" });
  });

  return missions;
}

export async function getGenerationCounts(): Promise<
  Array<{ generation: number; count: number }>
> {
  const data = await loadDataset();
  const counts = new Map<number, number>();
  data.clanPeople.forEach((person) =>
    counts.set(person.generation, (counts.get(person.generation) ?? 0) + 1),
  );

  return Array.from(counts.entries())
    .map(([generation, count]) => ({ generation, count }))
    .sort((a, b) => a.generation - b.generation);
}
