import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  parentKindLabel,
  personRoleLabel,
  genderLabel,
} from "../../lib/format";
import type { Person } from "../../services/types";
import PaperPanel from "../ornaments/PaperPanel";
import PersonAvatar from "../people/PersonAvatar";
import DatePair from "./DatePair";

const TONES: Record<string, string> = {
  jade: "border-jade/50 bg-jade/15 text-jade",
  gold: "border-gold/60 bg-gold/15 text-wood",
  bronze: "border-bronze/50 bg-bronze/15 text-wood",
  seal: "border-seal/50 bg-seal/10 text-seal",
};

function Chip({
  tone,
  children,
}: {
  tone: keyof typeof TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border-2 px-2.5 py-1 text-sm font-semibold",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export default function PersonCard({ person }: { person: Person }) {
  const relationKind = parentKindLabel(person.parentKind);

  return (
    <PaperPanel className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="mx-auto shrink-0 rounded-2xl border-4 border-seal bg-card p-2.5 sm:mx-0">
          <PersonAvatar person={person} size="lg" />
          <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-seal">
            Ấn triện dòng họ
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl leading-tight sm:text-4xl">
            {person.fullName}
          </h1>
          {person.commonName && (
            <p className="mt-1 text-base">
              Thường gọi:{" "}
              <span className="font-semibold">{person.commonName}</span>
            </p>
          )}
          <p className="mt-1 text-base text-muted-foreground">
            {personRoleLabel(person)} · {genderLabel(person.gender)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Chip tone={person.isDeceased ? "gold" : "jade"}>
              {person.isDeceased ? "Đã khuất" : "Còn sống"}
            </Chip>
            {relationKind && <Chip tone="seal">{relationKind}</Chip>}
          </div>

          <div className="mt-4 space-y-2">
            <DatePair
              label="Ngày sinh"
              solar={person.birthDate}
              precision={person.birthDatePrecision}
            />
            {person.isDeceased && (
              <DatePair
                label="Ngày mất"
                solar={person.deathDate}
                precision={person.deathDatePrecision}
                lunar={person.deathLunarDate}
              />
            )}
          </div>

          <div className="mt-4 space-y-1.5 text-base">
            <p className="flex items-start gap-2">
              <MapPin
                className="mt-1 h-4 w-4 shrink-0 text-bronze"
                aria-hidden="true"
              />
              <span>{person.hometown ?? "Chưa ghi quê quán"}</span>
            </p>
            {person.occupation && (
              <p>
                <span className="text-muted-foreground">Nghề nghiệp: </span>
                {person.occupation}
              </p>
            )}
            {person.isDeceased && person.burialPlace && (
              <p>
                <span className="text-muted-foreground">Nơi an táng: </span>
                {person.burialPlace}
              </p>
            )}
          </div>
        </div>
      </div>
    </PaperPanel>
  );
}
