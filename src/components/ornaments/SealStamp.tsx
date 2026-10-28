import { cn } from "../../lib/utils";

export default function SealStamp({
  label = "Niêm phong",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "orn-seal-stamp -rotate-3 px-2.5 py-1 font-heading text-sm font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}
