import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookMarked,
  CheckCircle2,
  Clock,
  GraduationCap,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { CHAPTERS } from '../data/chapters';
import { EXAM_QUESTIONS } from '../data/examQuestions';
import { getMaslaById, toUrduDigits } from '../data/fatawaData';
import { ChapterId, ExamAttemptRecord, ExamQuestion, FontStyle } from '../types/fatawa';

interface ExamCenterProps {
  initialChapter: ChapterId | 'all';
  examHistory: ExamAttemptRecord[];
  onSaveAttempt: (record: ExamAttemptRecord) => void;
  onOpenMaslaById: (maslaId: string) => void;
  fontStyle: FontStyle;
}

type ExamPhase = 'setup' | 'active' | 'results';

interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const ExamCenter: React.FC<ExamCenterProps> = ({
  initialChapter,
  examHistory,
  onSaveAttempt,
  onOpenMaslaById,
  fontStyle,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | 'all'>(initialChapter);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);

  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    setSelectedChapter(initialChapter);
  }, [initialChapter]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const availablePool = useMemo(() => {
    return selectedChapter === 'all'
      ? EXAM_QUESTIONS
      : EXAM_QUESTIONS.filter((q) => q.chapterId === selectedChapter);
  }, [selectedChapter]);

  const fontClass = fontStyle === 'nastaliq' ? 'font-urdu-display' : 'font-urdu-bold';

  const startExam = (customQuestions?: ExamQuestion[]) => {
    const pool = customQuestions ?? shuffleArray(availablePool);
    const limit = customQuestions ? customQuestions.length : Math.min(questionCount, pool.length);
    const chosen = pool.slice(0, limit);
    if (chosen.length === 0) return;

    setActiveQuestions(chosen);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setAnswers([]);
    setElapsedSeconds(0);
    setPhase('active');
  };

  const currentQuestion = activeQuestions[currentIndex];
  const currentMasla = currentQuestion ? getMaslaById(currentQuestion.maslaId) : undefined;

  const handleCheckAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsChecked(true);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedIndex: selectedOption,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const total = activeQuestions.length;
      const pct = Math.round((correctCount / total) * 100);
      const chapterTitle =
        selectedChapter === 'all'
          ? 'مکمل فتاویٰ رضویہ'
          : CHAPTERS.find((c) => c.id === selectedChapter)?.shortTitle || 'امتحان';

      onSaveAttempt({
        id: `att-${Date.now()}`,
        dateISO: new Date().toISOString(),
        chapterId: selectedChapter,
        chapterTitle,
        totalQuestions: total,
        correctCount,
        percentage: pct,
        durationSeconds: elapsedSeconds,
      });
      setPhase('results');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ======================== SETUP VIEW ========================
  if (phase === 'setup') {
    const totalAttempts = examHistory.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(examHistory.reduce((acc, r) => acc + r.percentage, 0) / totalAttempts)
        : 0;

    return (
      <section className="space-y-8">
        <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-emerald-950/10 dark:border-emerald-800/25">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B24] dark:text-emerald-300">
                امتحانی مشق (فتاویٰ رضویہ)
              </h1>
              <p className="mt-2 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                اپنا پسندیدہ باب اور سوالات کی تعداد منتخب کریں۔ ہر سوال کے بعد مستند فقہی جواب اور حدیثِ مبارکہ کا حوالہ دکھایا جائے گا۔
              </p>
            </div>
            <GraduationCap className="w-10 h-10 text-[#0F5132] dark:text-emerald-400 shrink-0" aria-hidden="true" />
          </div>

          {/* Chapter Filter */}
          <div className="mb-6">
            <label className="block text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-3">
              ۱۔ موضوع یا باب منتخب کریں:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedChapter('all')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm sm:text-base font-bold border transition-colors cursor-pointer ${
                  selectedChapter === 'all'
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-[#F6F8F6] dark:bg-[#1B2820] text-gray-800 dark:text-gray-200 border-emerald-950/10 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                تمام ابواب ({EXAM_QUESTIONS.length} سوالات)
              </button>
              {CHAPTERS.map((ch) => {
                const count = EXAM_QUESTIONS.filter((q) => q.chapterId === ch.id).length;
                const active = selectedChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChapter(ch.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-sm sm:text-base font-bold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F5132] text-white border-[#0F5132]'
                        : 'bg-[#F6F8F6] dark:bg-[#1B2820] text-gray-800 dark:text-gray-200 border-emerald-950/10 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    باب {ch.urduNum}: {ch.shortTitle} ({toUrduDigits(count)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count & Timer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                ۲۔ سوالات کی تعداد:
              </label>
              <div className="flex flex-wrap gap-2">
                {[4, 8, 16, 32].map((num) => {
                  const disabled = num > availablePool.length && num !== 4;
                  const effectiveLabel =
                    num === 32 ? `تمام (${availablePool.length})` : `${num} سوالات`;
                  const isSelected = questionCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={disabled && selectedChapter !== 'all'}
                      onClick={() => setQuestionCount(num)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-sm sm:text-base font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-[#9A6B16] text-white border-[#9A6B16]'
                          : 'bg-[#F6F8F6] dark:bg-[#1B2820] text-gray-800 dark:text-gray-200 border-emerald-950/10 dark:border-emerald-800/30'
                      }`}
                    >
                      {effectiveLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                ۳۔ امتحانی وقت کی پیمائش:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimerEnabled(false)}
                  className={`min-h-[44px] px-5 py-2 rounded-xl text-sm sm:text-base font-bold border cursor-pointer transition-colors ${
                    !timerEnabled
                      ? 'bg-[#0F5132] text-white border-[#0F5132]'
                      : 'bg-[#F6F8F6] dark:bg-[#1B2820] text-gray-800 dark:text-gray-200 border-emerald-950/10 dark:border-emerald-800/30'
                  }`}
                >
                  بغیر وقت کی قید
                </button>
                <button
                  type="button"
                  onClick={() => setTimerEnabled(true)}
                  className={`min-h-[44px] px-5 py-2 rounded-xl text-sm sm:text-base font-bold border inline-flex items-center gap-2 cursor-pointer transition-colors ${
                    timerEnabled
                      ? 'bg-[#0F5132] text-white border-[#0F5132]'
                      : 'bg-[#F6F8F6] dark:bg-[#1B2820] text-gray-800 dark:text-gray-200 border-emerald-950/10 dark:border-emerald-800/30'
                  }`}
                >
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>وقت شمار چالو</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startExam()}
            className="w-full sm:w-auto min-h-[52px] px-8 py-3 rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-lg font-extrabold transition-colors cursor-pointer"
          >
            امتحان شروع کریں
          </button>
        </div>

        {/* Offline Exam Progress Summary */}
        {totalAttempts > 0 && (
          <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-extrabold text-[#0B3B24] dark:text-emerald-300">
                آپ کی سابقہ امتحانی کارکردگی
              </h2>
              <div className="text-sm sm:text-base font-bold text-[#9A6B16] dark:text-amber-400 tabular-nums">
                کل امتحانات: {totalAttempts} · اوسط نمبر: {avgScore}%
              </div>
            </div>

            <div className="divide-y divide-emerald-950/8 dark:divide-emerald-800/25">
              {examHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-base font-bold"
                >
                  <div className="text-gray-900 dark:text-gray-100">
                    {item.chapterTitle}
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
                      ({new Date(item.dateISO).toLocaleDateString('ur-PK')})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums text-[#0F5132] dark:text-emerald-400">
                    <span>
                      {item.correctCount} / {item.totalQuestions}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // ======================== ACTIVE EXAM VIEW ========================
  if (phase === 'active' && currentQuestion) {
    const progressPct = Math.round(((currentIndex + (isChecked ? 1 : 0)) / activeQuestions.length) * 100);
    const isCorrectSelection = selectedOption === currentQuestion.correctIndex;

    const currentChapterInfo = CHAPTERS.find((c) => c.id === currentQuestion.chapterId);

    return (
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-5 sm:p-8">
          {/* Exam Top Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-extrabold text-[#0F5132] dark:text-emerald-400 tabular-nums">
              <span>
                امتحان سوال {toUrduDigits(currentIndex + 1)} از {toUrduDigits(activeQuestions.length)}
              </span>
              {currentMasla && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9A6B16] dark:text-amber-400">
                    {currentMasla.chapterNumber} ({currentChapterInfo?.shortTitle}) · {currentMasla.maslaNumber}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {timerEnabled && (
                <div className="inline-flex items-center gap-1.5 text-base font-bold text-[#9A6B16] dark:text-amber-400 tabular-nums">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setPhase('setup')}
                className="min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
              >
                امتحان ختم کریں
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-emerald-950/10 dark:bg-emerald-900/40 rounded-full overflow-hidden mb-7">
            <div
              className="h-full bg-[#0F5132] dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Question Text */}
          <h2
            className={`text-2xl sm:text-[26px] ${fontClass} font-extrabold text-gray-950 dark:text-white leading-[1.95] mb-6`}
          >
            {currentMasla && (
              <span className="text-[#9A6B16] dark:text-amber-400 ml-2">
                {currentMasla.maslaNumber}:
              </span>
            )}
            {currentQuestion.question}
          </h2>

          {/* 4 Options */}
          <div className="space-y-3 mb-7">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isRightOption = idx === currentQuestion.correctIndex;

              let btnStyle =
                'bg-[#F7F9F7] dark:bg-[#19261F] text-gray-900 dark:text-gray-100 border-emerald-950/12 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/30';

              if (!isChecked && isSelected) {
                btnStyle =
                  'bg-[#0F5132] text-white border-[#0F5132]';
              } else if (isChecked) {
                if (isRightOption) {
                  btnStyle =
                    'bg-emerald-50 dark:bg-emerald-950/70 text-[#0B3B24] dark:text-emerald-200 border-[#0F5132] dark:border-emerald-500';
                } else if (isSelected && !isRightOption) {
                  btnStyle =
                    'bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 border-red-600 dark:border-red-500';
                } else {
                  btnStyle =
                    'bg-[#F7F9F7] dark:bg-[#19261F] text-gray-500 dark:text-gray-400 border-emerald-950/10 dark:border-emerald-800/30 opacity-70';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full min-h-[56px] px-5 py-3.5 rounded-xl border-2 text-right text-lg sm:text-xl font-bold flex items-center justify-between gap-4 transition-colors cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span className={`${fontClass} leading-relaxed`}>{opt}</span>
                  {isChecked && isRightOption && (
                    <CheckCircle2 className="w-6 h-6 text-[#0F5132] dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  )}
                  {isChecked && isSelected && !isRightOption && (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback + Hadith Reference after Checking */}
          {isChecked && currentMasla && (
            <div className="rounded-2xl bg-[#F3F7F4] dark:bg-[#101A14] border border-emerald-900/15 dark:border-emerald-700/35 p-5 mb-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-extrabold">
                {isCorrectSelection ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-[#0F5132] dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-[#0F5132] dark:text-emerald-400">ما شاء اللہ! آپ کا جواب درست ہے۔</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <span className="text-red-700 dark:text-red-400">
                      غلط جواب — درست جواب: {currentQuestion.options[currentQuestion.correctIndex]}
                    </span>
                  </>
                )}
              </div>

              <p className={`text-base sm:text-lg ${fontClass} font-bold text-gray-900 dark:text-gray-100 leading-[1.95]`}>
                <span className="text-[#0F5132] dark:text-emerald-400 ml-2">شرعی وضاحت:</span>
                {currentMasla.answer}
              </p>

              <div className="pt-2 border-t border-emerald-950/10 dark:border-emerald-800/30">
                <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-[#9A6B16] dark:text-amber-400 mb-1">
                  <BookMarked className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>حدیثِ مبارکہ کا حوالہ:</span>
                  <span>{currentMasla.hadithRef.book}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentMasla.hadithRef.number}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentMasla.hadithRef.narration}
                </p>
                <p className="mt-2 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
                  حوالہ: {currentMasla.chapterNumber} · {currentMasla.maslaNumber} · {currentMasla.fatawaRef}
                </p>
              </div>
            </div>
          )}

          {/* Action CTA */}
          {!isChecked ? (
            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleCheckAnswer}
              className="w-full min-h-[52px] rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-lg font-extrabold transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              جواب کی تصدیق کریں
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full min-h-[52px] rounded-xl bg-[#9A6B16] hover:bg-[#7C5510] text-white text-lg font-extrabold transition-colors cursor-pointer"
            >
              {currentIndex + 1 < activeQuestions.length ? 'اگلا سوال' : 'امتحانی نتیجہ دیکھیں'}
            </button>
          )}
        </div>
      </section>
    );
  }

  // ======================== RESULTS VIEW ========================
  const correctTotal = answers.filter((a) => a.isCorrect).length;
  const totalQ = activeQuestions.length;
  const pct = totalQ > 0 ? Math.round((correctTotal / totalQ) * 100) : 0;
  const wrongQuestions = activeQuestions.filter((q) => {
    const rec = answers.find((a) => a.questionId === q.id);
    return rec && !rec.isCorrect;
  });

  const performanceTitle =
    pct >= 85
      ? 'ممتاز و شاندار کامیابی!'
      : pct >= 60
        ? 'بہترین کوشش! مزید محنت جاری رکھیں'
        : 'مزید مطالعہ کی ضرورت ہے';

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-6 sm:p-8 text-center">
        <Award className="w-12 h-12 text-[#9A6B16] dark:text-amber-400 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B24] dark:text-emerald-300">
          {performanceTitle}
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
          <span>
            حاصل کردہ نمبر: {correctTotal} / {totalQ}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-[#0F5132] dark:text-emerald-400">{pct}%</span>
          {timerEnabled && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-gray-600 dark:text-gray-300 text-lg">
                وقت: {formatTime(elapsedSeconds)}
              </span>
            </>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {wrongQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => startExam(wrongQuestions)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#9A6B16] hover:bg-[#7C5510] text-white text-base font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>غلط سوالات کی دہرائی ({wrongQuestions.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => startExam()}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-base font-extrabold cursor-pointer"
          >
            دوبارہ امتحان دیں
          </button>
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#F2F5F3] dark:bg-[#1C2A23] text-gray-900 dark:text-gray-100 text-base font-bold cursor-pointer"
          >
            ابواب کا انتخاب
          </button>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="bg-white dark:bg-[#141F19] border border-emerald-950/10 dark:border-emerald-800/35 rounded-2xl p-5 sm:p-7 space-y-5">
        <h3 className="text-xl font-extrabold text-[#0B3B24] dark:text-emerald-300">
          سوالات اور احادیثِ مبارکہ کا جائزہ
        </h3>
        <div className="divide-y divide-emerald-950/10 dark:divide-emerald-800/30">
          {activeQuestions.map((q, idx) => {
            const rec = answers.find((a) => a.questionId === q.id);
            const masla = getMaslaById(q.maslaId);
            const chInfo = CHAPTERS.find((c) => c.id === q.chapterId);
            return (
              <div key={q.id} className="py-5 first:pt-1 last:pb-1 space-y-2.5">
                {masla && (
                  <div className="pr-7 text-xs sm:text-sm font-bold text-[#9A6B16] dark:text-amber-400">
                    {masla.chapterNumber} ({chInfo?.shortTitle}) · {masla.maslaNumber}
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  {rec?.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F5132] dark:text-emerald-400 shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-1" />
                  )}
                  <p className="text-lg font-extrabold text-gray-950 dark:text-white">
                    {toUrduDigits(idx + 1)}. {q.question}
                  </p>
                </div>
                <p className="text-base font-bold text-[#0F5132] dark:text-emerald-400 pr-7">
                  درست جواب: {q.options[q.correctIndex]}
                </p>
                {masla && (
                  <div className="pr-7 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <span>
                      حدیث کا حوالہ: {masla.hadithRef.book} ({masla.hadithRef.number})
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenMaslaById(masla.id)}
                      className="text-[#9A6B16] dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      مکمل مسئلہ پڑھیں
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
