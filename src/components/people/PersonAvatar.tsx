import { personInitial } from "../../lib/format";
import { cn } from "../../lib/utils";
import type { Person } from "../../services/types";
import { Image } from "../ui/image";

const SIZES = {
  sm: "h-9 w-9 text-base",
  md: "h-14 w-14 text-2xl",
  lg: "h-28 w-28 text-5xl",
} as const;

type AvatarSize = keyof typeof SIZES;

interface PersonAvatarProps {
  person: Person;
  size?: AvatarSize;
  className?: string;
}

export default function PersonAvatar({
  person,
  size = "md",
  className,
}: PersonAvatarProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-seal bg-seal/10 font-heading font-semibold text-seal",
        SIZES[size],
        className,
      )}
    >
      {person.avatarUrl ? (
        <Image
          src={person.avatarUrl}
          alt={`Ảnh ${person.fullName}`}
          className="h-full w-full"
          fittingType="fill"
        />
      ) : (
        personInitial(person.fullName)
      )}
    </span>
  );
}
