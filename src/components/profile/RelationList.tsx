import { Link, ChevronRight } from "lucide-react";
import { personRoleLabel } from "../../lib/format";
import type { Person } from "../../services/types";
import PersonAvatar from "../people/PersonAvatar";

export default function RelationList({
  title,
  people,
  emptyText,
}: {
  title: string;
  people: Person[];
  emptyText: string;
}) {
  return (
    <div>
      <h3 className="font-heading text-base font-semibold text-muted-foreground">
        {title}
      </h3>
      {people.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                to={`/ho-so/${person.id}`}
                className="orn-plaque flex min-h-[52px] items-center gap-2.5 bg-card p-2"
              >
                <PersonAvatar person={person} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {person.fullName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {personRoleLabel(person)}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
