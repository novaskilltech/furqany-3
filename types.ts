
export interface Verse {
  number: number;
  arabic: string;
  french: string;
}

export interface Surah {
  id: number;
  idString: string; // e.g. "001"
  name: string; // Transliteration
  frenchName: string;
  englishName?: string;
  arabicName?: string;
  verses: Verse[];
  isSpecialVerse?: boolean;
}

export interface Badge {
  id: string;
  name: string; // French name
  englishName?: string;
  arabicName?: string;
  emoji: string;
  description: string;
  englishDescription?: string;
  arabicDescription?: string;
}

export type AppTheme = 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky' | 'violet';
export type Reciter = 'hossary' | 'albanna';

export interface UserProgress {
  completedSurahs: number[];
  completedVerses: string[];
  badges: string[];
  streak: number;
  theme: AppTheme;
  reciter: Reciter;
  fontSize: number;
  activityLog: { [date: string]: boolean };
  unlockedQuarters: number[];
  gameStars: number;
  userName?: string;
  userAge?: number;
  gender?: 'boy' | 'girl';
  isPremium?: boolean;
  preferredLanguage?: 'fr' | 'ar' | 'en';
}

export enum AppMode {
  SELECTION = 'SELECTION',
  LEARNING = 'LEARNING',
  BADGES = 'BADGES',
  GAMES = 'GAMES',
  COMPLETED_LIST = 'COMPLETED_LIST',
  ADHKARS = 'ADHKARS'
}
