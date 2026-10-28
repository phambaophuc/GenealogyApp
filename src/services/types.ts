import type { ComponentType } from "react";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type DatePrecision = "FULL" | "YEAR" | "APPROX";
export type ParentRole = "FATHER" | "MOTHER";
export type ParentKind = "BIOLOGICAL" | "ADOPTED" | "STEP";
export type MarriageEndReason = "DIVORCED" | "WIDOWED";
export type UserRole = "ADMIN" | "MEMBER";
export type Lineage = "CLAN" | "SPOUSE" | "OUTSIDE";

export interface DbPerson {
  id: string;
  full_name: string;
  common_name: string | null;
  gender: Gender;
  avatar_url: string | null;
  generation: number | null;
  birth_order: number | null;
  is_blood_line: boolean;
  birth_date: string | null;
  birth_date_precision: DatePrecision | null;
  death_date: string | null;
  death_date_precision: DatePrecision | null;
  death_lunar_date: string | null;
  is_deceased: boolean;
  hometown: string | null;
  current_address: string | null;
  phone: string | null;
  occupation: string | null;
  bio: string | null;
  burial_place: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DbParentChild {
  id: string;
  parent_id: string;
  child_id: string;
  kind: ParentKind;
  parent_role: ParentRole;
}

export interface DbSpouse {
  id: string;
  person_a_id: string;
  person_b_id: string;
  marriage_date: string | null;
  end_date: string | null;
  end_reason: MarriageEndReason | null;
}

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  person_id: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParentChildLink {
  id: string;
  parentId: string;
  childId: string;
  kind: ParentKind;
  parentRole: ParentRole;
}

export interface SpouseLink {
  id: string;
  personAId: string;
  personBId: string;
  marriageDate: string | null;
  endDate: string | null;
  endReason: MarriageEndReason | null;
}

export interface Person {
  id: string;
  fullName: string;
  commonName: string | null;
  gender: Gender;
  avatarUrl: string | null;
  generation: number;
  birthOrder: number | null;
  isBloodLine: boolean;
  lineage: Lineage;
  birthDate: string | null;
  birthDatePrecision: DatePrecision | null;
  deathDate: string | null;
  deathDatePrecision: DatePrecision | null;
  deathLunarDate: string | null;
  isDeceased: boolean;
  hometown: string | null;
  currentAddress: string | null;
  phone: string | null;
  occupation: string | null;
  bio: string | null;
  burialPlace: string | null;
  notes: string | null;
  fatherId: string | null;
  motherId: string | null;
  parentKind: ParentKind | null;
  spouseIds: string[];
}

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  personId: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface VillageDoor {
  id: string;
  name: string;
  desc: string;
  stage: number;
  adminOnly: boolean;
  icon: ComponentType<{ className?: string }>;
  accentClass: string;
  to?: string;
  upcoming: string;
}

export interface ClanInfo {
  familyName: string;
  village: string;
  region: string;
  motto: string;
  foundedNote: string;
}

export interface Mission {
  id: string;
  label: string;
  hint: string;
  tag: "gio" | "chung";
}

export interface ClanStats {
  total: number;
  generations: number;
  deceased: number;
  living: number;
  outsideClan: number;
  missingInfo: number;
  completeness: number;
}

export interface UpcomingGio {
  person: Person;
  daysLeft: number;
  nextGioDate: string;
}

export interface PersonNodeData extends Record<string, unknown> {
  person: Person;
  alive: boolean;
  childCount: number;
  hiddenCount: number;
  collapsed: boolean;
  onToggle: (id: string) => void;
}
