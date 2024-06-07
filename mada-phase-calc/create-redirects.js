const fs = require("fs");
const path = require("path");

const redirectsContent = "/*    /index.html   200\n";
const redirectsPath = path.join(__dirname, "dist", "_redirects");

fs.writeFileSync(redirectsPath, redirectsContent, "utf8");
console.log("_redirects file created successfully");
