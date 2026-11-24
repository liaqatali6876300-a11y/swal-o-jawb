export type ChapterId =
  | 'taharat'
  | 'namaz'
  | 'roza'
  | 'zakat'
  | 'hajj'
  | 'nikah'
  | 'muamalat'
  | 'aqaid';

export interface ChapterInfo {
  id: ChapterId;
  number: string;
  urduNum: string;
  title: string;
  shortTitle: string;
  description: string;
  volumeRange: string;
}

export interface HadithReference {
  book: string;
  number: string;
  narration: string;
}

export interface MaslaItem {
  id: string;
  chapterId: ChapterId;
  chapterNumber?: string;
  chapterTitle: string;
  maslaNumber: string;
  question: string;
  answer: string;
  hadithRef: HadithReference;
  fatawaRef: string;
  keywords: string[];
}

export interface ExamQuestion {
  id: string;
  maslaId: string;
  chapterId: ChapterId;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface ExamAttemptRecord {
  id: string;
  dateISO: string;
  chapterId: ChapterId | 'all';
  chapterTitle: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  durationSeconds: number;
}

export type FontScale = 'normal' | 'large' | 'xlarge';
export type FontStyle = 'bold-naskh' | 'nastaliq';
