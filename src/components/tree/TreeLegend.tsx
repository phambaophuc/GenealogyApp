import { cn } from "../../lib/utils";

const GENERATION_DOTS: Record<number, string> = {
  1: "border-gen-1",
  2: "border-gen-2",
  3: "border-gen-3",
  4: "border-gen-4",
  5: "border-gen-5",
};

export default function TreeLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {[1, 2, 3, 4, 5].map((generation) => (
        <li key={generation} className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-3.5 w-3.5 rounded-sm border-2 bg-card",
              GENERATION_DOTS[generation],
            )}
            aria-hidden="true"
          />
          Đời {generation}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span
          className="h-3.5 w-3.5 rounded-sm border-2 border-gold bg-card"
          aria-hidden="true"
        />
        Đã khuất (có hương khói)
      </li>
      <li className="flex items-center gap-1.5">
        <span
          className="h-3.5 w-3.5 rounded-sm border-2 border-jade bg-card"
          aria-hidden="true"
        />
        Còn sống
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-1 w-6 rounded-full bg-seal" aria-hidden="true" />
        Vợ · chồng
      </li>
      <li className="flex items-center gap-1.5">
        <span
          className="h-1 w-6 rounded-full bg-wood-light"
          aria-hidden="true"
        />
        Cha mẹ → con
      </li>
    </ul>
  );
}
