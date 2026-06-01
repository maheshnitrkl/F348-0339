import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GitCommit, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    Terminal, 
    Sparkles, 
    CheckCircle, 
    Info, 
    TrendingUp,
    Sliders
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';

export const PolicyGradient: React.FC = () => {
    // --- Gridworld Parameters ---
    const GRID_SIZE = 4;
    const START_STATE = 12; // Bottom-left (row 3, col 0)
    const GOAL_STATE = 3;  // Top-right (row 0, col 3)

    // Actions: 0: Up, 1: Down, 2: Left, 3: Right
    const ACTIONS = [
        { name: 'Up', dr: -1, dc: 0, arrow: '↑' },
        { name: 'Down', dr: 1, dc: 0, arrow: '↓' },
        { name: 'Left', dr: 0, dc: -1, arrow: '←' },
        { name: 'Right', dr: 0, dc: 1, arrow: '→' }
    ];

    // --- Simulator & Training States ---
    const [algorithm, setAlgorithm] = useState<'reinforce' | 'reinforce-baseline' | 'actor-critic'>('actor-critic');
    const [alphaActor, setAlphaActor] = useState<number>(0.2); // Actor learning rate
    const [alphaCritic, setAlphaCritic] = useState<number>(0.1); // Critic learning rate
    const [gamma, setGamma] = useState<number>(0.95);
    
    // Actor parameters (theta): 16 states, 4 actions
    const [actorWeights, setActorWeights] = useState<number[][]>(() => 
        Array.from({ length: GRID_SIZE * GRID_SIZE }, () => [0, 0, 0, 0])
    );
    // Critic state-value estimates (V): 16 states
    const [criticValues, setCriticValues] = useState<number[]>(() => 
        Array(GRID_SIZE * GRID_SIZE).fill(0)
    );

    const [agentState, setAgentState] = useState<number>(START_STATE);
    const [episodesCount, setEpisodesCount] = useState<number>(0);
    const [currentReward, setCurrentReward] = useState<number>(0);
    const [simPlaying, setSimPlaying] = useState<boolean>(false);
    const [history, setHistory] = useState<string[]>(['System initialized. Softmax policy is uniform (25%).']);

    // --- Physics / Transition Helper ---
    const getNextState = (state: number, actionIdx: number): { nextS: number; reward: number; done: boolean } => {
        if (state === GOAL_STATE) return { nextS: GOAL_STATE, reward: 0, done: true };
        
        const row = Math.floor(state / GRID_SIZE);
        const col = state % GRID_SIZE;
        const act = ACTIONS[actionIdx];
        
        let nr = row + act.dr;
        let nc = col + act.dc;

        // Bounce off edges
        if (nr < 0 || nr >= GRID_SIZE) nr = row;
        if (nc < 0 || nc >= GRID_SIZE) nc = col;

        const nextS = nr * GRID_SIZE + nc;
        const done = nextS === GOAL_STATE;
        const reward = done ? 0 : -1;

        return { nextS, reward, done };
    };

    // --- Softmax Helper ---
    const getProbabilities = (stateIdx: number, weights: number[][]): number[] => {
        const logits = weights[stateIdx];
        const maxLogit = Math.max(...logits);
        const exps = logits.map(l => Math.exp(l - maxLogit)); // stable softmax
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sumExps);
    };

    // Choose action based on softmax probabilities
    const selectAction = (stateIdx: number, weights: number[][]): number => {
        const probs = getProbabilities(stateIdx, weights);
        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < probs.length; i++) {
            cumulative += probs[i];
            if (rand < cumulative) return i;
        }
        return probs.length - 1;
    };

    // --- Training Engine (N Episodes) ---
    const trainEpisodes = (numEpisodes: number) => {
        const newActor = actorWeights.map(arr => [...arr]);
        const newCritic = [...criticValues];
        let totalEpisodes = episodesCount;

        for (let ep = 0; ep < numEpisodes; ep++) {
            let s = START_STATE;
            
            if (algorithm === 'actor-critic') {
                // Actor-Critic: TD learning update step-by-step
                while (s !== GOAL_STATE) {
                    const a = selectAction(s, newActor);
                    const { nextS, reward, done } = getNextState(s, a);

                    // TD target & error
                    const target = reward + (done ? 0 : gamma * newCritic[nextS]);
                    const delta = target - newCritic[s];

                    // Update Critic
                    newCritic[s] += alphaCritic * delta;

                    // Update Actor: theta[s][a] <- theta[s][a] + alpha * delta * grad(ln pi(a|s))
                    // grad(ln pi(a|s)) = 1(a) - pi(a|s)
                    const probs = getProbabilities(s, newActor);
                    for (let actionIdx = 0; actionIdx < 4; actionIdx++) {
                        const gradient = (actionIdx === a ? 1.0 : 0.0) - probs[actionIdx];
                        newActor[s][actionIdx] += alphaActor * delta * gradient;
                    }

                    s = nextS;
                }
            } else {
                // REINFORCE & REINFORCE with Baseline (Episode-based)
                const trajectory: { s: number; a: number; r: number }[] = [];
                let steps = 0;

                // 1. Generate episode trajectory
                while (s !== GOAL_STATE && steps < 100) {
                    const a = selectAction(s, newActor);
                    const { nextS, reward } = getNextState(s, a);
                    trajectory.push({ s, a, r: reward });
                    s = nextS;
                    steps++;
                }

                // 2. Perform updates based on returns
                let G = 0;
                for (let t = trajectory.length - 1; t >= 0; t--) {
                    const step = trajectory[t];
                    G = step.r + gamma * G;

                    let advantage = G;
                    if (algorithm === 'reinforce-baseline') {
                        // Advantage = Return - Baseline (state-value estimate V)
                        advantage = G - newCritic[step.s];
                        // Update baseline / Critic
                        newCritic[step.s] += alphaCritic * (G - newCritic[step.s]);
                    }

                    // Update Actor weights
                    const probs = getProbabilities(step.s, newActor);
                    for (let actionIdx = 0; actionIdx < 4; actionIdx++) {
                        const gradient = (actionIdx === step.a ? 1.0 : 0.0) - probs[actionIdx];
                        newActor[step.s][actionIdx] += alphaActor * advantage * gradient;
                    }
                }
            }
            totalEpisodes++;
        }

        setActorWeights(newActor);
        setCriticValues(newCritic);
        setEpisodesCount(totalEpisodes);
        setAgentState(START_STATE);
        setCurrentReward(0);
        setHistory(prev => [
            `Trained ${numEpisodes} episodes using ${algorithm.toUpperCase()}. (Total: ${totalEpisodes})`,
            ...prev.slice(0, 5)
        ]);
    };

    // --- Single Step of Simulator ---
    const runSingleStep = () => {
        if (agentState === GOAL_STATE) {
            setAgentState(START_STATE);
            setCurrentReward(0);
            return;
        }

        const s = agentState;
        const a = selectAction(s, actorWeights);
        const { nextS, reward, done } = getNextState(s, a);

        const newActor = actorWeights.map(arr => [...arr]);
        const newCritic = [...criticValues];

        let logMsg = '';

        if (algorithm === 'actor-critic') {
            // Actor-Critic (TD) update
            const target = reward + (done ? 0 : gamma * newCritic[nextS]);
            const delta = target - newCritic[s];

            newCritic[s] += alphaCritic * delta;

            const probs = getProbabilities(s, newActor);
            for (let actionIdx = 0; actionIdx < 4; actionIdx++) {
                const gradient = (actionIdx === a ? 1.0 : 0.0) - probs[actionIdx];
                newActor[s][actionIdx] += alphaActor * delta * gradient;
            }

            logMsg = `Actor-Critic step: S${s} -> ${ACTIONS[a].name} -> S${nextS}. TD Error (δ) = ${delta.toFixed(2)}.`;
        } else {
            // REINFORCE update happens at episode termination
            logMsg = `REINFORCE step: S${s} -> took ${ACTIONS[a].name}. `;
        }

        setActorWeights(newActor);
        setCriticValues(newCritic);
        setAgentState(nextS);
        setCurrentReward(prev => prev + reward);

        if (done) {
            logMsg += ' Reached GOAL! Episode complete.';
            setEpisodesCount(prev => prev + 1);
            if (algorithm !== 'actor-critic') {
                // Perform batch REINFORCE episode update on return
                // For a single step simulation of REINFORCE, we treat it as 1-step trajectory for simple demonstration
                const G = reward;
                const advantage = algorithm === 'reinforce-baseline' ? G - newCritic[s] : G;
                if (algorithm === 'reinforce-baseline') {
                    newCritic[s] += alphaCritic * (G - newCritic[s]);
                }
                const probs = getProbabilities(s, newActor);
                for (let actionIdx = 0; actionIdx < 4; actionIdx++) {
                    const gradient = (actionIdx === a ? 1.0 : 0.0) - probs[actionIdx];
                    newActor[s][actionIdx] += alphaActor * advantage * gradient;
                }
                setActorWeights(newActor);
                setCriticValues(newCritic);
            }
        }

        setHistory(prev => [logMsg, ...prev.slice(0, 5)]);
    };

    // Auto Play loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (simPlaying) {
            interval = setInterval(() => {
                runSingleStep();
            }, 250);
        }
        return () => clearInterval(interval);
    }, [simPlaying, agentState, actorWeights, criticValues, algorithm, alphaActor, alphaCritic, gamma]);

    const resetSimulator = () => {
        setSimPlaying(false);
        setActorWeights(Array.from({ length: GRID_SIZE * GRID_SIZE }, () => [0, 0, 0, 0]));
        setCriticValues(Array(GRID_SIZE * GRID_SIZE).fill(0));
        setAgentState(START_STATE);
        setCurrentReward(0);
        setEpisodesCount(0);
        setHistory(['Simulator reset. Policy weights initialized to zero.']);
    };

    // Helper to get color representing V(s) value
    const getCellColor = (val: number): string => {
        if (val === 0) return 'rgba(30, 41, 59, 0.4)'; // slate-800
        const normalized = Math.min(Math.max((val + 10) / 10, 0), 1);
        return `rgba(239, 68, 68, ${(1 - normalized) * 0.4})`; // Soft red for negative values
    };

    return (
        <div className="space-y-12">
            {/* Header banner */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-3xl flex items-center justify-center text-red-400 font-bold border-l border-b border-red-500/20">
                    Ch. 6
                </div>
                <div className="flex items-center gap-2 text-red-400 mb-2 font-mono text-xs uppercase tracking-wider">
                    <GitCommit size={14} />
                    Module 6 / 13
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Policy Gradient Methods</h2>
                <p className="text-lg text-slate-400 max-w-4xl leading-relaxed">
                    Policy Gradient methods optimize action selection probabilities directly using parameterized stochastic policy networks <MathEquation formula="\pi(a \mid s, \mathbf{\theta})" />, completely avoiding the limitations of value-based schemes in continuous action spaces or under partially observable environments.
                </p>
            </div>

            {/* Section 1: Theorem & Proof */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-red-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">1. The Policy Gradient Theorem</h3>
                </div>
                <p className="text-slate-400">
                    In value-based methods, small changes in value estimates can cause action selections to swing discretely (e.g. max choice). In contrast, policy parameterization allows policies to shift smoothly. We define the objective function <MathEquation formula="J(\mathbf{\theta})" /> as the expected start value:
                </p>
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 text-center">
                    <MathEquation formula="J(\mathbf{\theta}) = v_{\pi_{\mathbf{\theta}}}(s_0)" />
                </div>
                <p className="text-slate-400">
                    Computing the gradient of <MathEquation formula="J(\mathbf{\theta})" /> is difficult because changing <MathEquation formula="\mathbf{\theta}" /> alters the distribution of states visited by the agent. The **Policy Gradient Theorem** solves this by proving that the gradient is proportional to the expected sum of Q-value gradients, completely bypassing the need to compute state distribution derivatives:
                </p>
                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                    <MathEquation formula="\nabla_{\mathbf{\theta}} J(\mathbf{\theta}) \propto \sum_{s \in S} d^\pi(s) \sum_{a \in A} q_\pi(s, a) \nabla_{\mathbf{\theta}} \pi(a \mid s, \mathbf{\theta})" block />
                </div>

                <h4 className="text-white font-bold text-lg">Theorem Derivation Steps</h4>
                <div className="bg-black/50 p-6 rounded-xl border border-slate-800 font-mono text-sm overflow-x-auto text-slate-300 space-y-4">
                    <div className="border-b border-slate-800 pb-2 mb-2 text-xs text-slate-500 font-bold uppercase">
                        Deriving the log-likelihood gradient trick
                    </div>
                    <div className="space-y-4 text-xs">
                        <div>
                            <span className="text-red-400 font-bold">Step 1: Multiply and divide the summation by the policy probability:</span>
                            <MathEquation formula="\nabla_{\mathbf{\theta}} J(\mathbf{\theta}) \propto \sum_{s \in S} d^\pi(s) \sum_{a \in A} q_\pi(s, a) \pi(a \mid s, \mathbf{\theta}) \frac{\nabla_{\mathbf{\theta}} \pi(a \mid s, \mathbf{\theta})}{\pi(a \mid s, \mathbf{\theta})}" block />
                        </div>
                        <div>
                            <span className="text-red-400 font-bold">Step 2: Apply the identity <MathEquation formula="\nabla \ln x = \frac{\nabla x}{x}" /> to extract the score function:</span>
                            <MathEquation formula="\nabla_{\mathbf{\theta}} J(\mathbf{\theta}) \propto \sum_{s \in S} d^\pi(s) \sum_{a \in A} \pi(a \mid s, \mathbf{\theta}) q_\pi(s, a) \nabla_{\mathbf{\theta}} \ln \pi(a \mid s, \mathbf{\theta})" block />
                        </div>
                        <div>
                            <span className="text-red-400 font-bold">Step 3: Express as an expectation under policy <MathEquation formula="\pi" />:</span>
                            <MathEquation formula="\nabla_{\mathbf{\theta}} J(\mathbf{\theta}) = \mathbb{E}_\pi \left[ q_\pi(S_t, A_t) \nabla_{\mathbf{\theta}} \ln \pi(A_t \mid S_t, \mathbf{\theta}) \right]" block />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: REINFORCE vs Actor-Critic */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-red-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. REINFORCE and Actor-Critic Structures</h3>
                </div>
                <p className="text-slate-400">
                    Depending on how we approximate the Q-value term <MathEquation formula="q_\pi(S_t, A_t)" /> in the expectation, we obtain different algorithms:
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* REINFORCE */}
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold">REINFORCE (Monte Carlo Policy Gradient)</h4>
                        <p className="text-sm text-slate-400">
                            REINFORCE replaces the true Q-value with the empirical cumulative return <MathEquation formula="G_t" /> from the rest of the episode.
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-center border border-slate-850">
                            <MathEquation formula="\mathbf{\theta}_{t+1} \leftarrow \mathbf{\theta}_t + \alpha G_t \nabla_{\mathbf{\theta}} \ln \pi(A_t \mid S_t, \mathbf{\theta}_t)" block />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            To reduce the high statistical variance of Monte Carlo returns, we subtract a baseline value <MathEquation formula="b(S_t) = V(S_t)" /> to calculate the advantage:
                            <br />
                            <MathEquation formula="\mathbf{\theta}_{t+1} \leftarrow \mathbf{\theta}_t + \alpha \left( G_t - V(S_t) \right) \nabla_{\mathbf{\theta}} \ln \pi(A_t \mid S_t, \mathbf{\theta}_t)" />
                        </p>
                    </div>

                    {/* Actor-Critic */}
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold">Actor-Critic Methods</h4>
                        <p className="text-sm text-slate-400">
                            Instead of waiting for episode termination, Actor-Critic methods learn a value function estimate (Critic) to bootstrap value targets.
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-center border border-slate-850">
                            <MathEquation formula="\delta_t = R_{t+1} + \gamma V(S_{t+1}; \mathbf{w}) - V(S_t; \mathbf{w})" block />
                            <MathEquation formula="\mathbf{\theta}_{t+1} \leftarrow \mathbf{\theta}_t + \alpha \delta_t \nabla_{\mathbf{\theta}} \ln \pi(A_t \mid S_t, \mathbf{\theta}_t)" block />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-mono">
                            - Actor: Updates policy weights <MathEquation formula="\mathbf{\theta}" /> using TD error.
                            <br />
                            - Critic: Updates state value weights <MathEquation formula="\mathbf{w}" />.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. Interactive Actor-Critic Simulator */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-red-400 animate-pulse" size={20} />
                        Actor-Critic Softmax Policy Pathfinder
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Train a Softmax policy directly on a gridworld. Watch the Action Probability Wedges align along the path as the Critic learns state values.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Controls Panel */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Training Controls</h5>

                            {/* Algorithm Select */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-slate-500 block">Select Gradient Strategy:</span>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => { setAlgorithm('actor-critic'); }}
                                        className={`py-1.5 rounded text-xs font-bold transition-all px-3 text-left flex justify-between ${algorithm === 'actor-critic' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        <span>One-Step Actor-Critic</span>
                                        <span className="text-[9px] font-mono">TD(0)</span>
                                    </button>
                                    <button 
                                        onClick={() => { setAlgorithm('reinforce-baseline'); }}
                                        className={`py-1.5 rounded text-xs font-bold transition-all px-3 text-left flex justify-between ${algorithm === 'reinforce-baseline' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        <span>REINFORCE with Baseline</span>
                                        <span className="text-[9px] font-mono">MC Baseline</span>
                                    </button>
                                    <button 
                                        onClick={() => { setAlgorithm('reinforce'); }}
                                        className={`py-1.5 rounded text-xs font-bold transition-all px-3 text-left flex justify-between ${algorithm === 'reinforce' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        <span>REINFORCE (No Baseline)</span>
                                        <span className="text-[9px] font-mono">Pure MC</span>
                                    </button>
                                </div>
                            </div>

                            {/* Batch Training */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                <span className="text-[11px] text-slate-500 block">Fast Batch Training:</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => trainEpisodes(10)}
                                        className="py-1.5 bg-slate-850 hover:bg-slate-750 text-white text-xs font-semibold rounded border border-slate-800 transition-colors"
                                    >
                                        Train 10 Ep.
                                    </button>
                                    <button 
                                        onClick={() => trainEpisodes(50)}
                                        className="py-1.5 bg-red-550/10 hover:bg-red-550/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded transition-colors"
                                    >
                                        Train 50 Ep.
                                    </button>
                                </div>
                            </div>

                            {/* Sliders */}
                            <div className="space-y-3 pt-2 border-t border-slate-800">
                                <div>
                                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                        <span>Actor Step Size (α_θ):</span>
                                        <span className="text-white font-bold">{alphaActor}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.05" max="0.5" step="0.05" value={alphaActor}
                                        onChange={(e) => setAlphaActor(parseFloat(e.target.value))}
                                        className="w-full accent-red-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                        <span>Critic Step Size (α_w):</span>
                                        <span className="text-white font-bold">{alphaCritic}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.05" max="0.5" step="0.05" value={alphaCritic}
                                        onChange={(e) => setAlphaCritic(parseFloat(e.target.value))}
                                        className="w-full accent-red-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                                <button 
                                    onClick={runSingleStep}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Step Sim
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
                        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Episodes</span>
                                <span className="text-sm text-white font-bold">{episodesCount}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Total Reward</span>
                                <span className={`text-sm font-bold ${currentReward < -10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {currentReward}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gridworld Arena */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl overflow-x-auto">
                            <div className="grid grid-cols-4 gap-2.5 w-full max-w-[360px] aspect-square mx-auto">
                                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                                    const r = Math.floor(idx / GRID_SIZE);
                                    const c = idx % GRID_SIZE;
                                    const isAgent = agentState === idx;
                                    const isGoalCell = idx === GOAL_STATE;
                                    const isStartCell = idx === START_STATE;
                                    const vVal = criticValues[idx];
                                    
                                    const probs = getProbabilities(idx, actorWeights);
                                    
                                    return (
                                        <div 
                                            key={idx}
                                            className="rounded border relative flex flex-col items-center justify-center transition-all duration-200 aspect-square overflow-hidden"
                                            style={{ 
                                                backgroundColor: isGoalCell ? 'rgba(16, 185, 129, 0.2)' : getCellColor(vVal),
                                                borderColor: isAgent ? '#ef4444' : isGoalCell ? '#10b981' : 'rgba(51, 65, 85, 0.4)'
                                            }}
                                        >
                                            {/* Cell identifier */}
                                            <span className="absolute top-1 left-1 text-[7px] text-slate-500">S{idx}</span>

                                            {/* V value display */}
                                            {!isGoalCell && (
                                                <span className="absolute bottom-1 right-1.5 text-[7px] text-slate-500 font-mono">
                                                    V:{vVal.toFixed(1)}
                                                </span>
                                            )}

                                            {/* Softmax probabilities indicator (Pizza wedges) */}
                                            {!isGoalCell && (
                                                <svg viewBox="0 0 40 40" className="w-12 h-12 opacity-40">
                                                    {/* Up Wedge */}
                                                    <path d="M 20 20 L 10 10 A 14.14 14.14 0 0 1 30 10 Z" fill="#ef4444" style={{ opacity: probs[0] }} />
                                                    {/* Down Wedge */}
                                                    <path d="M 20 20 L 30 30 A 14.14 14.14 0 0 1 10 30 Z" fill="#ef4444" style={{ opacity: probs[1] }} />
                                                    {/* Left Wedge */}
                                                    <path d="M 20 20 L 10 30 A 14.14 14.14 0 0 1 10 10 Z" fill="#ef4444" style={{ opacity: probs[2] }} />
                                                    {/* Right Wedge */}
                                                    <path d="M 20 20 L 30 10 A 14.14 14.14 0 0 1 30 30 Z" fill="#ef4444" style={{ opacity: probs[3] }} />
                                                </svg>
                                            )}

                                            {/* Labels */}
                                            {isGoalCell && <span className="text-[9px] text-emerald-400 font-bold">GOAL</span>}
                                            {isStartCell && !isAgent && <span className="text-[8px] text-slate-600 absolute">START</span>}

                                            {/* Agent Overlay */}
                                            {isAgent && (
                                                <motion.div 
                                                    layoutId="actor-agent"
                                                    className="w-6 h-6 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] flex items-center justify-center text-white font-extrabold text-[10px] z-10"
                                                >
                                                    A
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Experience logs */}
                        <div className="bg-black/50 p-4 border border-slate-800 rounded-xl h-24 overflow-y-auto font-mono text-xs text-slate-400 scrollbar-hide">
                            <span className="text-red-400 font-bold block mb-1">&gt; Actor Experience Log:</span>
                            {history.map((log, i) => (
                                <div key={i} className={i === 0 ? 'text-slate-200' : ''}>
                                    - {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Worked Numerical Example */}
            <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-red-400" size={20} />
                    Worked Numerical Example: Softmax Actor-Critic Step
                </h4>
                <p className="text-sm text-slate-400">
                    Let's trace a single gradient update step for a Softmax actor in state <MathEquation formula="s" />. Assume:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                    <div>
                        <strong>1. Initial Conditions:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>Current logits for state <MathEquation formula="S_t" />: <MathEquation formula="\mathbf{\theta}_s = [\theta_{\text{Up}}, \theta_{\text{Down}}, \theta_{\text{Left}}, \theta_{\text{Right}}] = [0.0, 1.0, 0.0, 0.0]" />.</li>
                            <li>Action selected: <MathEquation formula="A_t = \text{Down}" /> (index 1).</li>
                            <li>TD Error computed by critic: <MathEquation formula="\delta_t = +0.5" />.</li>
                            <li>Actor learning rate: <MathEquation formula="\alpha_{\theta} = 0.2" />.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>2. Calculate Softmax Probabilities:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            <MathEquation formula="\sum_{a'} \exp(\theta_{a'}) = e^0 + e^1 + e^0 + e^0 = 1 + 2.718 + 1 + 1 = 5.718" />
                            <br />
                            <MathEquation formula="\pi(\text{Down} \mid s) = \frac{e^1}{5.718} = \frac{2.718}{5.718} \approx 0.475" />
                            <br />
                            <MathEquation formula="\pi(\text{Up} \mid s) = \pi(\text{Left} \mid s) = \pi(\text{Right} \mid s) = \frac{e^0}{5.718} = \frac{1}{5.718} \approx 0.175" />
                        </div>
                    </div>
                    <div>
                        <strong>3. Calculate Parameter Gradients:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            Using log-likelihood gradient identity: <MathEquation formula="\nabla_{\theta_a} \ln \pi(A \mid S) = \mathbf{1}(a = A) - \pi(a \mid S)" />.
                            <br />
                            - For chosen action (Down):
                            <br />
                            <MathEquation formula="\nabla_{\theta_{\text{Down}}} \ln \pi(\text{Down} \mid s) = 1.0 - 0.475 = +0.525" />
                            <br />
                            - For unchosen action (e.g. Up):
                            <br />
                            <MathEquation formula="\nabla_{\theta_{\text{Up}}} \ln \pi(\text{Down} \mid s) = 0.0 - 0.175 = -0.175" />
                        </div>
                    </div>
                    <div>
                        <strong>4. Update Logits:</strong>
                        <div className="pl-4 mt-1 text-slate-400 font-bold text-red-400">
                            <MathEquation formula="\theta_a \leftarrow \theta_a + \alpha_{\theta} \delta_t \nabla_{\theta_a} \ln \pi(A_t \mid S_t)" />
                            <br />
                            <MathEquation formula="\theta_{\text{Down}} \leftarrow 1.0 + 0.2 \times 0.5 \times (+0.525) = 1.0 + 0.0525 = 1.0525" />
                            <br />
                            <MathEquation formula="\theta_{\text{Up}} \leftarrow 0.0 + 0.2 \times 0.5 \times (-0.175) = 0.0 - 0.0175 = -0.0175" />
                        </div>
                        <div className="pl-4 mt-1 text-slate-500 text-[10px]">
                            Notice that Down's logit increased (strengthening the choice), while other logits decreased, smoothly concentrating the probability distribution.
                        </div>
                    </div>
                </div>
            </section>

            {/* Key takeaways */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="text-red-400" size={20} />
                    Key Takeaways: Policy Gradient Methods
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                    <li><strong>Stochastic Optimization:</strong> Direct policy parameterization enables continuous action selections and stochastic distributions, resolving tabular value function constraints.</li>
                    <li><strong>Policy Gradient Theorem:</strong> Proof that gradient updates depend on expectations of Q-values times score log-gradients, bypassing complex state transition modeling.</li>
                    <li><strong>Actor-Critic Decoupling:</strong> The actor optimizes action probability vectors directly while the critic evaluates states to minimize TD-error variance.</li>
                </ul>
            </section>

            {/* References */}
            <section className="space-y-2 text-xs text-slate-500">
                <h5 className="font-bold uppercase tracking-wider text-slate-400">Further Readings & References</h5>
                <p>1. Sutton, R. S., & Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em>. MIT Press. Chapter 13.</p>
                <p>2. Williams, R. J. (1992). <em>Simple statistical gradient-following algorithms for connectionist reinforcement learning</em>. Machine learning, 8(3-4), 229-256.</p>
                <p>3. Konda, V. R., & Tsitsiklis, J. N. (2000). <em>Actor-critic algorithms</em>. NIPS.</p>
            </section>
        </div>
    );
};
