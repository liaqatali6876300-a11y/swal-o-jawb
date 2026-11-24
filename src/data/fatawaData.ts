import { ChapterId, MaslaItem } from '../types/fatawa';
import { CHAPTERS } from './chapters';
import { FATAWA_PART_1 } from './fatawaPart1';
import { FATAWA_PART_2 } from './fatawaPart2';

const CHAPTER_NUMBER_MAP = new Map<ChapterId, string>(
  CHAPTERS.map((c) => [c.id, `باب ${c.urduNum}`])
);

export const ALL_FATAWA: MaslaItem[] = [...FATAWA_PART_1, ...FATAWA_PART_2].map((item) => ({
  ...item,
  chapterNumber: CHAPTER_NUMBER_MAP.get(item.chapterId) ?? 'باب ۱',
}));

const FATAWA_MAP = new Map<string, MaslaItem>(ALL_FATAWA.map((item) => [item.id, item]));

export function getMaslaById(id: string): MaslaItem | undefined {
  return FATAWA_MAP.get(id);
}

export function toUrduDigits(num: number): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? urduDigits[Number(ch)] : ch))
    .join('');
}

/**
 * Normalizes Urdu & Roman Urdu text (plus Urdu/English digits) for ultra-fast offline search.
 */
export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[أإآ]/g, 'ا')
    .replace(/[يك]/g, (ch) => (ch === 'ي' ? 'ی' : 'ک'))
    .replace(/[ةہھ]/g, 'ہ')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/\s+/g, ' ');
}

export function searchFatawa(
  query: string,
  chapterFilter: ChapterId | 'all' = 'all'
): MaslaItem[] {
  const base =
    chapterFilter === 'all'
      ? ALL_FATAWA
      : ALL_FATAWA.filter((item) => item.chapterId === chapterFilter);

  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return base;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);

  const scored = base
    .map((item) => {
      const qNorm = normalizeSearchText(item.question);
      const aNorm = normalizeSearchText(item.answer);
      const hNorm = normalizeSearchText(
        `${item.hadithRef.book} ${item.hadithRef.number} ${item.hadithRef.narration}`
      );
      const kNorm = item.keywords.map(normalizeSearchText).join(' ');
      const cNorm = normalizeSearchText(`${item.chapterNumber ?? ''} ${item.chapterTitle}`);
      const nNorm = normalizeSearchText(item.maslaNumber);
      const combined = `${nNorm} ${qNorm} ${kNorm} ${aNorm} ${hNorm} ${cNorm}`;

      const matchesAll = tokens.every((token) => combined.includes(token));
      if (!matchesAll) return null;

      let score = 0;
      if (nNorm.includes(normalizedQuery)) score += 12;
      if (qNorm.includes(normalizedQuery)) score += 10;
      if (kNorm.includes(normalizedQuery)) score += 8;
      for (const token of tokens) {
        if (nNorm.includes(token)) score += 5;
        if (qNorm.includes(token)) score += 4;
        if (kNorm.includes(token)) score += 3;
        if (aNorm.includes(token)) score += 2;
        if (hNorm.includes(token)) score += 1;
      }
      return { item, score };
    })
    .filter((entry): entry is { item: MaslaItem; score: number } => entry !== null);

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.item);
}
