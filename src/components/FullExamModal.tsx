import React, { useState, useEffect, useRef } from 'react';
import { WritingTopic, EvaluationResultData } from '../types';
import { analyzeEssay } from '../utils/nlpEvaluator';
import { sounds } from '../utils/audio';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Maximize2,
  FileCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  XCircle,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface FullExamModalProps {
  topic: WritingTopic;
  onFinish: (result: EvaluationResultData) => void;
  onAbort: (reason: string) => void;
}

export const FullExamModal: React.FC<FullExamModalProps> = ({
  topic,
  onFinish,
  onAbort
}) => {
  const { user, addSecurityLog } = useApp();

  const [essayText, setEssayText] = useState('');
  const [timeLeft, setTimeLeft] = useState(topic.timeLimitMinutes * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isAborted, setIsAborted] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Finish confirmation modal state (Point 2: "testni yakunlashda so'ra chunki bosib ketib qolgan bo'lishi mumkin")
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);

  // Motivational milestone banner
  const [motivationAlert, setMotivationAlert] = useState<{ message: string; type: '50' | '80' | '100' } | null>(null);
  const reached50Ref = useRef(false);
  const reached80Ref = useRef(false);
  const reached100Ref = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const strikesRef = useRef(0);
  strikesRef.current = strikes;

  // Calculate current words
  const words = essayText.trim().length > 0 ? essayText.trim().split(/\s+/).filter(Boolean) : [];
  const currentWordCount = words.length;
  const targetMin = topic.recommendedWords.min;
  const isWordTargetMet = currentWordCount >= targetMin;

  // Real-time motivation check
  useEffect(() => {
    if (!reached50Ref.current && currentWordCount >= targetMin * 0.5 && currentWordCount < targetMin * 0.8) {
      reached50Ref.current = true;
      setMotivationAlert({
        message: "🔥 Zo'r ketayapsiz! Allaqachon yarmiga yetdingiz, fikrlaringizni davom ettiring!",
        type: '50'
      });
      sounds.playCoin();
      setTimeout(() => setMotivationAlert(null), 4500);
    } else if (!reached80Ref.current && currentWordCount >= targetMin * 0.8 && currentWordCount < targetMin) {
      reached80Ref.current = true;
      setMotivationAlert({
        message: "🚀 Ozgina qoldi! Yana bir necha jumla yozsangiz minimum me'yorga yetasiz, ajoyib!",
        type: '80'
      });
      sounds.playCoin();
      setTimeout(() => setMotivationAlert(null), 4500);
    } else if (!reached100Ref.current && currentWordCount >= targetMin) {
      reached100Ref.current = true;
      setMotivationAlert({
        message: "🎉 Qoyilmaqom! So'zlar me'yori bajarildi! Endi xulosangizni chiroyli yakunlang!",
        type: '100'
      });
      sounds.playSuccess();
      setTimeout(() => setMotivationAlert(null), 4500);
    }
  }, [currentWordCount, targetMin]);

  // Request fullscreen on start
  const requestFullScreenMode = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // ignore
    }
  };

  // Trigger strike
  const registerStrike = (reason: string) => {
    if (isAborted || isSubmitting) return;

    sounds.playAlarm();
    const newStrike = strikesRef.current + 1;
    setStrikes(newStrike);

    // Record into security logs for Admin dashboard!
    addSecurityLog({
      userName: user.name,
      userEmail: user.email || 'mehmon@gmail.com',
      topicTitle: topic.title,
      violation: reason,
      strikesCount: newStrike,
      wasAborted: newStrike >= 3
    });

    if (newStrike >= 3) {
      setIsAborted(true);
      setShowWarningModal(false);
      setShowConfirmFinishModal(false);
      setTimeout(() => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onAbort('3 marta qoidabuzarlik (Alt+Tab, darcha almashtirish yoki taqiqlangan nusxa ko\'chirish) sababli imtihon bekor qilindi!');
      }, 3500);
    } else {
      setWarningMessage(reason);
      setShowWarningModal(true);
    }
  };

  // Anti-cheat Listeners: Strict Copy / Paste / Cut / Drag-drop lockdown
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerStrike("Darchadan chiqish yoki tabni almashtirish aniqlandi!");
      }
    };

    const handleWindowBlur = () => {
      registerStrike("Alt+Tab yoki boshqa ilovaga o'tish aniqlandi!");
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFull);
      if (!isCurrentlyFull && !isAborted && !isSubmitting) {
        registerStrike("Full Screen rejimidan chiqish taqiqlangan!");
      }
    };

    // Strictly intercept all copy, cut, paste combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        e.preventDefault();
        registerStrike("Alt klavishasi bosildi!");
        return false;
      }

      // Check Ctrl+C, Ctrl+V, Ctrl+X, Meta+C, Meta+V, Shift+Insert, Ctrl+Insert
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.shiftKey && e.key === 'Insert') ||
        (e.ctrlKey && e.key === 'Insert')
      ) {
        e.preventDefault();
        registerStrike("Taqiqlangan amal: Matndan nusxa olish (Copy) yoki qo'yish (Paste) qat'iyan man etiladi!");
        return false;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      registerStrike("Matndan nusxa olish (Copy) taqiqlangan!");
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      registerStrike("Matnga tashqaridan nusxa qo'yish (Paste) taqiqlangan!");
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      registerStrike("Matnni qirqib olish (Cut) taqiqlangan!");
      return false;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      registerStrike("Matnni tortib tashlash (Drag & Drop) taqiqlangan!");
      return false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('cut', handleCut);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('drop', handleDrop);

    requestFullScreenMode();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('drop', handleDrop);
    };
  }, [isAborted, isSubmitting]);

  // Countdown Timer
  useEffect(() => {
    if (isAborted || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          executeFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAborted, isSubmitting]);

  // Triggered when user clicks "Yakunlash" button -> Ask confirmation first!
  const handleInitiateSubmit = () => {
    sounds.playClick();
    setShowConfirmFinishModal(true);
  };

  // Actually submit after user explicitly confirms in dialog
  const executeFinalSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmFinishModal(false);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const timeSpent = topic.timeLimitMinutes * 60 - timeLeft;
    const result = analyzeEssay(essayText, topic, Math.max(10, timeSpent));
    onFinish(result);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeLow = timeLeft < 120;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden ${
        strikes > 0 && showWarningModal ? 'animate-shake' : ''
      }`}
    >
      {/* Real-time Motivation Toast Alert */}
      {motivationAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white/50">
          <Sparkles className="w-5 h-5 text-slate-900" />
          <span className="text-xs sm:text-sm">{motivationAlert.message}</span>
        </div>
      )}

      {/* Top Secure Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-950/80 border border-emerald-500/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-emerald-400 text-[11px] sm:text-xs font-bold animate-pulse">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">XAVFSIZ FULLSCREEN</span>
            <span className="xs:hidden sm:hidden">FULLSCREEN</span>
          </div>

          {/* Strikes Counter */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-700">
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold mr-0.5 sm:mr-1 hidden sm:inline">Ogohlantirishlar:</span>
            {[1, 2, 3].map((num) => (
              <span
                key={num}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${
                  strikes >= num
                    ? 'bg-rose-600 text-white animate-bounce shadow-md shadow-rose-600/50'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Center Timer */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 font-mono font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl border text-xs sm:text-sm transition-all ${
            isTimeLow
              ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-amber-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        {/* Word count & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right">
            <div className="text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5">
              <span className={isWordTargetMet ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}>
                {currentWordCount}
              </span>
              <span className="text-slate-500 text-[10px] sm:text-xs">/ {topic.recommendedWords.min}-{topic.recommendedWords.max} so'z</span>
            </div>
            <div className="w-20 sm:w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${
                  isWordTargetMet ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (currentWordCount / topic.recommendedWords.min) * 100)}%` }}
              />
            </div>
          </div>

          {!isFullscreen && (
            <button
              onClick={requestFullScreenMode}
              className="bg-blue-600/80 hover:bg-blue-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all"
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          )}

          {/* Finish Button asks for confirmation! */}
          <BouncyButton
            variant="success"
            size="sm"
            pulseGlow={isWordTargetMet}
            icon={<FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={handleInitiateSubmit}
            className="!py-1.5 sm:!py-2 text-xs"
          >
            Yakunlash
          </BouncyButton>
        </div>
      </div>

      {/* Main Writing Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Topic Guide */}
        <div className="w-full md:w-96 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 p-4 sm:p-5 overflow-y-auto max-h-52 md:max-h-none shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide">
                Level: {topic.level}
              </span>
              <span className="text-xs text-slate-400">
                Tavsiya: {topic.timeLimitMinutes} daqiqa
              </span>
            </div>

            <h2 className="text-lg font-extrabold text-white mb-2 leading-snug">
              {topic.title}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 mb-4">
              {topic.prompt}
            </p>

            {/* Guiding Questions */}
            {topic.guidingQuestions && topic.guidingQuestions.length > 0 && (
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-300 hover:text-white"
                  onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                >
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <HelpCircle className="w-4 h-4" />
                    Yo'naltiruvchi savollar ({topic.guidingQuestions.length}):
                  </span>
                  {isPromptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {isPromptExpanded && (
                  <div className="space-y-2 pt-1">
                    {topic.guidingQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p>{q}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security notice */}
          <div className="mt-6 bg-rose-950/40 border border-rose-800/50 p-3 rounded-2xl flex items-start gap-2.5 text-[11px] text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>
              <b>Anti-Cheat:</b> Nusxa olish (Copy), qo'yish (Paste), Alt+Tab va darchadan chiqish qat'iyan taqiqlangan!
            </p>
          </div>
        </div>

        {/* Editor Area with STRICT Copy/Paste blocking */}
        <div className="flex-1 p-6 flex flex-col bg-slate-950">
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              registerStrike("Matnga tashqaridan nusxa qo'yish (Paste) taqiqlangan!");
            }}
            onCopy={(e) => {
              e.preventDefault();
              registerStrike("Matndan nusxa olish (Copy) taqiqlangan!");
            }}
            onCut={(e) => {
              e.preventDefault();
              registerStrike("Matnni qirqib olish (Cut) taqiqlangan!");
            }}
            onDrop={(e) => {
              e.preventDefault();
              registerStrike("Matnni tortib tashlash (Drag & Drop) taqiqlangan!");
            }}
            placeholder="Write your essay here in English... Start with an introduction, develop arguments with examples in body paragraphs, and conclude clearly."
            className="w-full flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-slate-100 text-base leading-relaxed placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none font-sans"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE FINISHING (Point 2: so'rab yakunlash) */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center transform scale-105 transition-all">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FileCheck className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              Imtihonni Yakunlaysizmi?
            </h3>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Siz hozirgacha <b>{currentWordCount}</b> ta so'z yozdingiz. Qolgan vaqtingiz: <b>{minutes} daqiqa {seconds} soniya</b>.
            </p>

            {/* Warning if word count is lower than minimum requirement */}
            {!isWordTargetMet && (
              <div className="bg-rose-950/70 border border-rose-500 text-rose-300 p-3 rounded-2xl text-xs font-bold flex items-start gap-2 mb-4 text-left">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Diqqat! Siz yozgan so'zlar soni ({currentWordCount}) minimal talab ({targetMin} so'z)dan kam. Bu umumiy ballingiz pasayishiga olib kelishi mumkin!
                </span>
              </div>
            )}

            <p className="text-[11px] text-slate-400 mb-6">
              Tasodifan bosib ketgan bo'lsangiz, bemalol qaytib yozishda davom etishingiz mumkin.
            </p>

            <div className="flex gap-3">
              <BouncyButton
                variant="outline"
                size="md"
                className="flex-1 !bg-slate-800 !text-slate-200 !border-slate-700 hover:!bg-slate-700"
                onClick={() => setShowConfirmFinishModal(false)}
              >
                Yo'q, davom etaman
              </BouncyButton>

              <BouncyButton
                variant="success"
                size="md"
                pulseGlow={true}
                className="flex-1"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={executeFinalSubmit}
              >
                Ha, yakunlash
              </BouncyButton>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for Strikes */}
      {showWarningModal && !isAborted && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center transform scale-105 transition-all">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="inline-block bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              OGOHLANTIRISH {strikes}/3
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2">
              Qoidabuzarlik aniqlandi!
            </h3>

            <p className="text-sm text-rose-300 mb-4 bg-rose-950/60 p-3 rounded-2xl border border-rose-800/60">
              {warningMessage || "Darchadan chiqish, tab almashtirish yoki nusxa olish taqiqlangan!"}
            </p>

            <p className="text-xs text-slate-400 mb-6">
              Diqqat! 3 ta ogohlantirish olsangiz, barcha yozganlaringiz bekor qilinadi va bosh menyuga qaytarilasiz.
            </p>

            <BouncyButton
              variant="danger"
              size="lg"
              className="w-full"
              onClick={() => {
                setShowWarningModal(false);
                requestFullScreenMode();
              }}
            >
              Tushundim, davom etaman
            </BouncyButton>
          </div>
        </div>
      )}

      {/* 3rd Strike Disaster Modal */}
      {isAborted && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-rose-600 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center animate-shake">
            <div className="w-20 h-20 rounded-full bg-rose-600/30 border-4 border-rose-600 text-rose-500 flex items-center justify-center mx-auto mb-5 animate-pulse">
              <XCircle className="w-12 h-12" />
            </div>

            <div className="inline-block bg-rose-600 text-white font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
              3/3 CHEKLOV TUGADI!
            </div>

            <h3 className="text-2xl font-black text-white mb-3">
              IMTIHON BEKOR QILINDI!
            </h3>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Ketma-ket 3 marta qoidani buzdingiz (nusxa olish, tab almashtirish yoki ekrandan chiqish).
              Xavfsizlik tizimi imtihonni to'xtatdi. Siz bosh menyuga qaytarilmoqdasiz...
            </p>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
