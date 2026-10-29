import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import {
  buildKinContext,
  ancestorMap,
  sortByAge,
  siblingsOf,
  descendantMap,
  childrenOf,
  parentsOf,
  describeRelation,
} from "../../services/kinship";
import type { Person } from "../../services/types";

interface FocusListViewProps {
  center: Person;
  people: Person[];
  onCenter: (id: string) => void;
}

export default function FocusListView({
  center,
  people,
  onCenter,
}: FocusListViewProps) {
  const ctx = useMemo(() => buildKinContext(people), [people]);

  const sections = useMemo(() => {
    const ancestors = Array.from(ancestorMap(center, ctx).entries())
      .sort((a, b) => a[1].depth - b[1].depth)
      .map(([id]) => ctx.byId.get(id))
      .filter((person): person is Person => Boolean(person));

    const siblings = sortByAge(siblingsOf(center, ctx));

    const descendants = Array.from(descendantMap(center, ctx).entries())
      .sort((a, b) => a[1] - b[1])
      .map(([id]) => ctx.byId.get(id))
      .filter((person): person is Person => Boolean(person));

    return [
      { key: "to-tien", title: "Tổ tiên", items: ancestors },
      { key: "anh-chi-em", title: "Anh chị em", items: siblings },
      { key: "con-chau", title: "Con cháu", items: descendants },
    ];
  }, [center, ctx]);

  const directChildren = new Set(
    childrenOf(center, ctx).map((child) => child.id),
  );
  const directParents = new Set(
    parentsOf(center, ctx).map((parent) => parent.id),
  );

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <Collapsible key={section.key} defaultOpen>
          <CollapsibleTrigger className="orn-plaque flex w-full items-center justify-between gap-2 bg-card px-3 py-2.5 text-left text-sm font-semibold">
            {section.title}
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {section.items.length} người
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {section.items.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Phả chưa ghi.
              </p>
            ) : (
              <ul className="mt-1 space-y-1">
                {section.items.map((person) => {
                  const relation = describeRelation(center, person, ctx);
                  const direct =
                    directChildren.has(person.id) ||
                    directParents.has(person.id);

                  return (
                    <li key={person.id}>
                      <button
                        type="button"
                        onClick={() => onCenter(person.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-wood/20 bg-card/70 px-3 py-2 text-left hover:bg-secondary"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {person.fullName}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            Đời {person.generation} ·{" "}
                            {person.isDeceased ? "đã khuất" : "còn sống"}
                          </span>
                        </span>
                        <span
                          className={
                            direct
                              ? "shrink-0 rounded-md bg-seal px-1.5 py-0.5 text-[11px] font-semibold text-paper"
                              : "shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold"
                          }
                        >
                          {relation.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
