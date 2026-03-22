const fs = require('fs');
const https = require('https');

function fetchSurah(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-simple,fr.hamidullah`, (res) => {
        let content = '';
        res.on('data', chunk => content += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(content));
          } catch(e) { reject(e); }
        });
    }).on('error', reject);
  });
}

async function main() {
  const filePath = 'constants.ts';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find which Surahs are empty
  const surahsBlocks = content.split(/\s*{\s*id:\s*/);
  
  let newContent = surahsBlocks[0]; // The part before the first surah
  
  console.log(`Checking blocks...`);
  
  for (let i = 1; i < surahsBlocks.length; i++) {
    let block = surahsBlocks[i];
    const idMatch = block.match(/^(\d+),/);
    if (!idMatch) {
      newContent += '  {\n    id: ' + block;
      continue;
    }
    
    const id = parseInt(idMatch[1]);
    
    // We only want Surah 2
    if (id !== 2) {
      newContent += '  {\n    id: ' + block;
      continue;
    }
    
    console.log(`Fetching Surah ${id}...`);
    try {
      const response = await fetchSurah(id);
      const arabic = response.data[0].ayahs;
      const french = response.data[1].ayahs;
      
      let versesStr = '[\n';
      for (let j = 0; j < arabic.length; j++) {
        let textAr = arabic[j].text.replace(/'/g, "\\'").replace(/\n/g, " ");
        if (j === 0 && id !== 1 && textAr.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ')) {
            textAr = textAr.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
        }
        const textFr = french[j].text.replace(/'/g, "\\'").replace(/\n/g, " ");
        
        versesStr += `      { number: ${j + 1}, arabic: '${textAr}', french: '${textFr}' },\n`;
      }
      versesStr += '    ]';
      
      // Replace the old verses array with the new one
      const replacedBlock = block.replace(/verses:\s*\[.*?\]/s, `verses: ${versesStr}`);
      newContent += '  {\n    id: ' + replacedBlock;
      
    } catch (e) {
      console.error(`Error fetching Surah ${id}:`, e);
      newContent += '  {\n    id: ' + block;
    }
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log("Done updating constants.ts for Surah 2");
}

main();
