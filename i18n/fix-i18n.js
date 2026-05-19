const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'ar.json');
const enPath = path.join(__dirname, 'en.json');

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// 1. Add missing keys from ar to en
let addedToEn = 0;
Object.keys(arData).forEach(key => {
  if (!enData.hasOwnProperty(key)) {
    enData[key] = key; // The key is the English translation
    addedToEn++;
  }
});

const sortedEn = {};
Object.keys(enData).sort().forEach(k => {
  sortedEn[k] = enData[k];
});
fs.writeFileSync(enPath, JSON.stringify(sortedEn, null, 2) + '\n');
console.log(`Added ${addedToEn} keys to en.json`);

// 2. Add missing keys from en to all other languages
const langs = ['ar', 'de', 'es', 'fr', 'hi', 'ja', 'ml', 'ru', 'tr', 'ur', 'zh'];

langs.forEach(lang => {
  if (lang === 'en') return;
  const langPath = path.join(__dirname, `${lang}.json`);
  let langData = {};
  
  if (fs.existsSync(langPath)) {
    try {
      langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${lang}.json`);
    }
  }

  let added = 0;
  Object.keys(sortedEn).forEach(key => {
    if (!langData.hasOwnProperty(key)) {
      langData[key] = sortedEn[key]; // Put english value temporarily
      added++;
    }
  });

  const sortedData = {};
  Object.keys(langData).sort().forEach(k => {
    sortedData[k] = langData[k];
  });

  fs.writeFileSync(langPath, JSON.stringify(sortedData, null, 2) + '\n');
  console.log(`Filled ${added} missing keys for ${lang}.json`);
});
