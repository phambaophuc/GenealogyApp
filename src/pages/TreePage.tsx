import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FocusTree from "../components/focus/FocusTree";
import PaperPanel from "../components/ornaments/PaperPanel";
import PersonSearch from "../components/search/PersonSearch";
import FamilyTree from "../components/tree/FamilyTree";
import { getPeople, getClanPeople, getDemoUserPerson } from "../services/api";
import type { Person } from "../services/types";

const readTarget = () => new URLSearchParams(window.location.search).get("tam");

export default function TreePage() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [clanPeople, setClanPeople] = useState<Person[] | null>(null);
  const [myPerson, setMyPerson] = useState<Person | null>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    let alive = true;

    Promise.all([getPeople(), getClanPeople(), getDemoUserPerson()]).then(
      ([list, clan, me]) => {
        if (!alive) return;
        setPeople(list);
        setClanPeople(clan);
        setMyPerson(me);

        const target = readTarget();
        const found = target
          ? list.find((person) => person.id === target)
          : undefined;
        setTrail(found ? [found.id] : []);
        setCursor(0);
      },
    );

    return () => {
      alive = false;
    };
  }, []);

  const centerId = trail[cursor];
  const center = useMemo(
    () => people?.find((person) => person.id === centerId) ?? null,
    [people, centerId],
  );

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      centerId ? `/cay?tam=${centerId}` : "/cay",
    );
  }, [centerId]);

  const openPerson = (id: string) => {
    if (!id) return;
    if (!centerId) {
      setTrail([id]);
      setCursor(0);
      return;
    }
    if (id === centerId) return;
    setTrail((previous) => [...previous.slice(0, cursor + 1), id]);
    setCursor((previous) => previous + 1);
  };

  const backToOverview = () => {
    setTrail([]);
    setCursor(0);
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
          Cây Đại Thụ
        </p>
        <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
          {center ? "Họ hàng quanh một người" : "Toàn cảnh dòng họ"}
        </h1>
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">
          {center
            ? "Người được chọn ở giữa, tổ tiên ở trên, con cháu ở dưới. Nhãn nhỏ trên mỗi thẻ cho biết bạn gọi người ấy là gì."
            : "Cả dòng họ trong một khung. Gõ tên một người ở ô tìm kiếm, cây sẽ chuyển sang góc nhìn quanh người ấy."}
        </p>
      </PaperPanel>

      {people ? (
        center ? (
          <PaperPanel className="p-3 sm:p-4">
            <FocusTree
              center={center}
              people={people}
              myPerson={myPerson}
              canBack={cursor > 0}
              canForward={cursor < trail.length - 1}
              onBack={() => setCursor((previous) => Math.max(0, previous - 1))}
              onForward={() =>
                setCursor((previous) =>
                  Math.min(trail.length - 1, previous + 1),
                )
              }
              onCenter={openPerson}
              onOverview={backToOverview}
            />
          </PaperPanel>
        ) : (
          <PaperPanel className="p-3 sm:p-4">
            <div className="mb-3">
              <PersonSearch
                onSelect={(person) => openPerson(person.id)}
                placeholder="Gõ tên một người để xem góc nhìn quanh người ấy…"
              />
            </div>
            <FamilyTree people={clanPeople ?? []} />
          </PaperPanel>
        )
      ) : (
        <PaperPanel className="p-8 text-center">
          <p className="font-heading text-xl">Đang mở cây gia phả…</p>
        </PaperPanel>
      )}
    </div>
  );
}
