
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppTheme, UserProgress, Surah } from '../types';
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
    
    // Get distractors from other verses or surahs
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

  const themeColors = {
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    gold: 'text-amber-600 bg-amber-50 border-amber-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border-4 border-white animate-in zoom-in duration-300 min-h-[450px] flex flex-col relative overflow-hidden ${isError ? 'animate-shake' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-black ${theme === 'rose' ? 'text-rose-800' : 'text-emerald-800'}`}>{t('games_title')}</h3>
        <button onClick={onClose} className="bg-gray-100 px-4 py-1.5 rounded-full font-bold text-gray-500 text-sm active:scale-95">{t('games_exit')}</button>
      </div>

      {feedback && (
        <div className="absolute top-16 left-4 right-4 z-20 animate-in slide-in-from-top-2">
          <div className={`p-3 rounded-xl border-2 shadow-lg text-center font-bold text-sm ${themeColors[theme]}`}>
            {feedback}
          </div>
        </div>
      )}

      {currentGame === 'selection' && (
        <div className="flex flex-col gap-4 flex-1">
          {/* Range Selector */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                🎯 {t('game_range.title')}
              </span>
              <button 
                onClick={() => setIsRangeEnabled(!isRangeEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${isRangeEnabled ? (theme === 'rose' ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRangeEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {isRangeEnabled && (
              <div className="flex items-center gap-3 animate-in slide-in-from-top-1">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('game_range.from')}</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={rangeEnd} 
                    value={rangeStart} 
                    onChange={(e) => setRangeStart(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-emerald-300 transition-all text-center shadow-sm"
                  />
                </div>
                <div className="pt-4 text-slate-300">➡</div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('game_range.to')}</label>
                  <input 
                    type="number" 
                    min={rangeStart} 
                    max="114" 
                    value={rangeEnd} 
                    onChange={(e) => setRangeEnd(Math.min(114, parseInt(e.target.value) || 114))}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-emerald-300 transition-all text-center shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 overflow-y-auto pr-1">
            <button onClick={startMemory} className={`p-5 bg-gradient-to-r ${theme === 'rose' ? 'from-rose-400 to-pink-500' : 'from-emerald-400 to-teal-500'} text-white rounded-[1.8rem] shadow-md flex items-center justify-between active:scale-95 transition-transform`}>
            <div className="text-left"><span className="text-3xl">🧩</span><h4 className="text-lg font-black mt-1">{t('game_memory')}</h4></div>
            <div className="bg-white/20 p-2 rounded-full">➡</div>
          </button>
          <button onClick={startPuzzle} className="p-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-[1.8rem] shadow-md flex items-center justify-between active:scale-95 transition-transform">
            <div className="text-left"><span className="text-3xl">📝</span><h4 className="text-lg font-black mt-1">{t('game_words')}</h4></div>
            <div className="bg-white/20 p-2 rounded-full">➡</div>
          </button>
          <button onClick={startSequence} className="p-5 bg-gradient-to-r from-purple-400 to-indigo-500 text-white rounded-[1.8rem] shadow-md flex items-center justify-between active:scale-95 transition-transform">
            <div className="text-left"><span className="text-3xl">📖</span><h4 className="text-lg font-black mt-1">{t('game_sequence')}</h4></div>
            <div className="bg-white/20 p-2 rounded-full">➡</div>
          </button>
          <button onClick={startMath} className="p-5 bg-gradient-to-r from-indigo-400 to-blue-500 text-white rounded-[1.8rem] shadow-md flex items-center justify-between active:scale-95 transition-transform">
            <div className="text-left"><span className="text-3xl">🔢</span><h4 className="text-lg font-black mt-1">{t('game_math')}</h4></div>
            <div className="bg-white/20 p-2 rounded-full">➡</div>
          </button>
        </div>
      </div>
      )}

      {currentGame === 'memory' && (
        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="grid grid-cols-4 gap-2 mb-6">
            {memoryCards.map(card => (
              <button key={card.id} onClick={() => handleCardClick(card.id)} className={`w-14 h-14 rounded-xl text-xl flex items-center justify-center transition-all duration-300 shadow-sm ${card.flipped || card.solved ? 'bg-white' : `${theme === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`}`}>
                {(card.flipped || card.solved) ? card.emoji : '❓'}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentGame('selection')} className="text-gray-400 font-bold text-sm bg-gray-50 px-6 py-2 rounded-full">{t('games_back')}</button>
        </div>
      )}

      {currentGame === 'puzzle' && puzzleData && (
        <div className="flex flex-col items-center gap-4 text-center flex-1">
          <div className="bg-slate-50 p-4 rounded-2xl border border-emerald-50 w-full mb-2">
            <p className="text-2xl quran-text text-gray-800 leading-normal">{puzzleData.verse}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {puzzleData.options.map(opt => (
              <button key={opt} onClick={() => handlePuzzleSelect(opt)} className="py-4 bg-white rounded-xl border border-emerald-100 text-xl font-bold active:bg-emerald-50 shadow-sm">
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentGame('selection')} className="text-gray-400 font-bold text-sm bg-gray-50 px-6 py-2 rounded-full mt-2">{t('games_back')}</button>
        </div>
      )}

      {currentGame === 'math' && mathData && (
        <div className="flex flex-col items-center gap-4 text-center flex-1 justify-center">
          <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-white shadow-inner w-full mb-2">
            <p className="text-5xl font-black text-indigo-600">{mathData.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {mathData.options.map(opt => (
              <button key={opt} onClick={() => handleMathSelect(opt)} className="py-5 bg-white rounded-2xl border border-indigo-50 text-2xl font-black text-indigo-700 active:bg-indigo-50 shadow-sm">
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentGame('selection')} className="text-indigo-400 font-bold text-sm bg-indigo-50 px-6 py-2 rounded-full mt-2">{t('games_back')}</button>
        </div>
      )}
      {currentGame === 'sequence' && sequenceData && (
        <div className="flex flex-col items-center gap-4 text-center flex-1">
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 w-full mb-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{t('next_verse_q')}</span>
            <p className="text-2xl quran-text text-gray-800 leading-normal mt-2">{sequenceData.currentVerse}</p>
          </div>
          <div className="grid gap-2 w-full">
            {sequenceData.options.map((opt, i) => (
              <button key={i} onClick={() => handleSequenceSelect(opt)} className="p-3 bg-white rounded-xl border border-purple-50 text-lg quran-text active:bg-purple-50 shadow-sm leading-relaxed">
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentGame('selection')} className="text-gray-400 font-bold text-sm bg-gray-50 px-6 py-2 rounded-full mt-2">{t('games_back')}</button>
        </div>
      )}
    </div>
  );
};
