
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
import PrayerTimes from './components/PrayerTimes';
import { generateCompliment } from './geminiService';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { BottomNav } from './components/BottomNav';
import { PremiumDashboard } from './components/Premium/PremiumDashboard';

const PARENTAL_CODE = "70000";

const surahNameTextClasses: Record<AppTheme, string> = {
  rose: 'text-rose-900',
  emerald: 'text-emerald-900',
  amber: 'text-amber-900',
  sky: 'text-sky-900',
  indigo: 'text-indigo-900',
  violet: 'text-violet-900'
};

const buttonClasses: Record<AppTheme, string> = {
  rose: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
  amber: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
  sky: 'bg-sky-600 hover:bg-sky-700 shadow-sky-200',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
  violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
};

const getSurahTitle = (surah: Surah, lng: string) => {
  const normLng = lng.toLowerCase();
  if (normLng.startsWith('ar')) return surah.arabicName;
  if (normLng.startsWith('en')) return surah.englishName || surah.name;
  return surah.frenchName || surah.name;
};

const getSurahSubtitle = (surah: Surah, lng: string) => {
  const normLng = lng.toLowerCase();
  if (normLng.startsWith('ar')) return surah.name;
  if (normLng.startsWith('en')) return surah.name;
  return surah.name;
};

const App: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(true);
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
  const [expandedQuarterId, setExpandedQuarterId] = useState<number | null>(4);
  const [unlockingQuarterId, setUnlockingQuarterId] = useState<number | null>(null);
  const [unlockInput, setUnlockInput] = useState('');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

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
    return () => i18nInstance.off('languageChanged', handleLanguageChange);
  }, [progress.preferredLanguage, i18nInstance]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProgress(userDoc.data() as UserProgress);
          } else {
            await setDoc(doc(db, 'users', currentUser.uid), progress);
          }
        } catch (err) {
          console.error("Error fetching user progress:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      updateDoc(doc(db, 'users', user.uid), progress as any).catch(err => console.error("Error updating progress:", err));
    }
    localStorage.setItem('furqany_progress_v6', JSON.stringify(progress));
  }, [progress, user]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
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

  const handleQuarterClick = (id: number) => {
    if (progress.unlockedQuarters.includes(id)) {
      setExpandedQuarterId(expandedQuarterId === id ? null : id);
    } else {
      setUnlockingQuarterId(id);
    }
  };

  const confirmUnlock = () => {
    if (unlockInput === PARENTAL_CODE) {
      setProgress(p => ({
        ...p,
        unlockedQuarters: [...p.unlockedQuarters, unlockingQuarterId!]
      }));
      setExpandedQuarterId(unlockingQuarterId);
      setUnlockingQuarterId(null);
      setUnlockInput('');
    } else {
      alert(t('wrong_code'));
    }
  };

  const selectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setCurrentVerseIndex(0);
    setMode(AppMode.LEARNING);
  };

  const nextVerse = () => {
    if (!selectedSurah) return;
    if (currentVerseIndex < selectedSurah.verses.length - 1) {
      setCurrentVerseIndex(v => v + 1);
    } else {
      handleParentConfirm();
    }
  };

  const handleVerseValidation = () => {
    if (!selectedSurah) return;
    const verseId = selectedSurah.verses[currentVerseIndex].id;
    if (!progress.completedVerses.includes(verseId)) {
      setProgress(p => ({
        ...p,
        completedVerses: [...p.completedVerses, verseId]
      }));
    }
  };

  const handleAutoNext = () => {
    if (selectedSurah && currentVerseIndex < selectedSurah.verses.length - 1) {
      setTimeout(() => setCurrentVerseIndex(v => v + 1), 1000);
    } else if (selectedSurah) {
      setIsAutoPlayingSurah(false);
      handleParentConfirm();
    }
  };

  const handleParentConfirm = async () => {
      if (selectedSurah && !progress.completedSurahs.includes(selectedSurah.id)) {
        const newCompleted = [...progress.completedSurahs, selectedSurah.id];
        let newBadges = [...progress.badges];
        let badgeEarned = null;

        if (newCompleted.length === 1) {
          newBadges.push('first_surah');
          badgeEarned = BADGES_LIST.find(b => b.id === 'first_surah');
        } else if (newCompleted.length === 5) {
          newBadges.push('five_surahs');
          badgeEarned = BADGES_LIST.find(b => b.id === 'five_surahs');
        }

        const compliment = await generateCompliment(selectedSurah.name, progress.userName || 'Enfant');
        setCelebrationData({ compliment, badge: badgeEarned });
        
        setProgress(p => ({
          ...p,
          completedSurahs: newCompleted,
          badges: newBadges,
          gameStars: p.gameStars + 50
        }));
        
        setShowCelebration(true);
      }
      setShowParentalValidation(false);
      setParentInput('');
      setMode(AppMode.SELECTION);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMode(AppMode.SELECTION);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const renameUser = async (newName: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { userName: newName });
        setProgress(p => ({ ...p, userName: newName }));
      } catch (err) {
        console.error("Error renaming user:", err);
        alert("Erreur lors du changement de nom.");
      }
    } else {
      setProgress(p => ({ ...p, userName: newName }));
    }
  };

  if (!isAuthReady) return <Loader />;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${
      progress.theme === 'rose' ? 'bg-[#FFF5F7]' :
      progress.theme === 'emerald' ? 'bg-[#F0FDF4]' :
      progress.theme === 'amber' ? 'bg-[#FFFBEB]' :
      progress.theme === 'sky' ? 'bg-[#F0F9FF]' :
      progress.theme === 'indigo' ? 'bg-[#EEF2FF]' :
      'bg-[#F5F3FF]'
    } font-sans pb-24`}>
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg ${buttonClasses[progress.theme]}`}>F</div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Furqany</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-2xl">⚙️</button>
        </div>
      </header>

      {showMenu && (
        <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50 space-y-4">
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowThemePicker(true); setShowMenu(false); }} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 flex justify-between items-center">
                <span>🎨 {t('menu.change_theme')}</span>
                <span className="text-xs opacity-50">→</span>
              </button>
              <button onClick={() => { setShowReciterPicker(true); setShowMenu(false); }} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 flex justify-between items-center">
                <span>🎙️ {t('menu.change_reciter')}</span>
                <span className="text-xs opacity-50">→</span>
              </button>
              <button onClick={() => { setShowManual(true); setShowMenu(false); }} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 flex justify-between items-center">
                <span>📖 {t('headings.manual_title')}</span>
                <span className="text-xs opacity-50">→</span>
              </button>
            </div>
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button onClick={handleLogout} className="w-full p-4 text-rose-500 font-black text-center">{t('menu.logout')}</button>
              ) : (
                <button onClick={handleLogin} className="w-full p-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">{t('menu.login_google')}</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-2" ref={mainRef}>
        {mode === AppMode.SELECTION ? (
          <div className="space-y-6">
            <PremiumDashboard 
              userName={progress.userName || t('child')} 
              onRename={renameUser}
            />
            
            <div className="space-y-6">
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
                  surahsInQuarter = [...surahsInQuarter].sort((a, b) => b.id - a.id);
                }
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
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner border-2 border-white/80 bg-white/40">
                          <img 
                            src={`/${quarter.id}.png`} 
                            alt={quarter.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=' + quarter.id; }}
                          />
                        </div>
                        <div className="text-left">
                          <h3 className={`text-md font-black leading-tight ${surahNameTextClasses[progress.theme]}`}>{quarter.name}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('surahs_count', { count: surahsInQuarter.length })}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-rose-100 text-rose-600' : 'bg-gray-100/50 text-gray-400'}`}>⌄</div>
                    </button>
                    {isExpanded && (
                      <div className="space-y-3 px-2 animate-in slide-in-from-top-4">
                        {surahsInQuarter.map(surah => (
                          <button key={surah.id} onClick={() => selectSurah(surah)} className="w-full bg-white/30 backdrop-blur-md p-4 rounded-[1.8rem] shadow-sm border border-white/40 active:border-rose-500 transition-all flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${progress.completedSurahs.includes(surah.id) ? 'bg-emerald-500/20 text-emerald-700' : 'bg-white/40 text-gray-400'}`}>
                                {surah.isSpecialVerse ? '💎' : surah.idString.replace(/^0+/, '')}
                              </div>
                              <div className="text-left">
                                <h4 className={`text-base font-black truncate ${surahNameTextClasses[progress.theme]}`}>{getSurahTitle(surah, i18nInstance.language)}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{getSurahSubtitle(surah, i18nInstance.language)}</p>
                              </div>
                            </div>
                            <span className="text-sm">{progress.completedSurahs.includes(surah.id) ? '✅' : '📖'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : mode === AppMode.LEARNING && selectedSurah ? (
          <div className="max-w-md mx-auto space-y-5 pb-10">
            <div className="flex items-center justify-between px-2">
              <button onClick={() => { setMode(AppMode.SELECTION); setIsAutoPlayingSurah(false); }} className="bg-white/80 px-4 py-1.5 rounded-full font-bold text-rose-700 text-sm">⬅ {t('back')}</button>
              <div className="flex-1 text-center">
                <h3 className={`text-xl font-black ${surahNameTextClasses[progress.theme]}`}>{getSurahTitle(selectedSurah, i18nInstance.language)}</h3>
              </div>
              <button onClick={() => setIsAutoPlayingSurah(!isAutoPlayingSurah)} className={`px-4 py-1.5 rounded-full font-bold text-xs ${isAutoPlayingSurah ? 'bg-rose-600 text-white' : 'bg-white text-gray-600'}`}>
                {isAutoPlayingSurah ? '⏹️' : '▶️'}
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
              <button onClick={() => setCurrentVerseIndex(v => v - 1)} disabled={currentVerseIndex === 0} className="flex-1 py-4 bg-white rounded-2xl font-black disabled:opacity-50">Précédent</button>
              <button onClick={nextVerse} className={`flex-1 py-4 text-white rounded-2xl font-black ${buttonClasses[progress.theme]}`}>
                {currentVerseIndex === selectedSurah.verses.length - 1 ? 'Valider ! 🏁' : 'Suivant ➡'}
              </button>
            </div>
            <Mascot verse={selectedSurah.verses[currentVerseIndex]} surahName={getSurahTitle(selectedSurah, i18nInstance.language)} theme={progress.theme} userName={progress.userName} isPremium={isPremium} />
          </div>
        ) : mode === AppMode.GAMES ? (
          <GamesSection progress={progress} setProgress={setProgress} onClose={() => setMode(AppMode.SELECTION)} theme={progress.theme} />
        ) : mode === AppMode.ADHKARS ? (
          <AdhkarsSection onBack={() => setMode(AppMode.SELECTION)} theme={progress.theme} />
        ) : mode === AppMode.BADGES ? (
          <div className="max-w-md mx-auto bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border-4 border-white">
            <div className="flex items-center justify-between mb-6">
               <h3 className={`text-xl font-black ${surahNameTextClasses[progress.theme]}`}>Mon Parcours</h3>
               <button onClick={() => setMode(AppMode.SELECTION)} className="text-rose-600 font-bold text-sm bg-white px-4 py-1.5 rounded-full shadow-sm">Fermer</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {BADGES_LIST.map(badge => (
                <div key={badge.id} className={`p-4 rounded-2xl flex flex-col items-center text-center ${progress.badges.includes(badge.id) ? 'bg-white shadow-md border-b-4 border-rose-500' : 'bg-gray-100 opacity-40'}`}>
                  <span className="text-4xl mb-2">{badge.emoji}</span>
                  <h4 className="text-xs font-black text-gray-800">{badge.name}</h4>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-rose-900/70 backdrop-blur-md p-6">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl border-[6px] border-yellow-400/50 flex flex-col items-center gap-5 text-center">
            <div className="text-7xl animate-bounce">🏆</div>
            <h2 className="text-3xl font-black text-rose-700 leading-tight">Macha Allah !</h2>
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-gray-700 font-medium">"{celebrationData.compliment}"</div>
            {celebrationData.badge && (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl border-2 border-yellow-300">{celebrationData.badge.emoji}</div>
                <p className="font-black text-sm text-yellow-600 uppercase tracking-widest mt-2">{celebrationData.badge.name}</p>
              </div>
            )}
            <button onClick={closeCelebration} className={`w-full py-5 rounded-[1.8rem] text-white text-xl font-black shadow-lg ${buttonClasses[progress.theme]}`}>Génial ! 🚀</button>
          </div>
        </div>
      )}

      {showParentalValidation && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-6 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 text-center mb-1">Espace Parents</h2>
            <p className="text-slate-500 text-center mb-6 text-sm">Entrez votre code pour valider la sourate.</p>
            <input type="password" inputMode="numeric" value={parentInput} onChange={(e) => setParentInput(e.target.value)} placeholder="•••••" className="w-full text-center py-4 bg-white rounded-xl border-2 border-slate-200 text-3xl font-black focus:border-rose-500 outline-none tracking-[0.5rem] mb-6" />
            <button onClick={handleParentConfirm} className="w-full py-5 bg-rose-600 text-white rounded-2xl text-lg font-black shadow-lg">Valider ✅</button>
            <button onClick={() => setShowParentalValidation(false)} className="w-full py-4 text-slate-400 font-bold text-sm">Annuler</button>
          </div>
        </div>
      )}

      {showThemePicker && (
        <ThemePicker currentTheme={progress.theme} isPremium={isPremium} onSelect={(theme) => { setProgress(p => ({ ...p, theme })); setShowThemePicker(false); }} onClose={() => setShowThemePicker(false)} />
      )}
      {showReciterPicker && (
        <ReciterPicker currentReciter={progress.reciter} isPremium={isPremium} onSelect={(reciter) => { setProgress(p => ({ ...p, reciter })); setShowReciterPicker(false); }} onClose={() => setShowReciterPicker(false)} />
      )}
      {showManual && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-blue-900/60 backdrop-blur-md p-4">
          <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-blue-800">Guide de l'application</h2>
              <button onClick={() => setShowManual(false)} className="text-gray-400 font-bold">✖</button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 whitespace-pre-wrap">{manualContent}</div>
            <button onClick={() => setShowManual(false)} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black">Fermer</button>
          </div>
        </div>
      )}

      <BottomNav currentMode={mode} onModeChange={setMode} theme={progress.theme} />
    </div>
  );
};

export default App;
