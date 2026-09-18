const fs = require('fs');

const text = fs.readFileSync('data/Disease pathways (2026)(Lung cancer).csv', 'utf8');

const matches = text.match(/.{0,20}\s\/\s.{0,20}/g);
if (matches) {
  const unique = new Set(matches);
  console.log(Array.from(unique));
} else {
  console.log("No matches for space-slash-space");
}
