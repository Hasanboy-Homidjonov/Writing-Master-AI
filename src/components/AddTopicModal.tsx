import React, { useState } from 'react';
import { CEFRLevel } from '../types';
import { autoGenerateQuestions, isValidTopicTitle } from '../data/defaultTopics';
import { sounds } from '../utils/audio';
import {
  PlusCircle,
  Sparkles,
  HelpCircle,
  Clock,
  Type,
  Layers,
  Check,
  AlertTriangle
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    prompt: string,
    questions: string[],
    level: CEFRLevel,
    minWords: number,
    maxWords: number,
    timeMin: number
  ) => void;
  defaultLevel: CEFRLevel;
}

const LEVEL_PRESETS: Record<CEFRLevel, { min: number; max: number; time: number }> = {
  A1: { min: 60, max: 100, time: 12 },
  A2: { min: 90, max: 140, time: 18 },
  B1: { min: 150, max: 220, time: 25 },
  B2: { min: 200, max: 280, time: 30 },
  C1: { min: 280, max: 400, time: 40 },
  C2: { min: 350, max: 500, time: 45 },
};

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultLevel
}) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [level, setLevel] = useState<CEFRLevel>(defaultLevel);
  const [questionsText, setQuestionsText] = useState('');
  const [minWords, setMinWords] = useState(LEVEL_PRESETS[defaultLevel].min);
  const [maxWords, setMaxWords] = useState(LEVEL_PRESETS[defaultLevel].max);
  const [timeMin, setTimeMin] = useState(LEVEL_PRESETS[defaultLevel].time);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLevelChange = (newLevel: CEFRLevel) => {
    setLevel(newLevel);
    const preset = LEVEL_PRESETS[newLevel];
    setMinWords(preset.min);
    setMaxWords(preset.max);
    setTimeMin(preset.time);
  };

  const handleAutoGenerateQuestions = () => {
    const valResult = isValidTopicTitle(title);
    if (!valResult.isValid) {
      setValidationError(valResult.reason || "Mavzuni to'g'ri yozing!");
      sounds.playAlarm();
      return;
    }
    setValidationError(null);
    setIsGenerating(true);
    sounds.playCoin();

    setTimeout(() => {
      const generated = autoGenerateQuestions(title.trim());
      setQuestionsText(generated.join('\n'));
      setIsGenerating(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT VALIDATION
    const valResult = isValidTopicTitle(title);
    if (!valResult.isValid) {
      setValidationError(valResult.reason || "Iltimos, mazmunli inglizcha mavzu kiriting!");
      sounds.playAlarm();
      return;
    }
    setValidationError(null);

    let finalQuestions = questionsText
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    if (finalQuestions.length === 0) {
      finalQuestions = autoGenerateQuestions(title.trim());
    }

    const finalPrompt = prompt.trim() || `Discuss the topic: "${title.trim()}". Support your arguments with real-life examples and reach a well-reasoned conclusion.`;

    onAdd(title.trim(), finalPrompt, finalQuestions, level, minWords, maxWords, timeMin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Yangi Writing Mavzusi Qo'shish
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faqat mazmunli va hayotiy mavzular qabul qilinadi
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

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4">

          {/* Level Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Darajani tanlang (CEFR):</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    level === lvl
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mavzu nomi (Inglizcha sarlavha): *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. My home, Friendship, Life in Modern Cities..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          {/* Prompt Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Qisqacha topshiriq / Prompt (Ixtiyoriy):
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the main arguments and give your personal opinion..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Guiding Questions with Auto-generation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Yo'naltiruvchi savollar (Har bir qatorga bittadan):</span>
              </label>

              <button
                type="button"
                onClick={handleAutoGenerateQuestions}
                disabled={isGenerating}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all hover:bg-indigo-100"
              >
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>AI bilan savollar tuzish</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              placeholder="Agar bo'sh qoldirsangiz, tizim o'zi avtomatik savollar tuzib beradi..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 leading-relaxed font-mono"
            />
          </div>

          {/* Word limits and Timer settings */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Type className="w-3 h-3 text-blue-500" />
                <span>Min so'z:</span>
              </label>
              <input
                type="number"
                min={30}
                max={600}
                value={minWords}
                onChange={(e) => setMinWords(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Type className="w-3 h-3 text-blue-500" />
                <span>Max so'z:</span>
              </label>
              <input
                type="number"
                min={50}
                max={1000}
                value={maxWords}
                onChange={(e) => setMaxWords(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>Vaqt (daqiqa):</span>
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={timeMin}
                onChange={(e) => setTimeMin(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              icon={<Check className="w-4 h-4" />}
            >
              Mavzuni saqlash
            </BouncyButton>
          </div>

        </form>

      </div>
    </div>
  );
};
