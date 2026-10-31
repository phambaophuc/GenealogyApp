import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import PaperPanel from "../components/ornaments/PaperPanel";
import MissingInfoNotice from "../components/profile/MissingInfoNotice";
import PersonCard from "../components/profile/PersonCard";
import RelationList from "../components/profile/RelationList";
import SensitiveBlock from "../components/profile/SensitiveBlock";
import { personRoleLabel } from "../lib/format";
import { getPeople, toErrorMessage } from "../services/api";
import type { Person } from "../services/types";

export default function PersonProfile() {
  const { personId } = useParams();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );

  useEffect(() => {
    let alive = true;
    async function loadPeople() {
      try {
        const list = await getPeople();
        if (!alive) return;
        setPeople(list);
        setStatus(
          list.some((person) => person.id === personId) ? "ready" : "missing",
        );
      } catch (loadError) {
        if (!alive) return;
        setError(toErrorMessage(loadError, "Không mở được hồ sơ."));
        setStatus("error");
      }
    }
    loadPeople();
    return () => {
      alive = false;
    };
  }, [personId]);

  useEffect(() => {
    if (status !== "missing") return;
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [status]);

  if (status === "error") {
    return (
      <PaperPanel className="p-8 text-center">
        <p className="font-heading text-xl">Không mở được hồ sơ</p>
        <p className="mt-2 text-base text-muted-foreground">{error}</p>
        <Link
          to="/cay-pha-he"
          className="orn-plaque mt-4 inline-flex min-h-[44px] items-center gap-2 bg-card px-4 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Về cây gia phả
        </Link>
      </PaperPanel>
    );
  }

  if (status === "loading" || !people) {
    return (
      <PaperPanel className="p-8 text-center">
        <p className="font-heading text-xl">Đang mở hồ sơ…</p>
      </PaperPanel>
    );
  }

  const person = people.find((item) => item.id === personId) ?? null;

  if (status === "missing" || !person) {
    return (
      <PaperPanel className="p-8 text-center">
        <p className="font-heading text-2xl">Không tìm thấy hồ sơ này</p>
        <p className="mt-2 text-base text-muted-foreground">
          Người này không có trong sổ phả hệ, hoặc đường dẫn không đúng.
        </p>
        <Link
          to="/cay-pha-he"
          className="orn-plaque mt-4 inline-flex min-h-[44px] items-center gap-2 bg-card px-4 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Về cây gia phả
        </Link>
      </PaperPanel>
    );
  }

  const byId = new Map(people.map((item) => [item.id, item]));
  const father = person.fatherId ? (byId.get(person.fatherId) ?? null) : null;
  const mother = person.motherId ? (byId.get(person.motherId) ?? null) : null;
  const spouses = person.spouseIds
    .map((id) => byId.get(id))
    .filter((item): item is Person => Boolean(item));
  const children = people
    .filter(
      (child) => child.fatherId === person.id || child.motherId === person.id,
    )
    .sort(
      (a, b) =>
        (a.birthOrder ?? 99) - (b.birthOrder ?? 99) ||
        a.fullName.localeCompare(b.fullName),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/cay-pha-he"
          className="orn-plaque flex min-h-[44px] items-center gap-2 bg-card px-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Về cây gia phả
        </Link>
        <Link
          to="/ban-do"
          className="orn-plaque flex min-h-[44px] items-center gap-2 bg-card px-3 text-sm font-semibold"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Bản đồ dòng họ
        </Link>
      </div>

      <PersonCard person={person} />
      <MissingInfoNotice person={person} />

      <div className="grid gap-4 lg:grid-cols-3">
        <PaperPanel className="p-5 lg:col-span-2">
          <h2 className="font-heading text-xl font-semibold">Cốt truyện</h2>
          {person.bio ? (
            <p className="mt-2 text-base leading-relaxed">{person.bio}</p>
          ) : (
            <p className="mt-2 text-base text-muted-foreground">
              Chưa ghi tiểu sử cho người này.
            </p>
          )}
          {person.notes && (
            <p className="mt-3 rounded-xl border-2 border-wood/20 bg-secondary/50 px-3 py-2 text-sm">
              <span className="font-semibold text-muted-foreground">
                Ghi chú:{" "}
              </span>
              {person.notes}
            </p>
          )}
        </PaperPanel>

        <PaperPanel className="p-5">
          <h2 className="font-heading text-xl font-semibold">
            Thông tin nhanh
          </h2>
          <dl className="mt-3 space-y-2 text-base">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold text-muted-foreground">
                Vai vế
              </dt>
              <dd>{personRoleLabel(person)}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold text-muted-foreground">
                Trạng thái
              </dt>
              <dd>{person.isDeceased ? "Đã khuất" : "Còn sống"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold text-muted-foreground">
                Quê quán
              </dt>
              <dd>{person.hometown ?? "chưa ghi"}</dd>
            </div>
            {person.occupation && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 font-semibold text-muted-foreground">
                  Nghề nghiệp
                </dt>
                <dd>{person.occupation}</dd>
              </div>
            )}
            {person.isDeceased && person.burialPlace && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 font-semibold text-muted-foreground">
                  Nơi an táng
                </dt>
                <dd>{person.burialPlace}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold text-muted-foreground">
                Con ghi trong sổ
              </dt>
              <dd>{children.length}</dd>
            </div>
          </dl>
        </PaperPanel>
      </div>

      <PaperPanel className="p-5">
        <h2 className="font-heading text-xl font-semibold">Quan hệ trong họ</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RelationList
            title="Cha"
            people={father ? [father] : []}
            emptyText="Chưa ghi cha"
          />
          <RelationList
            title="Mẹ"
            people={mother ? [mother] : []}
            emptyText="Chưa ghi mẹ"
          />
          <RelationList
            title="Vợ / Chồng"
            people={spouses}
            emptyText={
              person.spouseIds.length > 0 ? "Không có trong sổ" : "Chưa ghi"
            }
          />
          <RelationList
            title="Con"
            people={children}
            emptyText="Chưa ghi con"
          />
        </div>
      </PaperPanel>

      <SensitiveBlock person={person} />
    </div>
  );
}
