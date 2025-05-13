import { Rulebook } from "./base-creation.model";

export interface Prerequisite {
  name: string;
  required: boolean;
}

export interface Advantage {
  name: string;
  cost: number;
  label: string;
  lvl?: number;
  mandatory?: boolean;
  prerequisite: Prerequisite[]
  rulebook?: Rulebook;
  url?: string;
}