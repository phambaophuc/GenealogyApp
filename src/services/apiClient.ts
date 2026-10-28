import { mockTables } from "./mockDb";
import type { DbParentChild, DbPerson, DbSpouse, DbUser } from "./types";

const USE_MOCK = true;
const BASE_URL = "/api";
const LATENCY_MS = 120;

export type QueryParams = Record<string, string | number | undefined>;

interface TableRows {
  "/persons": DbPerson[];
  "/parent_child": DbParentChild[];
  "/spouses": DbSpouse[];
  "/users": DbUser[];
}

type TableName = keyof typeof mockTables;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function filterPersons(rows: DbPerson[], params: QueryParams): DbPerson[] {
  const needle = params.q === undefined ? "" : normalizeText(String(params.q));
  return rows.filter((row) => {
    if (params.id !== undefined && row.id !== String(params.id)) return false;
    if (
      params.generation !== undefined &&
      row.generation !== Number(params.generation)
    )
      return false;
    if (needle) {
      const haystack = `${normalizeText(row.full_name)} ${normalizeText(row.common_name ?? "")}`;
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

function filterMock(table: TableName, params: QueryParams) {
  if (table === "persons") return filterPersons(mockTables.persons, params);

  const rows = mockTables[table] as unknown as Array<Record<string, unknown>>;
  return rows.filter((row) =>
    Object.entries(params).every(
      ([key, value]) => value === undefined || row[key] === value,
    ),
  );
}

function toSearch(params: QueryParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiGet<P extends keyof TableRows>(
  path: P,
  params: QueryParams = {},
): Promise<TableRows[P]> {
  if (USE_MOCK) {
    await wait(LATENCY_MS);
    return filterMock(
      path.replace(/^\//, "") as TableName,
      params,
    ) as TableRows[P];
  }

  const response = await fetch(`${BASE_URL}${path}${toSearch(params)}`);
  if (!response.ok)
    throw new Error(`Không đọc được ${path} (${response.status})`);
  return (await response.json()) as TableRows[P];
}
