import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Database, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    Terminal, 
    Sparkles,
    CheckCircle,
    Info,
    HelpCircle
} from 'lucide-react';
import { MathEquation } from '../components/MathEquation';

export const DynamicProgramming: React.FC = () => {
    // --- Gridworld Convergence Simulator States ---
    const [simMethod, setSimMethod] = useState<'policy-eval' | 'value-iter'>('value-iter');
    const [gridValues, setGridValues] = useState<number[]>(Array(16).fill(0));
    const [policy, setPolicy] = useState<string[]>(Array(16).fill('R')); // Default right
    const [iteration, setIteration] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [convergenceDelta, setConvergenceDelta] = useState<number>(0);

    // Grid config
    const gridSize = 4;
    // 0 is Start (top-left), 15 is Goal (bottom-right, terminal)
    // Obstacle at index 5 (row 1, col 1)
    const obstacleIndex = 5;
    const goalIndex = 15;

    // Transition function
    const getNextState = (state: number, action: 'U' | 'D' | 'L' | 'R'): number => {
        if (state === goalIndex) return goalIndex;
        const row = Math.floor(state / gridSize);
        const col = state % gridSize;
        let nextRow = row;
        let nextCol = col;

        if (action === 'U') nextRow = Math.max(0, row - 1);
        if (action === 'D') nextRow = Math.min(gridSize - 1, row + 1);
        if (action === 'L') nextCol = Math.max(0, col - 1);
        if (action === 'R') nextCol = Math.min(gridSize - 1, col + 1);

        const nextState = nextRow * gridSize + nextCol;
        // Bouncing off obstacles
        if (nextState === obstacleIndex) return state;
        return nextState;
    };

    // Single step of Bellman Update
    const runSingleIteration = () => {
        const gamma = 0.9;
        const reward = -1; // step cost
        const newValues = [...gridValues];
        const newPolicy = [...policy];
        let maxDelta = 0;

        const actions: ('U' | 'D' | 'L' | 'R')[] = ['U', 'D', 'L', 'R'];

        for (let s = 0; s < 16; s++) {
            if (s === goalIndex || s === obstacleIndex) continue;

            if (simMethod === 'value-iter') {
                // Value Iteration: V(s) <- max_a \sum_{s', r} P(s',r|s,a)[r + \gamma V(s')]
                let bestVal = -Infinity;
                let bestAction = 'R';
                actions.forEach(a => {
                    const nextS = getNextState(s, a);
                    const expectedVal = reward + gamma * gridValues[nextS];
                    if (expectedVal > bestVal) {
                        bestVal = expectedVal;
                        bestAction = a;
                    }
                });
                newValues[s] = parseFloat(bestVal.toFixed(3));
                newPolicy[s] = bestAction;
            } else {
                // Policy Evaluation (for a uniform random policy)
                // V(s) <- \sum_a \pi(a|s) \sum_{s', r} P(s',r|s,a)[r + \gamma V(s')]
                let sum = 0;
                actions.forEach(a => {
                    const nextS = getNextState(s, a);
                    const expectedVal = reward + gamma * gridValues[nextS];
                    sum += 0.25 * expectedVal; // uniform probability
                });
                newValues[s] = parseFloat(sum.toFixed(3));
            }

            const diff = Math.abs(newValues[s] - gridValues[s]);
            if (diff > maxDelta) maxDelta = diff;
        }

        setGridValues(newValues);
        setPolicy(newPolicy);
        setIteration(prev => prev + 1);
        setConvergenceDelta(parseFloat(maxDelta.toFixed(5)));
    };

    // Play loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            interval = setInterval(() => {
                runSingleIteration();
            }, 300);
        }
        return () => clearInterval(interval);
    }, [isPlaying, gridValues, simMethod]);

    const resetSimulator = () => {
        setIsPlaying(false);
        setGridValues(Array(16).fill(0));
        setPolicy(Array(16).fill('R'));
        setIteration(0);
        setConvergenceDelta(0);
    };

    // Color mapper based on state-values (warm-to-cool heatmap)
    const getCellColor = (val: number): string => {
        if (val === 0) return 'rgba(30, 41, 59, 0.4)'; // slate-800
        // Minimum theoretical value in this setup is around -10
        const ratio = Math.min(Math.abs(val) / 10, 1);
        return `rgba(239, 68, 68, ${ratio * 0.4})`; // soft red gradient based on cost
    };

    return (
        <div className="space-y-12">
            {/* Scaffolding Banner */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-bl-3xl flex items-center justify-center text-violet-400 font-bold border-l border-b border-violet-500/20">
                    Ch. 2
                </div>
                <div className="flex items-center gap-2 text-violet-400 mb-2 font-mono text-xs uppercase tracking-wider">
                    <Database size={14} />
                    Module 2 / 13
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Dynamic Programming in RL</h2>
                <p className="text-lg text-slate-400 max-w-4xl leading-relaxed">
                    Dynamic Programming (DP) refers to a collection of algorithms that can be used to compute optimal policies given a perfect model of the environment as a Markov Decision Process (MDP).
                </p>
            </div>

            {/* Conceptual Introduction */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white">1. Conceptual Overview: The Planning Paradigm</h3>
                <p className="text-slate-400">
                    In computer science, **Dynamic Programming** simplifies a complex problem by breaking it down into recursive subproblems. In Reinforcement Learning, our "subproblems" are the values of future states. If we know the exact transition dynamics $P(s', r \mid s, a)$ of the environment, we can compute the value of any state by looking ahead to its neighbor states.
                </p>
                <p className="text-slate-400">
                    This lookahead calculation is called a **Bellman Backup**. Since DP updates the values of states based on the values of successor states, it relies heavily on **Bootstrapping**—updating estimates based on other estimates, without waiting for a final game result.
                </p>
                <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3">
                    <Info className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-slate-400">
                        <strong className="text-amber-300">The Core Limitation:</strong> Dynamic Programming is a <em>planning</em> method, not a learning method. It assumes the agent has full access to the transition probabilities $P$ and rewards $R$. In real-world tasks (like robotics or chess), this model is usually unknown, requiring model-free methods instead.
                    </div>
                </div>
            </section>

            {/* Section 2: Policy Evaluation */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-violet-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. Policy Evaluation (Iterative)</h3>
                </div>

                <p className="text-slate-400">
                    **Policy Evaluation** is the process of computing the state-value function $V^\pi$ for an arbitrary policy $\pi$. We turn the Bellman Expectation Equation into an iterative update rule:
                </p>

                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                    <MathEquation formula="V_{k+1}(s) \leftarrow \sum_{a} \pi(a \mid s) \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma V_k(s') \right]" block />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        For each state $s \in S$, we update its value estimate at iteration $k+1$ using the value estimates $V_k$ of its successor states.
                    </p>
                </div>

                <p className="text-slate-400">
                    This algorithm converges to the true value function $V^\pi$ as $k \to \infty$. In practice, we terminate iterations when the maximum change in state values (often denoted as $\Delta$) drops below a tiny threshold $\theta$:
                </p>
                <div className="text-center font-mono text-xs text-slate-500">
                    {"Terminate if $\\max_{s \\in S} |V_{k+1}(s) - V_k(s)| < \\theta$"}
                </div>
            </section>

            {/* Interactive Gridworld visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-2xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-cyan-400" />
                    Interactive Gridworld Value Convergence Simulator
                </h4>

                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Grid Graphic */}
                    <div className="flex flex-col items-center">
                        <div className="grid grid-cols-4 gap-2 bg-slate-900 p-4 rounded-xl border border-slate-800 w-full max-w-[340px] aspect-square">
                            {gridValues.map((val, idx) => {
                                const isGoal = idx === goalIndex;
                                const isObstacle = idx === obstacleIndex;
                                return (
                                    <div 
                                        key={idx} 
                                        className="relative rounded-lg border border-slate-700/50 flex flex-col items-center justify-center font-mono transition-all duration-300 text-xs"
                                        style={{ backgroundColor: isGoal ? 'rgba(16, 185, 129, 0.2)' : isObstacle ? 'rgb(15, 23, 42)' : getCellColor(val), borderColor: isGoal ? '#10b981' : isObstacle ? '#334155' : undefined }}
                                    >
                                        {/* State identifier */}
                                        <span className="absolute top-1 left-1 text-[8px] text-slate-500">S{idx}</span>

                                        {/* State Value */}
                                        {isObstacle ? (
                                            <span className="text-slate-600 font-bold">BLOCKED</span>
                                        ) : isGoal ? (
                                            <span className="text-emerald-400 font-bold">GOAL</span>
                                        ) : (
                                            <span className="text-white font-bold">{val.toFixed(2)}</span>
                                        )}

                                        {/* Policy Arrow */}
                                        {!isGoal && !isObstacle && simMethod === 'value-iter' && val !== 0 && (
                                            <span className="absolute bottom-1 right-2 text-violet-400 font-bold">
                                                {policy[idx] === 'U' ? '↑' : policy[idx] === 'D' ? '↓' : policy[idx] === 'L' ? '←' : '→'}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls & Metrics */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center">
                                <h5 className="font-bold text-white text-sm">Simulation Settings</h5>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setSimMethod('value-iter'); resetSimulator(); }}
                                        className={`px-3 py-1 rounded text-xs font-bold ${simMethod === 'value-iter' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        Value Iteration
                                    </button>
                                    <button 
                                        onClick={() => { setSimMethod('policy-eval'); resetSimulator(); }}
                                        className={`px-3 py-1 rounded text-xs font-bold ${simMethod === 'policy-eval' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        Policy Eval
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed">
                                {simMethod === 'value-iter' 
                                    ? "Value Iteration automatically updates the policy greedily towards the maximum local backup values. Arrows show the extracted optimal policy directions." 
                                    : "Policy Evaluation simulates value updates under a uniform random policy (equal 25% chance for Up, Down, Left, Right)."}
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-black/30 p-2.5 rounded text-center border border-slate-800">
                                    <span className="text-[10px] text-slate-500 block mb-1">Iteration</span>
                                    <span className="font-mono text-sm text-white font-bold">{iteration}</span>
                                </div>
                                <div className="bg-black/30 p-2.5 rounded text-center border border-slate-800">
                                    <span className="text-[10px] text-slate-500 block mb-1">Max Delta (Δ)</span>
                                    <span className="font-mono text-sm text-white font-bold">{convergenceDelta}</span>
                                </div>
                                <div className="bg-black/30 p-2.5 rounded text-center border border-slate-800">
                                    <span className="text-[10px] text-slate-500 block mb-1">Discount (γ)</span>
                                    <span className="font-mono text-sm text-white font-bold">0.90</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={runSingleIteration}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Single Step
                                </button>
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${isPlaying ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
                                >
                                    {isPlaying ? 'Pause' : 'Auto Iterate'}
                                </button>
                                <button 
                                    onClick={resetSimulator}
                                    className="px-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Policy Improvement & Iteration */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-violet-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">3. Policy Improvement & Policy Iteration</h3>
                </div>

                <p className="text-slate-400">
                    Once we have evaluated a policy and computed its state values $V^\pi$, how do we make the policy better? This is governed by the **Policy Improvement Theorem**.
                </p>
                <p className="text-slate-400">
                    For any state $s$, we define a new greedy policy $\pi'$ that selects the action that maximizes the expected local backup:
                </p>

                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                    <MathEquation formula="\pi'(s) \leftarrow \text{argmax}_{a} \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma V^\pi(s') \right]" block />
                </div>

                <p className="text-slate-400">
                    By alternating between **Policy Evaluation** (estimating values for the current policy) and **Policy Improvement** (making the policy greedy with respect to those values), we form a loop that is guaranteed to converge to the optimal policy $\pi^*$. This process is called **Policy Iteration**.
                </p>

                {/* Generalized Policy Iteration */}
                <h4 className="text-white font-bold text-lg mb-2">Generalized Policy Iteration (GPI)</h4>
                <p className="text-slate-400">
                    Almost all reinforcement learning algorithms can be structured under the **Generalized Policy Iteration (GPI)** framework. GPI represents the interaction between two competing objectives:
                </p>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-2">
                        <h5 className="font-bold text-violet-400">1. Evaluation (Estimation)</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Making the value function consistent with the current policy. (Moving $V$ towards $V^\pi$).
                        </p>
                    </div>
                    <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800 space-y-2">
                        <h5 className="font-bold text-emerald-400">2. Improvement (Decisions)</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Making the policy greedy with respect to the current value function. (Moving $\pi$ towards greediness).
                        </p>
                    </div>
                </div>
            </section>

            {/* Pseudocode Box: Policy Iteration */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg">Policy Iteration Algorithm Box</h4>
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center font-mono text-xs text-slate-400">
                        <span>Algorithm: Policy Iteration</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Sutton & Barto</span>
                    </div>
                    <div className="p-6 text-xs font-mono text-slate-300 space-y-3 leading-relaxed">
                        <div>
                            <strong>1. Initialization</strong>
                            <br />
                            <span className="text-slate-500">Initialize V(s) ∈ ℝ arbitrarily (e.g., 0) and π(s) ∈ A(s) arbitrarily for all s ∈ S</span>
                        </div>
                        <div>
                            <strong>2. Policy Evaluation</strong>
                            <br />
                            <span className="text-slate-500">Loop:</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;Δ ← 0</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;For each s ∈ S:</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;&nbsp;&nbsp;v ← V(s)</span>
                            <br />
                            <span className="text-slate-500">{"&nbsp;&nbsp;&nbsp;&nbsp;V(s) ← Σ_{s',r} p(s',r|s, π(s)) [ r + γ V(s') ]"}</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;&nbsp;&nbsp;Δ ← max(Δ, |v - V(s)|)</span>
                            <br />
                            <span className="text-slate-500">until Δ &lt; θ (a small positive threshold)</span>
                        </div>
                        <div>
                            <strong>3. Policy Improvement</strong>
                            <br />
                            <span className="text-slate-500">policy_stable ← true</span>
                            <br />
                            <span className="text-slate-500">For each s ∈ S:</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;old_action ← π(s)</span>
                            <br />
                            <span className="text-slate-500">{"&nbsp;&nbsp;π(s) ← argmax_a Σ_{s',r} p(s',r|s, a) [ r + γ V(s') ]"}</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;If old_action ≠ π(s), then policy_stable ← false</span>
                        </div>
                        <div>
                            <strong>4. Termination Check</strong>
                            <br />
                            <span className="text-slate-500">If policy_stable is true, then stop and return V and π; else go to step 2</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Value Iteration */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-violet-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">4. Value Iteration</h3>
                </div>

                <p className="text-slate-400">
                    A major drawback of Policy Iteration is that each evaluation step requires running a complete inner iterative loop to convergence. 
                </p>
                <p className="text-slate-400">
                    **Value Iteration** fixes this by combining evaluation and improvement into a single step: it truncates policy evaluation after exactly one sweep of state updates, updating values directly towards the maximum action values:
                </p>

                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                    <MathEquation formula="V_{k+1}(s) \leftarrow \max_{a} \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma V_k(s') \right]" block />
                </div>
            </section>

            {/* Pseudocode Box: Value Iteration */}
            <section className="space-y-4">
                <h4 className="text-white font-bold text-lg">Value Iteration Algorithm Box</h4>
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center font-mono text-xs text-slate-400">
                        <span>Algorithm: Value Iteration</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Sutton & Barto</span>
                    </div>
                    <div className="p-6 text-xs font-mono text-slate-300 space-y-3 leading-relaxed">
                        <div>
                            <strong>1. Initialization</strong>
                            <br />
                            <span className="text-slate-500">Initialize V(s) ∈ ℝ arbitrarily, and V(terminal) = 0</span>
                        </div>
                        <div>
                            <strong>2. Value Iteration Loop</strong>
                            <br />
                            <span className="text-slate-500">Loop:</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;Δ ← 0</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;For each s ∈ S:</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;&nbsp;&nbsp;v ← V(s)</span>
                            <br />
                            <span className="text-slate-500">{"&nbsp;&nbsp;&nbsp;&nbsp;V(s) ← max_a Σ_{s',r} p(s',r|s, a) [ r + γ V(s') ]"}</span>
                            <br />
                            <span className="text-slate-500">&nbsp;&nbsp;&nbsp;&nbsp;Δ ← max(Δ, |v - V(s)|)</span>
                            <br />
                            <span className="text-slate-500">until Δ &lt; θ (a small positive threshold)</span>
                        </div>
                        <div>
                            <strong>3. Policy Extraction</strong>
                            <br />
                            <span className="text-slate-500">Output a deterministic policy π(s) such that:</span>
                            <br />
                            <span className="text-slate-500">{"&nbsp;&nbsp;π(s) = argmax_a Σ_{s',r} p(s',r|s, a) [ r + γ V(s') ]"}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Worked Numerical Example */}
            <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-emerald-400" size={20} />
                    Worked Numerical Example: 2x2 Gridworld Value Iteration
                </h4>
                <p className="text-sm text-slate-400">
                    Let's trace two steps of Value Iteration on a simple 2x2 gridworld:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                    <div>
                        <strong>1. Setup:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>States: $S_0, S_1, S_2$ (non-terminal) and $S_3$ (terminal, value 0).</li>
                            <li>Actions: Down (D), Right (R). Move is deterministic unless bouncing off grid edges.</li>
                            <li>Reward: $-1.0$ for all steps. Discount factor $\gamma = 1.0$.</li>
                            <li>Initial Values: $V_0(S_0)=0, V_0(S_1)=0, V_0(S_2)=0, V_0(S_3)=0$.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>2. Iteration 1 ($k=1$):</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            For $S_0$:
                            <br />
                            - Down goes to $S_2$: $Q_1(S_0, D) = -1.0 + 1.0 \times V_0(S_2) = -1.0 + 0 = -1.0$
                            <br />
                            - Right goes to $S_1$: $Q_1(S_0, R) = -1.0 + 1.0 \times V_0(S_1) = -1.0 + 0 = -1.0$
                            <br />
                            - $V_1(S_0) = \max(-1, -1) = -1.0$
                            <br />
                            {"Similarly, $V_1(S_1) = \\max(\\text{Down to } S_3 \\text{ [R:-1]}, \\text{Right bounce}) = \\max(-1.0 + V_0(S_3), -1.0 + V_0(S_1)) = \\max(-1.0 + 0, -1.0 + 0) = -1.0$."}
                            <br />
                            $V_1(S_2) = -1.0$.
                        </div>
                    </div>
                    <div>
                        <strong>3. Iteration 2 ($k=2$):</strong>
                        <div className="pl-4 mt-1 text-slate-400 font-bold text-violet-400">
                            For $S_0$:
                            <br />
                            - Down goes to $S_2$: $Q_2(S_0, D) = -1.0 + V_1(S_2) = -1.0 + (-1.0) = -2.0$
                            <br />
                            - Right goes to $S_1$: $Q_2(S_0, R) = -1.0 + V_1(S_1) = -1.0 + (-1.0) = -2.0$
                            <br />
                            - $V_2(S_0) = -2.0$.
                            <br />
                            For $S_1$ (adjacent to Terminal $S_3$):
                            <br />
                            - Down goes to $S_3$: $Q_2(S_1, D) = -1.0 + V_1(S_3) = -1.0 + 0.0 = -1.0$
                            <br />
                            - Right bounce: $Q_2(S_1, R) = -1.0 + V_1(S_1) = -1.0 + (-1.0) = -2.0$
                            <br />
                            - $V_2(S_1) = \max(-1, -2) = -1.0$. (Converged! Optimal policy at $S_1$ is Down).
                        </div>
                    </div>
                </div>
            </section>

            {/* Code implementation */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Terminal size={22} className="text-violet-400" />
                    5. Python Implementation: Policy & Value Iteration
                </h3>

                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-mono text-slate-400">dp_planning.py</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Python 3</span>
                    </div>
                    <pre className="p-6 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed bg-black/40">
{`import numpy as np

class GridworldDP:
    def __init__(self, size=4, gamma=0.9, theta=1e-4):
        self.size = size
        self.num_states = size * size
        self.gamma = gamma
        self.theta = theta
        self.actions = ['U', 'D', 'L', 'R']
        self.num_actions = len(self.actions)
        self.goal_state = self.num_states - 1
        
    def get_next_state_reward(self, state, action):
        if state == self.goal_state:
            return state, 0
            
        row, col = state // self.size, state % self.size
        if action == 'U': row = max(0, row - 1)
        elif action == 'D': row = min(self.size - 1, row + 1)
        elif action == 'L': col = max(0, col - 1)
        elif action == 'R': col = min(self.size - 1, col + 1)
        
        next_state = row * self.size + col
        reward = -1 # step cost
        return next_state, reward

    def value_iteration(self):
        V = np.zeros(self.num_states)
        policy = {}
        
        while True:
            delta = 0
            for s in range(self.num_states):
                if s == self.goal_state:
                    continue
                v = V[s]
                
                # V(s) = max_a [ R + gamma * V(s') ]
                q_values = []
                for a in self.actions:
                    next_s, r = self.get_next_state_reward(s, a)
                    q_values.append(r + self.gamma * V[next_s])
                    
                V[s] = max(q_values)
                delta = max(delta, abs(v - V[s]))
                
            if delta < self.theta:
                break
                
        # Extract optimal policy
        for s in range(self.num_states):
            if s == self.goal_state:
                policy[s] = 'G'
                continue
            q_values = []
            for a in self.actions:
                next_s, r = self.get_next_state_reward(s, a)
                q_values.append(r + self.gamma * V[next_s])
            policy[s] = self.actions[np.argmax(q_values)]
            
        return V, policy

# Run
env = GridworldDP()
V_star, pi_star = env.value_iteration()
print("Optimal State-Values:")
print(V_star.reshape((4, 4)))
`}
                    </pre>
                </div>
            </section>

            {/* Benchmark results */}
            <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white">6. Benchmark Convergence Comparison</h3>
                <p className="text-slate-400">
                    Comparing convergence speed (number of sweeps over states) between Iterative Policy Evaluation, Policy Iteration, and Value Iteration on standard grids:
                </p>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden p-6">
                    <div className="grid grid-cols-3 text-center border-b border-slate-800 pb-3 mb-3 text-xs font-mono text-slate-500 uppercase font-bold">
                        <div>Algorithm</div>
                        <div>Sweeps to Policy Optimality</div>
                        <div>Computation Cost per Sweep</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2 text-sm text-slate-300 border-b border-slate-900">
                        <div className="font-bold text-white">Policy Iteration</div>
                        <div className="text-violet-400">~3-5 iterations (with evaluations)</div>
                        <div>$O(|S|^2 \cdot |A|)$</div>
                    </div>
                    <div className="grid grid-cols-3 text-center py-2 text-sm text-slate-300">
                        <div className="font-bold text-white">Value Iteration</div>
                        <div className="text-violet-400">~6-8 sweeps</div>
                        <div>$O(|S| \cdot |A|)$</div>
                    </div>
                </div>
            </section>

            {/* Key takeaways */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="text-violet-400" size={20} />
                    Key Takeaways: Dynamic Programming
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                    <li><strong>Bootstrapping:</strong> DP updates value estimates of states using current estimates of successor states, rather than waiting for actual environment trajectories.</li>
                    <li><strong>Policy Iteration vs. Value Iteration:</strong> Policy Iteration runs evaluation to convergence before improving, while Value Iteration performs evaluation and greedy update in a single sweep.</li>
                    <li><strong>Generalized Policy Iteration:</strong> The foundational RL architecture of competing evaluation and policy improvement processes.</li>
                    <li><strong>Model Limitations:</strong> Requires full knowledge of transition dynamics, making it computationally heavy and impractical for continuous or unknown environments.</li>
                </ul>
            </section>

            {/* References */}
            <section className="space-y-2 text-xs text-slate-500">
                <h5 className="font-bold uppercase tracking-wider text-slate-400">Further Readings & References</h5>
                <p>1. Sutton, R. S., & Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em>. MIT Press. Chapter 4.</p>
                <p>2. Puterman, M. L. (2014). <em>Markov Decision Processes: Discrete Stochastic Dynamic Programming</em>. John Wiley & Sons.</p>
                <p>3. Bertsekas, D. (2012). <em>Dynamic Programming and Optimal Control</em>. Athena Scientific.</p>
            </section>
        </div>
    );
};
