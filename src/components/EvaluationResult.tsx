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
  AlertCircle,
  Trophy,
  Copy,
  Check,
  Lightbulb,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';
import { sounds } from '../utils/audio';

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
  const [expandedCard, setExpandedCard] = useState<string | null>('task');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showModelEssay, setShowModelEssay] = useState<boolean>(true);

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
    setExpandedCard((prev) => (prev === cardName ? null : cardName));
  };

  const handleCopyModelEssay = () => {
    if (data.sampleEssay?.fullText) {
      navigator.clipboard.writeText(data.sampleEssay.fullText);
      setIsCopied(true);
      sounds.playSuccess();
      setTimeout(() => setIsCopied(false), 2500);
    }
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 max-w-[260px]">
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
        <div
          className={`px-6 py-3 flex items-center justify-between shadow-inner ${
            data.overallScore >= 3.0
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-900'
              : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-800 dark:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 font-black text-sm">
            <Coins className="w-5 h-5 text-amber-900 dark:text-amber-400 animate-bounce" />
            <span>
              +{data.coinsEarned} Coin {data.overallScore >= 3.0 ? 'yutdingiz!' : 'berildi'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
            <span>Ball: {data.overallScore}/5</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold">
              {data.cefrLevel}
            </span>
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
            <span>
              <b>{data.wordCount}</b> ta so'z
            </span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              <b>
                {minutes}m {seconds}s
              </b>
            </span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>IELTS ~{getEstimatedIELTS(data.overallScore)}</span>
          </div>
        </div>

        {/* 5 Feedback Cards & 100% Model Essay Container */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">

          {/* CARD 1: Task Achievement */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-500/30">
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand('task')}
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.taskAchievement.score}/5 Task Achievement
                  </h3>
                  {expandedCard === 'task' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
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

                {expandedCard === 'task' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                    {/* Aniq tushunarli yo'riqnoma */}
                    {data.criteria.taskAchievement.guidelines && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
                          <Lightbulb className="w-4 h-4" />
                          <span>Qanday qilib 100% (5/5) olish mumkin? (Aniq yo'riqnoma):</span>
                        </div>
                        {data.criteria.taskAchievement.guidelines.map((g, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 space-y-1 text-xs"
                          >
                            <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                                {i + 1}
                              </span>
                              <span>{g.rule}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                              {g.explanation}
                            </p>
                            {g.example && (
                              <div className="ml-5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-[10.5px] text-slate-700 dark:text-slate-300 italic border border-rose-200/50 dark:border-rose-800/50">
                                💡 <b>Misol:</b> {g.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Qo'shimcha maslahatlar */}
                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Tezkor tavsiyalar:
                      </p>
                      {data.criteria.taskAchievement.suggestions.map((sug, i) => (
                        <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 2: Organization */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
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
                    {data.criteria.organization.score}/5 Organization & Cohesion
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
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                    {/* Aniq tushunarli yo'riqnoma */}
                    {data.criteria.organization.guidelines && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                          <Lightbulb className="w-4 h-4" />
                          <span>Qanday qilib 100% (5/5) olish mumkin? (Aniq yo'riqnoma):</span>
                        </div>
                        {data.criteria.organization.guidelines.map((g, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 space-y-1 text-xs"
                          >
                            <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                                {i + 1}
                              </span>
                              <span>{g.rule}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                              {g.explanation}
                            </p>
                            {g.example && (
                              <div className="ml-5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-[10.5px] text-slate-700 dark:text-slate-300 italic border border-amber-200/50 dark:border-amber-800/50">
                                💡 <b>Misol:</b> {g.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Struktura tavsiyalari:
                      </p>
                      {data.criteria.organization.suggestions.map((sug, i) => (
                        <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3: Grammar */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
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
                    {data.criteria.grammar.score}/5 Grammar Range & Accuracy
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

                {expandedCard === 'grammar' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                    {/* Aniq tushunarli yo'riqnoma */}
                    {data.criteria.grammar.guidelines && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                          <Lightbulb className="w-4 h-4" />
                          <span>Qanday qilib 100% (5/5) olish mumkin? (Aniq yo'riqnoma):</span>
                        </div>
                        {data.criteria.grammar.guidelines.map((g, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-1 text-xs"
                          >
                            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                                {i + 1}
                              </span>
                              <span>{g.rule}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                              {g.explanation}
                            </p>
                            {g.example && (
                              <div className="ml-5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-[10.5px] text-slate-700 dark:text-slate-300 italic border border-emerald-200/50 dark:border-emerald-800/50">
                                💡 <b>Misol:</b> {g.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Aniqlangan xatolar */}
                    {data.criteria.grammar.examples && data.criteria.grammar.examples.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          Aniqlangan xatolar va tuzatishlar:
                        </p>
                        {data.criteria.grammar.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="bg-rose-50/70 dark:bg-rose-950/40 p-2.5 rounded-xl text-[11px] border border-rose-100 dark:border-rose-900/40"
                          >
                            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
                              <span className="line-through">{ex.original}</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                {ex.correction}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              {ex.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 4: Vocabulary */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
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
                    {data.criteria.vocabulary.score}/5 Vocabulary (Lexical Resource)
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
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                    {/* Aniq tushunarli yo'riqnoma */}
                    {data.criteria.vocabulary.guidelines && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-sky-600 dark:text-sky-400">
                          <Lightbulb className="w-4 h-4" />
                          <span>Qanday qilib 100% (5/5) olish mumkin? (Aniq yo'riqnoma):</span>
                        </div>
                        {data.criteria.vocabulary.guidelines.map((g, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 space-y-1 text-xs"
                          >
                            <div className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                                {i + 1}
                              </span>
                              <span>{g.rule}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                              {g.explanation}
                            </p>
                            {g.example && (
                              <div className="ml-5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-[10.5px] text-slate-700 dark:text-slate-300 italic border border-sky-200/50 dark:border-sky-800/50">
                                💡 <b>Misol:</b> {g.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Lug'at tavsiyalari:
                      </p>
                      {data.criteria.vocabulary.suggestions.map((sug, i) => (
                        <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-sky-500 font-bold">•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 5: Structure */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-600/30">
                <Layers className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div
                  className="flex items-center justify-between mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand('struct')}
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {data.criteria.structure.score}/5 Structure & Variety
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
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${(data.criteria.structure.score / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.criteria.structure.summary}
                </p>

                {expandedCard === 'struct' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-3">
                    {/* Aniq tushunarli yo'riqnoma */}
                    {data.criteria.structure.guidelines && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                          <Lightbulb className="w-4 h-4" />
                          <span>Qanday qilib 100% (5/5) olish mumkin? (Aniq yo'riqnoma):</span>
                        </div>
                        {data.criteria.structure.guidelines.map((g, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1 text-xs"
                          >
                            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-extrabold">
                                {i + 1}
                              </span>
                              <span>{g.rule}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                              {g.explanation}
                            </p>
                            {g.example && (
                              <div className="ml-5 p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 text-[10.5px] text-slate-700 dark:text-slate-300 italic border border-indigo-200/50 dark:border-indigo-800/50">
                                💡 <b>Misol:</b> {g.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Gap tuzilishi tavsiyalari:
                      </p>
                      {data.criteria.structure.suggestions.map((sug, i) => (
                        <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* ENG PASTDA: 100% NAMUNAVIY MUKAMMAL INSHO (BAND 9.0 / C2 MODEL ESSAY) */}
          {/* =================================================================== */}
          {data.sampleEssay && (
            <div className="mt-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-purple-500/10 p-[2px] shadow-2xl animate-fadeIn">
              <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 border border-amber-300/40 dark:border-amber-600/30">

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/30 shrink-0">
                      <Trophy className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {data.sampleEssay.bandScore}
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-black">
                          100% IDEAL
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                        Ushbu Mavzu Uchun 100% Namunaviy Insho
                      </h2>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyModelEssay}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shrink-0"
                    title="Insho matnidan nusxa olish"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Nusxa olish</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Subtitle / Word count */}
                <div className="py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800/80 mb-5">
                  <span className="italic">
                    Mavzu: <b>{data.sampleEssay.title}</b>
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {data.sampleEssay.wordCount} ta so'z
                  </span>
                </div>

                {/* Model Essay Paragraphs */}
                <div className="space-y-4 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-[13.5px] sm:text-sm">
                  {data.sampleEssay.paragraphs.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-amber-400/40 transition-colors"
                    >
                      <div className="text-[11px] font-sans font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{p.heading}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200">{p.text}</p>
                    </div>
                  ))}
                </div>

                {/* Key C1-C2 Vocabulary Highlights */}
                {data.sampleEssay.keyVocabulary && data.sampleEssay.keyVocabulary.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Namunaviy inshodagi C1-C2 darajadagi ilg'or iboralar:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {data.sampleEssay.keyVocabulary.map((v, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 text-xs space-y-1"
                        >
                          <div className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{v.term}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            <b>Ma'nosi:</b> {v.meaning}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                            "{v.exampleInEssay}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nega bu insho 100% ga loyiq? (Why it is 100%) */}
                {data.sampleEssay.whyItIs100Percent && data.sampleEssay.whyItIs100Percent.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Nima uchun bu insho 100% (Band 9.0) ga loyiq?</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.sampleEssay.whyItIs100Percent.map((reason, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                        >
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {reason.criterion}:
                          </span>{' '}
                          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                            {reason.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

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
