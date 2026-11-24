import React, { useState } from 'react';
import { Bookmark, Check, Copy, Maximize2, BookMarked } from 'lucide-react';
import { FontScale, FontStyle, MaslaItem } from '../types/fatawa';

interface MaslaCardProps {
  masla: MaslaItem;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetail: (masla: MaslaItem) => void;
  fontScale: FontScale;
  fontStyle: FontStyle;
}

export const MaslaCard: React.FC<MaslaCardProps> = ({
  masla,
  isSaved,
  onToggleSave,
  onOpenDetail,
  fontScale,
  fontStyle,
}) => {
  const [copied, setCopied] = useState(false);

  const questionSizeClass =
    fontScale === 'xlarge'
      ? 'text-2xl sm:text-[28px]'
      : fontScale === 'large'
        ? 'text-xl sm:text-2xl'
        : 'text-lg sm:text-xl';

  const answerSizeClass =
    fontScale === 'xlarge'
      ? 'text-xl sm:text-2xl'
      : fontScale === 'large'
        ? 'text-lg sm:text-[21px]'
        : 'text-base sm:text-lg';

  const hadithSizeClass =
    fontScale === 'xlarge'
      ? 'text-lg sm:text-xl'
      : fontScale === 'large'
        ? 'text-base sm:text-lg'
        : 'text-sm sm:text-base';

  const fontClass = fontStyle === 'nastaliq' ? 'font-urdu-display' : 'font-urdu-bold';

  const handleCopy = async () => {
    const baabLabel = masla.chapterNumber ? `${masla.chapterNumber} · ` : '';
    const formatted = `${baabLabel}${masla.chapterTitle} (${masla.maslaNumber})\n\n${masla.maslaNumber}: ${masla.question}\n\nجواب: ${masla.answer}\n\nحدیث کا حوالہ (${masla.hadithRef.book} - ${masla.hadithRef.number}): ${masla.hadithRef.narration}\n\nحوالہ: ${masla.fatawaRef}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <article className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-5 sm:p-7 transition-colors">
      {/* Unboxed inline metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-950/8 dark:border-emerald-800/25">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#9A6B16] dark:text-amber-400">
          {masla.chapterNumber && (
            <>
              <span>{masla.chapterNumber}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{masla.maslaNumber}</span>
          <span aria-hidden="true">·</span>
          <span>{masla.chapterTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="text-gray-600 dark:text-gray-400">{masla.fatawaRef}</span>
        </div>
      </div>

      {/* Question (سوال نمبر) */}
      <div className="mb-5">
        <h2
          className={`${questionSizeClass} ${fontClass} font-extrabold text-[#0B3B24] dark:text-emerald-300 leading-[1.9]`}
        >
          <span className="text-[#9A6B16] dark:text-amber-400 ml-2">{masla.maslaNumber}:</span>
          {masla.question}
        </h2>
      </div>

      {/* Answer (جواب) */}
      <div className="mb-6">
        <p
          className={`${answerSizeClass} ${fontClass} font-bold text-gray-900 dark:text-gray-100 leading-[2.0]`}
        >
          <span className="text-[#0F5132] dark:text-emerald-400 font-extrabold ml-2">جواب:</span>
          {masla.answer}
        </p>
      </div>

      {/* Hadith Reference Box (حدیثِ مبارکہ کا حوالہ) - no thick side borders */}
      <div className="rounded-xl bg-[#F3F7F4] dark:bg-[#101A14] border border-emerald-900/12 dark:border-emerald-700/30 p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-extrabold text-[#0F5132] dark:text-emerald-400 mb-2">
          <BookMarked className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>حدیثِ مبارکہ کا حوالہ</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#9A6B16] dark:text-amber-400">{masla.hadithRef.book}</span>
          <span aria-hidden="true">·</span>
          <span className="text-gray-700 dark:text-gray-300">{masla.hadithRef.number}</span>
        </div>
        <p
          className={`${hadithSizeClass} ${fontClass} font-semibold text-gray-800 dark:text-gray-200 leading-[1.95]`}
        >
          {masla.hadithRef.narration}
        </p>
      </div>

      {/* Functional Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(masla.id)}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isSaved
                ? 'bg-[#0F5132] text-white border-[#0F5132]'
                : 'bg-white dark:bg-[#19261F] text-gray-800 dark:text-gray-200 border-emerald-950/15 dark:border-emerald-700/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
            }`}
          >
            <Bookmark className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{isSaved ? 'محفوظ شدہ' : 'محفوظ کریں'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[42px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 bg-white dark:bg-[#19261F] text-gray-800 dark:text-gray-200 border border-emerald-950/15 dark:border-emerald-700/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span>نقل ہو گیا</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>نقل کریں</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(masla)}
          className="min-h-[42px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 text-[#0F5132] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Maximize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>بڑے صفحے پر پڑھیں</span>
        </button>
      </div>
    </article>
  );
};
