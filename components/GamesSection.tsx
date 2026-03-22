import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppTheme, UserProgress } from '../types';
import { SHORT_SURAHS } from '../constants';

interface GamesSectionProps {
  progress: UserProgress;
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  onClose: () => void;
  theme: AppTheme;
}

const EMOJIS = ['🌟', '🌙', '🕌', '🍯', '🕊️', '📖', '🛡️', '🌴'];

export const GamesSection: React.FC<GamesSectionProps> = ({ progress, setProgress, onClose, theme }) => {
  const { t } = useTranslation();
  const [currentGame, setCurrentGame] = useState<'selection' | 'memory' | 'puzzle' | 'math' | 'sequence'>('selection');
  const [memoryCards, setMemoryCards] = useState<{ id: number, emoji: string, flipped: boolean, solved: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [puzzleData, setPuzzleData] = useState<{ verse: string, missingWord: string, options: string[] } | null>(null);
  const [mathData, setMathData] = useState<{ question: string, answer: number, options: number[] } | null>(null);
  const [sequenceData, setSequenceData] = useState<{ currentVerse: string, nextVerse: string, options: string[] } | null>(null);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(114);
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setIsError(true);
    setTimeout(() => {
      setFeedback(null);
      setIsError(false);
    }, 2500);
  };

  const startMemory = () => {
    const cards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, flipped: false, solved: false }));
    setMemoryCards(cards);
    setCurrentGame('memory');
  };

  const startPuzzle = () => {
    let pool = SHORT_SURAHS;
    if (isRangeEnabled) {
      pool = SHORT_SURAHS.filter(s => s.id >= rangeStart && s.id <= rangeEnd);
    } else {
      const learnedSurahs = SHORT_SURAHS.filter(s => progress.completedSurahs.includes(s.id));
      if (learnedSurahs.length > 0) pool = learnedSurahs;
      else pool = SHORT_SURAHS.slice(0, 5);
    }

    if (pool.length === 0) {
      triggerFeedback(t('none_in_range'));
      return;
    }

    const surah = pool[Math.floor(Math.random() * pool.length)];
    const verse = surah.verses[Math.floor(Math.random() * surah.verses.length)];
    const words = verse.arabic.split(' ').filter(w => w.length > 2);
    if (words.length === 0) { startPuzzle(); return; }
    
    const missingWord = words[Math.floor(Math.random() * words.length)];
    const displayVerse = verse.arabic.replace(missingWord, '_______');
    
    const distractors = ['اللَّهُ', 'الْحَمْدُ', 'نَعْبُدُ', 'الرَّحْمَنِ', 'مَالِكِ', 'الصِّرَاطَ'];
    const options = [missingWord, ...distractors.filter(d => d !== missingWord).sort(() => 0.5 - Math.random()).slice(0, 3)]
      .sort(() => Math.random() - 0.5);
      
    setPuzzleData({ verse: displayVerse, missingWord, options });
    setCurrentGame('puzzle');
  };

  const startSequence = () => {
    let pool = SHORT_SURAHS;
    if (isRangeEnabled) {
      pool = SHORT_SURAHS.filter(s => s.id >= rangeStart && s.id <= rangeEnd);
    } else {
      const learnedSurahs = SHORT_SURAHS.filter(s => progress.completedSurahs.includes(s.id));
      if (learnedSurahs.length > 0) pool = learnedSurahs;
      else pool = SHORT_SURAHS.slice(0, 5);
    }

    if (pool.length === 0) {
      triggerFeedback(t('none_in_range'));
      return;
    }

    const eligibleSurahs = pool.filter(s => s.verses.length >= 2);
    if (eligibleSurahs.length === 0) {
      triggerFeedback(t('not_enough_verses'));
      return;
    }

    const surah = eligibleSurahs[Math.floor(Math.random() * eligibleSurahs.length)];
    const idx = Math.floor(Math.random() * (surah.verses.length - 1));
    const currentVerse = surah.verses[idx].arabic;
    const nextVerse = surah.verses[idx+1].arabic;
    
    const distractors = SHORT_SURAHS.flatMap(s => s.verses)
      .map(v => v.arabic)
      .filter(v => v !== nextVerse)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    setSequenceData({ 
      currentVerse, 
      nextVerse, 
      options: [nextVerse, ...distractors].sort(() => Math.random() - 0.5) 
    });
    setCurrentGame('sequence');
  };

  const startMath = () => {
    const isAddition = Math.random() > 0.5;
    let n1, n2, ans, q;
    if (isAddition) {
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
      ans = n1 + n2;
      q = `${n1} + ${n2}`;
    } else {
      n1 = Math.floor(Math.random() * 15) + 5;
      n2 = Math.floor(Math.random() * n1) + 1;
      ans = n1 - n2;
      q = `${n1} - ${n2}`;
    }
    const options = new Set<number>();
    options.add(ans);
    while (options.size < 4) {
      const wrong = Math.max(0, ans + (Math.floor(Math.random() * 7) - 3));
      if (wrong !== ans) options.add(wrong);
    }
    setMathData({ question: q, answer: ans, options: Array.from(options).sort(() => Math.random() - 0.5) });
    setCurrentGame('math');
  };

  const awardStar = () => {
    setProgress(prev => ({
      ...prev,
      gameStars: (prev.gameStars || 0) + 1
    }));
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || memoryCards[id].flipped || memoryCards[id].solved) return;
    const newCards = [...memoryCards];
    newCards[id].flipped = true;
    setMemoryCards(newCards);
    setFlippedCards([...flippedCards, id]);
    if (flippedCards.length === 1) {
      const firstId = flippedCards[0];
      if (newCards[firstId].emoji === newCards[id].emoji) {
        setTimeout(() => {
          newCards[firstId].solved = true;
          newCards[id].solved = true;
          setMemoryCards([...newCards]);
          setFlippedCards([]);
          if (newCards.every(c => c.solved)) { 
            awardStar();
          }
        }, 500);
      } else {
        setTimeout(() => {
          newCards[firstId].flipped = false;
          newCards[id].flipped = false;
          setMemoryCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handlePuzzleSelect = (word: string) => {
    if (word === puzzleData?.missingWord) {
      awardStar();
      startPuzzle();
    } else triggerFeedback(t('try_again'));
  };

  const handleMathSelect = (val: number) => {
    if (val === mathData?.answer) {
      awardStar();
      startMath();
    } else triggerFeedback(t('try_again_soft'));
  };

  const handleSequenceSelect = (verse: string) => {
    if (verse === sequenceData?.nextVerse) {
      awardStar();
      startSequence();
    } else triggerFeedback(t('not_quite'));
  };

  return (
    <div className={`bg-surface-container-low rounded-[3rem] p-8 shadow-sm border border-surface-variant/30 animate-in zoom-in duration-700 min-h-[500px] flex flex-col relative overflow-hidden ${isError ? 'animate-shake' : ''}`}>
      {/* Game Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-2xl font-black text-on-surface tracking-tight">{t('games_title')}</h3>
        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface/40 hover:text-on-surface active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {feedback && (
        <div className="absolute top-24 left-8 right-8 z-20 animate-in slide-in-from-top-4">
          <div className="p-4 rounded-[1.5rem] bg-error-container text-on-error-container border border-error/20 shadow-lg text-center font-black text-sm uppercase tracking-widest">
            {feedback}
          </div>
        </div>
      )}

      {currentGame === 'selection' && (
        <div className="flex flex-col gap-6 flex-1 relative z-10">
          {/* Range Bento Section */}
          <div className="bg-surface-container-highest/30 p-6 rounded-[2rem] border border-surface-variant/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">target</span>
                {t('game_range.title')}
              </span>
              <button 
                onClick={() => setIsRangeEnabled(!isRangeEnabled)}
                className={`w-14 h-8 rounded-full transition-all relative p-1 ${isRangeEnabled ? 'bg-primary' : 'bg-surface-variant'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-sm ${isRangeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {isRangeEnabled && (
              <div className="flex items-center gap-4 animate-in slide-in-from-top-2 duration-500">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface/40 ml-1">{t('game_range.from')}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={rangeEnd} 
                    value={rangeStart} 
                    onChange={(e) => setRangeStart(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-12 bg-surface-container-lowest rounded-xl border border-surface-variant/30 text-sm font-black focus:outline-none focus:border-primary transition-all text-center"
                  />
                </div>
                <div className="pt-6 text-surface-variant">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface/40 ml-1">{t('game_range.to')}</label>
                  <input 
                    type="number" 
                    min={rangeStart} 
                    max="114" 
                    value={rangeEnd} 
                    onChange={(e) => setRangeEnd(Math.min(114, parseInt(e.target.value) || 114))}
                    className="w-full h-12 bg-surface-container-lowest rounded-xl border border-surface-variant/30 text-sm font-black focus:outline-none focus:border-primary transition-all text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 flex-1 no-scrollbar">
            <button onClick={startMemory} className="p-6 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-[2.5rem] border border-primary/20 flex items-center justify-between group active:scale-98 transition-all">
              <div className="flex items-center gap-5 text-left">
                <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-3xl">extension</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-on-surface">{t('game_memory')}</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Niveau Débutant</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/40 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>

            <button onClick={startPuzzle} className="p-6 bg-gradient-to-tr from-secondary/10 to-secondary/5 rounded-[2.5rem] border border-secondary/20 flex items-center justify-between group active:scale-98 transition-all">
              <div className="flex items-center gap-5 text-left">
                <div className="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-lg shadow-secondary/20">
                  <span className="material-symbols-outlined text-3xl">edit_note</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-on-surface">{t('game_words')}</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Intermédiaire</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary/40 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>

            <button onClick={startSequence} className="p-6 bg-gradient-to-tr from-tertiary/10 to-tertiary/5 rounded-[2.5rem] border border-tertiary/20 flex items-center justify-between group active:scale-98 transition-all">
              <div className="flex items-center gap-5 text-left">
                <div className="w-16 h-16 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg shadow-tertiary/20">
                  <span className="material-symbols-outlined text-3xl">auto_stories</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-on-surface">{t('game_sequence')}</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Avancé</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary/40 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>

            <button onClick={startMath} className="p-6 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-[2.5rem] border border-primary/20 flex items-center justify-between group active:scale-98 transition-all">
              <div className="flex items-center gap-5 text-left">
                <div className="w-16 h-16 rounded-2xl bg-on-surface text-surface flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl">calculate</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-on-surface">{t('game_math')}</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Défis Quotidien</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface/40 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {currentGame === 'memory' && (
        <div className="flex flex-col items-center flex-1 justify-center animate-in zoom-in duration-500">
          <div className="grid grid-cols-4 gap-3 mb-10">
            {memoryCards.map(card => (
              <button 
                key={card.id} 
                onClick={() => handleCardClick(card.id)} 
                className={`w-16 h-16 rounded-2xl text-2xl flex items-center justify-center transition-all duration-500 shadow-sm border border-surface-variant/30 ${card.flipped || card.solved ? 'bg-surface-container-lowest rotate-0' : 'bg-primary rotate-y-180'}`}
              >
                {(card.flipped || card.solved) ? card.emoji : (
                   <span className="material-symbols-outlined text-on-primary">star</span>
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCurrentGame('selection')} 
            className="h-14 px-10 rounded-[2rem] bg-surface-container-high font-black text-xs uppercase tracking-widest text-on-surface/40 active:scale-95 transition-all"
          >
            {t('games_back')}
          </button>
        </div>
      )}

      {currentGame === 'puzzle' && puzzleData && (
        <div className="flex flex-col items-center gap-6 text-center flex-1 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 w-full mb-4">
            <p className="text-3xl quran-text text-on-surface leading-loose drop-shadow-sm" dir="rtl">{puzzleData.verse}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            {puzzleData.options.map(opt => (
              <button 
                key={opt} 
                onClick={() => handlePuzzleSelect(opt)} 
                className="h-20 bg-surface-container-low rounded-2xl border border-surface-variant/30 text-2xl quran-text font-bold active:bg-primary active:text-on-primary hover:border-primary/40 transition-all shadow-sm flex items-center justify-center"
              >
                {opt}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCurrentGame('selection')} 
            className="mt-4 h-14 px-10 rounded-[2rem] bg-surface-container-high font-black text-xs uppercase tracking-widest text-on-surface/40"
          >
            {t('games_back')}
          </button>
        </div>
      )}

      {currentGame === 'math' && mathData && (
        <div className="flex flex-col items-center gap-6 text-center flex-1 justify-center animate-in zoom-in-95 duration-500">
          <div className="bg-primary/5 p-12 rounded-[3rem] border-2 border-primary/10 shadow-inner w-full mb-4">
            <p className="text-6xl font-black text-primary tracking-tighter">{mathData.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            {mathData.options.map(opt => (
              <button 
                key={opt} 
                onClick={() => handleMathSelect(opt)} 
                className="h-20 bg-surface-container-low rounded-2xl border border-surface-variant/30 text-3xl font-black text-on-surface active:bg-primary active:text-on-primary transition-all shadow-sm"
              >
                {opt}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCurrentGame('selection')} 
            className="mt-4 h-14 px-10 rounded-[2rem] bg-surface-container-high font-black text-xs uppercase tracking-widest text-on-surface/40"
          >
            {t('games_back')}
          </button>
        </div>
      )}

      {currentGame === 'sequence' && sequenceData && (
        <div className="flex flex-col items-center gap-6 text-center flex-1 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 w-full mb-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">{t('next_verse_q')}</span>
            <p className="text-3xl quran-text text-on-surface leading-loose" dir="rtl">{sequenceData.currentVerse}</p>
          </div>
          <div className="grid gap-3 w-full">
            {sequenceData.options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleSequenceSelect(opt)} 
                className="p-5 bg-surface-container-low rounded-2xl border border-surface-variant/30 text-xl quran-text active:bg-primary active:text-on-primary transition-all shadow-sm leading-relaxed text-right" 
                dir="rtl"
              >
                {opt}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCurrentGame('selection')} 
            className="mt-4 h-14 px-10 rounded-[2rem] bg-surface-container-high font-black text-xs uppercase tracking-widest text-on-surface/40"
          >
            {t('games_back')}
          </button>
        </div>
      )}
    </div>
  );
};
