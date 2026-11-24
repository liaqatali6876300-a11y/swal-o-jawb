import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Moon,
  Search,
  Sun,
  Type,
  X,
} from 'lucide-react';
import { CHAPTERS } from './data/chapters';
import { ALL_FATAWA, getMaslaById, searchFatawa } from './data/fatawaData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  ChapterId,
  ExamAttemptRecord,
  FontScale,
  FontStyle,
  MaslaItem,
} from './types/fatawa';
import { ActiveTab, Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MaslaCard } from './components/MaslaCard';
import { MaslaReaderModal } from './components/MaslaReaderModal';
import { ExamCenter } from './components/ExamCenter';
import { ChaptersView } from './components/ChaptersView';
import { SavedMasailView } from './components/SavedMasailView';
import { OfflineBanner } from './components/PWAInstallButton';

const QUICK_TOPICS = ['وضو', 'نماز', 'روزہ', 'زکوٰۃ', 'طلاق', 'سود', 'درود', 'سفر'];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('masail');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | 'all'>('all');
  const [examInitialChapter, setExamInitialChapter] = useState<ChapterId | 'all'>('all');

  const [savedIds, setSavedIds] = useLocalStorage<string[]>('fr_saved_masail', []);
  const [examHistory, setExamHistory] = useLocalStorage<ExamAttemptRecord[]>('fr_exam_history', []);
  const [fontScale, setFontScale] = useLocalStorage<FontScale>('fr_font_scale', 'large');
  const [fontStyle, setFontStyle] = useLocalStorage<FontStyle>('fr_font_style', 'bold-naskh');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('fr_dark_mode', false);

  const [readerMaslaId, setReaderMaslaId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const filteredMasail = useMemo(
    () => searchFatawa(searchQuery, selectedChapter),
    [searchQuery, selectedChapter]
  );

  const savedMasail = useMemo(
    () => ALL_FATAWA.filter((m) => savedIds.includes(m.id)),
    [savedIds]
  );

  const activeReaderMasla: MaslaItem | null = useMemo(
    () => (readerMaslaId ? getMaslaById(readerMaslaId) ?? null : null),
    [readerMaslaId]
  );

  const readerIndex = useMemo(() => {
    if (!readerMaslaId) return -1;
    return filteredMasail.findIndex((m) => m.id === readerMaslaId);
  }, [filteredMasail, readerMaslaId]);

  const toggleSaveMasla = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveExamAttempt = (record: ExamAttemptRecord) => {
    setExamHistory((prev) => [record, ...prev].slice(0, 30));
  };

  const handleSelectChapterFromOverview = (chapterId: ChapterId) => {
    setSelectedChapter(chapterId);
    setSearchQuery('');
    setActiveTab('masail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChapterForExam = (chapterId: ChapterId) => {
    setExamInitialChapter(chapterId);
    setActiveTab('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMaslaById = (maslaId: string) => {
    setReaderMaslaId(maslaId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F7] dark:bg-[#0D1410] text-[#111827] dark:text-[#F3F4F6] pb-16 md:pb-0">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedIds.length}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Workspace Utility & Appearance Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-950/10 dark:border-emerald-800/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-gray-700 dark:text-gray-300 ml-1">
              <Type className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" aria-hidden="true" />
              <span>حروف:</span>
            </span>
            <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35">
              {(
                [
                  { id: 'normal', label: 'عام' },
                  { id: 'large', label: 'موٹا و بڑا' },
                  { id: 'xlarge', label: 'بہت بڑا' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontScale(opt.id)}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    fontScale === opt.id
                      ? 'bg-[#0F5132] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35">
              <button
                type="button"
                onClick={() => setFontStyle('bold-naskh')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  fontStyle === 'bold-naskh'
                    ? 'bg-[#9A6B16] text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                موٹا خط
              </button>
              <button
                type="button"
                onClick={() => setFontStyle('nastaliq')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  fontStyle === 'nastaliq'
                    ? 'bg-[#9A6B16] text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                نستعلیق
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 text-sm font-bold text-gray-800 dark:text-gray-200 inline-flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>دن کا مطالعہ</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#0F5132]" aria-hidden="true" />
                  <span>رات کا مطالعہ</span>
                </>
              )}
            </button>

            {activeTab !== 'exam' && (
              <button
                type="button"
                onClick={() => {
                  setExamInitialChapter(selectedChapter);
                  setActiveTab('exam');
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#9A6B16] hover:bg-[#7C5510] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>امتحان دیں</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================== TAB 1: MASAIL Q&A & INSTANT SEARCH ======================== */}
        {activeTab === 'masail' && (
          <div className="space-y-6">
            {/* Hero & Instant Offline Search Box */}
            <section className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-5 sm:p-8">
              <div className="max-w-4xl">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B3B24] dark:text-emerald-300 leading-snug text-balance">
                  فتاویٰ رضویہ — سوال و جواب اور مستند احادیث کے حوالہ جات
                </h1>
                <p className="mt-2.5 text-base sm:text-xl font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                  بغیر عربی عبارت کے خالص اردو میں ہر مسئلے کا سوال، واضح جواب اور حدیثِ مبارکہ کا حوالہ۔ کوئی بھی مسئلہ تلاش کریں، فوراً آف لائن سامنے آ جائے گا۔
                </p>
              </div>

              {/* Instant Search Input */}
              <div className="mt-6 relative">
                <label htmlFor="masla-search" className="sr-only">
                  مسئلہ تلاش کریں
                </label>
                <div className="relative flex items-center">
                  <Search
                    className="w-6 h-6 text-[#0F5132] dark:text-emerald-400 absolute right-4 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="masla-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="مسئلہ یا سوال نمبر تلاش کریں... مثلاً: وضو، نماز، سوال نمبر ۲ (یا wuzu, namaz)"
                    className="w-full min-h-[56px] pr-13 pl-12 py-3.5 rounded-2xl bg-[#F6F8F6] dark:bg-[#0E1712] border-2 border-emerald-900/15 dark:border-emerald-700/40 focus:border-[#0F5132] dark:focus:border-emerald-400 text-lg sm:text-xl font-bold text-gray-950 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="تلاش صاف کریں"
                      className="absolute left-3 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Quick Search Shortcuts */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-gray-600 dark:text-gray-400 ml-1">
                    فوری تلاش:
                  </span>
                  {QUICK_TOPICS.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setSearchQuery(word)}
                      className="min-h-[36px] px-3.5 py-1 rounded-xl bg-[#F2F6F3] dark:bg-[#1B2820] hover:bg-[#0F5132] hover:text-white text-sm font-bold text-[#0F5132] dark:text-emerald-300 border border-emerald-950/10 dark:border-emerald-800/35 transition-colors cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Two-Column Desktop Layout: Chapters Sidebar + Masail Q&A List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Chapter Filter Column */}
              <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-4">
                <h2 className="text-lg font-extrabold text-[#0B3B24] dark:text-emerald-300 px-2 pb-3 mb-2 border-b border-emerald-950/10 dark:border-emerald-800/25">
                  ابوابِ فتاویٰ
                </h2>
                <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                  <button
                    type="button"
                    onClick={() => setSelectedChapter('all')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm sm:text-base font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                      selectedChapter === 'all'
                        ? 'bg-[#0F5132] text-white'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <span>تمام ابواب</span>
                    <span className="tabular-nums text-xs sm:text-sm opacity-90">
                      {ALL_FATAWA.length}
                    </span>
                  </button>

                  {CHAPTERS.map((ch) => {
                    const count = ALL_FATAWA.filter((m) => m.chapterId === ch.id).length;
                    const active = selectedChapter === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSelectedChapter(ch.id)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-sm sm:text-base font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer whitespace-nowrap shrink-0 lg:w-full ${
                          active
                            ? 'bg-[#0F5132] text-white'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                        }`}
                      >
                        <span className="truncate">
                          باب {ch.urduNum}: {ch.shortTitle}
                        </span>
                        <span className="tabular-nums text-xs sm:text-sm opacity-90">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Masail Feed */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="text-base sm:text-lg font-extrabold text-gray-800 dark:text-gray-200 tabular-nums">
                    {filteredMasail.length} مسائل ملے
                    {selectedChapter !== 'all' && (
                      <span className="text-[#9A6B16] dark:text-amber-400 mr-2">
                        · باب {CHAPTERS.find((c) => c.id === selectedChapter)?.urduNum} (
                        {CHAPTERS.find((c) => c.id === selectedChapter)?.shortTitle})
                      </span>
                    )}
                  </div>
                  {(searchQuery || selectedChapter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedChapter('all');
                      }}
                      className="min-h-[38px] px-3 py-1 rounded-lg text-sm font-bold text-[#0F5132] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer"
                    >
                      تمام مسائل دکھائیں
                    </button>
                  )}
                </div>

                {filteredMasail.length === 0 ? (
                  <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-10 text-center space-y-4">
                    <BookOpen className="w-10 h-10 text-[#9A6B16] dark:text-amber-400 mx-auto" aria-hidden="true" />
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                      اس تلاش سے کوئی مسئلہ نہیں ملا
                    </h2>
                    <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                      براہِ کرم کوئی دوسرا لفظ لکھیں (مثلاً: وضو، نماز، روزہ، زکوٰۃ، حج، نکاح، طلاق، سود)۔
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedChapter('all');
                      }}
                      className="min-h-[44px] px-6 py-2 rounded-xl bg-[#0F5132] text-white text-base font-bold cursor-pointer"
                    >
                      تلاش صاف کریں
                    </button>
                  </div>
                ) : (
                  filteredMasail.map((masla) => (
                    <MaslaCard
                      key={masla.id}
                      masla={masla}
                      isSaved={savedIds.includes(masla.id)}
                      onToggleSave={toggleSaveMasla}
                      onOpenDetail={(m) => setReaderMaslaId(m.id)}
                      fontScale={fontScale}
                      fontStyle={fontStyle}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================== TAB 2: EXAM CENTER ======================== */}
        {activeTab === 'exam' && (
          <ExamCenter
            initialChapter={examInitialChapter}
            examHistory={examHistory}
            onSaveAttempt={handleSaveExamAttempt}
            onOpenMaslaById={handleOpenMaslaById}
            fontStyle={fontStyle}
          />
        )}

        {/* ======================== TAB 3: CHAPTERS OVERVIEW ======================== */}
        {activeTab === 'chapters' && (
          <ChaptersView
            onSelectChapterForReading={handleSelectChapterFromOverview}
            onSelectChapterForExam={handleSelectChapterForExam}
          />
        )}

        {/* ======================== TAB 4: SAVED BOOKMARKS ======================== */}
        {activeTab === 'saved' && (
          <SavedMasailView
            savedMasail={savedMasail}
            savedIds={savedIds}
            onToggleSave={toggleSaveMasla}
            onOpenDetail={(m) => setReaderMaslaId(m.id)}
            onGoToMasail={() => setActiveTab('masail')}
            fontScale={fontScale}
            fontStyle={fontStyle}
          />
        )}
      </main>

      <footer className="border-t border-emerald-950/10 dark:border-emerald-800/30 bg-white/60 dark:bg-[#101814]/60 py-5 px-4 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
        فتاویٰ رضویہ — سوال و جواب و امتحانی ایپ · مستند اردو فقہی مسائل و احادیثِ مبارکہ کے حوالہ جات
      </footer>

      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedIds.length}
      />

      <OfflineBanner />

      <MaslaReaderModal
        masla={activeReaderMasla}
        onClose={() => setReaderMaslaId(null)}
        hasPrev={readerIndex > 0}
        hasNext={readerIndex >= 0 && readerIndex < filteredMasail.length - 1}
        onPrev={() => {
          if (readerIndex > 0) setReaderMaslaId(filteredMasail[readerIndex - 1].id);
        }}
        onNext={() => {
          if (readerIndex >= 0 && readerIndex < filteredMasail.length - 1) {
            setReaderMaslaId(filteredMasail[readerIndex + 1].id);
          }
        }}
        isSaved={activeReaderMasla ? savedIds.includes(activeReaderMasla.id) : false}
        onToggleSave={toggleSaveMasla}
        fontStyle={fontStyle}
      />
    </div>
  );
}
