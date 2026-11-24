import React, { useEffect, useState } from 'react';
import { Bookmark, BookMarked, Check, ChevronLeft, ChevronRight, Copy, X } from 'lucide-react';
import { FontStyle, MaslaItem } from '../types/fatawa';

interface MaslaReaderModalProps {
  masla: MaslaItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  fontStyle: FontStyle;
}

export const MaslaReaderModal: React.FC<MaslaReaderModalProps> = ({
  masla,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isSaved,
  onToggleSave,
  fontStyle,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!masla) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [masla, onClose]);

  if (!masla) return null;

  const fontClass = fontStyle === 'nastaliq' ? 'font-urdu-display' : 'font-urdu-bold';

  const handleCopy = async () => {
    const baabLabel = masla.chapterNumber ? `${masla.chapterNumber} · ` : '';
    const formatted = `${baabLabel}${masla.chapterTitle} (${masla.maslaNumber})\n\n${masla.maslaNumber}: ${masla.question}\n\nجواب: ${masla.answer}\n\nحدیث کا حوالہ (${masla.hadithRef.book} - ${masla.hadithRef.number}): ${masla.hadithRef.narration}\n\nحوالہ: ${masla.fatawaRef}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#FAF9F6] dark:bg-[#121D17] border border-emerald-950/15 dark:border-emerald-700/40 shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white dark:bg-[#16231C] border-b border-emerald-950/10 dark:border-emerald-800/30">
          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-[#9A6B16] dark:text-amber-400">
            {masla.chapterNumber && (
              <>
                <span>{masla.chapterNumber}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>{masla.maslaNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{masla.chapterTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="بند کریں"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Bold Reading Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          <h2
            id="reader-modal-title"
            className={`text-2xl sm:text-3xl ${fontClass} font-extrabold text-[#0B3B24] dark:text-emerald-300 leading-[1.95]`}
          >
            <span className="text-[#9A6B16] dark:text-amber-400 ml-2">{masla.maslaNumber}:</span>
            {masla.question}
          </h2>

          <div className="h-px bg-emerald-950/10 dark:bg-emerald-800/30" />

          <p
            className={`text-xl sm:text-2xl ${fontClass} font-bold text-gray-900 dark:text-gray-100 leading-[2.05]`}
          >
            <span className="text-[#0F5132] dark:text-emerald-400 font-extrabold ml-2">جواب:</span>
            {masla.answer}
          </p>

          <div className="rounded-2xl bg-[#EEF4F0] dark:bg-[#0E1812] border border-emerald-900/15 dark:border-emerald-700/35 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-extrabold text-[#0F5132] dark:text-emerald-400 mb-3">
              <BookMarked className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>حدیثِ مبارکہ کا حوالہ</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#9A6B16] dark:text-amber-400">{masla.hadithRef.book}</span>
              <span aria-hidden="true">·</span>
              <span className="text-gray-700 dark:text-gray-300">{masla.hadithRef.number}</span>
            </div>
            <p
              className={`text-lg sm:text-xl ${fontClass} font-semibold text-gray-800 dark:text-gray-200 leading-[2.0]`}
            >
              {masla.hadithRef.narration}
            </p>
          </div>

          <p className="text-base font-bold text-gray-600 dark:text-gray-400">
            ماخذ: {masla.fatawaRef}
          </p>
        </div>

        {/* Footer Actions & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-[#16231C] border-t border-emerald-950/10 dark:border-emerald-800/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(masla.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 border cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-[#0F5132] text-white border-[#0F5132]'
                  : 'bg-white dark:bg-[#1C2A23] text-gray-800 dark:text-gray-200 border-emerald-950/15 dark:border-emerald-700/40'
              }`}
            >
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              <span>{isSaved ? 'محفوظ شدہ' : 'محفوظ کریں'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 bg-white dark:bg-[#1C2A23] text-gray-800 dark:text-gray-200 border border-emerald-950/15 dark:border-emerald-700/40 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#0F5132]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'نقل ہو گیا' : 'نقل کریں'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 bg-[#F2F5F3] dark:bg-[#1C2A23] text-gray-900 dark:text-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <span>پچھلا مسئلہ</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 bg-[#0F5132] text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>اگلا مسئلہ</span>
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
