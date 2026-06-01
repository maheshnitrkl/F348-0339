import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, 
    ArrowRight, 
    Play, 
    Pause, 
    RotateCcw, 
    Terminal, 
    Sparkles, 
    CheckCircle, 
    Info, 
    Layers,
    LineChart,
    Server,
    ListRestart
} from 'lucide-react';
import { MathEquation } from '../../../../components/MathEquation';

export const DeepRL: React.FC = () => {
    // --- CartPole Physics Simulator State ---
    const [simPlaying, setSimPlaying] = useState<boolean>(false);
    const [trainingStage, setTrainingStage] = useState<'random' | 'mid' | 'trained'>('trained');
    const [cartX, setCartX] = useState<number>(0.0); // Cart position [meters]
    const [cartXDot, setCartXDot] = useState<number>(0.0); // Cart velocity
    const [poleTheta, setPoleTheta] = useState<number>(0.05); // Pole angle [radians]
    const [poleThetaDot, setPoleThetaDot] = useState<number>(0.0); // Pole angular velocity
    const [stepsCount, setStepsCount] = useState<number>(0);
    const [qLeftVal, setQLeftVal] = useState<number>(0.0);
    const [qRightVal, setQRightVal] = useState<number>(0.0);
    const [bufferList, setBufferList] = useState<{ s: string; a: string; r: number; ns: string }[]>([]);
    
    // Physics constants
    const GRAVITY = 9.8;
    const MASSCART = 1.0;
    const MASSPOLE = 0.1;
    const TOTAL_MASS = MASSCART + MASSPOLE;
    const LENGTH = 0.5; // Half of pole length
    const POLEMASS_LENGTH = MASSPOLE * LENGTH;
    const FORCE_MAG = 10.0;
    const TAU = 0.02; // Time step
    const X_LIMIT = 2.4; // Out of bounds limit
    const THETA_LIMIT = (12 * Math.PI) / 180; // Out of bounds limit (12 degrees)

    // Reset physics state
    const resetPhysics = () => {
        setCartX(0.0);
        setCartXDot(0.0);
        setPoleTheta((Math.random() - 0.5) * 0.1); // Small random offset
        setPoleThetaDot(0.0);
        setStepsCount(0);
        setQLeftVal(0.0);
        setQRightVal(0.0);
    };

    // Physics step
    const updatePhysicsStep = () => {
        // 1. Controller decides action based on trainingStage
        let action: 'left' | 'right' = 'left';
        
        // Feedforward control logic approximating DQN value decisions
        const thetaErr = poleTheta;
        const thetaDotErr = poleThetaDot;
        const xErr = cartX;
        const xDotErr = cartXDot;
        
        // Optimal control law
        const score = thetaErr * 15.0 + thetaDotErr * 2.5 + xErr * 0.5 + xDotErr * 0.8;
        
        // Approximate Q-values
        let qLeft = -score;
        let qRight = score;

        if (trainingStage === 'random') {
            action = Math.random() > 0.5 ? 'right' : 'left';
            qLeft = Math.random() * 2 - 1;
            qRight = Math.random() * 2 - 1;
        } else if (trainingStage === 'mid') {
            // 75% correct decisions, add noise
            const isCorrect = Math.random() > 0.25;
            const targetAction = score > 0 ? 'right' : 'left';
            action = isCorrect ? targetAction : (targetAction === 'left' ? 'right' : 'left');
            qLeft += (Math.random() - 0.5) * 5;
            qRight += (Math.random() - 0.5) * 5;
        } else {
            // Fully trained
            action = score > 0 ? 'right' : 'left';
        }

        setQLeftVal(parseFloat(qLeft.toFixed(2)));
        setQRightVal(parseFloat(qRight.toFixed(2)));

        // 2. Physics simulation
        const force = action === 'right' ? FORCE_MAG : -FORCE_MAG;
        const cosTheta = Math.cos(poleTheta);
        const sinTheta = Math.sin(poleTheta);

        const temp = (force + POLEMASS_LENGTH * Math.pow(poleThetaDot, 2) * sinTheta) / TOTAL_MASS;
        const thetaAcc = (GRAVITY * sinTheta - cosTheta * temp) / (LENGTH * (4.0 / 3.0 - (MASSPOLE * Math.pow(cosTheta, 2)) / TOTAL_MASS));
        const xAcc = temp - (POLEMASS_LENGTH * thetaAcc * cosTheta) / TOTAL_MASS;

        // Euler integration
        const nextX = cartX + TAU * cartXDot;
        const nextXDot = cartXDot + TAU * xAcc;
        const nextTheta = poleTheta + TAU * poleThetaDot;
        const nextThetaDot = poleThetaDot + TAU * thetaAcc;

        setCartX(nextX);
        setCartXDot(nextXDot);
        setPoleTheta(nextTheta);
        setPoleThetaDot(nextThetaDot);
        setStepsCount(prev => prev + 1);

        // 3. Add to Experience Replay Buffer
        const stateStr = `[${cartX.toFixed(1)}, ${poleTheta.toFixed(2)}]`;
        const nextStateStr = `[${nextX.toFixed(1)}, ${nextTheta.toFixed(2)}]`;
        const reward = (Math.abs(nextX) < X_LIMIT && Math.abs(nextTheta) < THETA_LIMIT) ? 1.0 : -10.0;

        setBufferList(prev => [
            { s: stateStr, a: action.toUpperCase(), r: reward, ns: nextStateStr },
            ...prev.slice(0, 7) // Keep last 8 elements
        ]);

        // Check fail conditions
        if (Math.abs(nextX) >= X_LIMIT || Math.abs(nextTheta) >= THETA_LIMIT) {
            setSimPlaying(false);
        }
    };

    // Auto update loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (simPlaying) {
            interval = setInterval(() => {
                updatePhysicsStep();
            }, 30);
        }
        return () => clearInterval(interval);
    }, [simPlaying, cartX, cartXDot, poleTheta, poleThetaDot, trainingStage]);

    // Handle stage change
    const changeStage = (stage: 'random' | 'mid' | 'trained') => {
        setTrainingStage(stage);
        resetPhysics();
    };

    return (
        <div className="space-y-12">
            {/* Header banner */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-3xl flex items-center justify-center text-amber-500 font-bold border-l border-b border-amber-500/20">
                    Ch. 5
                </div>
                <div className="flex items-center gap-2 text-amber-500 mb-2 font-mono text-xs uppercase tracking-wider">
                    <Cpu size={14} />
                    Module 5 / 13
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Deep Reinforcement Learning & DQN</h2>
                <p className="text-lg text-slate-400 max-w-4xl leading-relaxed">
                    Deep Reinforcement Learning replaces hand-crafted linear features with deep neural networks, enabling agents to parse high-dimensional raw observations (such as game screen pixels or robotic camera feeds) directly into optimal control actions.
                </p>
            </div>

            {/* Section 1: Intro to DQN, Replay Buffer, Target Net */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-amber-500" size={24} />
                    <h3 className="text-2xl font-bold text-white">1. Deep Q-Networks (DQN)</h3>
                </div>
                <p className="text-slate-400">
                    Standard tabular Q-Learning fails when state cardinality is infinite. DQN approximates the optimal action-value function <MathEquation formula="Q^*(s, a)" /> using a deep neural network parameterized by weights <MathEquation formula="\theta" />:
                </p>
                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 text-center">
                    <MathEquation formula="Q(s, a; \theta) \approx Q^*(s, a)" />
                </div>
                <p className="text-slate-400">
                    Training a neural network on RL trajectories is notoriously unstable because consecutive experiences are highly correlated, violating the independent and identically distributed (i.i.d.) data assumption. To resolve this, DQN introduces two critical stability mechanisms:
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Experience Replay */}
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold flex items-center gap-2">
                            <ListRestart className="text-amber-500" size={18} />
                            1. Experience Replay Buffer
                        </h4>
                        <p className="text-sm text-slate-400">
                            Instead of performing updates immediately on incoming steps, the agent stores transition tuples <MathEquation formula="e_t = (S_t, A_t, R_{t+1}, S_{t+1})" /> in a dataset <MathEquation formula="\mathcal{D}" />. During training, we sample random mini-batches uniformly from <MathEquation formula="\mathcal{D}" />:
                        </p>
                        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-center border border-slate-850">
                            <MathEquation formula="(s, a, r, s') \sim U(\mathcal{D})" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            This **breaks the temporal correlation** of sequential observations and allows the network to reuse past data multiple times, significantly improving sample efficiency.
                        </p>
                    </div>

                    {/* Target Network */}
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold flex items-center gap-2">
                            <Server className="text-amber-500" size={18} />
                            2. Target Q-Network
                        </h4>
                        <p className="text-sm text-slate-400">
                            In standard Q-learning, updating the network weights changes both the prediction and the target, causing the network to chase a constantly moving target. DQN maintains a separate target network <MathEquation formula="Q(s, a; \theta^-)" /> whose weights are frozen and only copied periodically:
                        </p>
                        <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-center border border-slate-850">
                            <MathEquation formula="L_i(\theta_i) = \mathbb{E} \left[ \left( r + \gamma \max_{a'} Q(s', a'; \theta_i^-) - Q(s, a; \theta_i) \right)^2 \right]" block />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Every <MathEquation formula="C" /> steps, we copy the online weights to the target weights: <MathEquation formula="\theta^- \leftarrow \theta" />. Alternatively, we perform soft updates: <MathEquation formula="\theta^- \leftarrow \tau \theta + (1-\tau)\theta^-" />.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: DQN Improvements: Double & Dueling */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <CheckCircle className="text-amber-500" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. Double DQN & Dueling Q-Networks</h3>
                </div>
                <p className="text-slate-400">
                    To scale beyond basic DQN, standard architectures incorporate key improvements to mitigate overestimation bias and separate environment values from actions.
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Double DQN */}
                    <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold">Double DQN (Reducing Overestimations)</h4>
                        <p className="text-sm text-slate-400">
                            Standard DQN uses the maximum Q-value as the target, which systematically overestimates values due to statistical noise in early training. Double DQN solves this by decoupling action selection from action evaluation. We use the **online weights** to choose the best action, and the **target weights** to evaluate its value:
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg text-center font-mono text-xs border border-slate-850">
                            <MathEquation formula="Y_t^{\text{DoubleDQN}} = R_{t+1} + \gamma Q\left(S_{t+1}, \text{argmax}_{a} Q(S_{t+1}, a; \theta_t); \theta_t^-\right)" block />
                        </div>
                    </div>

                    {/* Dueling DQN */}
                    <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4">
                        <h4 className="text-white font-bold">Dueling DQN (Decoupling Streams)</h4>
                        <p className="text-sm text-slate-400">
                            Instead of estimating action-values directly, a Dueling network splits the model architecture into two streams: a **State-Value stream** <MathEquation formula="V(s)" /> and an **Advantage stream** <MathEquation formula="A(s, a)" />. They are combined at the output layer:
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg text-center font-mono text-xs border border-slate-850">
                            <MathEquation formula="Q(s, a; \theta) = V(s; \beta) + \left( A(s, a; \alpha) - \frac{1}{|A|} \sum_{a'} A(s, a'; \alpha) \right)" block />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Subtracting the mean advantage ensures identifiability (prevents the Q-value from shifting arbitrarily between streams).
                        </p>
                    </div>
                </div>

                {/* Rainbow DQN Callout */}
                <div className="bg-amber-950/20 border border-amber-900/40 p-6 rounded-xl space-y-3">
                    <h4 className="text-amber-400 font-bold flex items-center gap-2">
                        <Sparkles size={18} />
                        The Rainbow DQN Integration (SOTA)
                    </h4>
                    <p className="text-sm text-slate-400">
                        Rainbow DQN integrates 7 independent improvements to achieve state-of-the-art sample efficiency:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-mono">
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">1. DQN</div>
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">2. Double DQN</div>
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">3. Prioritized Replay</div>
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">4. Dueling Nets</div>
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">5. Multi-Step TD</div>
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">6. Distributional RL</div>
                        <div className="p-2 bg-slate-900/50 rounded border border-slate-800">7. Noisy Nets</div>
                    </div>
                </div>
            </section>

            {/* 3. Interactive CartPole physics simulator */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-amber-500 animate-pulse" size={20} />
                        DQN Interactive Simulator: CartPole Balancing
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Select a DQN training stage and watch the cart balance the pole using real physics. Monitor the live Q-value stream and replay buffer entries.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Controls panel */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">DQN Training Epochs</h5>

                            {/* Training Stage Selector */}
                            <div className="space-y-2">
                                <button 
                                    onClick={() => changeStage('random')}
                                    className={`w-full py-2 rounded text-xs font-bold text-left px-3 flex justify-between items-center transition-all ${
                                        trainingStage === 'random' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <span>Stage 1: Random Weights</span>
                                    <span className="text-[10px] uppercase font-mono">0 Ep.</span>
                                </button>
                                <button 
                                    onClick={() => changeStage('mid')}
                                    className={`w-full py-2 rounded text-xs font-bold text-left px-3 flex justify-between items-center transition-all ${
                                        trainingStage === 'mid' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <span>Stage 2: Mid-Training</span>
                                    <span className="text-[10px] uppercase font-mono">50 Ep.</span>
                                </button>
                                <button 
                                    onClick={() => changeStage('trained')}
                                    className={`w-full py-2 rounded text-xs font-bold text-left px-3 flex justify-between items-center transition-all ${
                                        trainingStage === 'trained' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <span>Stage 3: DQN Fully Trained</span>
                                    <span className="text-[10px] uppercase font-mono">300+ Ep.</span>
                                </button>
                            </div>

                            {/* Sim triggers */}
                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                                <button 
                                    onClick={() => setSimPlaying(!simPlaying)}
                                    className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${simPlaying ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
                                >
                                    {simPlaying ? 'Pause Simulation' : 'Start Simulation'}
                                </button>
                                <button 
                                    onClick={resetPhysics}
                                    className="px-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                                >
                                    <RotateCcw size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Monitor */}
                        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Time Steps (Score)</span>
                                <span className="text-sm text-white font-bold">{stepsCount}</span>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-500 block mb-1">Pole Angle (θ)</span>
                                <span className={`text-sm font-bold ${Math.abs(poleTheta) > THETA_LIMIT * 0.75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {(poleTheta * 180 / Math.PI).toFixed(1)}°
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Physics SVG screen */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative h-64 overflow-hidden">
                            {/* SVG Arena */}
                            <svg viewBox="0 0 500 200" className="w-full h-full">
                                {/* Floor */}
                                <line x1="20" y1="160" x2="480" y2="160" stroke="#334155" strokeWidth="2" />
                                
                                {/* Track boundaries */}
                                <line x1={250 + X_LIMIT * 80} y1="150" x2={250 + X_LIMIT * 80} y2="170" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                                <line x1={250 - X_LIMIT * 80} y1="150" x2={250 - X_LIMIT * 80} y2="170" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />

                                {/* Cart */}
                                <rect 
                                    x={250 + cartX * 80 - 30} 
                                    y="130" 
                                    width="60" 
                                    height="30" 
                                    rx="4" 
                                    fill="#475569" 
                                    stroke="#94a3b8" 
                                    strokeWidth="1.5" 
                                />

                                {/* Cart wheels */}
                                <circle cx={250 + cartX * 80 - 20} cy="165" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                                <circle cx={250 + cartX * 80 + 20} cy="165" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="1" />

                                {/* Joint */}
                                <circle cx={250 + cartX * 80} cy="140" r="4" fill="#f59e0b" />

                                {/* Pole stick */}
                                <line 
                                    x1={250 + cartX * 80} 
                                    y1="140" 
                                    x2={250 + cartX * 80 + LENGTH * 200 * Math.sin(poleTheta)} 
                                    y2={140 - LENGTH * 200 * Math.cos(poleTheta)} 
                                    stroke="#b45309" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                />
                            </svg>

                            {/* Q-Values stream overlay */}
                            <div className="absolute top-3 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-2.5 rounded-lg font-mono text-[10px] space-y-1.5 min-w-[150px]">
                                <span className="text-amber-400 font-bold block">Live DQN Predictions:</span>
                                <div className="flex justify-between items-center">
                                    <span>Q(s, PUSH_LEFT):</span>
                                    <span className={qLeftVal >= qRightVal ? 'text-amber-400 font-bold' : 'text-slate-400'}>{qLeftVal}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Q(s, PUSH_RIGHT):</span>
                                    <span className={qRightVal >= qLeftVal ? 'text-amber-400 font-bold' : 'text-slate-400'}>{qRightVal}</span>
                                </div>
                            </div>
                        </div>

                        {/* Experience replay streaming log */}
                        <div className="bg-black/50 p-4 border border-slate-800 rounded-xl h-28 overflow-y-auto font-mono text-[10px] text-slate-400 scrollbar-hide">
                            <span className="text-amber-400 font-bold block mb-1">&gt; Experience Replay Buffer Queue:</span>
                            <div className="grid grid-cols-4 border-b border-slate-800 pb-1 text-slate-500 uppercase font-bold text-center">
                                <div>State [x, θ]</div>
                                <div>Action</div>
                                <div>Reward</div>
                                <div>Next State [x', θ']</div>
                            </div>
                            <div className="divide-y divide-slate-900">
                                {bufferList.map((entry, idx) => (
                                    <div key={idx} className="grid grid-cols-4 py-1 text-center font-mono">
                                        <div className="text-slate-300">{entry.s}</div>
                                        <div className="text-cyan-400">{entry.a}</div>
                                        <div className={entry.r > 0 ? 'text-emerald-400' : 'text-rose-400'}>{entry.r.toFixed(1)}</div>
                                        <div className="text-slate-400">{entry.ns}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Worked Numerical Example */}
            <section className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-amber-400" size={20} />
                    Worked Numerical Example: DQN Target Estimation
                </h4>
                <p className="text-sm text-slate-400">
                    Let's compute the Loss calculation step for a DQN agent update. Assume:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                    <div>
                        <strong>1. Replay transition tuple sampled:</strong>
                        <ul className="list-disc pl-5 mt-1 text-slate-400">
                            <li>State transition: <MathEquation formula="s \to s'" />.</li>
                            <li>Action taken: <MathEquation formula="a = \text{Push Right}" /> (index 1).</li>
                            <li>Reward: <MathEquation formula="r = +1.0" />, discount factor <MathEquation formula="\gamma = 0.95" />.</li>
                        </ul>
                    </div>
                    <div>
                        <strong>2. Online Q-network outputs Q(s, a; θ):</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            <MathEquation formula="Q(s, \text{Push Left}; \theta) = -0.52" />
                            <br />
                            <MathEquation formula="Q(s, \text{Push Right}; \theta) = +1.48 \quad \text{(Predict Value)}" />
                        </div>
                    </div>
                    <div>
                        <strong>3. Target Q-network outputs Q(s', a'; θ^-):</strong>
                        <div className="pl-4 mt-1 text-slate-400 font-bold text-amber-400">
                            Double DQN Action selection (via Online Network):
                            <br />
                            <MathEquation formula="a^* = \text{argmax}_{a'} Q(s', a'; \theta) = \text{Push Right}" />
                            <br />
                            Double DQN Action evaluation (via Target Network):
                            <br />
                            <MathEquation formula="Q(s', a^*; \theta^-) = +1.20" />
                            <br />
                            Target value calculation:
                            <br />
                            <MathEquation formula="Y_t = r + \gamma Q(s', a^*; \theta^-) = 1.0 + 0.95 \times 1.20 = 1.0 + 1.14 = 2.14" />
                        </div>
                    </div>
                    <div>
                        <strong>4. Loss Step computation:</strong>
                        <div className="pl-4 mt-1 text-slate-400">
                            <MathEquation formula="L(\theta) = \left( Y_t - Q(s, \text{Push Right}; \theta) \right)^2 = (2.14 - 1.48)^2 = 0.66^2 = 0.4356" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Takeaways */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="text-amber-400" size={20} />
                    Key Takeaways: Deep Reinforcement Learning
                </h4>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-400">
                    <li><strong>DQN Scaffolding:</strong> Stabilizes training using an Experience Replay Buffer (removes correlation) and a frozen Target Network (stabilizes targets).</li>
                    <li><strong>Double DQN:</strong> Mitigates Q-value overestimation bias by using the online network for action selection and the target network for action evaluation.</li>
                    <li><strong>Dueling DQN:</strong> Decouples value and advantage streams to focus network updates on states without forcing independent estimates for each action.</li>
                </ul>
            </section>

            {/* References */}
            <section className="space-y-2 text-xs text-slate-500">
                <h5 className="font-bold uppercase tracking-wider text-slate-400">Further Readings & References</h5>
                <p>1. Mnih, V., et al. (2015). <em>Human-level control through deep reinforcement learning</em>. Nature, 518(7540), 529-533.</p>
                <p>2. Van Hasselt, H., Guez, A., & Silver, D. (2016). <em>Deep reinforcement learning with double q-learning</em>. AAAI.</p>
                <p>3. Wang, Z., et al. (2016). <em>Dueling network architectures for deep reinforcement learning</em>. ICML.</p>
                <p>4. Hessel, M., et al. (2018). <em>Rainbow: Combining improvements in deep reinforcement learning</em>. AAAI.</p>
            </section>
        </div>
    );
};
