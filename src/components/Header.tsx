import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'masail' | 'exam' | 'chapters' | 'saved';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, savedCount }) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'masail', label: 'سوال و جواب' },
    { id: 'exam', label: 'امتحانی مشق' },
    { id: 'chapters', label: 'فہرستِ ابواب' },
    { id: 'saved', label: savedCount > 0 ? `محفوظ (${savedCount})` : 'محفوظ مسائل' },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#FAF9F6]/95 dark:bg-[#0D1410]/95 backdrop-blur-md border-b border-emerald-950/10 dark:border-emerald-800/30">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('masail')}
          className="text-xl sm:text-2xl font-extrabold text-[#0F5132] dark:text-emerald-400 tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
        >
          فتاویٰ رضویہ
        </button>

        <nav className="hidden md:flex items-center gap-6" aria-label="بنیادی مینو">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1.5 text-base font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-[#0F5132] dark:text-emerald-400 border-[#0F5132] dark:border-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 border-transparent hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <PWAInstallButton onFallbackExam={() => onSelectTab('exam')} />
        </div>
      </div>
    </header>
  );
};
