import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { personRoleLabel } from "../../lib/format";
import { cn } from "../../lib/utils";
import { searchPeople } from "../../services/api";
import type { Person } from "../../services/types";

interface PersonSearchProps {
  placeholder?: string;
  onSelect: (person: Person) => void;
  hint?: (person: Person) => string | null;
  className?: string;
}

export default function PersonSearch({
  placeholder = "Tìm người trong họ… (gõ không dấu cũng được)",
  onSelect,
  hint,
  className,
}: PersonSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let alive = true;
    const timer = window.setTimeout(() => {
      searchPeople(query, 6)
        .then((list) => {
          if (!alive) return;
          setResults(list);
          setLoading(false);
        })
        .catch(() => {
          if (!alive) return;
          setResults([]);
          setLoading(false);
        });
    }, 220);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const choose = (person: Person) => {
    onSelect(person);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-xl border-2 border-wood/35 bg-card px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-bronze" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            setOpen(true);
            if (!value.trim()) {
              setResults([]);
              setLoading(false);
            } else {
              setLoading(true);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) choose(results[0]);
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          aria-label="Tìm người trong họ"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && (
          <Loader2
            className="h-4 w-4 animate-spin text-bronze"
            aria-hidden="true"
          />
        )}
        {!loading && query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setLoading(false);
            }}
            aria-label="Xoá nội dung tìm kiếm"
            className="text-wood/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border-2 border-wood/40 bg-card shadow-lg">
          {results.length === 0 && !loading ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              Không thấy ai khớp với “{query}”.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {results.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => choose(person)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-secondary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {person.fullName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {personRoleLabel(person)}
                      </span>
                    </span>
                    {hint?.(person) && (
                      <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold">
                        {hint(person)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
