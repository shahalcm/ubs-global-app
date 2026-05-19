const fs = require('fs');
const path = require('path');

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  let translatedText = '';
  if (data && data[0]) {
    data[0].forEach(part => {
      if (part[0]) translatedText += part[0];
    });
  }
  return translatedText || text;
}

// Simple concurrency limiter
async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = task();
    results.push(p);
    const e = p.finally(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

(async () => {
  const enPath = path.join(__dirname, 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const keys = Object.keys(enData);
  
  const langs = ['de', 'es', 'fr', 'hi', 'ja', 'ml', 'ru', 'tr', 'ur', 'zh'];
  
  for (const lang of langs) {
    console.log(`Translating to ${lang}...`);
    const langPath = path.join(__dirname, `${lang}.json`);
    let langData = {};
    if (fs.existsSync(langPath)) {
      langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    }
    
    const tasks = [];
    let toTranslate = 0;

    for (const key of keys) {
      if (typeof enData[key] !== 'string') continue;
      
      if (key === '000-000-0000' || key === '0000 0000 0000 0000' || key === '•••' || key === '••••••••' || key === 'email@ubsglobal.com') {
        langData[key] = enData[key];
        continue;
      }

      if (!langData[key] || langData[key] === key || langData[key] === enData[key]) {
        toTranslate++;
        tasks.push(async () => {
          try {
            const result = await translateText(enData[key], lang);
            langData[key] = result;
          } catch (e) {
            langData[key] = enData[key];
          }
        });
      }
    }
    
    if (toTranslate > 0) {
      await runWithConcurrency(tasks, 15);
    }

    const sortedData = {};
    Object.keys(langData).sort().forEach(k => {
      sortedData[k] = langData[k];
    });

    fs.writeFileSync(langPath, JSON.stringify(sortedData, null, 2) + '\n');
    console.log(`Finished ${lang} with ${toTranslate} new translations.`);
  }
  console.log('All done!');
})();
