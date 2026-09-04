// Generates the (git-ignored) production environment file from the real googleScriptId held in the
// (also git-ignored) environment.local.ts. Run before `ng build` (see the "build"/"build:prod" scripts).
// environment.prod.ts is a BUILD ARTIFACT — it is never committed, so the ID is never pushed to GitHub;
// the tracked template with the placeholder is environment.ts. Writes the whole file, so it works even
// on a fresh clone where environment.prod.ts does not exist yet.
const fs = require('fs');
const path = require('path');

const localEnvPath = path.resolve(__dirname, 'src/environments/environment.local.ts');
const prodEnvPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');

if (!fs.existsSync(localEnvPath)) {
  console.error('FEHLER: src/environments/environment.local.ts fehlt (enthält die echte googleScriptId).');
  process.exit(1);
}

const localContent = fs.readFileSync(localEnvPath, 'utf-8');
const idMatch = localContent.match(/googleScriptId:\s*'(.*)'/);

if (!idMatch || !idMatch[1] || idMatch[1] === 'GOOGLE_SCRIPT_ID_PLACEHOLDER') {
  console.error('FEHLER: Keine echte googleScriptId in environment.local.ts gefunden!');
  process.exit(1);
}

const realId = idMatch[1];

const prodContent = `export const environment = {
  production: true,
  googleScriptId: '${realId}',
};
`;

fs.writeFileSync(prodEnvPath, prodContent, 'utf-8');

console.log(`Erfolg: environment.prod.ts erzeugt (ID ${realId.substring(0, 5)}…).`);
