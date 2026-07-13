import { NamedEntry, SourceReference } from './base-creation.model';

// Talentstile (talent styles) — chosen via a special ability; "passender Talentstil" prerequisites of
// the extended-skill SFs refer to these. Mostly flavour at creation time, but modelled so those
// prerequisites resolve structurally.
export interface TalentStyle extends NamedEntry {
  cost: number; // AP
  rule?: string; // verbatim "Regel:" text
  /** Labels of the extended skill SFs this style grants (cross-match for "passender Talentstil"). */
  styleGrants?: string[];
  sources?: SourceReference[];
  url?: string;
}
