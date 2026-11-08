import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WritingTopic, CEFRLevel } from '../types';
import {
  Clock,
  Type,
  HelpCircle,
  Play,
  PlusCircle,
  Award,
  ShieldCheck,
  Zap,
  Trash2,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';
import { AnimatedSticker } from './AnimatedSticker';
import { CriteriaModal } from './CriteriaModal';

interface TopicsViewProps {
  onStartExam: (topic: WritingTopic, level?: CEFRLevel) => void;
  onOpenAddTopic: () => void;
  onOpenLevelTest: () => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  onStartExam,
  onOpenAddTopic,
  onOpenLevelTest
}) => {
  const { topics, deleteCustomTopic, user, isAdmin, t } = useApp();
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<CEFRLevel | 'ALL'>('ALL');
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);

  // Level selector modal before starting exam
  const [selectedTopicForExam, setSelectedTopicForExam] = useState<WritingTopic | null>(null);
  const [chosenLevel, setChosenLevel] = useState<CEFRLevel>('B1');

  const filteredTopics = selectedLevelFilter === 'ALL'
    ? topics
    : topics.filter(t => t.level === selectedLevelFilter);

  const handleOpenLevelSelect = (topic: WritingTopic) => {
    setSelectedTopicForExam(topic);
    setChosenLevel(topic.level);
  };

  const handleConfirmStart = () => {
    if (selectedTopicForExam) {
      onStartExam(selectedTopicForExam, chosenLevel);
      setSelectedTopicForExam(null);
    }
  };

  const LEVEL_CONFIGS: Record<CEFRLevel, { words: string; time: number; desc: string }> = {
    A1: { words: '60 - 100 ' + t.words, time: 12, desc: 'A1: Simple everyday topics & basic sentences' },
    A2: { words: '90 - 140 ' + t.words, time: 18, desc: 'A2: Routine habits, past experiences & stories' },
    B1: { words: '150 - 220 ' + t.words, time: 25, desc: 'B1: Opinion essays, causes, and consequences' },
    B2: { words: '200 - 280 ' + t.words, time: 30, desc: 'B2: Balanced arguments, pros/cons, and analysis' },
    C1: { words: '280 - 400 ' + t.words, time: 40, desc: 'C1: Complex societal, ethical, and global arguments' },
    C2: { words: '350 - 500 ' + t.words, time: 45, desc: 'C2: Mastery & advanced academic synthesis' },
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 sm:p-10 text-white overflow-hidden shadow-2xl shadow-indigo-500/20 mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.antiCheatBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-4">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed mb-6">
            {t.heroSub}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <BouncyButton
              variant="gold"
              size="lg"
              pulseGlow={true}
              icon={<Play className="w-5 h-5 fill-slate-900" />}
              onClick={() => handleOpenLevelSelect(filteredTopics[0] || topics[0])}
            >
              {t.startWriting}
            </BouncyButton>

            <BouncyButton
              variant="outline"
              size="lg"
              className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20"
              icon={<Award className="w-5 h-5 text-amber-300" />}
              onClick={onOpenLevelTest}
            >
              {t.testLevelBtn}
            </BouncyButton>
          </div>
        </div>

        {/* Decorative Floating Stickers */}
        <div className="absolute right-6 top-6 hidden lg:flex flex-col items-center gap-4">
          <AnimatedSticker type="feather" size="xl" />
          <AnimatedSticker type="shield" size="lg" />
          <AnimatedSticker type="coin" size="xl" />
        </div>
      </div>

      {/* CREATIVE 1-BUTTON FOR THE 5 CRITERIA */}
      <div className="mb-8">
        <div
          onClick={() => setCriteriaModalOpen(true)}
          className="w-full bg-gradient-to-r from-white via-blue-50/50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-blue-400/60 dark:border-blue-500/40 hover:border-blue-600 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform shrink-0">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {t.audit5DTitle}
                </h3>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {t.rulesBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.audit5DDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>{t.view5Criteria}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Topics Header & Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.topicsHeading}</span>
            <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {filteredTopics.length} {t.lifeTopicsCount}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.topicsSubheading}
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedLevelFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedLevelFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {t.allLevels}
          </button>
          {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                selectedLevelFilter === lvl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

        {/* Card 0: Custom Add Topic Trigger */}
        <div
          onClick={onOpenAddTopic}
          className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 hover:shadow-xl group"
        >
          <div className="w-14 h-14 rounded-3xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md shadow-blue-500/10">
            <PlusCircle className="w-7 h-7" />
          </div>

          <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-1">
            {t.addNewTopicCard}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
            {t.addNewTopicCardDesc}
          </p>

          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
            <span>{t.createTopicLink}</span>
            <span>→</span>
          </span>
        </div>

        {/* Real-life Topic Cards */}
        {filteredTopics.map((topic) => {
          const isOwner = topic.isCustom && (topic.authorId === user.id || isAdmin);

          return (
            <div
              key={topic.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between hover:-translate-y-1 relative group"
            >
              {topic.isCustom && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    {t.onlyAuthorVisible}
                  </span>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Ushbu mavzuni o'chirmoqchimisiz?")) {
                          deleteCustomTopic(topic.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Mavzuni o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div>
                {/* Level badge & metrics */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-lg shadow-xs">
                    {t.recommended} {topic.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{topic.timeLimitMinutes} {t.min}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-slate-400" />
                    <span>{topic.recommendedWords.min}-{topic.recommendedWords.max} {t.words}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {topic.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {topic.prompt}
                </p>

                {/* Guiding Questions preview */}
                {topic.guidingQuestions && topic.guidingQuestions.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-5">
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                      <HelpCircle className="w-3 h-3 text-blue-500" />
                      <span>{t.guidingQuestions} ({topic.guidingQuestions.length} ta):</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                      "{topic.guidingQuestions[0]}"
                    </p>
                  </div>
                )}
              </div>

              {/* Start Button - opens Level selector */}
              <BouncyButton
                variant="primary"
                size="md"
                pulseGlow={false}
                icon={<Play className="w-4 h-4 fill-white" />}
                className="w-full mt-2"
                onClick={() => handleOpenLevelSelect(topic)}
              >
                {t.startExam}
              </BouncyButton>
            </div>
          );
        })}
      </div>

      {/* 5 Criteria Explanation Modal */}
      <CriteriaModal
        isOpen={criteriaModalOpen}
        onClose={() => setCriteriaModalOpen(false)}
      />

      {/* LEVEL SELECTION MODAL BEFORE EXAM */}
      {selectedTopicForExam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t.selectLevelTitle}
              </h3>
              <button
                onClick={() => setSelectedTopicForExam(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 font-bold">
              Mavzu: "{selectedTopicForExam.title}"
            </p>

            <div className="space-y-2 mb-5">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => {
                const conf = LEVEL_CONFIGS[lvl];
                const isSelected = chosenLevel === lvl;
                return (
                  <div
                    key={lvl}
                    onClick={() => setChosenLevel(lvl)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md">
                          {lvl}
                        </span>
                        <span className="font-bold text-xs">{conf.words} • {conf.time} {t.min}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {conf.desc}
                      </p>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <BouncyButton
              variant="primary"
              size="md"
              pulseGlow={true}
              className="w-full"
              icon={<Play className="w-4 h-4 fill-white" />}
              onClick={handleConfirmStart}
            >
              {t.startFullScreenExam}
            </BouncyButton>
          </div>
        </div>
      )}

    </div>
  );
};
