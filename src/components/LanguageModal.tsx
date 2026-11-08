import React from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { CheckCircle2, Globe2, X } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useApp();

  if (!isOpen) return null;

  const languages: {
    code: Language;
    label: string;
    sublabel: string;
    flag: string;
    description: string;
  }[] = [
    {
      code: 'uz',
      label: "O'zbek tili",
      sublabel: 'O\'zbekcha (Lotin)',
      flag: '🇺🇿',
      description: 'Platformani to\'liq o\'zbek tilida ishlatish'
    },
    {
      code: 'en',
      label: 'English',
      sublabel: 'English (UK / US)',
      flag: '🇬🇧',
      description: 'Use the platform completely in English'
    },
    {
      code: 'ru',
      label: 'Русский язык',
      sublabel: 'Русский',
      flag: '🇷🇺',
      description: 'Использовать платформу полностью на русском языке'
    }
  ];

  const handleSelect = (code: Language) => {
    sounds.playClick();
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative transition-colors">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Tilni Tanlang
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Select Language / Выберите язык
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center text-xs font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Language Options */}
        <div className="space-y-2.5 mb-2">
          {languages.map((l) => {
            const isSelected = language === l.code;
            return (
              <div
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                    {l.flag}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{l.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        ({l.code.toUpperCase()})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {l.description}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 group-hover:border-blue-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-4">
          Tanlangan til barcha sahifa va testlarda qo'llaniladi
        </p>

      </div>
    </div>
  );
};
