const fs = require('fs');
let s = fs.readFileSync('constants.ts', 'utf8');
const badStr = `    ]." },
      { number: 2, arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", french: "Prie donc ton Seigneur et sacrifie." },
      { number: 3, arabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", french: "C'est ton ennemi qui sera sans postérité." }
    ]
  },  {`;
const goodStr = `    ]
  },  {`;
if (s.includes(badStr)) {
  s = s.replace(badStr, goodStr);
  fs.writeFileSync('constants.ts', s);
  console.log("Fixed!");
} else {
  console.log("Not found.");
}
