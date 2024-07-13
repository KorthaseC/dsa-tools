const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prodEnvFilePath = path.resolve(
  __dirname,
  "src/environments/environment.prod.ts"
);

const googleScriptId = process.env.GOOGLE_SCRIPT_ID;

const replaceEnvVariables = (filePath) => {
  let fileContent = fs.readFileSync(filePath, "utf-8");
  fileContent = fileContent.replace(
    "GOOGLE_SCRIPT_ID_PLACEHOLDER",
    googleScriptId
  );
  fs.writeFileSync(filePath, fileContent, "utf-8");
};

replaceEnvVariables(prodEnvFilePath);
