const fs = require('fs');
const path = require('path');
const dir = __dirname;
const seedFile = 'en.json';
const en = JSON.parse(fs.readFileSync(path.join(dir, seedFile), 'utf8'));
const jsonFiles = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.json') && file !== seedFile);
const keys = new Set(Object.keys(en));
const sorted = Array.from(keys).sort();
for (const file of jsonFiles) {
  const target = {};
  sorted.forEach((key) => {
    target[key] = en[key] ?? key;
  });
  fs.writeFileSync(path.join(dir, file), JSON.stringify(target, null, 2) + '\n');
}
console.log('generated', jsonFiles.map((file) => path.basename(file, '.json')).join(', '));