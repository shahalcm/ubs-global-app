const fs = require('fs');
const path = require('path');

// Wrap everything in an async IIFE
(async () => {
  const { translate } = await import('@vitalets/google-translate-api');

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const enPath = path.join(__dirname, 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const keys = Object.keys(enData);
  
  const langs = ['ar', 'de', 'es', 'fr', 'hi', 'ja', 'ml', 'ru', 'tr', 'ur', 'zh'];
  
  for (const lang of langs) {
    console.log('Translating to', lang);
    const langPath = path.join(__dirname, `${lang}.json`);
    let langData = {};
    if (fs.existsSync(langPath)) {
      langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    }
    
    let translatedCount = 0;
    for (const key of keys) {
      if (!langData[key] || langData[key] === key) {
        try {
          const res = await translate(enData[key], { to: lang });
          langData[key] = res.text;
          translatedCount++;
          await delay(300); // 300ms delay to prevent rate limit
        } catch (e) {
          console.error(`Error translating [${key}] to ${lang}:`, e.message);
          langData[key] = enData[key]; // fallback to english
          await delay(2000); 
        }
      }
    }
    
    fs.writeFileSync(langPath, JSON.stringify(langData, null, 2) + '\n');
    console.log('Finished', lang, 'with', translatedCount, 'new translations');
  }
  console.log('All done!');
})();
