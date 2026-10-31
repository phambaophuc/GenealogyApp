import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import PaperPanel from "../components/ornaments/PaperPanel";
import PersonSearch from "../components/search/PersonSearch";
import SearchResultItem from "../components/search/SearchResultItem";
import { getPeople, toErrorMessage } from "../services/api";
import type { Person } from "../services/types";

type StatusFilter = "all" | "living" | "deceased";
type SideFilter = "all" | "CLAN" | "SPOUSE" | "OUTSIDE";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function buildSideMap(
  people: Person[],
): Map<string, Exclude<SideFilter, "all">> {
  const byId = new Map(people.map((person) => [person.id, person]));
  const childrenByParent = new Map<string, string[]>();

  for (const person of people) {
    for (const parentId of [person.fatherId, person.motherId]) {
      if (!parentId || !byId.has(parentId)) continue;
      const children = childrenByParent.get(parentId) ?? [];
      children.push(person.id);
      childrenByParent.set(parentId, children);
    }
  }

  const blood = new Set<string>();
  const queue = people
    .filter((person) => person.generation === 1)
    .map((person) => person.id);

  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index];
    if (blood.has(id)) continue;

    blood.add(id);
    for (const childId of childrenByParent.get(id) ?? []) {
      queue.push(childId);
    }
  }

  const marriedIn = new Set<string>();
  for (const person of people) {
    if (person.spouseIds.some((id) => byId.has(id))) {
      marriedIn.add(person.id);
    }
  }

  return new Map(
    people.map((person) => {
      if (blood.has(person.id)) return [person.id, "CLAN"] as const;
      if (marriedIn.has(person.id)) return [person.id, "SPOUSE"] as const;
      return [person.id, "OUTSIDE"] as const;
    }),
  );
}

export default function SearchPage() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [generation, setGeneration] = useState<number | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [side, setSide] = useState<SideFilter>("all");

  useEffect(() => {
    let alive = true;

    getPeople().then(
      (list) => {
        if (alive) setPeople(list);
      },
      (loadError: unknown) => {
        if (!alive) return;
        setError(
          toErrorMessage(loadError, "Không tải được danh sách người trong họ."),
        );
      },
    );

    return () => {
      alive = false;
    };
  }, []);

  const generations = useMemo(
    () =>
      Array.from(
        new Set((people ?? []).map((person) => person.generation)),
      ).sort((a, b) => a - b),
    [people],
  );

  const sideById = useMemo(() => buildSideMap(people ?? []), [people]);

  const results = useMemo(() => {
    if (!people) return [];

    const needle = normalize(query);

    return people
      .filter((person) => {
        if (needle) {
          const haystack = normalize(
            `${person.fullName} ${person.commonName ?? ""}`,
          );
          if (!haystack.includes(needle)) return false;
        }

        if (generation !== "all" && person.generation !== generation) {
          return false;
        }

        if (status === "living" && person.isDeceased) return false;
        if (status === "deceased" && !person.isDeceased) return false;

        if (side !== "all" && sideById.get(person.id) !== side) return false;

        return true;
      })
      .sort(
        (a, b) =>
          a.generation - b.generation ||
          (a.birthOrder ?? 99) - (b.birthOrder ?? 99) ||
          a.fullName.localeCompare(b.fullName, "vi"),
      );
  }, [people, query, generation, status, side, sideById]);

  const resetFilters = () => {
    setQuery("");
    setGeneration("all");
    setStatus("all");
    setSide("all");
  };

  return (
    <div className="space-y-4">
      <PaperPanel className="p-5 sm:p-6">
        <Link
          to="/ban-do"
          className="orn-plaque mb-3 inline-flex min-h-[44px] items-center gap-2 bg-card px-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Về bản đồ dòng họ
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-seal">
          Cổng làng
        </p>
        <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
          Tìm người trong họ
        </h1>
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">
          Gõ tên có dấu hay không dấu đều được. Lọc thêm theo đời, theo còn sống
          – đã khuất hoặc theo người trong họ, dâu/rể và người ngoài phả.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="flex items-center gap-2 rounded-xl border-2 border-wood/35 bg-card px-3 py-2">
            <Search
              className="h-4 w-4 shrink-0 text-bronze"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: dinh son, cụ bảng, thị mai…"
              aria-label="Tìm theo tên"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <select
            value={String(generation)}
            onChange={(event) =>
              setGeneration(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value),
              )
            }
            aria-label="Lọc theo đời"
            className="rounded-xl border-2 border-wood/35 bg-card px-2.5 py-2 text-sm"
          >
            <option value="all">Mọi đời</option>
            {generations.map((item) => (
              <option key={item} value={item}>
                Đời {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            aria-label="Lọc theo còn sống hay đã khuất"
            className="rounded-xl border-2 border-wood/35 bg-card px-2.5 py-2 text-sm"
          >
            <option value="all">Còn sống & đã khuất</option>
            <option value="living">Còn sống</option>
            <option value="deceased">Đã khuất</option>
          </select>

          <select
            value={side}
            onChange={(event) => setSide(event.target.value as SideFilter)}
            aria-label="Lọc theo bên họ"
            className="rounded-xl border-2 border-wood/35 bg-card px-2.5 py-2 text-sm"
          >
            <option value="all">Mọi bên</option>
            <option value="CLAN">Trong họ</option>
            <option value="SPOUSE">Dâu / rể</option>
            <option value="OUTSIDE">Ngoài phả</option>
          </select>
        </div>
      </PaperPanel>

      <PaperPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">
            {error
              ? "Không tải được danh sách"
              : people
                ? `${results.length} người khớp`
                : "Đang tìm…"}
          </h2>
          <PersonSearch
            placeholder="Hoặc chọn nhanh một người…"
            onSelect={(person) => setQuery(person.fullName)}
            className="w-full sm:w-72"
          />
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border-2 border-dashed border-seal/40 bg-seal/5 px-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="orn-plaque mt-3 inline-flex min-h-[40px] items-center bg-card px-3 text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : people && results.length === 0 ? (
          <div className="mt-3 rounded-xl border-2 border-dashed border-wood/25 px-3 py-6 text-center text-sm text-muted-foreground">
            <p>Không có ai khớp với điều kiện đang chọn.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="orn-plaque mt-3 inline-flex min-h-[40px] items-center bg-card px-3 text-sm font-semibold"
            >
              Xoá bộ lọc
            </button>
          </div>
        ) : null}

        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {results.map((person) => (
            <SearchResultItem key={person.id} person={person} />
          ))}
        </ul>
      </PaperPanel>
    </div>
  );
}
