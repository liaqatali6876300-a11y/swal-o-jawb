import React from 'react';
import { BookOpen, GraduationCap, LayoutGrid, Bookmark } from 'lucide-react';
import { ActiveTab } from './Header';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'masail', label: 'مسائل', icon: <BookOpen className="w-5 h-5" aria-hidden="true" /> },
    { id: 'exam', label: 'امتحان', icon: <GraduationCap className="w-5 h-5" aria-hidden="true" /> },
    { id: 'chapters', label: 'ابواب', icon: <LayoutGrid className="w-5 h-5" aria-hidden="true" /> },
    {
      id: 'saved',
      label: savedCount > 0 ? `محفوظ (${savedCount})` : 'محفوظ',
      icon: <Bookmark className="w-5 h-5" aria-hidden="true" />,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 dark:bg-[#111A15]/95 backdrop-blur-md border-t border-emerald-950/10 dark:border-emerald-800/30 grid grid-cols-4"
      aria-label="موبائل نیویگیشن"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors cursor-pointer ${
              isActive
                ? 'text-[#0F5132] dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tab.icon}
            <span className="whitespace-nowrap truncate max-w-full px-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
