
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
import { generateCompliment } from './geminiService';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { BottomNav } from './components/BottomNav';
import { PremiumDashboard } from './components/Premium/PremiumDashboard';
import { PremiumLearning } from './components/Premium/PremiumLearning';
import { PremiumBadges } from './components/Premium/PremiumBadges';

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
  const [showTafsir, setShowTafsir] = useState(false);
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
      const validLng: 'fr' | 'ar' | 'en' = lng.startsWith('fr') ? 'fr' : lng.startsWith('ar') ? 'ar' : 'en';
      if (progress.preferredLanguage !== validLng) {
        setProgress(prev => ({ ...prev, preferredLanguage: validLng }));
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
    setShowTafsir(false);
    setMode(AppMode.LEARNING);
  };

  const nextVerse = () => {
    if (!selectedSurah) return;
    if (currentVerseIndex < selectedSurah.verses.length - 1) {
      setCurrentVerseIndex(v => v + 1);
      setShowTafsir(false);
    } else {
      handleParentConfirm();
    }
  };

  const handleVerseValidation = () => {
    if (!selectedSurah) return;
    const verse = selectedSurah.verses[currentVerseIndex];
    const verseId = `${selectedSurah.idString}-${verse.number.toString().padStart(3, '0')}`;
    if (!progress.completedVerses.includes(verseId)) {
      setProgress(p => ({
        ...p,
        completedVerses: [...p.completedVerses, verseId]
      }));
    }
  };

  const handleAutoNext = () => {
    if (selectedSurah && currentVerseIndex < selectedSurah.verses.length - 1) {
      setTimeout(() => {
          setCurrentVerseIndex(v => v + 1);
          setShowTafsir(false);
      }, 1000);
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

        const compliment = await generateCompliment(selectedSurah.name, isPremium, progress.userName, progress.gender, progress.preferredLanguage);
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

  if (!isAuthReady) return <Loader onComplete={() => {}} />;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${
      progress.theme === 'rose' ? 'bg-[#FFF5F7]' :
      progress.theme === 'emerald' ? 'bg-[#F0FDF4]' :
      progress.theme === 'amber' ? 'bg-[#FFFBEB]' :
      progress.theme === 'sky' ? 'bg-[#F0F9FF]' :
      progress.theme === 'indigo' ? 'bg-[#EEF2FF]' :
      'bg-[#F5F3FF]'
    } font-sans pb-24`}>


      {showMenu && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="bg-surface-container-low w-full max-w-md p-8 rounded-t-[3.5rem] shadow-2xl border-t border-surface-variant/30 relative overflow-hidden">
            <div className="w-12 h-1.5 bg-surface-variant/30 rounded-full mx-auto mb-8"></div>
            
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Paramètres 👋</h2>
              <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em]">Configuration App</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => { setShowThemePicker(true); setShowMenu(false); }} 
                className="group w-full p-6 bg-surface-container rounded-[2rem] border border-surface-variant/20 flex items-center justify-between hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">palette</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-on-surface">{t('menu.change_theme')}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Couleurs & Design</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30">chevron_right</span>
              </button>

              <button 
                onClick={() => { setShowReciterPicker(true); setShowMenu(false); }} 
                className="group w-full p-6 bg-surface-container rounded-[2rem] border border-surface-variant/20 flex items-center justify-between hover:border-secondary/40 hover:bg-secondary/5 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">mic</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-on-surface">{t('menu.change_reciter')}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Vois de récitateur</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30">chevron_right</span>
              </button>

              <button 
                onClick={() => { setShowManual(true); setShowMenu(false); }} 
                className="group w-full p-6 bg-surface-container rounded-[2rem] border border-surface-variant/20 flex items-center justify-between hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">menu_book</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-on-surface">{t('headings.manual_title')}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Guide Utilisateur</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30">chevron_right</span>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-surface-variant/20 space-y-4">
              {user ? (
                <button 
                  onClick={handleLogout} 
                  className="w-full py-5 rounded-[2rem] bg-surface-variant/10 text-rose-500 font-black text-sm uppercase tracking-widest hover:bg-rose-50 transition-colors"
                >
                  {t('menu.logout')}
                </button>
              ) : (
                <button 
                  onClick={handleLogin} 
                  className="w-full py-5 bg-primary text-on-primary rounded-[2rem] font-black shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  {t('menu.login_google')}
                </button>
              )}
              <button 
                onClick={() => setShowMenu(false)} 
                className="w-full py-4 text-on-surface-variant/60 font-black text-xs uppercase tracking-[0.2em] hover:text-on-surface transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-2" ref={mainRef}>
        {mode === AppMode.SELECTION ? (
          <div className="space-y-6">
            <PremiumDashboard 
              user={user}
              progress={progress}
              isPremium={isPremium}
              expandedQuarterId={expandedQuarterId}
              onAction={(action, data) => {
                if (action === 'openMenu') setShowMenu(true);
                if (action === 'renameUser') {
                    const newName = prompt(t('enter_name'), progress.userName);
                    if (newName) renameUser(newName);
                }
                if (action === 'selectQuarter') handleQuarterClick(data);
                if (action === 'selectSurah') selectSurah(data);
                if (action === 'changeTab') {
                    if (data === 'adhkars') setMode(AppMode.ADHKARS);
                    if (data === 'badges') setMode(AppMode.BADGES);
                    if (data === 'games') setMode(AppMode.GAMES);
                    if (data === 'home') setMode(AppMode.SELECTION);
                }
              }}
            />
            

          </div>
        ) : mode === AppMode.LEARNING && selectedSurah ? (
          <PremiumLearning
            surah={selectedSurah}
            currentVerseIndex={currentVerseIndex}
            theme={progress.theme}
            reciter={progress.reciter}
            fontSize={progress.fontSize}
            isAutoPlay={isAutoPlayingSurah}
            showTafsir={showTafsir}
            userName={progress.userName}
            isPremium={isPremium}
            onBack={() => { setMode(AppMode.SELECTION); setIsAutoPlayingSurah(false); }}
            onToggleAutoPlay={() => setIsAutoPlayingSurah(!isAutoPlayingSurah)}
            onPrevVerse={() => { setCurrentVerseIndex(v => v - 1); setShowTafsir(false); }}
            onNextVerse={nextVerse}
            onToggleTafsir={() => setShowTafsir(!showTafsir)}
            onValidateVerse={handleVerseValidation}
            onVerseEnded={handleAutoNext}
          />
        ) : mode === AppMode.GAMES ? (
          <GamesSection progress={progress} setProgress={setProgress} onClose={() => setMode(AppMode.SELECTION)} theme={progress.theme} />
        ) : mode === AppMode.ADHKARS ? (
          <AdhkarsSection onBack={() => setMode(AppMode.SELECTION)} theme={progress.theme} />
        ) : mode === AppMode.BADGES ? (
          <PremiumBadges progress={progress} onBack={() => setMode(AppMode.SELECTION)} />
        ) : null}
      </main>

      {/* Célébration Premium */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-500">
          <div className="bg-surface-container-low w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl border border-surface-variant/30 flex flex-col items-center gap-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse"></div>
            
            <div className="relative">
              <div className="text-7xl animate-bounce drop-shadow-xl">🏆</div>
              <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-on-surface leading-tight tracking-tight">Macha Allah !</h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Réussite Exceptionnelle</p>
            </div>

            <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10 text-on-surface-variant font-medium italic text-sm leading-relaxed">
              "{celebrationData.compliment}"
            </div>

            {celebrationData.badge && (
              <div className="flex flex-col items-center gap-3 p-4 bg-surface-container rounded-[2rem] border border-surface-variant/20 w-full">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center text-4xl border border-primary/20 shadow-inner">
                  {celebrationData.badge.emoji}
                </div>
                <div className="space-y-0.5">
                  <p className="font-black text-[10px] text-primary uppercase tracking-widest">Nouveau Badge</p>
                  <p className="text-sm font-black text-on-surface">{celebrationData.badge.name}</p>
                </div>
              </div>
            )}

            <button 
              onClick={closeCelebration} 
              className="w-full py-5 rounded-[2rem] bg-primary text-on-primary text-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Génial ! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Espace Parents Premium */}
      {showParentalValidation && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="bg-surface-container-low w-full max-w-md p-8 rounded-t-[3.5rem] sm:rounded-[3.5rem] shadow-2xl border-t sm:border border-surface-variant/30">
            <div className="w-12 h-1.5 bg-surface-variant/30 rounded-full mx-auto mb-8 sm:hidden"></div>
            
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">family_restroom</span>
              </div>
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Espace Parents</h2>
              <p className="text-on-surface-variant text-sm font-medium">Entrez votre code pour valider la sourate.</p>
            </div>

            <div className="relative mb-8">
              <input 
                type="password" 
                inputMode="numeric" 
                value={parentInput} 
                onChange={(e) => setParentInput(e.target.value)} 
                placeholder="•••••" 
                className="w-full text-center py-6 bg-surface-container rounded-3xl border border-surface-variant/30 text-4xl font-black text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none tracking-[0.75rem] transition-all" 
              />
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleParentConfirm} 
                className="w-full py-5 bg-primary text-on-primary rounded-[2rem] text-lg font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Valider ✅
              </button>
              <button 
                onClick={() => setShowParentalValidation(false)} 
                className="w-full py-4 text-on-surface-variant/60 font-black text-sm uppercase tracking-widest hover:text-on-surface transition-colors"
              >
                Annuler
              </button>
            </div>
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
