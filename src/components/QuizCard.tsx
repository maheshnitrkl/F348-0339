import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy } from 'lucide-react';

export type QuizQuestion = {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
};

interface QuizCardProps {
    /** Stable id — used to persist the learner's best score across sessions. */
    id: string;
    title?: string;
    questions: QuizQuestion[];
    /** Call to action when the learner finishes (defaults to the dashboard). */
    nextHint?: string;
}

const SCORES_STORAGE_KEY = 'neuralnexus.quiz-scores';

/**
 * Knowledge-check card. A framework-neutral version of the DL-Efficiency
 * module's QuizComponent, extended with best-score persistence so quiz results
 * are not lost on reload and can surface a badge when revisiting the page.
 */
function readBestScores(): Record<string, number> {
    try {
        const raw = localStorage.getItem(SCORES_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
        return {};
    }
}

function writeBestScores(scores: Record<string, number>) {
    try {
        localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
    } catch {
        // Private browsing / quota errors are non-fatal.
    }
}

export function QuizCard({ id, title = 'Knowledge Check', questions, nextHint }: QuizCardProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [best] = useState<number | null>(() => readBestScores()[id] ?? null);

    const question = questions[currentIdx];

    const persistBestScore = (finalScore: number) => {
        const scores = readBestScores();
        if (finalScore > (scores[id] ?? 0)) {
            scores[id] = finalScore;
            writeBestScores(scores);
        }
    };

    const handleSubmit = () => {
        if (selectedIdx === null) return;

        if (!hasSubmitted) {
            setHasSubmitted(true);
            if (selectedIdx === question.correctIndex) {
                setScore((s) => s + 1);
            }
        } else {
            // Move to next question
            if (currentIdx < questions.length - 1) {
                setCurrentIdx((c) => c + 1);
                setSelectedIdx(null);
                setHasSubmitted(false);
            } else {
                const finalScore = score;
                persistBestScore(finalScore);
                setIsFinished(true);
            }
        }
    };

    const resetQuiz = () => {
        setCurrentIdx(0);
        setSelectedIdx(null);
        setHasSubmitted(false);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        const perfect = score === questions.length;
        return (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center mt-8 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mb-4">
                    {perfect ? <Trophy size={32} /> : <CheckCircle2 size={32} />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                    {perfect ? 'Perfect Score!' : 'Quiz Complete!'}
                </h3>
                <p className="text-slate-400 mb-6">
                    You scored {score} out of {questions.length}.
                    {best !== null && !perfect && (
                        <span className="block mt-1 text-xs text-slate-500">Personal best: {best}/{questions.length}</span>
                    )}
                </p>
                <div className="w-full bg-slate-800 rounded-full h-2.5 mb-6">
                    <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(score / questions.length) * 100}%` }} />
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button onClick={resetQuiz} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors">
                        Try Again
                    </button>
                    {nextHint && (
                        <span className="text-xs text-slate-500">{nextHint}</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden mt-8 max-w-3xl mx-auto shadow-2xl">
            <div className="bg-slate-900/80 border-b border-slate-800 p-4 backdrop-blur flex justify-between items-center">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <HelpCircle className="text-violet-400" size={20} />
                    {title}
                </h4>
                <div className="text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-full">
                    {currentIdx + 1} / {questions.length}
                </div>
            </div>

            <div className="p-6 md:p-8">
                <h5 className="text-xl text-white font-bold mb-6">{question.question}</h5>

                <div className="space-y-3 mb-8">
                    {question.options.map((opt, idx) => {
                        let btnClass = 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300';
                        let Icon = null;

                        if (hasSubmitted) {
                            if (idx === question.correctIndex) {
                                btnClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold';
                                Icon = <CheckCircle2 size={18} />;
                            } else if (idx === selectedIdx) {
                                btnClass = 'bg-rose-500/20 border-rose-500/50 text-rose-400';
                                Icon = <XCircle size={18} />;
                            } else {
                                btnClass = 'bg-slate-900/20 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed';
                            }
                        } else if (idx === selectedIdx) {
                            btnClass = 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100 ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]';
                        }

                        return (
                            <button
                                key={idx}
                                disabled={hasSubmitted}
                                onClick={() => setSelectedIdx(idx)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${btnClass}`}
                            >
                                <span>{opt}</span>
                                {Icon}
                            </button>
                        );
                    })}
                </div>

                {hasSubmitted && (
                    <div className={`p-4 rounded-xl mb-6 border text-sm ${selectedIdx === question.correctIndex ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' : 'bg-rose-500/10 border-rose-500/20 text-rose-100'}`}>
                        <strong className={`block mb-1 ${selectedIdx === question.correctIndex ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {selectedIdx === question.correctIndex ? 'Correct!' : 'Incorrect.'}
                        </strong>
                        {question.explanation}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        disabled={selectedIdx === null}
                        onClick={handleSubmit}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${
                            selectedIdx === null
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        }`}
                    >
                        {!hasSubmitted ? 'Check Answer' : currentIdx === questions.length - 1 ? 'Finish' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
}
