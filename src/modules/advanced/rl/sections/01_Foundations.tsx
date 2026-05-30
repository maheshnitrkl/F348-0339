import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    HelpCircle, 
    TrendingUp, 
    Terminal, 
    Sparkles,
    CheckCircle,
    Info
} from 'lucide-react';
import { MathEquation } from '../components/MathEquation';

export const Foundations: React.FC = () => {
    // --- State for Agent-Env Loop Visualization ---
    const [loopPlaying, setLoopPlaying] = useState(false);
    const [loopStep, setLoopStep] = useState(0); // 0: State/Reward, 1: Action Selection, 2: Environment transition
    const [loopLog, setLoopLog] = useState<string[]>([
        't=0: System initialized. Agent at S_0 (Resting)'
    ]);
    const [simState, setSimState] = useState<'Resting' | 'Working' | 'Exhausted'>('Resting');
    const [simReward, setSimReward] = useState<number>(0);

    // --- State for MDP Graph Visualization ---
    const [selectedState, setSelectedState] = useState<'S0' | 'S1' | 'S2'>('S0');
    const [selectedAction, setSelectedAction] = useState<string>('Relax');
    const [transitionResult, setTransitionResult] = useState<string>('');
    const [transitionHistory, setTransitionHistory] = useState<string[]>([]);

    // --- Agent-Env Loop Simulation logic ---
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (loopPlaying) {
            interval = setInterval(() => {
                setLoopStep(prev => {
                    const next = (prev + 1) % 3;
                    if (next === 0) {
                        // Environment returns State & Reward
                        let reward = 0;
                        let nextState: 'Resting' | 'Working' | 'Exhausted' = 'Resting';
                        if (simState === 'Resting') {
                            const act = Math.random() > 0.4 ? 'Work' : 'Relax';
                            if (act === 'Work') {
                                nextState = 'Working';
                                reward = +2;
                            } else {
                                nextState = 'Resting';
                                reward = +1;
                            }
                        } else if (simState === 'Working') {
                            const act = Math.random() > 0.6 ? 'Work' : 'Relax';
                            if (act === 'Work') {
                                nextState = 'Exhausted';
                                reward = -3;
                            } else {
                                nextState = 'Resting';
                                reward = +1;
                            }
                        } else {
                            // Exhausted
                            nextState = 'Resting';
                            reward = 0;
                        }
                        setSimState(nextState);
                        setSimReward(reward);
                        setLoopLog(log => [
                            `t=${log.length}: Env transitioned to state ${nextState} (Reward: ${reward >= 0 ? '+' : ''}${reward})`,
                            ...log.slice(0, 7)
                        ]);
                    } else if (next === 1) {
                        // Agent selects Action
                        let action = 'Relax';
                        if (simState === 'Resting') {
                            action = Math.random() > 0.4 ? 'Study/Work' : 'Relax';
                        } else if (simState === 'Working') {
                            action = Math.random() > 0.5 ? 'Keep Working' : 'Take a Break';
                        } else {
                            action = 'Rest/Recover';
                        }
                        setLoopLog(log => [
                            `t=${log.length}: Agent selected action "${action}" based on policy π`,
                            ...log.slice(0, 7)
                        ]);
                    } else {
                        // Action executed in Env
                        setLoopLog(log => [
                            `t=${log.length}: Action applied to Environment. Transitioning...`,
                            ...log.slice(0, 7)
                        ]);
                    }
                    return next;
                });
            }, 1800);
        }
        return () => clearInterval(interval);
    }, [loopPlaying, simState]);

    const resetLoopSim = () => {
        setLoopPlaying(false);
        setLoopStep(0);
        setSimState('Resting');
        setSimReward(0);
        setLoopLog(['t=0: System initialized. Agent at S_0 (Resting)']);
    };

    // --- MDP Simulation logic ---
    const handleTransition = () => {
        let rand = Math.random();
        let next: 'S0' | 'S1' | 'S2' = 'S0';
        let reward = 0;
        let message = '';

        if (selectedState === 'S0') {
            if (selectedAction === 'Relax') {
                // 100% stay in S0, reward +1
                next = 'S0';
                reward = 1;
                message = 'Resting. Safe choice, small reward.';
            } else {
                // Study
                // 80% to S1, 20% stay in S0
                if (rand < 0.8) {
                    next = 'S1';
                    reward = -1; // Effort cost
                    message = 'Studying hard! Transited to "Focused" state.';
                } else {
                    next = 'S0';
                    reward = -1;
                    message = 'Distracted! Wasted time, remained in "Idle".';
                }
            }
        } else if (selectedState === 'S1') {
            if (selectedAction === 'Relax') {
                // 100% to S0, reward +2
                next = 'S0';
                reward = 2;
                message = 'Taking a break. Refreshed and returned to "Idle".';
            } else {
                // Take Exam
                // 70% to S2 (Goal), 30% stay in S1
                if (rand < 0.7) {
                    next = 'S2';
                    reward = +10; // High success reward
                    message = 'Passed the exam! Transited to "Graduate".';
                } else {
                    next = 'S1';
                    reward = -2; // Exam fail cost
                    message = 'Failed exam. Remaining in "Focused" state to try again.';
                }
            }
        } else {
            // S2: Graduate (terminal)
            // Only action is Reset
            next = 'S0';
            reward = 0;
            message = 'Resetting back to Start.';
        }

        setSelectedState(next);
        setTransitionResult(`Outcome: State -> ${next === 'S0' ? 'Idle' : next === 'S1' ? 'Focused' : 'Graduate'}, Reward: ${reward >= 0 ? '+' : ''}${reward}. (${message})`);
        setTransitionHistory(h => [`${selectedState} --(${selectedAction})--> ${next} (R:${reward})`, ...h.slice(0, 4)]);
    };

    // Update valid actions based on selectedState
    useEffect(() => {
        if (selectedState === 'S0') {
            setSelectedAction('Relax');
        } else if (selectedState === 'S1') {
            setSelectedAction('Take Exam');
        } else {
            setSelectedAction('Reset');
        }
    }, [selectedState]);

    return (
        <div className="space-y-12">
            {/* Header section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-bl-3xl flex items-center justify-center text-violet-400 font-bold border-l border-b border-violet-500/20">
                    Ch. 1
                </div>
                <div className="flex items-center gap-2 text-violet-400 mb-2 font-mono text-xs uppercase tracking-wider">
                    <Brain size={14} />
                    Module 1 / 13
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Foundations of Reinforcement Learning</h2>
                <p className="text-lg text-slate-400 max-w-4xl leading-relaxed">
                    Reinforcement Learning (RL) is a paradigm of Machine Learning inspired by behavioral psychology: how an autonomous agent can learn to make decisions in an environment to maximize a cumulative numerical reward signal through trial-and-error interaction.
                </p>
            </div>

            {/* Real World Analogy */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white">1. The Intuitive Loop: Learning by Experience</h3>
                <p className="text-slate-400">
                    Imagine teaching a dog to fetch. You throw a ball (State). The dog can choose to chase it, bark, or sleep (Action). If the dog fetches the ball and brings it back, you give it a treat (Reward). If the dog sleeps, it gets nothing. Over multiple repetitions, the dog associates chasing the ball with positive treats. It has learned a mapping from observations to actions—called a <strong>Policy</strong>.
                </p>
                <p className="text-slate-400">
                    Formally, this closed loop of action and observation forms the bedrock of Reinforcement Learning, represented mathematically as a **Markov Decision Process (MDP)**.
                </p>
            </section>

            {/* Animated Agent-Environment Loop */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-2xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Terminal size={18} className="text-cyan-400" />
                    Interactive Agent-Environment Loop Simulator
                </h4>

                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Visualizer Panel */}
                    <div className="h-64 bg-slate-900/50 rounded-xl border border-slate-800 relative flex items-center justify-between px-12 overflow-hidden">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

                        {/* Agent Box */}
                        <div className={`z-10 w-28 h-28 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                            loopStep === 1 ? 'border-violet-500 bg-violet-950/40 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'border-slate-700 bg-slate-900'
                        }`}>
                            <Brain className="text-violet-400 mb-1" size={28} />
                            <span className="text-white font-bold text-sm">Agent</span>
                            <span className="text-[10px] text-slate-500 font-mono">Policy π(a|s)</span>
                        </div>

                        {/* Connection Arrows & Flowing Signals */}
                        <div className="flex-1 h-full relative flex items-center justify-center">
                            {/* Action Path (Top) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <path d="M 5 70 Q 110 20 220 70" fill="none" stroke={loopStep === 2 ? '#f97316' : '#334155'} strokeWidth="2" strokeDasharray="5 5" className={loopStep === 2 ? 'animate-pulse' : ''} />
                                <path d="M 220 70 L 212 62 M 220 70 L 210 74" fill="none" stroke={loopStep === 2 ? '#f97316' : '#334155'} strokeWidth="2" />

                                {/* State/Reward Path (Bottom) */}
                                <path d="M 220 180 Q 110 230 5 180" fill="none" stroke={loopStep === 0 ? '#10b981' : '#334155'} strokeWidth="2" strokeDasharray="5 5" className={loopStep === 0 ? 'animate-pulse' : ''} />
                                <path d="M 5 180 L 13 188 M 5 180 L 15 176" fill="none" stroke={loopStep === 0 ? '#10b981' : '#334155'} strokeWidth="2" />
                            </svg>

                            {/* Floating Action Text */}
                            {loopStep === 2 && (
                                <motion.div 
                                    initial={{ x: -60, y: -45, opacity: 0 }}
                                    animate={{ x: 60, y: -45, opacity: 1 }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                                >
                                    Action A_t
                                </motion.div>
                            )}

                            {/* Floating State/Reward Text */}
                            {loopStep === 0 && (
                                <motion.div 
                                    initial={{ x: 60, y: 45, opacity: 0 }}
                                    animate={{ x: -60, y: 45, opacity: 1 }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex gap-2"
                                >
                                    <span>S_t</span>
                                    <span>R_t</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Environment Box */}
                        <div className={`z-10 w-28 h-28 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                            loopStep === 0 ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-slate-700 bg-slate-900'
                        }`}>
                            <TrendingUp className="text-emerald-400 mb-1" size={28} />
                            <span className="text-white font-bold text-sm">Environment</span>
                            <span className="text-[10px] text-slate-500 font-mono">Dynamics P(s',r|s,a)</span>
                        </div>
                    </div>

                    {/* Console & Controls Panel */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLoopPlaying(!loopPlaying)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                                    loopPlaying 
                                        ? 'bg-rose-500 text-white hover:bg-rose-600' 
                                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                }`}
                            >
                                {loopPlaying ? <Pause size={16} /> : <Play size={16} />}
                                {loopPlaying ? 'Pause Simulation' : 'Start Simulation'}
                            </button>
                            <button 
                                onClick={resetLoopSim}
                                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-sm flex items-center gap-2 transition-colors"
                            >
                                <RotateCcw size={16} /> Reset
                            </button>
                        </div>

                        {/* Monitor stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-xs text-slate-500 block mb-1">Agent Current State</span>
                                <span className="text-sm font-mono text-white font-bold">{simState}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-xs text-slate-500 block mb-1">Last Environment Reward</span>
                                <span className={`text-sm font-mono font-bold ${simReward > 0 ? 'text-emerald-400' : simReward < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                    {simReward >= 0 ? '+' : ''}{simReward}
                                </span>
                            </div>
                        </div>

                        {/* Terminal Logs */}
                        <div className="bg-black/40 p-4 rounded-xl border border-slate-800 h-36 overflow-y-auto font-mono text-xs text-slate-400 space-y-1 scrollbar-hide">
                            {loopLog.map((log, idx) => (
                                <div key={idx} className={idx === 0 ? 'text-cyan-400 font-bold' : ''}>
                                    &gt; {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Formalizing MDPs */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-violet-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. Markov Decision Processes (MDPs)</h3>
                </div>

                <p className="text-slate-400">
                    To solve RL problems, we model the environment using a **Markov Decision Process**. The critical mathematical assumption in an MDP is the **Markov Property**.
                </p>

                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500" />
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">The Markov Property</h4>
                    <p className="text-sm text-slate-400 mb-4">
                        A state transition has the Markov property if the future state depends <em>only</em> upon the current state and action, completely forgetting all past history.
                    </p>
                    <MathEquation formula="P(S_{t+1} = s', R_{t+1} = r \mid S_t = s_t, A_t = a_t, S_{t-1} = s_{t-1}, A_{t-1} = a_{t-1}, \ldots, S_0 = s_0) = P(S_{t+1} = s', R_{t+1} = r \mid S_t = s_t, A_t = a_t)" block />
                </div>

                <h4 className="text-white font-bold text-lg mb-2">Formal MDP Definition</h4>
                <p className="text-slate-400">
                    An MDP is formally defined by a 5-tuple: <span className="font-mono text-cyan-400">⟨S, A, P, R, γ⟩</span> where:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-400">
                    <li><strong className="text-white">S</strong> is a finite set of states.</li>
                    <li><strong className="text-white">A</strong> is a finite set of actions.</li>
                    <li><strong className="text-white">P</strong> is the state transition probability function: <MathEquation formula="P(s', r \mid s, a) = P(S_{t+1} = s', R_{t+1} = r \mid S_t = s, A_t = a)" />.</li>
                    <li><strong className="text-white">R</strong> is the expected reward function: <MathEquation formula="R(s, a) = \mathbb{E}[R_{t+1} \mid S_t = s, A_t = a]" />.</li>
                    <li><strong className="text-white">γ (Gamma)</strong> is the discount factor <MathEquation formula="\gamma \in [0, 1]" />, determining the agent's valuation of immediate vs. future rewards.</li>
                </ul>

                <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3">
                    <Info className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-slate-400">
                        <strong className="text-amber-300">Why discount rewards?</strong> Mathematically, discounting (<MathEquation formula="\gamma < 1" />) guarantees that cumulative returns remain finite in infinite-horizon settings. Conceptually, it represents risk and preference for immediate gain (just like financial interest rates).
                    </div>
                </div>
            </section>

            {/* Interactive MDP Graph */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-2xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-violet-400" />
                    Interactive 3-State Markov Decision Process Graph
                </h4>

                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* SVG Graphic */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-center relative">
                        <svg viewBox="0 0 500 300" className="w-full max-w-[420px] h-auto">
                            {/* Arrow Markers */}
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
                                </marker>
                                <marker id="arrow-active" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                                </marker>
                            </defs>

                            {/* Transition paths (S0 -> S1, Study) */}
                            <path d="M 80 150 Q 200 60 320 150" fill="none" stroke={selectedState === 'S0' && selectedAction === 'Study' ? '#a855f7' : '#374151'} strokeWidth={selectedState === 'S0' && selectedAction === 'Study' ? 3 : 2} markerEnd={selectedState === 'S0' && selectedAction === 'Study' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                            <text x="200" y="80" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Study (80% S1, R:-1)</text>

                            {/* Transition paths (S1 -> S2, Exam) */}
                            <path d="M 320 150 L 420 150" fill="none" stroke={selectedState === 'S1' && selectedAction === 'Take Exam' ? '#10b981' : '#374151'} strokeWidth={selectedState === 'S1' && selectedAction === 'Take Exam' ? 3 : 2} markerEnd={selectedState === 'S1' && selectedAction === 'Take Exam' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                            <text x="370" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Exam (70% S2, R:+10)</text>

                            {/* Transition paths (S1 -> S0, Relax) */}
                            <path d="M 320 150 Q 200 240 80 150" fill="none" stroke={selectedState === 'S1' && selectedAction === 'Relax' ? '#3b82f6' : '#374151'} strokeWidth={selectedState === 'S1' && selectedAction === 'Relax' ? 3 : 2} markerEnd={selectedState === 'S1' && selectedAction === 'Relax' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                            <text x="200" y="220" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Relax (100% S0, R:+2)</text>

                            {/* Self transition (S0 -> S0, Relax) */}
                            <path d="M 80 150 C 30 110 30 190 80 150" fill="none" stroke={selectedState === 'S0' && selectedAction === 'Relax' ? '#a855f7' : '#374151'} strokeWidth={selectedState === 'S0' && selectedAction === 'Relax' ? 3 : 2} markerEnd={selectedState === 'S0' && selectedAction === 'Relax' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                            <text x="15" y="155" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Relax (100% S0, R:+1)</text>

                            {/* State S0 Circle */}
                            <circle cx="80" cy="150" r="28" fill={selectedState === 'S0' ? '#6d28d9' : '#1f2937'} stroke={selectedState === 'S0' ? '#c084fc' : '#4b5563'} strokeWidth="2" className="cursor-pointer" onClick={() => setSelectedState('S0')} />
                            <text x="80" y="146" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold" className="pointer-events-none">Idle</text>
                            <text x="80" y="162" fill="#a855f7" fontSize="10" textAnchor="middle" className="pointer-events-none">S0</text>

                            {/* State S1 Circle */}
                            <circle cx="320" cy="150" r="28" fill={selectedState === 'S1' ? '#1e3a8a' : '#1f2937'} stroke={selectedState === 'S1' ? '#60a5fa' : '#4b5563'} strokeWidth="2" className="cursor-pointer" onClick={() => setSelectedState('S1')} />
                            <text x="320" y="146" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold" className="pointer-events-none">Focused</text>
                            <text x="320" y="162" fill="#60a5fa" fontSize="10" textAnchor="middle" className="pointer-events-none">S1</text>

                            {/* State S2 Circle */}
                            <circle cx="440" cy="150" r="24" fill={selectedState === 'S2' ? '#064e3b' : '#1f2937'} stroke={selectedState === 'S2' ? '#34d399' : '#4b5563'} strokeWidth="2" className="cursor-pointer" onClick={() => setSelectedState('S2')} />
                            <text x="440" y="146" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold" className="pointer-events-none">Graduate</text>
                            <text x="440" y="160" fill="#34d399" fontSize="8" textAnchor="middle" className="pointer-events-none">S2 (Goal)</text>
                        </svg>
                    </div>

                    {/* Simulation Parameters */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                            <h5 className="font-bold text-white text-sm">Interactive Transition Configurator</h5>
                            <div className="text-xs text-slate-400">
                                Click states in the graph or toggle below to configure:
                            </div>

                            {/* State selector toggle */}
                            <div className="flex gap-2">
                                <span className="text-xs text-slate-500 w-24">Current State:</span>
                                <div className="flex-1 flex gap-1">
                                    {(['S0', 'S1', 'S2'] as const).map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => setSelectedState(s)}
                                            className={`px-2 py-1 rounded text-xs font-bold flex-1 ${selectedState === s ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                        >
                                            {s === 'S0' ? 'Idle' : s === 'S1' ? 'Focused' : 'Graduate'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action selector toggle */}
                            <div className="flex gap-2">
                                <span className="text-xs text-slate-500 w-24">Select Action:</span>
                                <div className="flex-1 flex gap-1">
                                    {selectedState === 'S0' && (
                                        <>
                                            <button onClick={() => setSelectedAction('Relax')} className={`px-2 py-1 rounded text-xs font-bold flex-1 ${selectedAction === 'Relax' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Relax</button>
                                            <button onClick={() => setSelectedAction('Study')} className={`px-2 py-1 rounded text-xs font-bold flex-1 ${selectedAction === 'Study' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Study</button>
                                        </>
                                    )}
                                    {selectedState === 'S1' && (
                                        <>
                                            <button onClick={() => setSelectedAction('Relax')} className={`px-2 py-1 rounded text-xs font-bold flex-1 ${selectedAction === 'Relax' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Relax</button>
                                            <button onClick={() => setSelectedAction('Take Exam')} className={`px-2 py-1 rounded text-xs font-bold flex-1 ${selectedAction === 'Take Exam' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Take Exam</button>
                                        </>
                                    )}
                                    {selectedState === 'S2' && (
                                        <button onClick={() => setSelectedAction('Reset')} className="px-2 py-1 rounded text-xs font-bold flex-1 bg-rose-600 text-white">Reset (Graduate &rarr; Idle)</button>
                                    )}
                                </div>
                            </div>

                            {/* Action expected values */}
                            <div className="bg-black/30 p-2.5 rounded text-[11px] font-mono text-slate-400 space-y-1">
                                <div className="text-violet-400 font-bold mb-1">Transition Distribution:</div>
                                {selectedState === 'S0' && selectedAction === 'Relax' && <div>P(Idle | Idle, Relax) = 1.00 (Reward: +1)</div>}
                                {selectedState === 'S0' && selectedAction === 'Study' && (
                                    <>
                                        <div>P(Focused | Idle, Study) = 0.80 (Reward: -1)</div>
                                        <div>P(Idle | Idle, Study) = 0.20 (Reward: -1)</div>
                                    </>
                                )}
                                {selectedState === 'S1' && selectedAction === 'Relax' && <div>P(Idle | Focused, Relax) = 1.00 (Reward: +2)</div>}
                                {selectedState === 'S1' && selectedAction === 'Take Exam' && (
                                    <>
                                        <div>P(Graduate | Focused, Exam) = 0.70 (Reward: +10)</div>
                                        <div>P(Focused | Focused, Exam) = 0.30 (Reward: -2)</div>
                                    </>
                                )}
                                {selectedState === 'S2' && <div>P(Idle | Graduate, Reset) = 1.00 (Reward: 0)</div>}
                            </div>

                            <button 
                                onClick={handleTransition}
                                className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-lg text-sm transition-all"
                            >
                                Simulate Transition (Roll Die)
                            </button>
                        </div>

                        {/* Transition output */}
                        {transitionResult && (
                            <div className="bg-slate-900/40 p-4 rounded-xl border border-violet-500/20 text-xs font-mono">
                                <div className="text-violet-400 font-bold mb-1">&gt; Transition Result:</div>
                                <div className="text-slate-200">{transitionResult}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 3: Bellman Equations */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-violet-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">3. Policies, Value Functions & Bellman Equations</h3>
                </div>

                <p className="text-slate-400">
                    A **Policy** <MathEquation formula="\pi(a|s)" /> defines the behavior of the agent—it is a probability distribution over actions given a state: <MathEquation formula="\pi(a|s) = P(A_t = a \mid S_t = s)" />.
                </p>

                <h4 className="text-white font-bold text-lg mb-2">Value Functions</h4>
                <p className="text-slate-400">
                    How good is it to be in a state <MathEquation formula="s" />? Or how good is it to perform action <MathEquation formula="a" /> in state <MathEquation formula="s" />? We define two expectation functions to compute these values:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-2">
                        <h5 className="font-bold text-white">State-Value Function <MathEquation formula="V^\pi(s)" /></h5>
                        <p className="text-xs text-slate-400">Expected return starting from state <MathEquation formula="s" />, and following policy <MathEquation formula="\pi" /> thereafter:</p>
                        <MathEquation formula="V^\pi(s) = \mathbb{E}_\pi \left[ \sum_{k=0}^{\infty} \gamma^k R_{t+k+1} \ \middle|\ S_t = s \right]" block />
                    </div>

                    <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-2">
                        <h5 className="font-bold text-white">Action-Value Function <MathEquation formula="Q^\pi(s,a)" /></h5>
                        <p className="text-xs text-slate-400">Expected return starting from state <MathEquation formula="s" />, taking action <MathEquation formula="a" />, and following policy <MathEquation formula="\pi" /> thereafter:</p>
                        <MathEquation formula="Q^\pi(s,a) = \mathbb{E}_\pi \left[ \sum_{k=0}^{\infty} \gamma^k R_{t+k+1} \ \middle|\ S_t = s, A_t = a \right]" block />
                    </div>
                </div>

                <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    Bellman Expectation Equation Derivation
                </h4>
                <p className="text-slate-400">
                    The fundamental relationship in RL is the recursive formulation of values, expressing the value of a state as the immediate reward plus the discounted value of the successor state. Here is the step-by-step derivation:
                </p>

                <div className="bg-black/50 p-6 rounded-xl border border-slate-800 font-mono text-sm overflow-x-auto text-slate-300 space-y-4">
                    <div className="border-b border-slate-800 pb-2 mb-2 text-xs text-slate-500 font-bold uppercase">
                        Derivation of V^π(s)
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className="text-violet-400 font-bold">Step 1: Expand cumulative return <MathEquation formula="G_t" /> into immediate reward plus discounted future return:</span>
                            <MathEquation formula="V^\pi(s) = \mathbb{E}_\pi \left[ R_{t+1} + \gamma G_{t+1} \ \middle|\ S_t = s \right]" block />
                        </div>
                        <div>
                            <span className="text-violet-400 font-bold">Step 2: Use the Law of Total Expectation to condition on actions <MathEquation formula="a" /> and subsequent states <MathEquation formula="s'" />:</span>
                            <MathEquation formula="V^\pi(s) = \sum_{a} \pi(a|s) \mathbb{E}_\pi \left[ R_{t+1} + \gamma G_{t+1} \ \middle|\ S_t = s, A_t = a \right]" block />
                        </div>
                        <div>
                            <span className="text-violet-400 font-bold">Step 3: Expand the expected transition to include probabilities of transition to next states <MathEquation formula="s'" /> and rewards <MathEquation formula="r" />:</span>
                            <MathEquation formula="V^\pi(s) = \sum_{a} \pi(a|s) \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma \mathbb{E}_\pi \left[ G_{t+1} \ \middle|\ S_{t+1} = s' \right] \right]" block />
                        </div>
                        <div>
                            <span className="text-violet-400 font-bold">Step 4: Recognize that <MathEquation formula="\mathbb{E}_\pi [G_{t+1} \mid S_{t+1} = s']" /> is by definition the value of the next state <MathEquation formula="V^\pi(s')" />:</span>
                            <MathEquation formula="V^\pi(s) = \sum_{a} \pi(a|s) \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma V^\pi(s') \right]" block />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h5 className="font-bold text-white">Bellman Optimality Equations</h5>
                    <p className="text-sm text-slate-400">
                        An optimal policy <MathEquation formula="\pi^*" /> maximizes the expected return. Under the optimal policy, the optimal value functions <MathEquation formula="V^*" /> and <MathEquation formula="Q^*" /> satisfy the **Bellman Optimality Equations**, which replace policy expectations with a <MathEquation formula="\max" /> operator over actions:
                    </p>
                    <MathEquation formula="V^*(s) = \max_{a} Q^*(s,a) = \max_a \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma V^*(s') \right]" block />
                    <MathEquation formula="Q^*(s,a) = \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma \max_{a'} Q^*(s', a') \right]" block />
                </div>
            </section>

            {/* Worked Numerical Example */}
            <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={20} />
                    Worked Numerical Example: Calculating V(s)
                </h4>
                <p className="text-sm text-slate-400">
                    Let's trace a single-step calculation of <MathEquation formula="V(S_0)" /> using the interactive MDP defined above. Let's assume a uniform policy where the agent is equally likely to Study or Relax at <MathEquation formula="S_0" />:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                    <div>
                        <strong>1. Environment Parameters:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>Discount factor: <MathEquation formula="\gamma = 0.9" /></li>
                            <li>Policy: <MathEquation formula="\pi(\text{Relax} \mid S_0) = 0.5" />, <MathEquation formula="\pi(\text{Study} \mid S_0) = 0.5" /></li>
                            <li>Current values: <MathEquation formula="V(S_0) = 0.0" /> (Idle), <MathEquation formula="V(S_1) = 5.0" /> (Focused), <MathEquation formula="V(S_2) = 10.0" /> (Graduate)</li>
                        </ul>
                    </div>
                    <div>
                        <strong>2. Calculate expectation for action Relax:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            Relax transition is deterministic: transition to <MathEquation formula="S_0" /> with reward <MathEquation formula="+1" />.
                            <br />
                            <MathEquation formula="Q(S_0, \text{Relax}) = 1.0 + 0.9 \times V(S_0) = 1.0 + 0.9 \times 0 = 1.0" />
                        </div>
                    </div>
                    <div>
                        <strong>3. Calculate expectation for action Study:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            Study transition: 80% to <MathEquation formula="S_1" /> (reward <MathEquation formula="-1" />), 20% to <MathEquation formula="S_0" /> (reward <MathEquation formula="-1" />).
                            <br />
                            <MathEquation formula="Q(S_0, \text{Study}) = -1.0 + 0.9 \times [0.8 \times V(S_1) + 0.2 \times V(S_0)]" />
                            <br />
                            <MathEquation formula="Q(S_0, \text{Study}) = -1.0 + 0.9 \times [0.8 \times 5.0 + 0.2 \times 0] = -1.0 + 0.9 \times 4.0 = -1.0 + 3.6 = 2.6" />
                        </div>
                    </div>
                    <div>
                        <strong>4. Combine using policy weights:</strong>
                        <div className="pl-4 mt-1 text-slate-400 font-bold text-violet-400">
                            <MathEquation formula="V(S_0) = \pi(\text{Relax}\mid S_0) Q(S_0,\text{Relax}) + \pi(\text{Study}\mid S_0) Q(S_0,\text{Study})" />
                            <br />
                            <MathEquation formula="V(S_0) = 0.5 \times 1.0 + 0.5 \times 2.6 = 0.5 + 1.3 = 1.8" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Exploration vs Exploitation */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white">4. The Exploration vs. Exploitation Dilemma</h3>
                <p className="text-slate-400">
                    If an agent finds a policy that yields decent rewards, should it keep executing it (<strong>Exploiting</strong>)? Or should it try novel, untested actions (<strong>Exploring</strong>) to discover if even better rewards exist?
                </p>
                <p className="text-slate-400">
                    This dilemma is central to RL. A simple yet powerful heuristic to solve it is the **<MathEquation formula="\epsilon" />-greedy policy**:
                </p>
                <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800">
                    <MathEquation formula="\pi(a \mid s) = \begin{cases} 1 - \epsilon + \frac{\epsilon}{|A|} & \text{for } a = \text{argmax}_{a'} Q(s, a') \\ \frac{\epsilon}{|A|} & \text{for } a \neq \text{argmax}_{a'} Q(s, a') \end{cases}" block />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        where <MathEquation formula="\epsilon \in [0, 1]" /> represents exploration probability, and <MathEquation formula="|A|" /> is the number of available actions.
                    </p>
                </div>
            </section>

            {/* Code Block */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Terminal size={22} className="text-violet-400" />
                    5. Implementation: Building a Basic Interaction Loop
                </h3>
                <p className="text-slate-400">
                    Below is a standard Python implementation of an Agent-Environment interaction loop using standard Gymnasium interfaces.
                </p>

                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-mono text-slate-400">interaction_loop.py</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Python 3</span>
                    </div>
                    <pre className="p-6 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed bg-black/40">
{`import gym
import numpy as np

class RandomEpsilonGreedyAgent:
    def __init__(self, num_states: int, num_actions: int, epsilon: float = 0.1):
        self.num_actions = num_actions
        self.epsilon = epsilon
        # Tabular action-value estimates Q(s, a)
        self.q_table = np.zeros((num_states, num_actions))
        
    def select_action(self, state: int) -> int:
        # Epsilon-greedy action selection
        if np.random.rand() < self.epsilon:
            # Explore: pick random action
            return np.random.choice(self.num_actions)
        else:
            # Exploit: pick best action
            return int(np.argmax(self.q_table[state]))

# Initialize typical gridworld/FrozenLake environment
env = gym.make("FrozenLake-v1", is_slippery=False)
num_states = env.observation_space.n
num_actions = env.action_space.n

# Create agent
agent = RandomEpsilonGreedyAgent(num_states, num_actions, epsilon=0.1)

# Main interaction loop
num_episodes = 5
for episode in range(num_episodes):
    state = env.reset()[0] if isinstance(env.reset(), tuple) else env.reset()
    terminated = False
    truncated = False
    total_reward = 0
    
    while not (terminated or truncated):
        # 1. Agent selects action
        action = agent.select_action(state)
        
        # 2. Environment steps
        next_state, reward, terminated, truncated, info = env.step(action)
        
        # 3. Accumulate rewards
        total_reward += reward
        state = next_state
        
    print(f"Episode {episode + 1}: Total Reward = {total_reward}")

env.close()`}
                    </pre>
                </div>
            </section>

            {/* Benchmark Results */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white">6. Benchmark Performance Overview</h3>
                <p className="text-slate-400">
                    In tabular Grid World problems, reinforcement learning agents converge rapidly to optimal reward scores once they transition from pure exploration to exploitation.
                </p>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden p-6">
                    <div className="grid grid-cols-3 text-center border-b border-slate-800 pb-3 mb-3 text-xs font-mono text-slate-500 uppercase font-bold">
                        <div>Environment</div>
                        <div>Policy Strategy</div>
                        <div>Steps to Convergence</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2 text-sm text-slate-300 border-b border-slate-900">
                        <div className="font-bold text-white">FrozenLake-v1</div>
                        <div className="text-violet-400">Tabular Q-Learning</div>
                        <div>~250 episodes</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2 text-sm text-slate-300 border-b border-slate-900">
                        <div className="font-bold text-white">CliffWalking-v0</div>
                        <div className="text-violet-400">Tabular SARSA</div>
                        <div>~500 episodes</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2 text-sm text-slate-300">
                        <div className="font-bold text-white">CartPole-v1</div>
                        <div className="text-violet-400">Deep Q-Network</div>
                        <div>~12,000 steps</div>
                    </div>
                </div>
            </section>

            {/* Takeaways Summary Box */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="text-violet-400" size={20} />
                    Key Takeaways: Foundations
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                    <li><strong>MDP Formulation:</strong> Every reinforcement learning problem is formalized as an MDP governed by the Markov property, where state transitions depend solely on the current state and action.</li>
                    <li><strong>Value Functions:</strong> Value functions (<MathEquation formula="V" /> and <MathEquation formula="Q" />) represent the expected future discounted return and are used by agents to evaluate actions.</li>
                    <li><strong>Bellman Equation:</strong> The core recurrence relation stating that the value of the current state equals the immediate reward plus the discounted expected value of the next state.</li>
                    <li><strong>Exploration vs. Exploitation:</strong> Agents must balance exploring the environment to find new paths and exploiting their current knowledge to maximize rewards.</li>
                </ul>
            </section>

            {/* References */}
            <section className="space-y-2 text-xs text-slate-500">
                <h5 className="font-bold uppercase tracking-wider text-slate-400">Further Readings & References</h5>
                <p>1. Sutton, R. S., & Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em>. MIT Press. Chapters 1 & 3.</p>
                <p>2. Bellman, R. (1957). <em>Dynamic Programming</em>. Princeton University Press.</p>
                <p>3. Silver, D. (2015). <em>Introduction to Reinforcement Learning</em>. Lectures 1 & 2. DeepMind.</p>
            </section>
        </div>
    );
};
