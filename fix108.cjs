const fs = require('fs');
let s = fs.readFileSync('constants.ts', 'utf8');
const p1 = s.indexOf('    id: 108,');
const p2 = s.indexOf('    id: 109,');
if (p1 !== -1 && p2 !== -1 && p1 < p2) {
  const before = s.substring(0, p1);
  const after = s.substring(p2);
  const s108 = `    id: 108,
    idString: "108",
    name: "Al-Kawthar",
    englishName: "Abundance",
    frenchName: "L'Abondance",
    verses: [
      { number: 1, arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', french: 'Nous t\\'avons certes, accordé l\\'Abondance.' },
      { number: 2, arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', french: 'Accomplis la Salât pour ton Seigneur et sacrifie.' },
      { number: 3, arabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', french: 'Celui qui te hait sera certes, sans postérité.' }
    ]
  },  {
`;
  fs.writeFileSync('constants.ts', before + s108 + after);
  console.log("Replaced 108 cleanly.");
} else {
  console.log("Could not find blocks.");
}
