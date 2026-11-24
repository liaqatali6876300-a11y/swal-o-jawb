import React from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';
import { ALL_FATAWA, toUrduDigits } from '../data/fatawaData';
import { EXAM_QUESTIONS } from '../data/examQuestions';
import { ChapterId } from '../types/fatawa';

interface ChaptersViewProps {
  onSelectChapterForReading: (chapterId: ChapterId) => void;
  onSelectChapterForExam: (chapterId: ChapterId) => void;
}

export const ChaptersView: React.FC<ChaptersViewProps> = ({
  onSelectChapterForReading,
  onSelectChapterForExam,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B24] dark:text-emerald-300">
          فہرستِ ابواب (فتاویٰ رضویہ)
        </h1>
        <p className="mt-2 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
          ہر باب کے مسائل الگ سوال نمبر (۱ تا آخر) کے ساتھ ترتیب دیے گئے ہیں۔ کسی بھی باب کے سوال و جواب پڑھیں یا اس کا امتحان دیں۔
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CHAPTERS.map((chapter) => {
          const masailCount = ALL_FATAWA.filter((m) => m.chapterId === chapter.id).length;
          const examCount = EXAM_QUESTIONS.filter((q) => q.chapterId === chapter.id).length;

          return (
            <div
              key={chapter.id}
              className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#9A6B16] dark:text-amber-400 mb-2">
                  <span>باب {chapter.urduNum}</span>
                  <span aria-hidden="true">·</span>
                  <span>سوال نمبر ۱ تا {toUrduDigits(masailCount)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-gray-600 dark:text-gray-400">{chapter.volumeRange}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B3B24] dark:text-emerald-300 mb-2">
                  {chapter.title}
                </h2>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                  {chapter.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-950/8 dark:border-emerald-800/25">
                <button
                  type="button"
                  onClick={() => onSelectChapterForReading(chapter.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-sm sm:text-base font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>سوال و جواب پڑھیں</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectChapterForExam(chapter.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F3F7F4] dark:bg-[#1B2820] hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-[#0F5132] dark:text-emerald-300 text-sm sm:text-base font-bold inline-flex items-center gap-2 border border-emerald-950/10 dark:border-emerald-700/30 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>باب کا امتحان ({examCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
