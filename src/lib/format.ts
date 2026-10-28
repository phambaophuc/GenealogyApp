import type {
  Person,
  Gender,
  DatePrecision,
  ParentKind,
} from "../services/types";

export function formatSolarDate(iso: string | null): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-");
  if (!month) return year;
  return `${day}/${month}/${year}`;
}

export function personInitial(fullName: string): string {
  const given = fullName.trim().split(/\s+/).pop() ?? "?";
  return given.charAt(0).toUpperCase();
}

export function personRoleLabel(person: Person): string {
  if (person.lineage === "OUTSIDE") return "Bên ngoại dòng họ";

  const parts = [`Đời ${person.generation}`];
  if (person.lineage === "SPOUSE") {
    parts.push(
      person.gender === "FEMALE"
        ? "dâu"
        : person.gender === "MALE"
          ? "rể"
          : "ngoài họ",
    );
  } else if (person.birthOrder) {
    parts.push(`thứ ${person.birthOrder}`);
  }
  return parts.join(" · ");
}

export function genderLabel(gender: Gender): string {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  if (gender === "OTHER") return "Khác";
  return "Chưa rõ";
}

export function precisionLabel(precision: DatePrecision | null): string | null {
  if (precision === "YEAR") return "chỉ ghi năm";
  if (precision === "APPROX") return "ước chừng";
  return null;
}

export function parentKindLabel(kind: ParentKind | null): string | null {
  if (kind === "ADOPTED") return "Con nuôi";
  if (kind === "STEP") return "Con riêng";
  return null;
}

export function gioLabel(deathLunarDate: string | null): string | null {
  if (!deathLunarDate) return null;
  return `${deathLunarDate.replace(/N$/, " (tháng nhuận)")} âm lịch`;
}
