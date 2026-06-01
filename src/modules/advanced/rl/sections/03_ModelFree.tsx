import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    Terminal, 
    Sparkles, 
    CheckCircle, 
    Info, 
    Sliders,
    Flame,
    Zap,
    HelpCircle
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';

export const ModelFree: React.FC = () => {
    // --- Cliff Walking Environment Configuration ---
    const ROWS = 4;
    const COLS = 12;
    const START_STATE = { r: 3, c: 0 };
    const GOAL_STATE = { r: 3, c: 11 };
    
    // Actions: 0: Up, 1: Down, 2: Left, 3: Right
    const ACTIONS = [
        { name: 'Up', dr: -1, dc: 0, arrow: '↑' },
        { name: 'Down', dr: 1, dc: 0, arrow: '↓' },
        { name: 'Left', dr: 0, dc: -1, arrow: '←' },
        { name: 'Right', dr: 0, dc: 1, arrow: '→' }
    ];

    // --- Hyperparameters & Simulator States ---
    const [algorithm, setAlgorithm] = useState<'sarsa' | 'q-learning'>('q-learning');
    const [alpha, setAlpha] = useState<number>(0.1); // Learning rate
    const [gamma, setGamma] = useState<number>(0.95); // Discount factor
    const [epsilon, setEpsilon] = useState<number>(0.1); // Exploration rate
    
    // Q-table representation: state index (0 to 47) -> array of 4 Q-values
    const [qTable, setQTable] = useState<number[][]>(() => 
        Array.from({ length: ROWS * COLS }, () => [0, 0, 0, 0])
    );
    
    const [agentPos, setAgentPos] = useState<{ r: number; c: number }>(START_STATE);
    const [episodeReward, setEpisodeReward] = useState<number>(0);
    const [episodesCount, setEpisodesCount] = useState<number>(0);
    const [simPlaying, setSimPlaying] = useState<boolean>(false);
    const [currentActionIdx, setCurrentActionIdx] = useState<number>(3); // start pointing right
    const [history, setHistory] = useState<string[]>(['System initialized. Ready to interact.']);
    
    // State for bias-variance slider comparison
    const [lambdaValue, setLambdaValue] = useState<number>(0.5); // λ slider for TD(λ) visualizer

    // Check if state is cliff
    const isCliff = (r: number, c: number): boolean => {
        return r === 3 && c > 0 && c < 11;
    };

    // Check if terminal
    const isGoal = (r: number, c: number): boolean => {
        return r === 3 && c === 11;
    };

    // State to index conversion
    const getIndex = (r: number, c: number): number => r * COLS + c;

    // Get greedy action
    const getGreedyAction = (stateIdx: number, currentQ: number[][]): number => {
        const qVals = currentQ[stateIdx];
        let best = 0;
        let maxQ = qVals[0];
        for (let i = 1; i < 4; i++) {
            if (qVals[i] > maxQ) {
                maxQ = qVals[i];
                best = i;
            }
        }
        return best;
    };

    // Epsilon-Greedy action selection
    const selectAction = (stateIdx: number, currentQ: number[][], currentEpsilon: number): number => {
        if (Math.random() < currentEpsilon) {
            return Math.floor(Math.random() * ACTIONS.length);
        }
        return getGreedyAction(stateIdx, currentQ);
    };

    // Environment transition: returns next position and reward
    const stepEnvironment = (r: number, c: number, actionIdx: number): { nr: number; nc: number; reward: number; reset: boolean } => {
        const action = ACTIONS[actionIdx];
        let nr = r + action.dr;
        let nc = c + action.dc;

        // Boundary check (bounce off edges)
        if (nr < 0 || nr >= ROWS) nr = r;
        if (nc < 0 || nc >= COLS) nc = c;

        if (isCliff(nr, nc)) {
            return { nr: START_STATE.r, nc: START_STATE.c, reward: -100, reset: true };
        }
        if (isGoal(nr, nc)) {
            return { nr, nc, reward: 0, reset: true };
        }
        return { nr, nc, reward: -1, reset: false };
    };

    // Live training of N episodes in the background
    const trainEpisodes = (numEpisodes: number) => {
        const newQ = qTable.map(arr => [...arr]);
        let totalEpisodes = episodesCount;

        for (let ep = 0; ep < numEpisodes; ep++) {
            let r = START_STATE.r;
            let c = START_STATE.c;
            let sIdx = getIndex(r, c);
            let aIdx = selectAction(sIdx, newQ, epsilon);

            while (!isGoal(r, c)) {
                const { nr, nc, reward } = stepEnvironment(r, c, aIdx);
                const nsIdx = getIndex(nr, nc);
                
                // Next action for SARSA
                const naIdx = selectAction(nsIdx, newQ, epsilon);

                if (algorithm === 'q-learning') {
                    // Q-Learning: Q(s, a) <- Q(s, a) + alpha * [ r + gamma * max_a' Q(s', a') - Q(s, a) ]
                    const maxNextQ = Math.max(...newQ[nsIdx]);
                    newQ[sIdx][aIdx] += alpha * (reward + gamma * maxNextQ - newQ[sIdx][aIdx]);
                } else {
                    // SARSA: Q(s, a) <- Q(s, a) + alpha * [ r + gamma * Q(s', a') - Q(s, a) ]
                    newQ[sIdx][aIdx] += alpha * (reward + gamma * newQ[nsIdx][naIdx] - newQ[sIdx][aIdx]);
                }

                r = nr;
                c = nc;
                sIdx = nsIdx;
                aIdx = naIdx;
            }
            totalEpisodes++;
        }

        setQTable(newQ);
        setEpisodesCount(totalEpisodes);
        setAgentPos(START_STATE);
        setEpisodeReward(0);
        setHistory(prev => [
            `Trained ${numEpisodes} episodes using ${algorithm.toUpperCase()}. (Total: ${totalEpisodes} episodes)`,
            ...prev.slice(0, 5)
        ]);
    };

    // Single step of simulator (Visual updates)
    const runSingleStep = () => {
        if (isGoal(agentPos.r, agentPos.c)) {
            setAgentPos(START_STATE);
            setEpisodeReward(0);
            return;
        }

        const sIdx = getIndex(agentPos.r, agentPos.c);
        // Choose action epsilon-greedily
        const aIdx = selectAction(sIdx, qTable, epsilon);
        setCurrentActionIdx(aIdx);

        // Step environment
        const { nr, nc, reward, reset } = stepEnvironment(agentPos.r, agentPos.c, aIdx);
        const nsIdx = getIndex(nr, nc);

        // SARSA vs Q-Learning updates
        const nextAIdx = selectAction(nsIdx, qTable, epsilon);
        const newQ = qTable.map(arr => [...arr]);

        if (algorithm === 'q-learning') {
            const maxNextQ = Math.max(...newQ[nsIdx]);
            newQ[sIdx][aIdx] += alpha * (reward + gamma * maxNextQ - newQ[sIdx][aIdx]);
        } else {
            newQ[sIdx][aIdx] += alpha * (reward + gamma * newQ[nsIdx][nextAIdx] - newQ[sIdx][aIdx]);
        }

        setQTable(newQ);
        setAgentPos({ r: nr, c: nc });
        setEpisodeReward(prev => prev + reward);

        const actionName = ACTIONS[aIdx].name;
        let eventLog = `State S${sIdx} -> Take ${actionName} -> Reward: ${reward}. `;
        if (reset) {
            eventLog += isCliff(nr, nc) || (nr === START_STATE.r && nc === START_STATE.c && reward === -100)
                ? 'Fell in Cliff! -100 Penalty. Back to Start.' 
                : 'Reached GOAL! Episode complete.';
            setEpisodesCount(prev => prev + 1);
        }

        setHistory(prev => [eventLog, ...prev.slice(0, 5)]);
    };

    // Auto Play loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (simPlaying) {
            interval = setInterval(() => {
                runSingleStep();
            }, 150);
        }
        return () => clearInterval(interval);
    }, [simPlaying, agentPos, qTable, algorithm, alpha, gamma, epsilon]);

    const resetSimulator = () => {
        setSimPlaying(false);
        setQTable(Array.from({ length: ROWS * COLS }, () => [0, 0, 0, 0]));
        setAgentPos(START_STATE);
        setEpisodeReward(0);
        setEpisodesCount(0);
        setHistory(['Q-Table and episodes reset to zero.']);
    };

    // Color cells based on value state: argmax Q
    const getCellHeatmap = (r: number, c: number): string => {
        if (isCliff(r, c)) return 'rgba(239, 68, 68, 0.2)'; // Cliff red
        if (isGoal(r, c)) return 'rgba(16, 185, 129, 0.2)'; // Goal green
        
        const sIdx = getIndex(r, c);
        const maxQ = Math.max(...qTable[sIdx]);

        if (maxQ === 0) return 'rgba(30, 41, 59, 0.4)'; // slate-800
        
        // Map rewards ranging roughly from -100 to 0
        // Best rewards are close to -5 (path steps)
        // Worst are -100 (cliff)
        // Normalized score from 0 (very bad / unexplored) to 1 (near goal / optimal)
        const normalized = Math.min(Math.max((maxQ + 20) / 20, 0), 1);
        return `rgba(16, 185, 129, ${normalized * 0.4})`; // Soft green heatmap for higher Q values
    };

    return (
        <div className="space-y-12">
            {/* Header Banner */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-3xl flex items-center justify-center text-emerald-400 font-bold border-l border-b border-emerald-500/20">
                    Ch. 3
                </div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2 font-mono text-xs uppercase tracking-wider">
                    <TrendingUp size={14} />
                    Module 3 / 13
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Model-Free Prediction & Control</h2>
                <p className="text-lg text-slate-400 max-w-4xl leading-relaxed">
                    In model-free reinforcement learning, the agent does not possess a transition probability function <MathEquation formula="P(s', r \mid s, a)" /> or reward function <MathEquation formula="R(s, a)" />. Instead, it must learn to predict state values and optimize decisions directly by interacting with the environment, experiencing trajectories, and updating its policy dynamically.
                </p>
            </div>

            {/* 1. Prediction: MC vs TD */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-emerald-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">1. Model-Free Prediction: Learning to Estimate</h3>
                </div>
                <p className="text-slate-400">
                    Before we can maximize rewards (Control), we must solve the **Prediction Problem**: given an arbitrary policy <MathEquation formula="\pi" />, what is its state-value function <MathEquation formula="V^\pi" />? We achieve this without a model using two main approaches: **Monte Carlo (MC)** and **Temporal Difference (TD)** learning.
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Monte Carlo Prediction */}
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold flex items-center gap-2">
                            <Flame className="text-amber-500" size={18} />
                            Monte Carlo (MC) Methods
                        </h4>
                        <p className="text-sm text-slate-400">
                            MC methods learn value functions directly from **complete episodes** of experience. Upon completing an episode starting at state <MathEquation formula="S_t" />, we calculate the empirical cumulative return <MathEquation formula="G_t" /> and pull the value function toward it:
                        </p>
                        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-center border border-slate-800">
                            <MathEquation formula="V(S_t) \leftarrow V(S_t) + \alpha \left( G_t - V(S_t) \right)" block />
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
                            <li><strong>First-Visit MC:</strong> Only averages returns following the first occurrence of state <MathEquation formula="s" /> within an episode.</li>
                            <li><strong>Every-Visit MC:</strong> Averages returns following every occurrence of state <MathEquation formula="s" />.</li>
                            <li><strong>Zero Bias:</strong> By using empirical returns, MC estimates are completely unbiased expectations of the true return.</li>
                            <li><strong>High Variance:</strong> Returns depend on a long sequence of random state/action transitions, leading to high statistical noise.</li>
                        </ul>
                    </div>

                    {/* Temporal Difference Prediction */}
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold flex items-center gap-2">
                            <Zap className="text-emerald-400" size={18} />
                            Temporal Difference (TD) Learning
                        </h4>
                        <p className="text-sm text-slate-400">
                            TD learning updates value estimates **after a single step** rather than waiting for episode termination. It achieves this by **bootstrapping**—estimating the remainder of the return using its own current value function:
                        </p>
                        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-center border border-slate-800">
                            <MathEquation formula="V(S_t) \leftarrow V(S_t) + \alpha \left( R_{t+1} + \gamma V(S_{t+1}) - V(S_t) \right)" block />
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
                            <li><strong>TD Target:</strong> The step estimate <MathEquation formula="R_{t+1} + \gamma V(S_{t+1})" />.</li>
                            <li><strong>TD Error:</strong> The difference between target and estimate: <MathEquation formula="\delta_t = R_{t+1} + \gamma V(S_{t+1}) - V(S_t)" />.</li>
                            <li><strong>Some Bias:</strong> Because it updates estimates based on other estimates (bootstrapping), initial values introduce estimation bias.</li>
                            <li><strong>Low Variance:</strong> Relies only on one step of transition randomness, resulting in much cleaner, faster convergence.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Interactive Bias-Variance Tradeoff Slider */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-white font-bold flex items-center gap-2 text-lg">
                            <Sliders size={18} className="text-emerald-400" />
                            The TD(<MathEquation formula="\lambda" />) Continuum & Bias-Variance Tradeoff
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Use the slider to transition from TD(0) (pure bootstrapping) to Monte Carlo (pure empirical observation).
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Control Panel */}
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono text-slate-400">
                                <span>Trace Decay Parameter (λ):</span>
                                <span className="text-emerald-400 font-bold">{lambdaValue.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05"
                                value={lambdaValue} 
                                onChange={(e) => setLambdaValue(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="text-[11px] font-mono space-y-2 text-slate-400">
                            <div>
                                <span className="text-white font-bold">Current Regime:</span>{' '}
                                {lambdaValue === 0 ? (
                                    <span className="text-emerald-400">One-Step TD(0)</span>
                                ) : lambdaValue === 1 ? (
                                    <span className="text-amber-500">Monte Carlo (TD(1))</span>
                                ) : (
                                    <span className="text-violet-400">n-Step TD (Intermediate λ-Return)</span>
                                )}
                            </div>
                            <div>
                                <span className="text-white font-bold">Forward View Objective (λ-Return):</span>
                                <div className="p-2 bg-black/40 rounded mt-1 text-[10px] overflow-x-auto text-slate-300">
                                    <MathEquation formula="G_t^\lambda = (1-\lambda) \sum_{n=1}^{\infty} \lambda^{n-1} G_{t:t+n}" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metric Bars */}
                    <div className="lg:col-span-2 space-y-4 font-mono text-xs">
                        {/* Bias Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Systematic Estimation Bias</span>
                                <span className="text-rose-400">{( (1 - lambdaValue) * 100 ).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(1 - lambdaValue) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500 block">Bias arises from bootstrap approximations before true rewards are verified.</span>
                        </div>

                        {/* Variance Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Statistical Variance (Noise)</span>
                                <span className="text-amber-400">{( lambdaValue * 100 ).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${lambdaValue * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500 block">Variance spikes as we aggregate long sequences of stochastic steps.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Model-Free Control: SARSA vs Q-Learning */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-emerald-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. Model-Free Control: Optimizing Policies</h3>
                </div>
                <p className="text-slate-400">
                    To optimize behavior in an unknown environment, we apply Generalized Policy Iteration (GPI) using **Action-Value Functions** <MathEquation formula="Q(s, a)" />. The two foundational algorithms are **SARSA** and **Q-Learning**.
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* SARSA Card */}
                    <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-white font-bold text-lg">SARSA (On-Policy TD Control)</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">On-Policy</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            SARSA updates the Q-table based on the action **actually taken** by the current exploration policy <MathEquation formula="\pi" />. The name is derived from the transition tuple: State-Action-Reward-State-Action (<MathEquation formula="S_t, A_t, R_{t+1}, S_{t+1}, A_{t+1}" />).
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg text-center font-mono text-xs border border-slate-800">
                            <MathEquation formula="Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma Q(S_{t+1}, A_{t+1}) - Q(S_t, A_t) \right]" block />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Because it updates values using the actual next action, SARSA accounts for exploration penalties (like falling off a cliff during training) and learns a **conservative, safe policy**.
                        </p>
                    </div>

                    {/* Q-Learning Card */}
                    <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-white font-bold text-lg">Q-Learning (Off-Policy TD Control)</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Off-Policy</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Q-learning updates its estimates assuming the agent will take the **optimal, greedy action** next, regardless of the actual exploring step taken. It decouples the learning target from the behavior policy.
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg text-center font-mono text-xs border border-slate-800">
                            <MathEquation formula="Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma \max_{a} Q(S_{t+1}, a) - Q(S_t, A_t) \right]" block />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Q-learning learns the **optimal, aggressive path**. However, during training under exploring policies, it may repeatedly incur heavy exploration penalties.
                        </p>
                    </div>
                </div>

                {/* Expected SARSA */}
                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-white font-bold">Expected SARSA: Bridging On and Off Policy</h4>
                    <p className="text-sm text-slate-400">
                        Expected SARSA improves stability by taking the expectation over all possible actions in the next state, instead of choosing a single action sample (SARSA) or the maximum (Q-Learning):
                    </p>
                    <div className="bg-black/55 p-4 rounded-lg text-center border border-slate-850">
                        <MathEquation formula="Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma \sum_{a} \pi(a \mid S_{t+1}) Q(S_{t+1}, a) - Q(S_t, A_t) \right]" block />
                    </div>
                </div>
            </section>

            {/* 3. Interactive Cliff Walking Simulator */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-emerald-400" size={20} />
                        Cliff Walking Simulator: SARSA vs. Q-Learning
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Compare SARSA (conservative route) and Q-Learning (shortest path) on the classic Gridworld Cliff problem.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Controls panel */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Training Controls</h5>
                            
                            {/* Algorithm Select */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-slate-500 block">Select Algorithm:</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setAlgorithm('q-learning')}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${algorithm === 'q-learning' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        Q-Learning
                                    </button>
                                    <button 
                                        onClick={() => setAlgorithm('sarsa')}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${algorithm === 'sarsa' ? 'bg-violet-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        SARSA
                                    </button>
                                </div>
                            </div>

                            {/* Live quick training */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-slate-500 block">Instant Training (Back-end sweeps):</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => trainEpisodes(10)}
                                        className="py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
                                    >
                                        Train 10 Ep.
                                    </button>
                                    <button 
                                        onClick={() => trainEpisodes(100)}
                                        className="py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded transition-colors animate-pulse"
                                    >
                                        Train 100 Ep.
                                    </button>
                                </div>
                            </div>

                            {/* Hyperparameter Sliders */}
                            <div className="space-y-3 pt-2 border-t border-slate-800">
                                <div>
                                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                        <span>Exploration Rate (ε):</span>
                                        <span className="text-white font-bold">{epsilon}</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="0.5" step="0.05" value={epsilon}
                                        onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                                        className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                        <span>Learning Rate (α):</span>
                                        <span className="text-white font-bold">{alpha}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.05" max="0.5" step="0.05" value={alpha}
                                        onChange={(e) => setAlpha(parseFloat(e.target.value))}
                                        className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Visual loop triggers */}
                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                                <button 
                                    onClick={runSingleStep}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Single Step
                                </button>
                                <button 
                                    onClick={() => setSimPlaying(!simPlaying)}
                                    className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${simPlaying ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
                                >
                                    {simPlaying ? 'Pause' : 'Auto Step'}
                                </button>
                                <button 
                                    onClick={resetSimulator}
                                    className="px-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Monitor */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Total Training Episodes</span>
                                <span className="text-sm font-mono text-white font-bold">{episodesCount}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Current Episode Reward</span>
                                <span className={`text-sm font-mono font-bold ${episodeReward < -10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {episodeReward}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gridworld Visualizer */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl overflow-x-auto">
                            <div className="min-w-[650px] grid grid-cols-12 gap-1.5">
                                {Array.from({ length: ROWS * COLS }).map((_, idx) => {
                                    const r = Math.floor(idx / COLS);
                                    const c = idx % COLS;
                                    const isAgent = agentPos.r === r && agentPos.c === c;
                                    const isCliffCell = isCliff(r, c);
                                    const isGoalCell = isGoal(r, c);
                                    const isStartCell = r === START_STATE.r && c === START_STATE.c;
                                    
                                    const bestAction = getGreedyAction(idx, qTable);
                                    const hasQValues = Math.max(...qTable[idx]) !== 0;

                                    return (
                                        <div 
                                            key={idx}
                                            className="h-14 rounded border relative flex flex-col items-center justify-center transition-all duration-200"
                                            style={{ 
                                                backgroundColor: getCellHeatmap(r, c),
                                                borderColor: isAgent 
                                                    ? '#10b981' 
                                                    : isCliffCell 
                                                        ? 'rgba(239, 68, 68, 0.4)' 
                                                        : 'rgba(51, 65, 85, 0.3)'
                                            }}
                                        >
                                            {/* Cell Identifier */}
                                            <span className="absolute top-0.5 left-1 text-[7px] text-slate-500">S{idx}</span>

                                            {/* Labels */}
                                            {isCliffCell && <span className="text-[10px] text-red-500 font-bold tracking-wider">CLIFF</span>}
                                            {isGoalCell && <span className="text-[10px] text-emerald-400 font-bold">GOAL</span>}
                                            {isStartCell && !isAgent && <span className="text-[8px] text-slate-500">START</span>}

                                            {/* Policy arrows on non-cliff cells */}
                                            {!isCliffCell && !isGoalCell && hasQValues && (
                                                <span className="text-slate-500 text-xs font-bold absolute bottom-0.5">
                                                    {ACTIONS[bestAction].arrow}
                                                </span>
                                            )}

                                            {/* Agent overlay */}
                                            {isAgent && (
                                                <motion.div 
                                                    layoutId="agent"
                                                    className="w-8 h-8 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] flex items-center justify-center text-slate-950 font-extrabold text-xs z-10"
                                                >
                                                    A
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex gap-4 items-center mt-3 text-[10px] text-slate-400 px-1 font-mono">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-emerald-500/10 border border-emerald-500/30 rounded" />
                                    <span>High Q-Value Path</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded" />
                                    <span>Cliff (-100 reward)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-[#1e293b]/40 border border-slate-700/50 rounded" />
                                    <span>Unexplored / 0 Q-Value</span>
                                </div>
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="bg-black/50 p-4 border border-slate-800 rounded-xl h-28 overflow-y-auto font-mono text-xs text-slate-400 scrollbar-hide">
                            <span className="text-emerald-400 font-bold block mb-1">&gt; Agent Experience Logs:</span>
                            {history.map((log, i) => (
                                <div key={i} className={i === 0 ? 'text-slate-200' : ''}>
                                    - {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pseudocode Box */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg">TD Control Algorithm Box</h4>
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center font-mono text-xs text-slate-400">
                        <span>Algorithm Comparison: SARSA vs Q-Learning</span>
                        <span className="text-[10px] text-slate-500 font-bold">Standard Tabular TD</span>
                    </div>
                    <div className="p-6 text-xs font-mono text-slate-300 space-y-4 leading-relaxed">
                        <div>
                            <strong>SARSA (On-Policy) Loop for each step:</strong>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;Take action <MathEquation formula="A" />, observe reward <MathEquation formula="R" />, and next state <MathEquation formula="S'" /></span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;Choose next action <MathEquation formula="A'" /> from <MathEquation formula="S'" /> using policy derived from <MathEquation formula="Q" /> (e.g. ε-greedy)</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;{"Q(S, A) ← Q(S, A) + α [ R + γ Q(S', A') - Q(S, A) ]"}</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;{"S ← S'; A ← A'"}</span>
                        </div>
                        <div>
                            <strong>Q-Learning (Off-Policy) Loop for each step:</strong>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;Take action <MathEquation formula="A" />, observe reward <MathEquation formula="R" />, and next state <MathEquation formula="S'" /></span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;{"Q(S, A) ← Q(S, A) + α [ R + γ max_a Q(S', a) - Q(S, A) ]"}</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;{"S ← S'"}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Worked Numerical Example */}
            <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={20} />
                    Worked Numerical Example: Q-Learning Step
                </h4>
                <p className="text-sm text-slate-400">
                    Let's trace a single transition update for a Q-learning agent. Assume:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                    <div>
                        <strong>1. Initial Conditions:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>Current State: <MathEquation formula="S_t = S_{36}" /> (immediately above the Start state).</li>
                            <li>Action taken: <MathEquation formula="A_t = \text{Right}" /> (action index 3).</li>
                            <li>Learning parameters: <MathEquation formula="\alpha = 0.2" />, <MathEquation formula="\gamma = 0.9" />.</li>
                            <li>Current value: <MathEquation formula="Q(S_{36}, \text{Right}) = -2.0" />.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>2. Transition details:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>Resulting state: <MathEquation formula="S_{37}" />.</li>
                            <li>Reward: <MathEquation formula="R_{t+1} = -1" />.</li>
                            <li>Next state Q-values: <MathEquation formula="Q(S_{37}, \text{Up}) = -1.0" />, <MathEquation formula="Q(S_{37}, \text{Down}) = -100.0" /> (Cliff), <MathEquation formula="Q(S_{37}, \text{Left}) = -3.0" />, <MathEquation formula="Q(S_{37}, \text{Right}) = -1.2" />.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>3. Calculate Target & Update:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            The greedy value at the next state is:
                            <br />
                            <MathEquation formula="\max_{a} Q(S_{37}, a) = \max(-1.0, -100.0, -3.0, -1.2) = -1.0 \quad (\text{action: Up})" />
                            <br />
                            The target is:
                            <br />
                            <MathEquation formula="\text{Target} = R_{t+1} + \gamma \max_{a} Q(S_{37}, a) = -1.0 + 0.9 \times (-1.0) = -1.9" />
                            <br />
                            The new Q-value is:
                            <br />
                            <MathEquation formula="Q(S_{36}, \text{Right}) \leftarrow -2.0 + 0.2 \times [-1.9 - (-2.0)] = -2.0 + 0.2 \times [0.1] = -1.98" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Takeaways */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={20} />
                    Key Takeaways: Model-Free Control
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                    <li><strong>Monte Carlo vs TD:</strong> MC updates values after complete episodes (zero bias, high variance), while TD updates values after each step (some bias, low variance).</li>
                    <li><strong>On-Policy (SARSA) vs Off-Policy (Q-Learning):</strong> SARSA learns path values accounting for the actual exploration step, leading to safe policies. Q-Learning learns values assuming absolute greediness, leading to optimal paths but vulnerability during exploration.</li>
                    <li><strong>TD target:</strong> Bootstrapping uses estimates <MathEquation formula="R_{t+1} + \gamma Q(S_{t+1}, A_{t+1})" /> as a target to update previous estimates.</li>
                </ul>
            </section>

            {/* References */}
            <section className="space-y-2 text-xs text-slate-500">
                <h5 className="font-bold uppercase tracking-wider text-slate-400">Further Readings & References</h5>
                <p>1. Sutton, R. S., & Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em>. MIT Press. Chapters 5 & 6.</p>
                <p>2. Watkins, C. J., & Dayan, P. (1992). <em>Q-learning</em>. Machine learning, 8(3-4), 279-292.</p>
            </section>
        </div>
    );
};
