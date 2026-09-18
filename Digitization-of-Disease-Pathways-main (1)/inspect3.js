const fs = require('fs');

const text = fs.readFileSync('data/Disease pathways (2026)(Lung cancer).csv', 'utf8');

const lines = text.split('\n');
for (const line of lines) {
  const count = (line.match(/http/g) || []).length;
  if (count > 1) {
    console.log(line);
  }
}
