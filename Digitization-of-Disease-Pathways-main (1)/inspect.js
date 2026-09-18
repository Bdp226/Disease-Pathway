const fs = require('fs');

const text = fs.readFileSync('data/Disease pathways (2026)(Lung cancer).csv', 'utf8');

const matches = text.match(/.{0,15}\/.{0,15}/g);
const unique = new Set(matches);
console.log(Array.from(unique).slice(0, 30));
