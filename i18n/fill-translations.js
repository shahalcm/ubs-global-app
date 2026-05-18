const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname);
const enPath = path.join(i18nPath, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const langs = ['ar', 'de', 'es', 'fr', 'hi', 'ja', 'ml', 'ru', 'tr', 'ur', 'zh'];

langs.forEach(lang => {
  const langPath = path.join(i18nPath, `${lang}.json`);
  let langData = {};
  
  if (fs.existsSync(langPath)) {
    try {
      langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${lang}.json`);
    }
  }

  let added = 0;
  Object.keys(enData).forEach(key => {
    if (!langData.hasOwnProperty(key)) {
      langData[key] = enData[key];
      added++;
    }
  });

  // Sort keys alphabetically for neatness
  const sortedData = {};
  Object.keys(langData).sort().forEach(k => {
    sortedData[k] = langData[k];
  });

  fs.writeFileSync(langPath, JSON.stringify(sortedData, null, 2) + '\n');
  console.log(`Filled ${added} missing keys for ${lang}.json`);
});

// Also sort en.json for neatness
const sortedEn = {};
Object.keys(enData).sort().forEach(k => {
  sortedEn[k] = enData[k];
});
fs.writeFileSync(enPath, JSON.stringify(sortedEn, null, 2) + '\n');
console.log('Sorted en.json');
console.log('Done filling translations.');
