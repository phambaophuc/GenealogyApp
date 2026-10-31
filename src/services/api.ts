import { CLAN_PROFILE } from "../config/clan";
import {
  apiGet,
  apiPost,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./apiClient";
import {
  buildPersonLinks,
  computeGenerations,
  emptyPersonLinks,
  mapParentChildLinks,
  mapSpouseLinks,
  toPerson,
  type PersonLinks,
} from "./mappers";
import type {
  ClanInfo,
  ClanStats,
  LoginResponseDto,
  Mission,
  Paginated,
  ParentChildLink,
  Person,
  PersonDto,
  PersonRelationsDto,
  SpouseLink,
  TreeGraphDto,
  UpcomingGio,
  UserProfileDto,
} from "./types";

const DAY = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 100;

interface Dataset {
  people: Person[];
  byId: Map<string, Person>;
  parentLinks: ParentChildLink[];
  spouseLinks: SpouseLink[];
  links: Map<string, PersonLinks>;
  generations: Map<string, number>;
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

async function fetchAllPersons(): Promise<PersonDto[]> {
  const people: PersonDto[] = [];
  let page = 1;

  for (;;) {
    const result = await apiGet<Paginated<PersonDto>>("/persons", {
      page,
      limit: PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "asc",
    });

    people.push(...result.items);

    if (!result.meta.hasNextPage || result.items.length === 0) break;
    page += 1;
  }

  return people;
}

async function fetchDataset(): Promise<Dataset> {
  const [personDtos, graph] = await Promise.all([
    fetchAllPersons(),
    apiGet<TreeGraphDto>("/tree/graph"),
  ]);

  const active = personDtos.filter((person) => !person.deletedAt);
  const ids = active.map((person) => person.id);
  const links = buildPersonLinks(ids, graph);
  const generations = computeGenerations(ids, graph);

  const people = active.map((dto) =>
    toPerson(
      dto,
      links.get(dto.id) ?? emptyPersonLinks(),
      generations.get(dto.id) ?? 1,
    ),
  );

  return {
    people,
    byId: new Map(people.map((person) => [person.id, person])),
    parentLinks: mapParentChildLinks(graph),
    spouseLinks: mapSpouseLinks(graph),
    links,
    generations,
  };
}

let datasetRequest: Promise<Dataset> | null = null;

function loadDataset(): Promise<Dataset> {
  if (!datasetRequest) {
    datasetRequest = fetchDataset().catch((error: unknown) => {
      datasetRequest = null;
      throw error;
    });
  }

  return datasetRequest;
}

export function invalidateDataset(): void {
  datasetRequest = null;
}

/* -------------------------------------------------------------------------- */
/* Domain helpers                                                             */
/* -------------------------------------------------------------------------- */

export const isAlive = (person: Person): boolean => !person.isDeceased;

export function missingFields(person: Person): string[] {
  const missing: string[] = [];
  if (!person.birthDate) missing.push("ngày sinh");
  if (!person.hometown) missing.push("quê quán");
  if (!person.bio) missing.push("tiểu sử");
  if (person.isDeceased && !person.deathLunarDate)
    missing.push("ngày giỗ âm lịch");
  if (person.generation > 1 && !person.fatherId && !person.motherId) {
    missing.push("cha mẹ");
  }
  return missing;
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

/* -------------------------------------------------------------------------- */
/* Clan                                                                       */
/* -------------------------------------------------------------------------- */

export async function getClan(): Promise<ClanInfo> {
  return CLAN_PROFILE;
}

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

export async function getPeople(): Promise<Person[]> {
  return (await loadDataset()).people;
}

export async function getClanPeople(): Promise<Person[]> {
  return (await loadDataset()).people;
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

  const [result, data] = await Promise.all([
    apiGet<Paginated<PersonDto>>("/persons", {
      search: trimmed,
      page: 1,
      limit,
      sortBy: "fullName",
      sortOrder: "asc",
    }),
    loadDataset(),
  ]);

  return result.items
    .map((row) => {
      const known = data.byId.get(row.id);
      if (known) return known;

      return toPerson(
        row,
        data.links.get(row.id) ?? emptyPersonLinks(),
        data.generations.get(row.id) ?? 1,
      );
    })
    .slice(0, limit);
}

export async function getPersonRelations(
  id: string,
): Promise<PersonRelationsDto> {
  return apiGet<PersonRelationsDto>(`/persons/${id}/relations`);
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

/* -------------------------------------------------------------------------- */
/* Stats, giỗ and missions                                                    */
/* -------------------------------------------------------------------------- */

export async function getClanStats(): Promise<ClanStats> {
  const data = await loadDataset();
  const people = data.people;
  const deceased = people.filter((person) => person.isDeceased).length;
  const generations =
    people.length === 0
      ? 0
      : people.reduce((max, person) => Math.max(max, person.generation), 1);

  const checks = people.reduce(
    (total, person) =>
      total + 3 + (person.generation > 1 ? 1 : 0) + (person.isDeceased ? 1 : 0),
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
    missingInfo,
    completeness:
      checks === 0 ? 100 : Math.round(((checks - missingInfo) / checks) * 100),
  };
}

export async function getUpcomingGio(limit = 3): Promise<UpcomingGio[]> {
  const data = await loadDataset();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data.people
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
  const [upcoming, stats] = await Promise.all([
    getUpcomingGio(1),
    getClanStats(),
  ]);
  const missions: Mission[] = [];

  if (upcoming.length > 0) {
    const { person, daysLeft } = upcoming[0];
    missions.push({
      id: `m-gio-${person.id}`,
      label: `Dâng hương ngày giỗ ${person.gender === "FEMALE" ? "cụ bà" : "cụ ông"} ${person.fullName}`,
      hint:
        daysLeft === 0
          ? `Hôm nay là ngày giỗ — mời con cháu ${CLAN_PROFILE.village.split(",")[0]} về từ đường.`
          : `Còn ${daysLeft} ngày — ngày giỗ ${person.deathLunarDate} âm lịch ghi trong phả.`,
      tag: "gio",
    });
  }

  if (stats.missingInfo > 0) {
    missions.push({
      id: "m-bo-sung-thong-tin",
      label: `Bổ sung ${stats.missingInfo} lượt thông tin còn thiếu`,
      hint: "Mở hồ sơ có dấu chấm than và ghi thêm ngày sinh, quê quán, tiểu sử…",
      tag: "chung",
    });
  }

  if (stats.total > 0) {
    missions.push({
      id: "m-xem-cay-pha-he",
      label: "Xem lại cây phả hệ",
      hint: `Dòng họ hiện có ${stats.total} người trải qua ${stats.generations} đời.`,
      tag: "chung",
    });
  }

  return missions;
}

export async function getGenerationCounts(): Promise<
  Array<{ generation: number; count: number }>
> {
  const data = await loadDataset();
  const counts = new Map<number, number>();

  data.people.forEach((person) =>
    counts.set(person.generation, (counts.get(person.generation) ?? 0) + 1),
  );

  return Array.from(counts.entries())
    .map(([generation, count]) => ({ generation, count }))
    .sort((a, b) => a.generation - b.generation);
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export async function login(
  email: string,
  password: string,
): Promise<LoginResponseDto> {
  const result = await apiPost<LoginResponseDto>(
    "/auth/login",
    { email, password },
    { auth: false },
  );
  invalidateDataset();
  setAccessToken(result.accessToken);
  return result;
}

export async function getCurrentUser(): Promise<UserProfileDto> {
  return apiGet<UserProfileDto>("/auth/me");
}

export function logout(): void {
  clearAccessToken();
  invalidateDataset();
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export {
  ApiError,
  clearAccessToken,
  getAccessToken,
  isApiError,
  setAccessToken,
  toErrorMessage,
} from "./apiClient";
