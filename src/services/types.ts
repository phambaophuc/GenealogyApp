import type { ComponentType } from "react";

/* -------------------------------------------------------------------------- */
/* Shared enums (mirror the backend's genealogy.enums.ts)                     */
/* -------------------------------------------------------------------------- */

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type DatePrecision = "FULL" | "YEAR" | "APPROX";
export type ParentRole = "FATHER" | "MOTHER";
export type ParentKind = "BIOLOGICAL" | "ADOPTED" | "STEP";
export type MarriageEndReason = "DIVORCED" | "WIDOWED";
export type UserRole = "admin" | "user";

/* -------------------------------------------------------------------------- */
/* API envelope                                                               */
/* -------------------------------------------------------------------------- */

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  requestId: string | null;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  requestId: string | null;
  path: string;
  method: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

/* -------------------------------------------------------------------------- */
/* Backend DTOs                                                               */
/* -------------------------------------------------------------------------- */

export interface PersonDto {
  id: string;
  fullName: string;
  commonName: string | null;
  gender: Gender;
  avatarUrl: string | null;
  birthOrder: number | null;
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PersonSummaryDto {
  id: string;
  fullName: string;
  commonName: string | null;
  gender: Gender;
  birthDate: string | null;
  deathDate: string | null;
  isDeceased: boolean;
  avatarUrl: string | null;
}

export interface PersonParentLinkDto {
  person: PersonSummaryDto;
  parentRole: ParentRole;
  kind: ParentKind;
}

export interface PersonChildLinkDto {
  person: PersonSummaryDto;
  parentRole: ParentRole;
  kind: ParentKind;
}

export interface PersonSpouseLinkDto {
  person: PersonSummaryDto;
  marriageDate: string | null;
  endDate: string | null;
  endReason: MarriageEndReason | null;
}

export interface PersonRelationsDto {
  person: PersonSummaryDto;
  parents: PersonParentLinkDto[];
  children: PersonChildLinkDto[];
  spouses: PersonSpouseLinkDto[];
}

export interface TreePersonDto {
  id: string;
  fullName: string;
  commonName: string | null;
  gender: Gender;
  birthYear: number | null;
  deathYear: number | null;
  isDeceased: boolean;
  birthOrder: number | null;
  avatarUrl: string | null;
}

export interface TreeParentChildDto {
  id: string;
  parentId: string;
  childId: string;
  parentRole: ParentRole;
  kind: ParentKind;
}

export interface TreeSpouseDto {
  id: string;
  personAId: string;
  personBId: string;
  marriageDate: string | null;
  endReason: MarriageEndReason | null;
}

export interface TreeGraphDto {
  persons: TreePersonDto[];
  parentChild: TreeParentChildDto[];
  spouses: TreeSpouseDto[];
}

export interface UserProfileDto {
  id: string;
  email: string;
  name?: string;
  roles: UserRole[];
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: UserProfileDto;
}

/* -------------------------------------------------------------------------- */
/* Domain models used by the UI                                               */
/* -------------------------------------------------------------------------- */

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
