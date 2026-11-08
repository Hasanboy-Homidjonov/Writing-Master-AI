import React from 'react';
import {
  FileText,
  BookOpen,
  GraduationCap,
  Smile,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const criteriaList = [
    {
      num: 1,
      name: 'Task Achievement',
      title: 'Topshiriq va savollarning to\'liq ochilishi',
      color: 'from-rose-500 to-orange-500',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50',
      icon: <FileText className="w-5 h-5" />,
      desc: 'Mavzuda berilgan barcha yo\'naltiruvchi savollarga to\'liq javob berilganligi, belgilangan so\'zlar me\'yori (minimum va maximum)ga qat\'iy rioya etilganligi va fikrlarning dalillanganligi tekshiriladi.'
    },
    {
      num: 2,
      name: 'Organization',
      title: 'Mantiqiy ketma-ketlik va paragraflar',
      color: 'from-amber-500 to-yellow-500',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
      icon: <BookOpen className="w-5 h-5" />,
      desc: 'Matnning aniq qismlarga bo\'linishi: Kirish (Introduction), Asosiy g\'oyalar (Body Paragraphs) va Xulosa (Conclusion). Har bir paragrafda 1 ta asosiy fikr (Topic sentence) bo\'lishi shart.'
    },
    {
      num: 3,
      name: 'Grammar',
      title: 'Zamonlar mosligi va grammatik aniqlik',
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
      icon: <GraduationCap className="w-5 h-5" />,
      desc: 'Barcha zamon shakllari, ega va kesim mosligi (He lives / She works), modal fe\'llar va passiv tuzilmalarning to\'g\'ri qo\'llanilishi. Xatolar matn ichidan aniq ko\'rsatib beriladi.'
    },
    {
      num: 4,
      name: 'Vocabulary',
      title: 'Lug\'at boyligi, sinonimlar va to\'g\'ri imlo',
      color: 'from-sky-500 to-blue-500',
      bgLight: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50',
      icon: <Smile className="w-5 h-5" />,
      desc: 'Bir xil so\'zlarni qayta-qayta takrorlamaslik, akademik sinonimlar, mavzuga oid iboralar va to\'g\'ri spelling (imlo xatolari bo\'lmasligi) baholanadi.'
    },
    {
      num: 5,
      name: 'Structure & Cohesion',
      title: 'Bog\'lovchilar va murakkab gap qurilishi',
      color: 'from-slate-800 to-slate-950 dark:from-slate-700 dark:to-slate-800',
      bgLight: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      icon: <Layers className="w-5 h-5" />,
      desc: 'Fikrlarni bir-biriga bog\'lovchi so\'zlar (However, Furthermore, Consequently, In contrast) va sodda gaplarni nisbiy olmoshlar (which, that, who) orqali murakkablashtirish darajasi.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                ⚡ 5D AI Writing Audit Tizimi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Writing natijalari rasmda ko'rsatilgan 5 ta asosiy mezon bo'yicha baholanadi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Criteria Cards */}
        <div className="py-5 space-y-3.5">
          {criteriaList.map((crit) => (
            <div
              key={crit.num}
              className={`p-4 rounded-2xl border transition-all ${crit.bgLight}`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${crit.color} text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md`}>
                  {crit.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {crit.name}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Maks: 5 ball
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {crit.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {crit.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <BouncyButton
            variant="primary"
            size="md"
            className="w-full"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={onClose}
          >
            Tushundim, davom etaman
          </BouncyButton>
        </div>

      </div>
    </div>
  );
};
