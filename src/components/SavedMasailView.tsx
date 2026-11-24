import React from 'react';
import { Bookmark, BookOpen } from 'lucide-react';
import { FontScale, FontStyle, MaslaItem } from '../types/fatawa';
import { MaslaCard } from './MaslaCard';

interface SavedMasailViewProps {
  savedMasail: MaslaItem[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenDetail: (masla: MaslaItem) => void;
  onGoToMasail: () => void;
  fontScale: FontScale;
  fontStyle: FontStyle;
}

export const SavedMasailView: React.FC<SavedMasailViewProps> = ({
  savedMasail,
  savedIds,
  onToggleSave,
  onOpenDetail,
  onGoToMasail,
  fontScale,
  fontStyle,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B24] dark:text-emerald-300">
          محفوظ شدہ مسائل
        </h1>
        <p className="mt-2 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
          آپ کے محفوظ کردہ تمام مسائل ہمیشہ آف لائن یہاں دستیاب رہیں گے۔
        </p>
      </div>

      {savedMasail.length === 0 ? (
        <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-10 text-center space-y-4">
          <Bookmark className="w-10 h-10 text-[#9A6B16] dark:text-amber-400 mx-auto" aria-hidden="true" />
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            ابھی کوئی مسئلہ محفوظ نہیں کیا گیا
          </h2>
          <p className="text-base font-semibold text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            کسی بھی مسئلے کے نیچے "محفوظ کریں" بٹن پر کلک کریں تاکہ آپ اسے فوری دہرائی کے لیے یہاں محفوظ رکھ سکیں۔
          </p>
          <button
            type="button"
            onClick={onGoToMasail}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-base font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>مسائل دیکھیں</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {savedMasail.map((masla) => (
            <MaslaCard
              key={masla.id}
              masla={masla}
              isSaved={savedIds.includes(masla.id)}
              onToggleSave={onToggleSave}
              onOpenDetail={onOpenDetail}
              fontScale={fontScale}
              fontStyle={fontStyle}
            />
          ))}
        </div>
      )}
    </section>
  );
};
