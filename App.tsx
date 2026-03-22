
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { SHORT_SURAHS, BADGES_LIST } from './constants';
import { UserProgress, AppMode, AppTheme, Surah } from './types';
import { Mascot } from './components/Mascot';
import { VerseDisplay } from './components/VerseDisplay';
import { GamesSection } from './components/GamesSection';
import { ThemePicker } from './components/ThemePicker';
import { ReciterPicker } from './components/ReciterPicker';
import { Loader } from './components/Loader';
import { AdhkarsSection } from './components/AdhkarsSection';
import LearningCalendar from './components/LearningCalendar';
import PrayerTimes from './components/PrayerTimes';
import { generateCompliment } from './geminiService';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { BottomNav } from './components/BottomNav';
import { PremiumDashboard } from './components/Premium/PremiumDashboard';

const PARENTAL_CODE = "70000";


const getSurahTitle = (surah: Surah, lng: string) => {
  const normLng = lng.toLowerCase();
  if (normLng.startsWith('ar')) return surah.arabicName;
  if (normLng.startsWith('en')) return surah.englishName || surah.name;
  return surah.frenchName || surah.name;
};

const getSurahSubtitle = (surah: Surah, lng: string) => {
  const normLng = lng.toLowerCase();
  if (normLng.startsWith('ar')) return surah.name; // Transliteration for Arabic users
  if (normLng.startsWith('en')) return surah.name; // Transliteration for English users
  return surah.name; // Transliteration for French users
};

const App: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isWelcomeSeen, setIsWelcomeSeen] = useState(() => {
    return localStorage.getItem('furqany_welcome_seen') === 'true';
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('furqany_progress_v6');
    return saved ? JSON.parse(saved) : {
      completedSurahs: [],
      completedVerses: [],
      badges: [],
      streak: 0,
      theme: 'rose',
      reciter: 'albanna',
      fontSize: 3,
      activityLog: {},
      unlockedQuarters: [1, 2, 3, 4],
      gameStars: 20
    };
  });

  const exportProgress = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "furqany_progress.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const [mode, setMode] = useState<AppMode>(AppMode.SELECTION);
  const [filterMode, setFilterMode] = useState<'all' | 'completed'>('all');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showParentalValidation, setShowParentalValidation] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [parentInput, setParentInput] = useState('');
  const [celebrationData, setCelebrationData] = useState({ compliment: '', badge: null as any });
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualContent, setManualContent] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showUninstallGuide, setShowUninstallGuide] = useState(false);
  const [isAutoPlayingSurah, setIsAutoPlayingSurah] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Furqany',
          text: 'Découvre Furqany, l\'application pour apprendre le Coran en s\'amusant ! ✨',
          url: window.location.origin,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert("Le partage n'est pas supporté sur ce navigateur.");
    }
  };

  const handleResetData = () => {
    if (window.confirm(t('uninstall_guide.reset_confirm'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  useEffect(() => {
    if (showManual && !manualContent) {
      fetch('/manual.md')
        .then(response => response.text())
        .then(text => setManualContent(text))
        .catch(err => console.error('Failed to load manual', err));
    }
  }, [showManual, manualContent]);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (progress.preferredLanguage !== lng) {
        setProgress(prev => ({ ...prev, preferredLanguage: lng }));
      }
    };
    i18nInstance.on('languageChanged', handleLanguageChange);
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [progress.preferredLanguage, i18nInstance]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Sync initial language from progress
  useEffect(() => {
    if (progress.preferredLanguage && i18nInstance.language !== progress.preferredLanguage) {
      i18nInstance.changeLanguage(progress.preferredLanguage);
    }
  }, [progress.preferredLanguage, i18nInstance]);

  const [expandedQuarterId, setExpandedQuarterId] = useState<number | null>(4);
  const [unlockingQuarterId, setUnlockingQuarterId] = useState<number | null>(null);
  const [unlockInput, setUnlockInput] = useState('');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProgress;
            setProgress(data);
            const isAuto = currentUser.email === 'emilmatan48@gmail.com' || currentUser.email === 'novaskilltech@gmail.com';
            setIsPremium(data.isPremium || isAuto);

            // Force albanna if not premium and hossary is selected
            if (!data.isPremium && data.reciter === 'hossary') {
              data.reciter = 'albanna';
            }
            
            // Force rose theme if not premium and a premium theme is selected
            if (!data.isPremium && data.theme !== 'rose') {
              data.theme = 'rose';
            }
                      // Special initialization for specific users
            const isAutoPremium = currentUser.email === 'emilmatan48@gmail.com' || currentUser.email === 'novaskilltech@gmail.com';
            if (isAutoPremium && !data.isPremium) {
              const premiumData = { 
                ...data, 
                isPremium: true, 
                userName: data.userName || (currentUser.email === 'emilmatan48@gmail.com' ? "Abdallah" : "Nova"), 
                gender: data.gender || (currentUser.email === 'emilmatan48@gmail.com' ? "boy" : "boy"), 
                unlockedQuarters: [1,2,3,4] 
              };
              setProgress(premiumData);
              setIsPremium(true);
              await setDoc(doc(db, 'users', currentUser.uid), premiumData);
            }
   

            // Sync with local cache and i18n
            if (data.userName) localStorage.setItem('furqany_userName', data.userName);
            if (data.gender) localStorage.setItem('furqany_gender', data.gender);
            if (data.preferredLanguage) {
              i18nInstance.changeLanguage(data.preferredLanguage);
            }


          } else {
            // New user or missing doc
            const cachedName = localStorage.getItem('furqany_userName');
            const cachedGender = localStorage.getItem('furqany_gender') as any;
            
            let initialProgress = { ...progress };            // Special initial data for specific users
            const isAutoPremium = currentUser.email === 'emilmatan48@gmail.com' || currentUser.email === 'novaskilltech@gmail.com';
            if (isAutoPremium) {
              initialProgress = { 
                ...progress, 
                isPremium: true, 
                userName: currentUser.email === 'emilmatan48@gmail.com' ? "Abdallah" : "Nova", 
                gender: "boy", 
                unlockedQuarters: [1,2,3,4] 
              };
              setProgress(initialProgress);
              setIsPremium(true);
              await setDoc(doc(db, 'users', currentUser.uid), initialProgress);
              setShowProfileSetup(false);
            }
   else if (cachedName && cachedGender) {
              initialProgress = { ...progress, userName: cachedName, gender: cachedGender };
              setProgress(initialProgress);
              await setDoc(doc(db, 'users', currentUser.uid), initialProgress);
            } else {
              await setDoc(doc(db, 'users', currentUser.uid), progress);
              setShowProfileSetup(true);
            }
          }
        } catch (error: any) {
          console.error("Error fetching/setting user doc:", error);
          setErrorMsg(`${t('error_data')} (${error?.code || 'inconnue'}).`);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), progress);
    } else {
      localStorage.setItem('furqany_progress_v6', JSON.stringify(progress));
    }
  }, [progress, user]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [mode, selectedSurah]);

  useEffect(() => {
    if (progress.gameStars === 0) {
      setProgress(prev => ({ ...prev, gameStars: 20 }));
    }
  }, []);

  const handleStartApp = () => {
    localStorage.setItem('furqany_welcome_seen', 'true');
    setIsWelcomeSeen(true);
  };

  const selectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setCurrentVerseIndex(0);
    setMode(AppMode.LEARNING);
  };

  const nextVerse = () => {
    if (selectedSurah && currentVerseIndex < selectedSurah.verses.length - 1) {
      setCurrentVerseIndex(v => v + 1);
    } else {
      initiateParentalValidation();
    }
  };

  const handleAutoNext = () => {
    if (!selectedSurah || !isAutoPlayingSurah) return;
    if (currentVerseIndex < selectedSurah.verses.length - 1) {
      setCurrentVerseIndex(v => v + 1);
    } else {
      setIsAutoPlayingSurah(false);
      // Optional: alert or feedback that surah is finished
    }
  };

  const initiateParentalValidation = () => {
    setParentInput('');
    setShowParentalValidation(true);
  };

  const handleVerseValidation = () => {
    if (selectedSurah) {
      const verseKey = `${selectedSurah.id}_${selectedSurah.verses[currentVerseIndex].number}`;
      if (!progress.completedVerses.includes(verseKey)) {
        setProgress(prev => ({
          ...prev,
          completedVerses: [...prev.completedVerses, verseKey]
        }));
      }
      
      const encouragements = [
        "MachaAllah ! C'est magnifique ! ❤️",
        "Bravo ! C'est un super travail ! 🌟",
        "SubhanAllah ! Quelle belle récitation ! ✨",
        "Génial ! Tu progresses super bien ! 🚀",
        "MachaAllah ! Allah t'aime et t'aide ! 💖"
      ];
      setEncouragementText(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
    initiateParentalValidation();
  };

  const handleParentConfirm = async () => {
    if (parentInput !== PARENTAL_CODE) {
      alert("Code incorrect. Seul un adulte peut valider la mémorisation.");
      return;
    }

    setShowParentalValidation(false);
    if (!selectedSurah) return;
    
    const compliment = await generateCompliment(getSurahTitle(selectedSurah, i18nInstance.language), isPremium, progress.userName, progress.gender, i18nInstance.language);
    let newBadge = null;

    if (selectedSurah.id === 1 && !progress.badges.includes('cle_tresor')) newBadge = BADGES_LIST.find(b => b.id === 'cle_tresor');
    else if (selectedSurah.id === 2 && !progress.badges.includes('bouclier_or')) newBadge = BADGES_LIST.find(b => b.id === 'bouclier_or');
    else if (selectedSurah.id === 93 && !progress.badges.includes('soleil_matin')) newBadge = BADGES_LIST.find(b => b.id === 'soleil_matin');

    const completedCount = progress.completedSurahs.length + 1;
    if (completedCount === 3 && !progress.badges.includes('etoile_guide')) newBadge = BADGES_LIST.find(b => b.id === 'etoile_guide');

    setCelebrationData({ compliment, badge: newBadge });
    setShowCelebration(true);

    setProgress(prev => ({
      ...prev,
      completedSurahs: [...new Set([...prev.completedSurahs, selectedSurah.id])],
      badges: newBadge ? [...new Set([...prev.badges, newBadge.id])] : prev.badges
    }));
  };

  const handleQuarterClick = (quarterId: number) => {
    const isUnlocked = true;
    
    if (false) {
      setUnlockingQuarterId(quarterId);
      setUnlockInput('');
      return;
    }

    setExpandedQuarterId(expandedQuarterId === quarterId ? null : quarterId);
  };

  const confirmUnlock = () => {
    if (unlockInput === PARENTAL_CODE) {
      if (unlockingQuarterId) {
        setProgress(prev => ({
          ...prev,
          unlockedQuarters: [...(prev.unlockedQuarters || []), unlockingQuarterId]
        }));
        setExpandedQuarterId(unlockingQuarterId);
      }
      setUnlockingQuarterId(null);
    } else {
      alert("Code incorrect !");
    }
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setMode(AppMode.SELECTION);
    setSelectedSurah(null);
  };

  const tryOpenGames = () => {
    setMode(AppMode.GAMES);
  };

  const themeClasses = {
    emerald: 'bg-[url(/back1.png)] bg-cover bg-center text-emerald-900',
    gold: 'bg-[url(/back2.png)] bg-cover bg-center text-amber-900',
    indigo: 'bg-[url(/back3.png)] bg-cover bg-center text-indigo-900',
    rose: 'bg-[url(/back4.png)] bg-cover bg-center text-rose-900',
  };

  const surahNameTextClasses = {
    emerald: 'text-emerald-900',
    gold: 'text-amber-900',
    indigo: 'text-indigo-900',
    rose: 'text-rose-900',
  };

  const buttonClasses = {
    emerald: 'bg-emerald-600/80 active:bg-emerald-700 shadow-emerald-200',
    gold: 'bg-amber-500/80 active:bg-amber-600 shadow-amber-200',
    indigo: 'bg-indigo-600/80 active:bg-indigo-700 shadow-indigo-200',
    rose: 'bg-rose-500/80 active:bg-rose-600 shadow-rose-200',
  };

  if (!isAuthReady) return <div className="h-[100dvh] flex items-center justify-center">Chargement...</div>;
  if (!user) {
    return (
      <div className={`h-[100dvh] ${themeClasses[progress.theme]} flex items-center justify-center p-6 select-none relative`}>
        <div className="absolute top-8 right-8 z-50">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white/50 text-center flex flex-col items-center gap-5">
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-1">Dès 4 ans</p>
          <h1 className="text-3xl font-black text-rose-700">{t('welcome_title')}</h1>
          <button onClick={() => {
            console.log("Attempting sign in from origin:", window.location.origin);
            signInWithPopup(auth, googleProvider).catch(err => {
              console.error("Sign in error details:", err);
              if (err.code === 'auth/unauthorized-domain') {
                 alert("ERREUR CHROME : Firebase ne reconnaît pas ce domaine.\n\n" +
                       "Causes possibles :\n" +
                       "1. Les 'Cookies tiers' sont bloqués dans Chrome (vérifiez Paramètres > Confidentialité).\n" +
                       "2. L'extension AdBlock modifie l'envoi du domaine.\n" +
                       "3. Le domaine " + window.location.hostname + " n'est pas dans la console Firebase (Authentication > Settings).");
              } else {
                 setErrorMsg(`${t('error_data')} : ` + err.message);
              }
            });
          }} className={`w-full py-5 ${buttonClasses[progress.theme]} text-white text-xl font-black rounded-full shadow-lg active:scale-95 transition-transform`}>
            {t('login_google')}
          </button>
        </div>
      </div>
    );
  }

  if (!isWelcomeSeen) {
    return (
      <div className={`h-[100dvh] ${themeClasses[progress.theme]} flex items-center justify-center p-6 select-none relative`}>
        <div className="absolute top-8 right-8 z-50">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white/50 text-center flex flex-col items-center gap-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl"></div>
          <div className="text-6xl animate-bounce">🎁</div>
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-1">Dès 4 ans</p>
          <h1 className="text-3xl font-black text-rose-700 leading-tight">{t('welcome_title')}</h1>
          <div className="bg-amber-50/80 p-6 rounded-[2rem] border border-amber-100/50 leading-relaxed shadow-inner text-left">
             <p className="text-md font-bold text-amber-900 italic mb-2">"{t('salut')} !"</p>
             <p className="text-base text-amber-800 font-medium">
               {t('welcome_desc')}
             </p>
          </div>
          <button onClick={handleStartApp} className={`w-full py-5 ${buttonClasses[progress.theme]} text-white text-xl font-black rounded-full shadow-lg active:scale-95 transition-transform`}>
            {t('open_gift')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplash && <Loader onComplete={() => setShowSplash(false)} />}
      <div 
        dir={i18nInstance.dir()}
      className={`h-[100dvh] ${isPremium ? 'bg-premium-bg overflow-x-hidden' : themeClasses[progress.theme]} font-sans transition-colors duration-700 flex flex-col select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${i18nInstance.language === 'ar' ? 'rtl-layout' : ''}`}
    >
      {isPremium && mode === AppMode.SELECTION ? (
        <PremiumDashboard 
          user={user} 
          progress={progress} 
          isPremium={isPremium}
          expandedQuarterId={expandedQuarterId}
          onAction={async (action, data) => {
            if (action === 'openMenu') setShowMenu(true);
            if (action === 'changeTab') {
              if (data === 'home') setMode(AppMode.SELECTION);
              if (data === 'learning') setMode(AppMode.SELECTION); 
              if (data === 'adhkars') setMode(AppMode.ADHKARS);
              if (data === 'stats') setMode(AppMode.BADGES);
            }
            if (action === 'selectQuarter') {
              if (data === null) {
                  setExpandedQuarterId(null);
                  return;
              }
              const qId = typeof data === 'string' ? parseInt(data.replace('q', '')) : data;
              setExpandedQuarterId(qId);
            }
            if (action === 'selectSurah') {
                selectSurah(data);
            }
            if (action === 'playLumiAudio') {
                const message = t('lumi_dashboard_welcome', "Tu fais un travail formidable ! Savais-tu que chaque lettre du Coran est une récompense ? ✨");
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = i18nInstance.language === 'ar' ? 'ar-SA' : (i18nInstance.language === 'en' ? 'en-US' : 'fr-FR');
                window.speechSynthesis.speak(utterance);
            }
            if (action === 'renameUser') {
                const newName = prompt(t('enter_name', "Comment t'appelles-tu ?"), progress.userName);
                if (newName && newName.trim()) {
                    const updatedProgress = { ...progress, userName: newName.trim() };
                    setProgress(updatedProgress);
                    // Save to Firebase
                    if (user) {
                        const { doc, setDoc } = await import('firebase/firestore');
                        const { db } = await import('./firebase');
                        await setDoc(doc(db, 'users', user.uid), updatedProgress, { merge: true });
                    }
                }
            }
            if (action === 'playAyatAudio') {
                // Audio for "فَاذْكُرُونِي أَذْكُرْكُمْ" (2:152)
                const audio = new Audio("https://cdn.islamic.network/quran/audio/128/ar.alafasy/159.mp3");
                audio.play().catch(e => console.error("Audio play failed", e));
            }
          }}
        />
      ) : (
        <>
          {showEncouragement && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-500">
              <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-3xl shadow-2xl border-4 border-rose-100 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <p className="text-rose-700 font-black text-lg whitespace-nowrap">{encouragementText}</p>
              </div>
            </div>
          )}
          <header className="px-4 py-2 flex justify-between items-center z-40 bg-white/40 backdrop-blur-md border-b border-white/20">
        <div className="relative flex items-center justify-between w-full">
          {/* Hub Profil (Left) */}
          <button 
            onClick={() => setMode(AppMode.BADGES)} 
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className={`w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-sm border border-white/50 text-2xl ${progress.theme === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>
              {progress.gender === 'girl' ? '🌸' : '🚀'}
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-tight -mt-0.5">
                {t('salut')},
              </p>
              <h2 className="text-sm font-black text-gray-800 leading-tight truncate max-w-[100px]">
                {progress.userName || 'Champion'} {isPremium && <span title="Premium" className="ms-1">🌟</span>}
              </h2>
            </div>
          </button>
          
          {/* Logo/Title (Center) */}
          <div className="flex flex-col items-center flex-1 absolute left-1/2 -translate-x-1/2">
             <h2 className="text-xl font-black text-rose-700 leading-tight tracking-wider">FURQANY</h2>
          </div>

          {/* Settings (Right) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform text-2xl border border-white/50"
              title="Paramètres"
            >
              ⚙️
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="absolute top-full right-4 mt-2 w-64 bg-white/95 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl z-50 border-4 border-white animate-in slide-in-from-top-4 flex flex-col gap-1">
            <div className="px-3 py-2 flex items-center justify-between">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Paramètres</h3>
              {user && (
                <button 
                  onClick={() => signOut(auth)} 
                  className="w-8 h-8 bg-red-100/80 text-red-600 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform text-sm" 
                  title={t('menu.logout')}
                >
                  🚪
                </button>
              )}
            </div>
            <div className="h-px bg-gray-100 my-1" />
            <div className="flex justify-center py-2">
              <LanguageSwitcher />
            </div>
            <div className="h-px bg-gray-100 my-1" />
            
            <button onClick={() => { setShowThemePicker(true); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="w-8 text-xl">🎨</span> {t('menu.themes')}
            </button>
            <button onClick={() => { setShowReciterPicker(true); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="w-8 text-xl">🎙️</span> {t('menu.reciter')}
            </button>
            <button onClick={() => { setShowNotice(true); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="w-8 text-xl">ℹ️</span> {t('parent_space')}
            </button>
            <button onClick={() => { exportProgress(); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="w-8 text-xl">💾</span> {t('menu.backup') || 'Sauvegarder'}
            </button>
            <button onClick={() => { handleShare(); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="w-8 text-xl">📤</span> {t('menu.share')}
            </button>
            {deferredPrompt && (
              <button onClick={() => { handleInstall(); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                <span className="w-8 text-xl">📱</span> {t('menu.install')}
              </button>
            )}
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => { setShowUninstallGuide(true); setShowMenu(false); }} className="w-full p-3 flex items-center text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
              <span className="w-8 text-xl">🛠️</span> {t('menu.uninstall')}
            </button>
          </div>
        )}
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6">
        {errorMsg && (
          <div className="mb-4 bg-rose-100 border-2 border-rose-200 p-3 rounded-xl text-rose-700 font-bold text-center animate-shake text-sm">
            {errorMsg}
          </div>
        )}

        {mode === AppMode.SELECTION ? (
          <div className="max-w-md mx-auto space-y-6 pb-20">

            {/* Learning Calendar */}
            <LearningCalendar theme={progress.theme} />

            {/* Badges Quick View */}
            {progress.badges.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-[2rem] border border-white/50">
                <div className="flex justify-between items-center mb-3 px-2">
                  <h4 className="text-sm font-black text-gray-600 uppercase tracking-wider">{t('trophies')}</h4>
                  <button onClick={() => setMode(AppMode.BADGES)} className="text-xs font-bold text-rose-500">{t('see_all')}</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {progress.badges.slice(-4).map(badgeId => {
                    const badge = BADGES_LIST.find(b => b.id === badgeId);
                    return (
                      <div key={badgeId} className="min-w-[60px] h-[60px] bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-50">
                        {badge?.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Surah List Section by Quarters */}
            <div className="space-y-6" dir={i18nInstance.dir()}>
              <PrayerTimes />
              {[
                { id: 1, name: t('quarters.q1'), range: [1, 6] },
                { id: 2, name: t('quarters.q2'), range: [7, 17] },
                { id: 3, name: t('quarters.q3'), range: [18, 35] },
                { id: 4, name: t('quarters.q4'), range: [36, 114], inverted: true },
              ].map(quarter => {
                let surahsInQuarter = SHORT_SURAHS.filter(s => s.id >= quarter.range[0] && s.id <= quarter.range[1]);
                
                if (filterMode === 'completed') {
                  surahsInQuarter = surahsInQuarter.filter(s => progress.completedSurahs.includes(s.id));
                }

                if (quarter.inverted) {
                  // Sort by ID descending for the 4th quarter
                  surahsInQuarter = [...surahsInQuarter].sort((a, b) => b.id - a.id);
                }
                
                const isUnlocked = true;
                const isExpanded = expandedQuarterId === quarter.id;

                return (
                  <div key={quarter.id} className="space-y-4">
                    <button 
                      onClick={() => handleQuarterClick(quarter.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-[2.2rem] transition-all shadow-md border-2 ${
                        isExpanded 
                          ? (progress.theme === 'rose' ? 'bg-rose-50/90 border-rose-200/50 scale-[1.02]' : 'bg-emerald-50/90 border-emerald-200/50 scale-[1.02]') 
                          : 'bg-white/70 backdrop-blur-md border-white/60 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden shadow-inner border-2 ${isUnlocked ? 'border-white/80' : 'border-gray-200 grayscale'} bg-white/40`}>
                          <img 
                            src={`/${quarter.id}.png`} 
                            alt={quarter.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=' + quarter.id;
                            }}
                          />
                        </div>
                        <div className="text-left">
                          <h3 className={`text-md font-black leading-tight ${progress.theme === 'rose' ? 'text-rose-900' : 'text-emerald-900'}`}>
                            {quarter.name}
                          </h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('surahs_count', { count: surahsInQuarter.length })}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-rose-100 text-rose-600' : 'bg-gray-100/50 text-gray-400'}`}>
                        <span className="text-sm">⌄</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-3 px-2 animate-in slide-in-from-top-4 duration-300">
                        {surahsInQuarter.length > 0 ? (
                          surahsInQuarter.map(surah => (
                            <button 
                              key={surah.id}
                              onClick={() => selectSurah(surah)}
                              className="w-full bg-white/30 backdrop-blur-md p-4 rounded-[1.8rem] shadow-sm border border-white/40 active:border-rose-500 transition-all flex justify-between items-center group active:translate-y-0.5"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${progress.completedSurahs.includes(surah.id) ? 'bg-emerald-500/20 text-emerald-700' : 'bg-white/40 text-gray-400'}`}>
                                  {surah.isSpecialVerse ? '💎' : surah.idString.replace(/^0+/, '')}
                                </div>
                                  <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-black truncate ${surahNameTextClasses[progress.theme]} leading-tight`}>
                                  {getSurahTitle(surah, i18nInstance.language)}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                  {getSurahSubtitle(surah, i18nInstance.language)}
                                </p>
                              </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${progress.completedSurahs.includes(surah.id) ? 'bg-emerald-500/20 text-emerald-600' : 'bg-white/40 text-gray-300'}`}>
                                <span className="text-sm">{progress.completedSurahs.includes(surah.id) ? '✅' : '📖'}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="bg-white/30 backdrop-blur-sm p-6 rounded-[1.8rem] border-2 border-dashed border-white/50 text-center">
                            <p className="text-sm font-bold text-gray-500 italic">{t('soon')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : mode === AppMode.COMPLETED_LIST ? (
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border-4 border-white animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-black ${progress.theme === 'rose' ? 'text-rose-800' : 'text-emerald-800'}`}>{t('my_surahs')}</h3>
                <button onClick={() => setMode(AppMode.SELECTION)} className="text-rose-600 font-bold text-sm bg-white px-4 py-1.5 rounded-full shadow-sm">{t('close')}</button>
             </div>
             <div className="space-y-3 pb-10">
               {SHORT_SURAHS.filter(s => progress.completedSurahs.includes(s.id)).length > 0 ? (
                 SHORT_SURAHS.filter(s => progress.completedSurahs.includes(s.id)).map(surah => (
                   <button 
                     key={surah.id}
                     onClick={() => selectSurah(surah)}
                     className="w-full bg-white/30 backdrop-blur-md p-4 rounded-[1.8rem] shadow-sm border border-white/40 active:border-emerald-500 transition-all flex justify-between items-center group active:translate-y-0.5"
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-lg">
                         {surah.isSpecialVerse ? '💎' : surah.idString.replace(/^0+/, '')}
                       </div>
                       <div className="text-left">
                          <p className={`text-lg font-black ${surahNameTextClasses[progress.theme]}`}>
                            {getSurahTitle(surah, i18nInstance.language)}
                          </p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                           {getSurahSubtitle(surah, i18nInstance.language)}
                         </p>
                       </div>
                     </div>
                     <span className="text-xl">✅</span>
                   </button>
                 ))
               ) : (
                 <div className="text-center py-10 space-y-4">
                   <span className="text-5xl block">🌱</span>
                   <p className="text-gray-500 font-bold">{t('no_surahs')}</p>
                 </div>
               )}
             </div>
          </div>
        ) : mode === AppMode.GAMES ? (
          <div className="max-w-md mx-auto">
            <GamesSection progress={progress} setProgress={setProgress} onClose={() => setMode(AppMode.SELECTION)} theme={progress.theme} />
          </div>
        ) : mode === AppMode.ADHKARS ? (
          <div className="max-w-md mx-auto h-full">
            <AdhkarsSection onBack={() => setMode(AppMode.SELECTION)} theme={progress.theme} />
          </div>
        ) : mode === AppMode.BADGES ? (
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border-4 border-white animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-black ${progress.theme === 'rose' ? 'text-rose-800' : 'text-emerald-800'}`}>Mon Parcours</h3>
                <button onClick={() => setMode(AppMode.SELECTION)} className="text-rose-600 font-bold text-sm bg-white px-4 py-1.5 rounded-full shadow-sm">{t('close')}</button>
             </div>
             
             <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setMode(AppMode.COMPLETED_LIST)}
                  className="flex-1 bg-white/80 hover:bg-white p-4 rounded-[2rem] shadow-sm border border-white flex flex-col items-center transition-all active:scale-95"
                >
                  <span className="text-3xl mb-1 mt-2">📖</span>
                  <span className="text-2xl font-black text-emerald-600 leading-none">{progress.completedSurahs.length}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">{t('learned', 'Apprises')}</span>
                </button>
                <div className="flex-1 bg-white/80 p-4 rounded-[2rem] shadow-sm border border-white flex flex-col items-center">
                  <span className="text-3xl mb-1 mt-2">🔥</span>
                  <span className="text-2xl font-black text-orange-600 leading-none">{progress.streak}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">{t('days', 'Jours')}</span>
                </div>
             </div>

             <h4 className="font-black text-gray-500 uppercase tracking-widest text-xs mb-4 ml-2">Mes Trophées</h4>
             <div className="grid grid-cols-2 gap-4 pb-10">
               {BADGES_LIST.map(badge => {
                 const isOwned = progress.badges.includes(badge.id);
                 return (
                   <div key={badge.id} className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isOwned ? 'bg-white shadow-md border-b-4 border-rose-500' : 'bg-gray-100/50 grayscale opacity-40'}`}>
                     <span className="text-4xl mb-2">{badge.emoji}</span>
                     <h4 className="text-xs font-black text-gray-800 focus:outline-none leading-tight">{badge.name}</h4>
                   </div>
                 );
               })}
             </div>
          </div>
        ) : mode === AppMode.LEARNING && selectedSurah ? (
          <div className="max-w-md mx-auto space-y-5 pb-10">
            <div className="flex items-center justify-between px-2">
              <button onClick={() => { setMode(AppMode.SELECTION); setIsAutoPlayingSurah(false); }} className="bg-white/80 px-4 py-1.5 rounded-full font-bold text-rose-700 text-sm border border-rose-200">⬅ {t('back')}</button>
                <div className="flex-1">
                  <h3 className={`text-xl font-black ${progress.theme === 'rose' ? 'text-rose-900' : 'text-emerald-900'} leading-tight truncate`}>
                    {getSurahTitle(selectedSurah, i18nInstance.language)}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    {getSurahSubtitle(selectedSurah, i18nInstance.language)}
                  </p>
                </div>
              <button 
                onClick={() => setIsAutoPlayingSurah(!isAutoPlayingSurah)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all border shadow-sm ${
                  isAutoPlayingSurah 
                    ? 'bg-rose-600 text-white border-rose-500 scale-105 animate-pulse' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t('auto_play')} {isAutoPlayingSurah ? '⏹️' : '▶️'}
              </button>
            </div>

            <VerseDisplay 
              verse={selectedSurah.verses[currentVerseIndex]} 
              surahIdString={selectedSurah.idString}
              theme={progress.theme}
              reciter={progress.reciter}
              fontSizeScale={progress.fontSize}
              onValidate={handleVerseValidation}
              isAutoPlay={isAutoPlayingSurah}
              onVerseEnded={handleAutoNext}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentVerseIndex(v => v - 1)} 
                disabled={currentVerseIndex === 0} 
                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all ${currentVerseIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-white text-rose-700 shadow-md active:translate-y-0.5'}`}
              >
                {t('previous')}
              </button>
              <button 
                onClick={nextVerse} 
                className={`flex-1 py-4 ${buttonClasses[progress.theme]} text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform`}
              >
                {currentVerseIndex === selectedSurah.verses.length - 1 ? `${t('validate')} ! 🏁` : `${t('next')} ➡`}
              </button>
            </div>

            <Mascot 
              verse={selectedSurah.verses[currentVerseIndex]} 
              surahName={getSurahTitle(selectedSurah, i18nInstance.language)} 
              theme={progress.theme} 
              userName={progress.userName} 
              isPremium={isPremium} 
            />
          </div>
        ) : null}
      </main>
      </>
    )}


      {showNotice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-blue-900/60 backdrop-blur-md p-4">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-blue-800">Guide Parents 📚</h2>
              <button onClick={() => setShowNotice(false)} className="text-gray-400 font-bold">✖</button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-700 mb-1">🎯 Objectif</h4>
                <p>Accompagner l'enfant dans la mémorisation des petites sourates avec plaisir.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-800 mb-1">🔐 Validation Parentale</h4>
                <p>À la fin d'une sourate, un code est demandé. Écoutez l'enfant réciter. Si c'est acquis, entrez votre code secret partagé pour débloquer le badge et les étoiles.</p>
              </section>
              <section>
                <h4 className="font-bold text-gray-800 mb-1">⭐ Récompenses</h4>
                <p>Chaque validation rapporte 50 étoiles permettant d'accéder aux mini-jeux (30 étoiles par session).</p>
              </section>
            </div>
            <button onClick={() => setShowNotice(false)} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">{t('headings.understood_btn')}</button>
          </div>
        </div>
      )}

      {showManual && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-blue-900/60 backdrop-blur-md p-4">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-blue-800">{t('headings.manual_title')}</h2>
              <button onClick={() => setShowManual(false)} className="text-gray-400 font-bold">✖</button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {manualContent}
            </div>
            <button onClick={() => setShowManual(false)} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">{t('headings.close_btn')}</button>
          </div>
        </div>
      )}

      {showParentalValidation && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-6 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <h2 className="text-2xl font-black text-slate-800 text-center mb-1">{t('headings.parent_space_title')}</h2>
            <p className="text-slate-500 text-center mb-6 text-sm font-medium">{t('headings.parent_space_desc')}</p>
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 mb-6 text-center">
              <p className="text-sm font-bold text-slate-500 mb-4">Saisissez votre code secret :</p>
              <input 
                type="password" 
                inputMode="numeric"
                value={parentInput}
                onChange={(e) => setParentInput(e.target.value)}
                placeholder="•••••"
                className="w-full text-center py-4 bg-white rounded-xl border-2 border-slate-200 text-3xl font-black focus:border-rose-500 outline-none transition-colors tracking-[0.5rem]"
              />
            </div>
            <button onClick={handleParentConfirm} className="w-full py-5 bg-rose-600 text-white rounded-2xl text-lg font-black shadow-lg active:scale-95 transition-transform">Valider ✅</button>
            <button onClick={() => setShowParentalValidation(false)} className="w-full py-4 text-slate-400 font-bold text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Quarter Unlock Modal */}
      {unlockingQuarterId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-blue-900/40 backdrop-blur-md p-4">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-xs p-8 rounded-[3rem] shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-4xl">👨‍👩‍👧</div>
            <h3 className="text-xl font-black text-blue-900">{t('headings.protected_zone_title')}</h3>
            <p className="text-sm font-bold text-blue-600/70">{t('headings.protected_zone_desc')}</p>
            <input 
              type="password" 
              inputMode="numeric"
              value={unlockInput}
              onChange={(e) => setUnlockInput(e.target.value)}
              placeholder="•••••"
              className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-center text-2xl font-black focus:outline-none focus:border-blue-300 tracking-[0.5rem]"
            />
            <div className="flex gap-3">
              <button onClick={() => setUnlockingQuarterId(null)} className="flex-1 py-3 font-bold text-blue-400">Annuler</button>
              <button onClick={confirmUnlock} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200">Débloquer</button>
            </div>
          </div>
        </div>
      )}

      {showUninstallGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm p-6 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 flex flex-col gap-5 border-4 border-white/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">{t('uninstall_guide.title')}</h2>
              <button onClick={() => setShowUninstallGuide(false)} className="text-slate-400 font-bold p-2">✕</button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p className="font-medium">{t('uninstall_guide.desc')}</p>
              
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="font-bold text-blue-800 mb-1">Android / Chrome / Edge :</p>
                <p>{t('uninstall_guide.step_chrome')}</p>
                <p>{t('uninstall_guide.step_chrome_2')}</p>
              </div>

              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                <p className="font-bold text-pink-800 mb-1">iPhone / iPad (Safari) :</p>
                <p>{t('uninstall_guide.step_ios')}</p>
              </div>

              <div className="h-px bg-slate-100 my-2" />

              <div className="space-y-3">
                <p className="font-black text-slate-800 uppercase tracking-wider text-xs">Option de Secours</p>
                <p className="text-xs">{t('uninstall_guide.reset_desc')}</p>
                <button 
                  onClick={handleResetData}
                  className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm active:scale-95 transition-all"
                >
                  ⚠️ {t('uninstall_guide.reset_btn')}
                </button>
              </div>
            </div>

            <button onClick={() => setShowUninstallGuide(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg">{t('headings.close_btn')}</button>
          </div>
        </div>
      )}

      {showProfileSetup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-rose-900/40 backdrop-blur-md p-4">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl text-center space-y-8 animate-in zoom-in duration-500 border-8 border-white">
            {!progress.gender ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-4xl">🌸</div>
                <h3 className="text-2xl font-black text-rose-900">{t('welcome_title')}</h3>
                <p className="text-lg font-bold text-rose-600/70">{t('select_gender')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setProgress(p => ({ ...p, gender: 'girl' }))}
                    className="p-6 bg-pink-50 border-4 border-pink-100 rounded-[2rem] text-4xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    🌸
                    <p className="text-xs font-black text-pink-500 mt-2 uppercase">{t('girl')}</p>
                  </button>
                  <button 
                    onClick={() => setProgress(p => ({ ...p, gender: 'boy' }))}
                    className="p-6 bg-blue-50 border-4 border-blue-100 rounded-[2rem] text-4xl hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    🚀
                    <p className="text-xs font-black text-blue-500 mt-2 uppercase">{t('boy')}</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-4xl">
                  {progress.gender === 'girl' ? '💖' : '🌟'}
                </div>
                <h3 className="text-2xl font-black text-rose-900">{t('salut')} !</h3>
                <p className="text-lg font-bold text-rose-600/70">{t('enter_name')}</p>
                <input 
                  type="text" 
                  placeholder={t('name_placeholder')}
                  autoFocus
                  value={progress.userName || ''}
                  onChange={(e) => setProgress(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full p-5 bg-white border-4 border-rose-100 rounded-3xl text-center text-xl font-black focus:outline-none focus:border-rose-400 placeholder:text-rose-200 shadow-inner"
                />
                <button 
                  disabled={!progress.userName}
                  onClick={() => {
                    if (progress.userName) {
                      localStorage.setItem('furqany_userName', progress.userName);
                      localStorage.setItem('furqany_gender', progress.gender!);
                      setShowProfileSetup(false);
                    }
                  }} 
                  className="w-full py-5 bg-rose-600 text-white rounded-3xl text-xl font-black shadow-lg shadow-rose-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {t('validate')}
                </button>
                <button 
                  onClick={() => setProgress(p => ({ ...p, gender: undefined }))}
                  className="text-xs font-bold text-rose-400 uppercase tracking-widest"
                >
                  ⬅ {t('menu.home')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-rose-900/70 backdrop-blur-md p-6 overflow-y-auto">
          <div className="bg-white/80 backdrop-blur-md w-full max-sm:w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl border-[6px] border-yellow-400/50 animate-in zoom-in duration-500 flex flex-col items-center gap-5 text-center relative my-4">
            <div className="text-7xl animate-bounce mt-2">🏆</div>
            <h2 className="text-3xl font-black text-rose-700 leading-tight">{t('headings.celebration_title')}</h2>
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-gray-700 text-base font-medium leading-relaxed">
              "{celebrationData.compliment}"
            </div>
            {celebrationData.badge && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl shadow-inner border-2 border-yellow-300 transform rotate-6 mb-2">
                  {celebrationData.badge.emoji}
                </div>
                <p className="font-black text-sm text-yellow-600 uppercase tracking-widest">{celebrationData.badge.name}</p>
              </div>
            )}
            <button onClick={closeCelebration} className={`w-full py-5 rounded-[1.8rem] text-white text-xl font-black shadow-lg active:scale-95 transition-transform ${buttonClasses[progress.theme]}`}>
              {t('validate')} ! 🚀
            </button>
          </div>
        </div>
      )}

      {showThemePicker && (
        <ThemePicker
          currentTheme={progress.theme}
          isPremium={isPremium}
          onSelect={(theme) => {
            setProgress(p => ({ ...p, theme }));
            setShowThemePicker(false);
          }}
          onClose={() => setShowThemePicker(false)}
        />
      )}

      {showReciterPicker && (
        <ReciterPicker
          currentReciter={progress.reciter}
          isPremium={isPremium}
          onSelect={(reciter) => {
            setProgress(p => ({ ...p, reciter }));
            setShowReciterPicker(false);
          }}
          onClose={() => setShowReciterPicker(false)}
        />
      )}
      {!isPremium && <BottomNav currentMode={mode} onModeChange={setMode} theme={progress.theme} />}
    </div>
  </>
);
};

export default App;
