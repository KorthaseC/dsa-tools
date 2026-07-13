// Structured, machine-checkable prerequisite (parsed at build time from the PDF "Voraussetzungen:" prose).
// One Requirement = one condition fragment. A list of them is AND-combined; fragments that share a
// `group` are OR-combined (any one satisfies the group). See requirements?: Requirement[] on
// Advantage / SpecialAbility, and CharacterValidationService.evaluateRequirement().

export type RequirementType =
  | 'attribute' // name = MU|KL|IN|CH|FF|GE|KO|KK, min = value
  | 'talent' // name = German talent label, min = FW
  | 'combatTechnique' // name = German technique label, min = KTW
  | 'spell' // name = spell label, min = FW
  | 'liturgy' // name = liturgy label, min = FW
  | 'leitTradition' // min = Leiteigenschaft (guiding attribute) value of the active tradition
  | 'tradition' // name = tradition (e.g. "Gildenmagier"); satisfied by tradition or "Tradition (name)" SF
  | 'caster' // Vorteil Zauberer
  | 'priest' // Vorteil Geweihter
  | 'species' // name = species slug
  | 'culture' // name = culture
  | 'cultureSocialStatus' // name = social-status tier (e.g. "Adel"); the char's culture must list it in socialStatus
  | 'karmalTradition' // the char must have any KarmalTradition special ability (Tradition eines Kults)
  | 'aspectCount' // `count` liturgies/ceremonies of the owning SA's chosen aspect at FW ≥ `min`
  | 'merkmalCount' // `count` spells of the owning SA's chosen Merkmal at FW ≥ `min`
  | 'selectedSpell' // the spell chosen for the owning SA (its selection/param) must be at FW ≥ `min`
  | 'cantrip' // name = cantrip (Zaubertrick) slug
  | 'spellExtension' // name = spell-extension slug, `spell` = the parent spell's slug
  | 'selectedTalent' // the SA's chosen talent at FW ≥ `min` × (number of specializations taken in that talent)
  | 'talentCount' // at least `count` of `names` (talent labels) at FW ≥ `min`
  | 'talentSum' // the summed FW of `names` (talent labels) must be ≥ `min`
  | 'language' // name = language label (optional), min = level (Stufe)
  | 'script' // name = script label (optional)
  | 'advantage' // name = advantage slug
  | 'disadvantage' // name = disadvantage slug
  | 'specialAbility' // name = SA slug
  | 'grantedAdvantage' // name = advantage slug; available only if the char's species/culture/profession grants it (auto/recommended/typical)
  | 'grantedDisadvantage' // name = disadvantage slug; available only if the char's species/culture/profession grants it
  | 'style' // styleKind = which style pool must grant this entry
  | 'ifOption' // option-conditional: `option` = the owner's chosen sub-option, `then` = the requirement that applies for it
  | 'narrative'; // unparseable prose — informational only, never a hard mismatch

export interface Requirement {
  type: RequirementType;
  /** Target name/label/slug/attribute-code, per the type. */
  name?: string;
  /** Minimum value (attribute, talent FW, KTW, spell FW, Leiteigenschaft, language level, advantage level). */
  min?: number;
  /** Required number of matching entries (for `aspectCount`: liturgies/ceremonies of the aspect at FW ≥ min). */
  count?: number;
  /** Parent spell slug (for `spellExtension`: the extension `name` belongs to this spell). */
  spell?: string;
  /** Required selection option (for an `advantage` ref that needs a specific sub-option, e.g. Magischer Titel = Erzmag:a). */
  option?: string;
  /** Talent labels (for `talentCount`/`talentSum`). */
  names?: string[];
  /** True = the condition is an incompatibility ("kein/keine …"): the target must be ABSENT. */
  forbidden?: boolean;
  /** For a forbidden advantage/disadvantage: only conflicts when it shares the owner's chosen option
   *  (e.g. "kein Nachteil Magische Einschränkung auf die gleiche Umgebung"). */
  sameOption?: boolean;
  /** For type 'style': which style pool must list this entry among its granted abilities. */
  styleKind?: 'combat' | 'magic' | 'karmal' | 'skill';
  /** OR-group id: requirements that share a group are satisfied if ANY one of them is met. */
  group?: number;
  /** Only applies once the owning entry has reached this level ("Stufe II: …"). */
  atLevel?: number;
  /** For type 'ifOption': the requirement that applies when the owner's chosen option matches `option`. */
  then?: Requirement;
  /** Verbatim source fragment — always kept for display; the payload for type 'narrative'. */
  text?: string;
}
