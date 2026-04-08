const fs = require('fs');
const path = require('path');

const localEnvPath = path.resolve(__dirname, 'src/environments/environment.local.ts');
const prodEnvPath = path.resolve(__dirname, 'src/environments/environment.prod.ts');

const localContent = fs.readFileSync(localEnvPath, 'utf-8');
const idMatch = localContent.match(/googleScriptId:\s*'(.*)'/);

if (!idMatch || !idMatch[1]) {
  console.error('FEHLER: Keine googleScriptId in environment.local.ts gefunden!');
  process.exit(1);
}

const realId = idMatch[1];

let prodContent = fs.readFileSync(prodEnvPath, 'utf-8');
prodContent = prodContent.replace('GOOGLE_SCRIPT_ID_PLACEHOLDER', realId);

fs.writeFileSync(prodEnvPath, prodContent, 'utf-8');

console.log(`Erfolg: ID (${realId.substring(0, 5)}...) wurde in environment.prod.ts eingesetzt.`);
