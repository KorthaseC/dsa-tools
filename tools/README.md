# `tools/` — DSA5 catalog code generation

These scripts are **dev-time codegen only**. They are **not** part of `npm run build`, not run in CI,
and not used at runtime. The app depends **exclusively** on the generated catalogs in
`src/app/character-creator/constants/*.const.ts`. You can ignore this folder entirely unless you are
refreshing the ruleset data.

## The source PDF (not in the repo)

The generator reads the official Ulisses fillable DSA5 character sheet, which embeds the whole ruleset as
JavaScript `XxxGetInfo(id, infoId)` functions inside FlateDecode streams. That PDF is **copyrighted
commercial material and is deliberately not distributed here** (`*.pdf` is git-ignored).

To regenerate, place your own local copy at the repo root under the exact name expected by
`extract-pdf-data.mjs` (see the `PDF` constant near the top of that file), then run the generator. It is
never needed to build or run the app.

## Scripts

| Script | Purpose | Needs the PDF? |
| --- | --- | --- |
| `extract-pdf-data.mjs` | Regenerates all catalog `*.const.ts` (spells, liturgies, special abilities, advantages, professions, species, talents, weapons, selection options, …). | Yes |
| `build-catalog-hand-snapshot.mjs` | One-time: freezes `label → existing slug` for talents/combat techniques/cantrips/blessings so regeneration keeps stable slugs. | No |
| `build-sa-hand-snapshot.mjs` | One-time: freezes the pristine special-ability catalogs (slug preservation + carries forward hand-only orphans: languages, scripts, karmal traditions). | No |
| `audit-requirements.mjs` | Read-only data-correctness audit against the generated consts (unresolved/dangling refs, duplicates). Exit code 1 on hard issues. | No |

Run any of them with `node tools/<script>.mjs`.

## `tools/dsa-data/`

**Tracked (curated inputs — NOT reproducible from the PDF, required by the generator):**

- `advantage-hand.const.txt` — curated advantage slugs/costs (read at generation time).
- `sa-hand-snapshot.json` — special-ability slug snapshot + hand-only orphans.
- `catalog-hand-snapshot.json` — talent/CT/cantrip/blessing slug snapshot.
- `prereq-narrative.txt` — coverage report of prerequisites that stayed narrative (useful when curating).

**Git-ignored (regenerable outputs — `writeFileSync` only, never read back, ~5.6 MB total):**

- `professions.json`, `spells.json`, `selection-options.json`, `liturgies.json`, `species.json`,
  `species-resolved.json`.

Deleting the ignored dumps is harmless — the next `extract-pdf-data.mjs` run rewrites them.
