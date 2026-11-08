import React, { useState, useEffect } from 'react';
import { DiagnosticQuestion, CEFRLevel } from '../types';
import { getComprehensiveDiagnosticQuiz } from '../data/diagnosticQuestions';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface LevelTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (level: CEFRLevel) => void;
}

export const LevelTestModal: React.FC<LevelTestModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 2 questions from EVERY level (A1, A2, B1, B2, C1) = 10 dynamic questions!
      setQuestions(getComprehensiveDiagnosticQuiz(2));
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsFinished(false);
      setShowExplanation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  if (!currentQ && !isFinished) return null;

  const handleSelectOption = (optIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    sounds.playClick();
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    sounds.playSuccess();
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Evaluation breakdown per level to eliminate lucky guessing!
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const levelBreakdown = levels.map(lvl => {
    const levelQuestions = questions.filter(q => q.level === lvl);
    const correctInLevel = levelQuestions.filter(q => {
      const qIndex = questions.findIndex(item => item.id === q.id);
      return selectedAnswers[qIndex] === q.correctIndex;
    }).length;

    return {
      level: lvl,
      total: levelQuestions.length,
      correct: correctInLevel,
      passed: correctInLevel >= Math.ceil(levelQuestions.length * 0.65) // passed if >= 65% in this level
    };
  });

  // Determine highest mastered level sequentially
  const calculateFinalLevel = (): CEFRLevel => {
    let achieved: CEFRLevel = 'A1';

    for (const b of levelBreakdown) {
      if (b.passed) {
        achieved = b.level;
      } else {
        break; // Stop at the first level failed!
      }
    }

    return achieved;
  };

  const determinedLevel = calculateFinalLevel();
  const totalCorrect = Object.entries(selectedAnswers).reduce((acc, [idx, ans]) => {
    const q = questions[Number(idx)];
    return acc + (q && ans === q.correctIndex ? 1 : 0);
  }, 0);

  const handleSaveLevel = () => {
    onComplete(determinedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Clean, upright centered container (No crooked rotation!) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col relative overflow-hidden transition-colors">

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                5 Bosqichli CEFR Diagnostikasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A1 dan C1 gacha barcha darajalarni tekshirish (Taxmin qilishdan himoyalangan)
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

        {/* Quiz Body */}
        {!isFinished ? (
          <div className="py-5 flex-1 flex flex-col">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span>Savol {currentIndex + 1} / {questions.length}</span>
              <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black">
                Bosqich: CEFR {currentQ.level}
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question sentence */}
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5 mb-5 flex-1">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const isAnswered = selectedAnswers[currentIndex] !== undefined;
                const isCorrect = optIdx === currentQ.correctIndex;

                let btnStyle = 'bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                  } else {
                    btnStyle = 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-2xl text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-3.5 rounded-2xl mb-4 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Grammatik tahlil:</span>
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {selectedAnswers[currentIndex] !== undefined && (
              <BouncyButton
                variant="primary"
                size="md"
                pulseGlow={true}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNext}
              >
                {currentIndex < questions.length - 1 ? 'Keyingi savolga o\'tish' : 'To\'liq tahlilni ko\'rish'}
              </BouncyButton>
            )}
          </div>
        ) : (
          /* Result Summary Screen with Detailed Level-by-Level Breakdown */
          <div className="py-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-900 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-yellow-500/30 animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              Diagnostik Test Yakunlandi!
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Jami to'g'ri javoblar: <b>{totalCorrect} / {questions.length}</b> ta
            </p>

            {/* Level by level performance breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-4 text-left">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Bosqichlar bo'yicha natijalaringiz:
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {levelBreakdown.map((item) => (
                  <div
                    key={item.level}
                    className={`p-2 rounded-xl border ${
                      item.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{item.level}</div>
                    <div className="text-[10px] mt-0.5">{item.correct}/{item.total}</div>
                    <div className="text-[10px] font-bold mt-1">
                      {item.passed ? '✅ O\'tdi' : '❌ Qolmadi'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Determined Level */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border-2 border-blue-400 dark:border-blue-700 p-4 rounded-3xl mb-5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                Tasdiqlangan CEFR Darajangiz:
              </p>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                CEFR {determinedLevel}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                Taxminiy javoblarsiz aniqlandi. Writing topshiriqlari sizning {determinedLevel} darajangizga moslandi!
              </p>
            </div>

            <div className="flex gap-3">
              <BouncyButton
                variant="outline"
                size="md"
                className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={() => {
                  setQuestions(getComprehensiveDiagnosticQuiz(2));
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setIsFinished(false);
                }}
              >
                Qayta test
              </BouncyButton>

              <BouncyButton
                variant="success"
                size="md"
                pulseGlow={true}
                className="flex-1"
                icon={<BookOpen className="w-4 h-4" />}
                onClick={handleSaveLevel}
              >
                Darajani qabul qilish
              </BouncyButton>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
