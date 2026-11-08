import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { EvaluationResultData } from '../types';
import {
  FileText,
  BookOpen,
  GraduationCap,
  Smile,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Coins,
  ArrowLeft,
  RotateCcw,
  Clock,
  Type,
  PenTool,
  AlertCircle
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface EvaluationResultProps {
  data: EvaluationResultData;
  onBack: () => void;
  onRetry: () => void;
}

export const EvaluationResult: React.FC<EvaluationResultProps> = ({
  data,
  onBack,
  onRetry,
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const isWordTargetMet = data.wordCount >= data.targetWordCount.min;

  useEffect(() => {
    // Only launch confetti if writing met the word count and achieved reasonable score!
    if (isWordTargetMet && data.overallScore >= 2.5) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [isWordTargetMet, data.overallScore]);

  const toggleExpand = (cardName: string) => {
    setExpandedCard(prev => prev === cardName ? null : cardName);
  };

  const minutes = Math.floor(data.timeSpentSeconds / 60);
  const seconds = data.timeSpentSeconds % 60;

  // Realistic IELTS calculation strictly aligned with score
  const getEstimatedIELTS = (score: number) => {
    if (data.wordCount < 30) return '2.0 (Juda qisqa)';
    if (score <= 1.5) return '2.5 - 3.0';
    if (score <= 2.2) return '3.5 - 4.0';
    if (score <= 2.9) return '4.5 - 5.0';
    if (score <= 3.7) return '5.5 - 6.0';
    if (score <= 4.4) return '6.5 - 7.0';
    if (score <= 4.8) return '7.5 - 8.0';
    return '8.5 - 9.0';
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-4 sm:py-8 px-2 sm:px-4 flex justify-center items-start transition-colors">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">

        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            title="Bosh menyu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Writing Assessment</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 max-w-[220px]">
              {data.topicTitle}
            </p>
          </div>

          <button
            onClick={onBack}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            Finish
          </button>
        </div>

        {/* Coin & Score Celebration Banner */}
        <div className={`px-6 py-3 flex items-center justify-between shadow-inner ${
          data.overallScore >= 3.0
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-900'
            : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200'
        }`}>
          <div className="flex items-center gap-2 font-black text-sm">
            <Coins className="w-5 h-5 text-amber-900 dark:text-amber-400 animate-bounce" />
            <span>+{data.coinsEarned} Coin {data.overallScore >= 3.0 ? 'yutdingiz!' : 'berildi'}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
            <span>Ball: {data.overallScore}/5</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold">{data.cefrLevel}</span>
          </div>
        </div>

        {/* Under-length Warning Banner if words are not enough */}
        {!isWordTargetMet && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              So'zlar soni yetarli emas ({data.wordCount}/{data.targetWordCount.min} so'z). Shu sababli ball cheklangan!
            </span>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-500" />
            <span><b>{data.wordCount}</b> ta so'z</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span><b>{minutes}m {seconds}s</b></span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>IELTS ~{getEstimatedIELTS(data.overallScore)}</span>
          </div>
        </div>

        {/* 5 Feedback Cards */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">

          {/* CARD 1: Task Achievement */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-500/30">
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.taskAchievement.score}/5 Task Achievement
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${(data.criteria.taskAchievement.score / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.criteria.taskAchievement.summary}
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: Organization */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand('org')}
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.organization.score}/5 Organization
                  </h3>
                  {expandedCard === 'org' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${(data.criteria.organization.score / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.criteria.organization.summary}
                </p>

                {expandedCard === 'org' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Tavsiyalar:</p>
                    {data.criteria.organization.suggestions.map((sug, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3: Grammar */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand('grammar')}
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.grammar.score}/5 Grammar
                  </h3>
                  {expandedCard === 'grammar' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${(data.criteria.grammar.score / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.criteria.grammar.summary}
                </p>

                {expandedCard === 'grammar' && data.criteria.grammar.examples && data.criteria.grammar.examples.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Aniqlangan xatolar va tuzatishlar:</p>
                    {data.criteria.grammar.examples.map((ex, i) => (
                      <div key={i} className="bg-rose-50/70 dark:bg-rose-950/40 p-2 rounded-xl text-[11px] border border-rose-100 dark:border-rose-900/40">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
                          <span className="line-through">{ex.original}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{ex.correction}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ex.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 4: Vocabulary */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-sky-500/30">
                <Smile className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand('vocab')}
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.vocabulary.score}/5 Vocabulary
                  </h3>
                  {expandedCard === 'vocab' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-700"
                    style={{ width: `${(data.criteria.vocabulary.score / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.criteria.vocabulary.summary}
                </p>

                {expandedCard === 'vocab' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Lug'at boyligini oshirish bo'yicha maslahat:</p>
                    {data.criteria.vocabulary.suggestions.map((sug, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 5: Structure */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-sm shadow-slate-900/30">
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand('struct')}
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.structure.score}/5 Structure
                  </h3>
                  {expandedCard === 'struct' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-slate-900 dark:bg-slate-400 rounded-full transition-all duration-700"
                    style={{ width: `${(data.criteria.structure.score / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.criteria.structure.summary}
                </p>

                {expandedCard === 'struct' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Gap qurilishi tavsiyalari:</p>
                    {data.criteria.structure.suggestions.map((sug, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-900 dark:text-slate-400 font-bold">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <BouncyButton
            variant="outline"
            size="md"
            className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            icon={<RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            onClick={onRetry}
          >
            Qayta yozish
          </BouncyButton>

          <BouncyButton
            variant="primary"
            size="md"
            pulseGlow={true}
            className="flex-1"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={onBack}
          >
            Bosh menyu
          </BouncyButton>
        </div>

      </div>
    </div>
  );
};
