import genealogy from "../data/genealogy.json";
import outsideClan from "../data/outsideClan.json";
import type { DbParentChild, DbPerson, DbSpouse, DbUser } from "./types";

export interface MockTables {
  persons: DbPerson[];
  parent_child: DbParentChild[];
  spouses: DbSpouse[];
  users: DbUser[];
}

const clanPersons = genealogy.persons as unknown as DbPerson[];
const clanParentChild = genealogy.parent_child as unknown as DbParentChild[];
const clanSpouses = genealogy.spouses as unknown as DbSpouse[];

const outside = outsideClan as unknown as {
  persons: DbPerson[];
  parent_child: DbParentChild[];
  spouses: DbSpouse[];
};

export const mockTables: MockTables = {
  persons: [...clanPersons, ...outside.persons],
  parent_child: [...clanParentChild, ...outside.parent_child],
  spouses: [...clanSpouses, ...outside.spouses],
  users: genealogy.users as unknown as DbUser[],
};
