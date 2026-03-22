const fs = require('fs');
const path = 'c:/Users/P C/Downloads/FURQANY 3.0/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Debug log and force premium for specific emails
const searchString = "const [isWelcomeSeen, setIsWelcomeSeen] = useState(() => {";
const replacement = '  useEffect(() => {\n    console.log("Furqany Status:", { isPremium, mode, isWelcomeSeen, userEmail: user?.email });\n  }, [isPremium, mode, isWelcomeSeen, user]);\n\n  const [isWelcomeSeen, setIsWelcomeSeen] = useState(() => {';

if (content.includes(searchString)) {
  content = content.replace(searchString, replacement);
  console.log("Main trace added.");
}

// Force isPremium more strongly
const searchAuth = "setIsPremium(data.isPremium || false);";
const replacementAuth = "const isAuto = currentUser.email === 'emilmatan48@gmail.com' || currentUser.email === 'novaskilltech@gmail.com';\n            setIsPremium(data.isPremium || isAuto);";

if (content.includes(searchAuth)) {
  content = content.replace(searchAuth, replacementAuth);
  console.log("Auth force added.");
}

fs.writeFileSync(path, content, 'utf8');
console.log("File patched successfully.");
