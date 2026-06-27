import React, { useState, useEffect } from 'react';
import { QuizQuestion, ModuleId, UserProgressData } from '../types';
import { QUIZ_QUESTIONS } from '../data/chemistryData';
import { Check, X, RotateCcw, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface QuizPanelProps {
  moduleId: ModuleId;
  moduleName: string;
  onQuizCompleted: (score: number) => void;
  bestScore: number;
}

export default function QuizPanel({ moduleId, moduleName, onQuizCompleted, bestScore }: QuizPanelProps) {
  const questions = QUIZ_QUESTIONS[moduleId] || [];
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  
  // Matching states
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [answersChecked, setAnswersChecked] = useState<boolean[]>([]); // track if each answer was correct
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [explanationText, setExplanationText] = useState<string>('');

  const activeQuestion = questions[currentIdx];

  // Reset states when changing modules or resetting
  useEffect(() => {
    setCurrentIdx(0);
    setScore(0);
    setHasSubmitted(false);
    setSelectedOpt(null);
    setTfAnswer(null);
    setBlankAnswer('');
    setMatchingPairs({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowSummary(false);
    setAnswersChecked([]);
    setFeedbackText('');
    setExplanationText('');
  }, [moduleId]);

  if (!activeQuestion) {
    return <div className="text-zinc-400 font-mono text-xs">No quiz questions found for this module.</div>;
  }

  // Handle matching interaction
  const handleLeftClick = (val: string) => {
    if (hasSubmitted) return;
    setSelectedLeft(val);
    if (selectedRight) {
      setMatchingPairs((prev) => ({ ...prev, [val]: selectedRight }));
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRightClick = (val: string) => {
    if (hasSubmitted) return;
    setSelectedRight(val);
    if (selectedLeft) {
      setMatchingPairs((prev) => ({ ...prev, [selectedLeft]: val }));
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const checkAnswer = () => {
    if (hasSubmitted) return;

    let isCorrect = false;

    if (activeQuestion.type === 'mcq' || activeQuestion.type === 'image') {
      isCorrect = selectedOpt === activeQuestion.answer;
    } else if (activeQuestion.type === 'tf') {
      isCorrect = tfAnswer === activeQuestion.answer;
    } else if (activeQuestion.type === 'blank') {
      isCorrect = blankAnswer.toLowerCase().trim() === (activeQuestion.answer as string).toLowerCase().trim();
    } else if (activeQuestion.type === 'match') {
      const correctPairs = activeQuestion.answer as Record<string, string>;
      const totalPairsCount = Object.keys(correctPairs).length;
      let matchedCount = 0;
      Object.entries(correctPairs).forEach(([lKey, rVal]) => {
        if (matchingPairs[lKey] === rVal) matchedCount++;
      });
      isCorrect = matchedCount === totalPairsCount;
    }

    // Progress scoring
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);
    setAnswersChecked((prev) => [...prev, isCorrect]);
    setHasSubmitted(true);

    if (isCorrect) {
      setFeedbackText(activeQuestion.reinforcement);
    } else {
      let correctDesc = '';
      if (activeQuestion.type === 'mcq' || activeQuestion.type === 'image') {
        correctDesc = `Correct answer is: ${activeQuestion.options?.[activeQuestion.answer as number]}`;
      } else if (activeQuestion.type === 'tf') {
        correctDesc = `Correct answer is: ${activeQuestion.answer ? 'True' : 'False'}`;
      } else if (activeQuestion.type === 'blank') {
        correctDesc = `Correct answer is: "${activeQuestion.answer}"`;
      } else if (activeQuestion.type === 'match') {
        correctDesc = 'Incorrect matching. Inspect correct pairs on the screen.';
      }
      setFeedbackText(`Not quite. ${correctDesc}`);
    }
    setExplanationText(activeQuestion.explanation);
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setHasSubmitted(false);
      setSelectedOpt(null);
      setTfAnswer(null);
      setBlankAnswer('');
      setMatchingPairs({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setFeedbackText('');
      setExplanationText('');
    } else {
      setShowSummary(true);
      onQuizCompleted(score);
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setHasSubmitted(false);
    setSelectedOpt(null);
    setTfAnswer(null);
    setBlankAnswer('');
    setMatchingPairs({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowSummary(false);
    setAnswersChecked([]);
    setFeedbackText('');
    setExplanationText('');
  };

  // Inline SVG schematic generator to show for rich image questions
  const renderInteractiveDiagram = (type: string) => {
    if (type === 'bohr') {
      return (
        <svg className="w-full h-32 text-teal-400 fill-none stroke-current" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="4" className="fill-red-500 stroke-none" />
          <text x="50" y="52" className="fill-white text-[5px] text-center font-mono font-bold" textAnchor="middle">10N6P</text>
          <circle cx="50" cy="50" r="20" strokeWidth="0.5" className="stroke-violet-800/40" />
          <circle cx="50" cy="50" r="35" strokeWidth="0.5" className="stroke-violet-800/40" />
          {/* Electrons on orbits */}
          <circle cx="34" cy="38" r="1.5" className="fill-teal-400 stroke-none" />
          <circle cx="66" cy="62" r="1.5" className="fill-teal-400 stroke-none" />
          {/* Shell 2 */}
          <circle cx="15" cy="50" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="85" cy="50" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="50" cy="15" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="50" cy="85" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="25" cy="25" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="75" cy="25" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="25" cy="75" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="75" cy="75" r="1.8" className="fill-teal-400 stroke-none" />
        </svg>
      );
    }
    if (type === 'lewis') {
      return (
        <svg className="w-full h-32 text-amber-400 fill-none stroke-current" viewBox="0 0 180 80">
          <text x="40" y="45" className="fill-white font-mono text-sm" textAnchor="middle">O</text>
          <text x="90" y="45" className="fill-white font-mono text-sm" textAnchor="middle">C</text>
          <text x="140" y="45" className="fill-white font-mono text-sm" textAnchor="middle">O</text>
          {/* Lone pairs */}
          <circle cx="25" cy="30" r="1.5" className="fill-amber-400 stroke-none" />
          <circle cx="25" cy="50" r="1.5" className="fill-amber-400 stroke-none" />
          <circle cx="35" cy="20" r="1.5" className="fill-amber-400 stroke-none" />
          <circle cx="45" cy="20" r="1.5" className="fill-amber-400 stroke-none" />
          <circle cx="155" cy="30" r="1.5" className="fill-amber-400 stroke-none" />
          <circle cx="155" cy="50" r="1.5" className="fill-amber-400 stroke-none" />
          {/* Shared Double Covalent bonds dots */}
          <circle cx="65" cy="35" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="65" cy="45" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="70" cy="35" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="70" cy="45" r="1.8" className="fill-teal-400 stroke-none" />

          <circle cx="110" cy="35" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="110" cy="45" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="115" cy="35" r="1.8" className="fill-teal-400 stroke-none" />
          <circle cx="115" cy="45" r="1.8" className="fill-teal-400 stroke-none" />
        </svg>
      );
    }
    if (type === 'reaction') {
      return (
        <svg className="w-full h-32 text-violet-400 fill-none stroke-current animate-pulse" viewBox="0 0 200 80">
          <rect x="10" y="20" width="40" height="30" rx="4" className="stroke-violet-800/85 fill-slate-900" />
          <text x="30" y="38" className="fill-white font-mono text-center text-xs" textAnchor="middle">CH₄</text>
          <text x="60" y="39" className="fill-zinc-400 font-bold">+</text>
          
          <rect x="80" y="20" width="40" height="30" rx="4" className="stroke-violet-800/85 fill-slate-900" />
          <text x="100" y="38" className="fill-white font-mono text-xs" textAnchor="middle">2 O₂</text>
          <text x="130" y="39" className="fill-zinc-400 font-bold">→</text>

          <rect x="150" y="20" width="40" height="30" rx="4" className="stroke-teal-500 fill-slate-900" />
          <text x="170" y="38" className="fill-teal-400 font-mono text-[9px]" textAnchor="middle">CO₂ + 2H₂O</text>
        </svg>
      );
    }
    return (
      <div className="w-full h-32 flex items-center justify-center border border-dashed border-violet-900/30 rounded-xl bg-slate-950/20">
        <HelpCircle className="w-10 h-10 text-violet-700/60 animate-bounce" />
      </div>
    );
  };

  const getEndingMessageTier = (quizScore: number) => {
    if (quizScore === 5) return { text: "Master Chemist! ⚗️ You've got this element-ary!", borderCls: 'border-teal-500 bg-teal-500/5' };
    if (quizScore >= 3) return { text: "Good Reaction! Review the module and try again.", borderCls: 'border-amber-500 bg-amber-500/5' };
    return { text: "Don't precipitate — let's revisit this together.", borderCls: 'border-red-500 bg-red-500/5' };
  };

  return (
    <div className="w-full border border-violet-950/40 rounded-xl bg-slate-950/70 p-5 backdrop-blur-md relative overflow-hidden" id="quiz-main-container">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-radial-gradient from-violet-600/5 to-transparent pointer-events-none" />

      {/* Header HUD */}
      <div className="flex items-center justify-between border-b border-violet-950/40 pb-3 mb-4 relative z-10">
        <div>
          <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Academic Assessment</span>
          <h2 className="text-sm font-bold font-mono text-white select-none">Module Quiz: {moduleName}</h2>
        </div>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <span
              key={idx}
              className={`w-5 h-1.5 rounded-full transition ${
                idx === currentIdx
                  ? 'bg-violet-500'
                  : idx < currentIdx
                  ? answersChecked[idx]
                    ? 'bg-teal-500'
                    : 'bg-red-500'
                  : 'bg-slate-800'
              }`}
              id={`quiz-progress-bar-${idx}`}
            />
          ))}
        </div>
      </div>

      {!showSummary ? (
        <div className="space-y-4 relative z-10" id="quiz-question-view">
          {/* Question Label */}
          <div className="bg-slate-900/90 border border-violet-950/30 rounded-xl p-4">
            <span className="text-[10px] font-mono text-zinc-500 block mb-1">Question {currentIdx + 1} of 5</span>
            <p className="text-xs font-bold text-[#0D1B4B] dark:text-white select-text leading-relaxed quiz-question-text">
              {activeQuestion.question}
            </p>
          </div>

          {/* Interactive Graphic if question requires it */}
          {activeQuestion.type === 'image' && activeQuestion.diagramType && (
            <div className="border border-violet-950/30 rounded-xl p-3 bg-slate-950/40 relative">
              {renderInteractiveDiagram(activeQuestion.diagramType)}
            </div>
          )}

          {/* Question interaction blocks depending on type */}
          <div className="mt-4" id="interaction-field">
            {/* MCQ / Image options */}
            {(activeQuestion.type === 'mcq' || activeQuestion.type === 'image') && (
              <div className="grid grid-cols-1 gap-2">
                {activeQuestion.options?.map((opt, oIdx) => {
                  const isSelected = selectedOpt === oIdx;
                  const isCorrectAnswer = oIdx === activeQuestion.answer;
                  let cardStyle = 'border-violet-950/30 bg-slate-900/60 text-zinc-300 hover:border-violet-800';
                  
                  if (hasSubmitted) {
                    if (isCorrectAnswer) cardStyle = 'border-teal-500 bg-teal-500/10 text-teal-400';
                    else if (isSelected) cardStyle = 'border-red-500 bg-red-500/10 text-red-400';
                    else cardStyle = 'border-violet-950/10 bg-slate-950/20 text-zinc-600';
                  } else if (isSelected) {
                    cardStyle = 'border-violet-500 bg-violet-600/10 text-violet-400';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => !hasSubmitted && setSelectedOpt(oIdx)}
                      disabled={hasSubmitted}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition flex items-center justify-between ${cardStyle}`}
                      id={`opt-btn-${oIdx}`}
                    >
                      <span>{opt}</span>
                      {hasSubmitted && isCorrectAnswer && <Check className="w-4 h-4 text-teal-400" />}
                      {hasSubmitted && isSelected && !isCorrectAnswer && <X className="w-4 h-4 text-red-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False interaction */}
            {activeQuestion.type === 'tf' && (
              <div className="flex gap-3">
                {[true, false].map((val) => {
                  const isSelected = tfAnswer === val;
                  const isCorrectAnswer = val === activeQuestion.answer;
                  let cardStyle = 'border-violet-950/40 bg-slate-900/60 text-zinc-300 hover:border-violet-800';
                  
                  if (hasSubmitted) {
                    if (isCorrectAnswer) cardStyle = 'border-teal-500 bg-teal-500/10 text-teal-400';
                    else if (isSelected) cardStyle = 'border-red-500 bg-red-500/10 text-red-400';
                    else cardStyle = 'border-violet-950/10 bg-slate-950/20 text-zinc-600';
                  } else if (isSelected) {
                    cardStyle = 'border-violet-500 bg-violet-600/10 text-violet-400';
                  }

                  return (
                    <button
                      key={val ? 'true' : 'false'}
                      onClick={() => !hasSubmitted && setTfAnswer(val)}
                      disabled={hasSubmitted}
                      className={`flex-1 text-center py-4 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition ${cardStyle}`}
                      id={`tf-btn-${val}`}
                    >
                      {val ? 'True' : 'False'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill-in-the-blank with interactive word bank cards */}
            {activeQuestion.type === 'blank' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-violet-950/50 pb-2">
                  <span className="text-zinc-500 font-mono text-xs">Answer:</span>
                  <input
                    type="text"
                    value={blankAnswer}
                    onChange={(e) => !hasSubmitted && setBlankAnswer(e.target.value)}
                    placeholder="Click a word below or type..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-teal-400 font-mono text-xs placeholder-zinc-600"
                    disabled={hasSubmitted}
                    id="blank-text-input"
                  />
                  {hasSubmitted && (
                    <span className="font-mono text-[10px] text-zinc-500">
                      (Target: "{activeQuestion.answer}")
                    </span>
                  )}
                </div>

                {/* Word bank suggestions */}
                {!hasSubmitted && activeQuestion.wordBank && (
                  <div>
                    <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider block mb-1.5">Word Bank:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.wordBank.map((word) => (
                        <button
                          key={word}
                          onClick={() => setBlankAnswer(word)}
                          className={`text-[10px] font-mono px-3 py-1 border rounded transition-all ${
                            blankAnswer === word
                              ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                              : 'bg-slate-900 border-violet-950/35 text-zinc-400 hover:border-violet-700'
                          }`}
                          id={`word-bank-btn-${word}`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interactive matching lists */}
            {activeQuestion.type === 'match' && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-zinc-500 mb-2">Click an element on the left, then click its partner on the right to match.</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-1.5Packed flex flex-col gap-1.5">
                    {activeQuestion.pairs?.map((p) => {
                      const isSelected = selectedLeft === p.left;
                      const hasPair = matchingPairs[p.left] !== undefined;
                      return (
                        <button
                          key={p.left}
                          onClick={() => handleLeftClick(p.left)}
                          disabled={hasSubmitted}
                          className={`w-full text-left p-2.5 rounded-lg border text-[11px] font-mono transition-all ${
                            isSelected
                              ? 'bg-violet-600/10 border-violet-500 text-violet-400 shadow'
                              : hasPair
                              ? 'bg-teal-500/5 border-teal-950/30 text-teal-500 line-through'
                              : 'bg-slate-900/60 border-violet-950/20 text-zinc-400 hover:border-violet-800'
                          }`}
                          id={`match-l-${p.left}`}
                        >
                          {p.left}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-1.5">
                    {activeQuestion.pairs?.map((p) => {
                      const isSelected = selectedRight === p.right;
                      const isMatchedValue = Object.values(matchingPairs).includes(p.right);
                      return (
                        <button
                          key={p.right}
                          onClick={() => handleRightClick(p.right)}
                          disabled={hasSubmitted}
                          className={`w-full text-left p-2.5 rounded-lg border text-[11px] font-mono transition-all ${
                            isSelected
                              ? 'bg-violet-600/10 border-violet-500 text-violet-400 shadow'
                              : isMatchedValue
                              ? 'bg-teal-500/5 border-teal-950/30 text-teal-500 font-bold'
                              : 'bg-slate-900/60 border-violet-950/20 text-zinc-400 hover:border-violet-800'
                          }`}
                          id={`match-r-${p.right}`}
                        >
                          {p.right}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Matching current state */}
                {!hasSubmitted && Object.keys(matchingPairs).length > 0 && (
                  <button
                    onClick={() => {
                      setMatchingPairs({});
                      setSelectedLeft(null);
                      setSelectedRight(null);
                    }}
                    className="text-[9px] font-mono text-zinc-500 hover:text-white underline mt-2 block ml-auto"
                    id="reset-matching-btn"
                  >
                    Clear Match Mappings
                  </button>
                )}

                {/* Show currently established pairs */}
                {Object.keys(matchingPairs).length > 0 && (
                  <div className="bg-slate-900/40 p-2 border border-violet-950/20 rounded-lg text-[10px] font-mono mt-2" id="matching-pairings-hud">
                    <span className="text-zinc-500 uppercase block mb-1">Current Pairings:</span>
                    <div className="space-y-1">
                      {Object.entries(matchingPairs).map(([lKey, rVal]) => {
                        const correctVal = (activeQuestion.answer as Record<string, string>)[lKey];
                        const isCorrect = correctVal === rVal;
                        return (
                          <div key={lKey} className={`flex items-center justify-between ${hasSubmitted ? (isCorrect ? 'text-teal-400' : 'text-red-400') : 'text-zinc-300'}`}>
                            <span>{lKey} ➔ {rVal}</span>
                            {hasSubmitted && (isCorrect ? <Check className="w-3 h-3 ml-1" /> : <X className="w-3 h-3 ml-1" />)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation Hud Feedback & Explanation */}
          {hasSubmitted && (
            <div className={`p-4 border rounded-xl relative ${answersChecked[currentIdx] ? 'border-teal-500/30 bg-teal-500/5' : 'border-red-500/30 bg-red-500/5'}`} id="quiz-verdict-hud">
              <div className="flex items-start gap-2.5">
                {answersChecked[currentIdx] ? (
                  <Check className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <h4 className={`text-xs font-bold font-mono uppercase tracking-wide ${answersChecked[currentIdx] ? 'text-teal-400' : 'text-red-400'}`}>
                    {answersChecked[currentIdx] ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p className="text-xs text-[#0D1B4B] dark:text-[#F4F4F5] mt-1 select-text leading-relaxed font-sans italic quiz-feedback-text">
                    "{feedbackText}"
                  </p>
                  <p className="text-xs text-[#1E293B] dark:text-[#D4D4D8] mt-2 border-t border-violet-950/30 pt-1.5 select-text leading-relaxed font-sans quiz-explanation-text">
                    <strong className="text-[#0D1B4B] dark:text-white">Tutor ChemAI explanation:</strong> {explanationText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nav CTAs */}
          <div className="flex justify-end gap-2 mt-4" id="quiz-action-bar">
            {/* Answer trigger */}
            {!hasSubmitted && (
              <button
                onClick={checkAnswer}
                disabled={
                  (activeQuestion.type === 'mcq' || activeQuestion.type === 'image') && selectedOpt === null ||
                  (activeQuestion.type === 'tf' && tfAnswer === null) ||
                  (activeQuestion.type === 'blank' && !blankAnswer.trim()) ||
                  (activeQuestion.type === 'match' && Object.keys(matchingPairs).length < (activeQuestion.pairs?.length || 0))
                }
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold tracking-wider text-xs uppercase px-4 rounded-lg shadow-md transition-all duration-200"
                id="submit-answer-btn"
              >
                Submit Claim
              </button>
            )}

            {/* Advance button */}
            {hasSubmitted && (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold tracking-wider text-xs uppercase rounded-lg shadow-md transition-all duration-200 flex items-center gap-1.5"
                id="next-question-btn"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Seal Verdict'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Summary scorecard screen */
        <div className="text-center p-6 space-y-5 border border-violet-950/40 rounded-xl bg-slate-950/60 relative z-10" id="quiz-score-summary">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/30 mb-2">
            <span className="text-3xl">🏆</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Evaluation Concluded</span>
            <h3 className="text-lg font-bold font-mono text-zinc-100 select-none">{moduleName} Quiz</h3>
          </div>

          <div className="py-4 border-y border-violet-950/20 max-w-sm mx-auto flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-xs font-mono text-zinc-500 uppercase">Score Earned</span>
              <div className="text-4xl font-extrabold font-mono text-teal-400 mt-1">{score} <span className="text-lg text-zinc-500 font-semibold">/ 5</span></div>
            </div>
            <div className="w-px h-10 bg-violet-950" />
            <div className="text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Previous Personal Best</span>
              <div className="text-xs font-mono text-zinc-300 font-bold mt-1">{bestScore} / 5</div>
            </div>
          </div>

          {/* Fun tiered feedback card */}
          <div className={`p-4 rounded-xl border max-w-md mx-auto ${getEndingMessageTier(score).borderCls}`} id="verdict-tier-msg">
            <p className="text-xs font-mono font-medium text-teal-400">
              {getEndingMessageTier(score).text}
            </p>
            {score >= 3 ? (
              <p className="text-[10px] text-zinc-500 font-sans mt-1.5">You have completed this lesson module successfully, unlocking +100 chemistry experience points (XP) to spend!</p>
            ) : (
              <p className="text-[10px] text-zinc-500 font-sans mt-1.5">No worries, study the simulations again to grasp the bonds and kinetic theories, and retry when you are ready!</p>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 border border-violet-950 hover:bg-slate-900 text-zinc-300 rounded-lg text-xs font-mono transition flex items-center gap-2"
              id="retry-quiz-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
