// Generates the (git-ignored) production environment file from the real secrets held in the
// (also git-ignored) environment.local.ts. Run before `ng build` (see the "build"/"build:prod" scripts).
// environment.prod.ts is a BUILD ARTIFACT — it is never committed, so the secrets are never pushed to
// GitHub; the tracked template with the placeholders is environment.ts. Writes the whole file, so it
// works even on a fresh clone where environment.prod.ts does not exist yet.
const fs = require('fs');
const path = require('path');

const localEnvPath = path.resolve(__dirname, 'src/environments/environment.local.ts');
const prodEnvPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');

if (!fs.existsSync(localEnvPath)) {
  console.error('FEHLER: src/environments/environment.local.ts fehlt (enthält die echten Secrets).');
  process.exit(1);
}

const localContent = fs.readFileSync(localEnvPath, 'utf-8');

// Each secret: the environment key, its placeholder in the tracked template, and what to call it in errors.
const SECRETS = [
  { key: 'googleScriptId', placeholder: 'GOOGLE_SCRIPT_ID_PLACEHOLDER', label: 'googleScriptId' },
  { key: 'primeUiLicense', placeholder: 'PRIMEUI_LICENSE_PLACEHOLDER', label: 'PrimeUI-Lizenzschlüssel' },
];

const values = {};

for (const { key, placeholder, label } of SECRETS) {
  const match = localContent.match(new RegExp(`${key}:\\s*'(.*)'`));

  if (!match || !match[1] || match[1] === placeholder) {
    console.error(`FEHLER: Kein echter ${label} (${key}) in environment.local.ts gefunden!`);
    process.exit(1);
  }

  values[key] = match[1];
}

const prodContent = `export const environment = {
  production: true,
  googleScriptId: '${values.googleScriptId}',
  primeUiLicense: '${values.primeUiLicense}',
};
`;

fs.writeFileSync(prodEnvPath, prodContent, 'utf-8');

const preview = SECRETS.map(({ key }) => `${key} ${values[key].substring(0, 5)}…`).join(', ');
console.log(`Erfolg: environment.prod.ts erzeugt (${preview}).`);
