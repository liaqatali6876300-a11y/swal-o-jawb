import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface PWAInstallButtonProps {
  onFallbackExam?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onFallbackExam }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    if (!onFallbackExam) return null;
    return (
      <button
        type="button"
        onClick={onFallbackExam}
        className="px-4 py-2 min-h-[40px] rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        فوری امتحان
      </button>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>ایپ انسٹال کریں</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15201A] border border-emerald-900/15 dark:border-emerald-700/30 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" aria-hidden="true" />
                <h3
                  id="install-guide-title"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  ایپ انسٹال کرنے کا طریقہ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                aria-label="بند کریں"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-base font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">
                <p>آئی فون یا آئی پیڈ پر انسٹال کرنے کے لیے:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>سفاری براؤزر کے نیچے شیئر (Share) بٹن کو دبائیں۔</li>
                  <li>نیچے جا کر "Add to Home Screen" منتخب کریں۔</li>
                  <li>اوپر "Add" پر کلک کریں؛ ایپ آف لائن استعمال کے لیے تیار ہو جائے گی۔</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-base font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">
                <p>موبائل یا کمپیوٹر پر آف لائن ایپ انسٹال کرنے کے لیے:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>براؤزر کے کونے میں مینو (تین نقطے) یا ایڈریس بار میں انسٹال آئیکن کھولیں۔</li>
                  <li>"Install App" یا "Add to Home Screen" پر کلک کریں۔</li>
                  <li>انسٹال ہونے کے بعد تمام مسائل اور امتحانات بغیر انٹرنیٹ کے چلیں گے۔</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full min-h-[44px] rounded-xl bg-[#0F5132] hover:bg-[#0B3B24] text-white text-base font-bold transition-colors cursor-pointer"
            >
              سمجھ گیا
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-16 md:bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-[#9A6B16] px-4 py-2 text-sm font-bold text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>آف لائن موڈ — تمام مسائل و امتحان دستیاب ہیں</span>
    </div>
  );
};
