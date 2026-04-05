/**
 * Regenerates chrome-extension/seedSearches.json from backlog/amazon_searches.md.
 * Run from repo root: npm run seed:amazon-searches
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const mdPath = path.join(root, "backlog", "amazon_searches.md");
const outPath = path.join(root, "chrome-extension", "seedSearches.json");

const md = fs.readFileSync(mdPath, "utf8");
const searches = [];
for (const line of md.split("\n")) {
  const m = line.match(/^\d+\.\s+(.+)$/);
  if (m) searches.push(m[1].trim());
}

if (searches.length === 0) {
  console.error("No numbered search lines found in", mdPath);
  process.exit(1);
}

const payload = { version: 1, generatedFrom: "backlog/amazon_searches.md", searches };
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Wrote ${searches.length} searches to ${outPath}`);
