import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { Exam, Question, ExamAttempt } from '../types';

interface CBTExamInterfaceProps {
  exam: Exam;
  questions: Question[];
  attempt: ExamAttempt;
  onAutoSaveAnswer: (answers: Record<string, 'A' | 'B' | 'C' | 'D'>, timeSpent: number, flagged: string[]) => void;
  onSubmitExam: (answers: Record<string, 'A' | 'B' | 'C' | 'D'>, timeSpent: number) => void;
  onExitExam: () => void;
}

export const CBTExamInterface: React.FC<CBTExamInterfaceProps> = ({
  exam,
  questions,
  attempt,
  onAutoSaveAnswer,
  onSubmitExam,
  onExitExam
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>(attempt.answers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>(attempt.flaggedQuestions || []);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer logic
  const totalDurationSeconds = exam.durationMinutes * 60;
  const initialTimeSpent = attempt.timeSpentSeconds || 0;
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, totalDurationSeconds - initialTimeSpent)
  );

  const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer Interval Effect
  useEffect(() => {
    if (remainingSeconds <= 0) {
      // Automatic submission on timer expiration!
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });

      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Auto Save Effect (Persists state every 5 seconds or whenever answers change)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      onAutoSaveAnswer(answers, timeSpent, flaggedQuestions);
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [answers, timeSpent, flaggedQuestions]);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);
  };

  const handleClearOption = () => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    if (flaggedQuestions.includes(currentQuestion.id)) {
      setFlaggedQuestions(flaggedQuestions.filter((id) => id !== currentQuestion.id));
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion.id]);
    }
  };

  const handleFinalSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onSubmitExam(answers, timeSpent);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const isTimerLow = remainingSeconds < 180; // Warning color when under 3 minutes

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between font-sans selection:bg-[#C8102E] selection:text-white">
      {/* Top Fixed Header */}
      <header className="bg-[#002B49] border-b-2 border-[#C8102E] px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#C8102E] text-white flex items-center justify-center font-black text-sm">
            HiiT
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight">{exam.title}</h1>
            <p className="text-[11px] text-slate-300">
              Student: <strong className="text-white">{attempt.studentName}</strong> ({attempt.studentRegNumber})
            </p>
          </div>
        </div>

        {/* Real-Time Timer Display */}
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-1.5 rounded-xl border flex items-center space-x-2 font-mono font-black text-sm transition-colors ${
            isTimerLow
              ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-emerald-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span>TIME REMAINING: {formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-2 bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Active Question & Options */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Question Header & Indicator */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleFlag}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 border ${
                    flaggedQuestions.includes(currentQuestion?.id || '')
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                      : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flaggedQuestions.includes(currentQuestion?.id || '') ? 'Flagged for Review' : 'Flag Question'}</span>
                </button>

                {answers[currentQuestion?.id || ''] && (
                  <button
                    onClick={handleClearOption}
                    className="px-3 py-1 bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                    title="Clear selected option"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Answer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            {currentQuestion ? (
              <div className="space-y-6">
                <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                {/* 4 Options */}
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    const optText = currentQuestion[`option${opt}` as keyof Question];
                    const isSelected = answers[currentQuestion.id] === opt;

                    return (
                      <div
                        key={opt}
                        onClick={() => handleOptionSelect(opt)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 text-sm font-semibold ${
                          isSelected
                            ? 'bg-[#002B49] border-[#C8102E] text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-[#C8102E] text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt}
                        </span>
                        <span className="mt-0.5">{optText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No question loaded.</p>
            )}
          </div>

          {/* Navigation Control Bar */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-slate-400">
              Auto-saved to HiiT Cloud
            </span>

            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 bg-[#002B49] hover:bg-[#001d32] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1 border border-slate-600"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Question Palette Navigation Grid */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Question Palette
            </h3>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = flaggedQuestions.includes(q.id);

                let bgClass = 'bg-slate-900 border-slate-700 text-slate-400';
                if (isAnswered) bgClass = 'bg-emerald-600 border-emerald-500 text-white font-bold';
                if (isFlagged) bgClass = 'bg-amber-600 border-amber-500 text-white font-bold';
                if (isCurrent) bgClass += ' ring-2 ring-white scale-105';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-4 border-t border-slate-700/80 space-y-2 text-[11px] text-slate-400 font-semibold">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700"></span>
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                <span>Flagged for Review ({flaggedQuestions.length})</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="w-full py-3 bg-[#C8102E] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-colors uppercase tracking-wider"
          >
            Submit Examination
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-950 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">Confirm Exam Submission</h3>
            <p className="text-xs text-slate-300">
              You have answered <strong className="text-emerald-400">{answeredCount}</strong> out of <strong className="text-white">{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span className="block text-amber-400 font-bold mt-1">
                  Warning: You still have {questions.length - answeredCount} unanswered questions!
                </span>
              )}
            </p>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl"
              >
                Return to Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 bg-[#C8102E] hover:bg-red-700 text-xs font-extrabold text-white rounded-xl shadow-md"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
