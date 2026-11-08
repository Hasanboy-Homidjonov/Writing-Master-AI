import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquarePlus,
  Send,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { sendFeedback } = useApp();

  const [type, setType] = useState<'suggestion' | 'bug' | 'topic_request' | 'general'>('suggestion');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSubject = subject.trim();
    const cleanContent = content.trim();

    // Anti-spam validation: check for repeated spam characters like "aaaaa" or "zzzzz"
    if (/(.)\1{3,}/i.test(cleanSubject) || /(.)\1{3,}/i.test(cleanContent)) {
      setErrorMsg("Murojaatda takroriy bema'ni harflar aniqlandi!");
      return;
    }

    if (cleanSubject.length < 3) {
      setErrorMsg("Mavzu sarlavhasi kamida 3 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    if (cleanContent.length < 10) {
      setErrorMsg("Murojaat matni kamida 10 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setErrorMsg(null);
    sendFeedback(type, cleanSubject, cleanContent);
    setIsSent(true);

    setTimeout(() => {
      setIsSent(false);
      setSubject('');
      setContent('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Taklif va Murojaat Kiritish
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fikringiz to'g'ridan-to'g'ri loyiha adminiga yetkaziladi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Anti-spam error alert */}
        {errorMsg && (
          <div className="mt-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isSent ? (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">

            {/* Type selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Murojaat turi:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'suggestion', label: '💡 Taklif' },
                  { id: 'topic_request', label: '📚 Yangi mavzu' },
                  { id: 'bug', label: '🐛 Xatolik' },
                  { id: 'general', label: '💬 Boshqa' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      type === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mavzu / Qisqacha sarlavha: *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Grammatik tahlil bo'yicha taklifim..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Batafsil matn: *
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Fikrlaringiz yoki saytni yanada qulaylashtirish bo'yicha taklifingizni yozing..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex gap-3">
              <BouncyButton
                type="button"
                variant="outline"
                size="md"
                className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                onClick={onClose}
              >
                Bekor qilish
              </BouncyButton>

              <BouncyButton
                type="submit"
                variant="primary"
                size="md"
                pulseGlow={true}
                className="flex-1"
                icon={<Send className="w-4 h-4" />}
              >
                Yuborish
              </BouncyButton>
            </div>

          </form>
        ) : (
          /* Success Screen */
          <div className="py-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              Taklifingiz muvaffaqiyatli yuborildi!
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Xabaringiz administrator paneliga yetkazildi. Fikringiz platformani yanada yaxshilashga yordam beradi!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
