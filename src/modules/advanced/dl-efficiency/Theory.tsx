import React from 'react';
import { MathEquation } from '../../../components/MathEquation';
import { OptimizerRace3D } from './components/OptimizerRace3D';
import { LRSchedulerGraph } from './components/LRSchedulerGraph';
import { LossVisualizer } from './components/LossVisualizer';
import { RegularizationViz } from './components/RegularizationViz';
import { HyperparameterSandbox } from './components/HyperparameterSandbox';
import { QuizComponent } from './components/QuizComponent';
import { TrainingLifecycleViz } from './components/TrainingLifecycleViz';
import { Network, Activity, GitCommit, RefreshCw, Zap, TrendingDown, Target, ShieldAlert, Server } from 'lucide-react';

const quizQuestions = [
    {
        id: 'q1',
        question: "Which optimizer completely discards variance tracking and only uses the mathematical sign of the momentum, making it highly memory efficient for massive models?",
        options: ["AdamW", "Lion", "RMSProp", "Nesterov Accelerated Gradient"],
        correctIndex: 1,
        explanation: "Lion (EvoLved Sign Momentum) was discovered by an AI search and relies strictly on the sign of the momentum, saving massive amounts of VRAM by dropping the second moment (variance)."
    },
    {
        id: 'q2',
        question: "When applying regularization to enforce a highly sparse model (driving many weights exactly to zero), which technique should you use?",
        options: ["L2 Regularization (Ridge)", "Dropout", "Batch Normalization", "L1 Regularization (Lasso)"],
        correctIndex: 3,
        explanation: "L1 Regularization applies a constant penalty to the absolute value of weights, which physically forces smaller weights exactly to zero, creating sparsity. L2 only shrinks them proportionally."
    },
    {
        id: 'q3',
        question: "Why is 'Gradient Scaling' often required when training in Mixed Precision (FP16)?",
        options: ["To prevent numerical underflow of tiny gradients during backpropagation", "To speed up the matrix multiplications on Tensor Cores", "To reduce the amount of RAM needed to store the model", "To prevent overfitting by adding noise to the gradients"],
        correctIndex: 0,
        explanation: "FP16 (Half Precision) has a very limited dynamic range for tiny numbers. Without Gradient Scaling (multiplying the loss by a large factor before backprop), the tiny gradients would round down to absolute zero (underflow)."
    }
];

export const DLEfficiencyTheory: React.FC = () => {
    return (
        <div className="space-y-12 text-slate-300 leading-relaxed max-w-7xl mx-auto w-full">
            {/* Intro */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-4">Training Optimization & Efficiency</h2>
                <p className="text-lg text-slate-400">
                    Training deep neural networks is an intricate balancing act of compute, memory, and mathematical stability. This module explores the foundational steps of training, the optimization algorithms that drive learning, the loss functions that guide them, and the critical hyperparameters and regularization techniques required for convergence.
                </p>
            </div>

            {/* 1. The Training Lifecycle */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <RefreshCw className="text-cyan-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">1. The Training Lifecycle</h3>
                </div>
                
                <TrainingLifecycleViz />
            </section>

            {/* 2. Optimizers */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <Zap className="text-yellow-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">2. Optimization Algorithms</h3>
                </div>

                <div className="space-y-6">
                    {/* SGD */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h4 className="text-xl font-bold text-white mb-2">SGD (Stochastic Gradient Descent)</h4>
                        <div className="mb-4 bg-black/40 p-3 rounded-lg overflow-x-auto">
                            <MathEquation formula="\theta_{t+1} = \theta_t - \eta \nabla J(\theta_t)" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong className="text-blue-400">Intuition:</strong>
                                <p className="mt-1 text-slate-400">Takes a step in the exact opposite direction of the gradient. Simple and memory efficient, but can struggle with ravines and saddle points without momentum.</p>
                            </div>
                            <div>
                                <strong className="text-blue-400">Best Used When:</strong>
                                <p className="mt-1 text-slate-400">Training simple models or when fine-tuning near the end of training (typically combined with momentum).</p>
                                <div className="mt-2 text-xs bg-slate-800/50 p-2 rounded inline-block">
                                    <span className="text-slate-300">Key HP:</span> Learning Rate (<MathEquation formula="\eta" />) ≈ 0.01
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Adam */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                        <h4 className="text-xl font-bold text-white mb-2">Adam (Adaptive Moment Estimation)</h4>
                        <div className="mb-4 bg-black/40 p-3 rounded-lg overflow-x-auto flex flex-col items-center">
                            <MathEquation block formula="m_t = \beta_1 m_{t-1} + (1-\beta_1) g_t" />
                            <MathEquation block formula="v_t = \beta_2 v_{t-1} + (1-\beta_2) g_t^2" />
                            <MathEquation block formula="\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong className="text-violet-400">Intuition:</strong>
                                <p className="mt-1 text-slate-400">Combines momentum (first moment, <MathEquation formula="m_t" />) and scales steps by the moving average of squared gradients (second moment, <MathEquation formula="v_t" />). It adapts the learning rate for each parameter individually.</p>
                            </div>
                            <div>
                                <strong className="text-violet-400">Best Used When:</strong>
                                <p className="mt-1 text-slate-400">The default choice for most deep learning architectures. Highly robust and fast to converge, especially with sparse gradients.</p>
                                <div className="mt-2 text-xs bg-slate-800/50 p-2 rounded inline-block">
                                    <span className="text-slate-300">Key HPs:</span> <MathEquation formula="\eta" /> ≈ 0.001, <MathEquation formula="\beta_1" /> ≈ 0.9, <MathEquation formula="\beta_2" /> ≈ 0.999
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AdaGrad */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <h4 className="text-xl font-bold text-white mb-2">AdaGrad (Adaptive Gradient)</h4>
                        <div className="mb-4 bg-black/40 p-3 rounded-lg overflow-x-auto flex flex-col items-center">
                            <MathEquation block formula="G_t = G_{t-1} + g_t^2" />
                            <MathEquation block formula="\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{G_t + \epsilon}} g_t" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong className="text-emerald-400">Intuition:</strong>
                                <p className="mt-1 text-slate-400">Scales down the learning rate for frequently updated parameters while keeping it higher for sparse ones, accumulating the squares of all past gradients (<MathEquation formula="G_t" />).</p>
                            </div>
                            <div>
                                <strong className="text-emerald-400">Best Used When:</strong>
                                <p className="mt-1 text-slate-400">Dealing with highly sparse data, such as in natural language processing with large vocabularies or recommendation systems.</p>
                                <div className="mt-2 text-xs bg-slate-800/50 p-2 rounded inline-block">
                                    <span className="text-slate-300">Key HP:</span> <MathEquation formula="\eta" /> ≈ 0.01
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RMSProp */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <h4 className="text-xl font-bold text-white mb-2">RMSProp (Root Mean Square Propagation)</h4>
                        <div className="mb-4 bg-black/40 p-3 rounded-lg overflow-x-auto flex flex-col items-center">
                            <MathEquation block formula="E[g^2]_t = \beta E[g^2]_{t-1} + (1-\beta) g_t^2" />
                            <MathEquation block formula="\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{E[g^2]_t + \epsilon}} g_t" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong className="text-orange-400">Intuition:</strong>
                                <p className="mt-1 text-slate-400">Modifies AdaGrad to use an exponentially decaying moving average of squared gradients rather than a continually accumulating sum, preventing the learning rate from vanishing entirely.</p>
                            </div>
                            <div>
                                <strong className="text-orange-400">Best Used When:</strong>
                                <p className="mt-1 text-slate-400">Training Recurrent Neural Networks (RNNs) where standard momentum struggles with exploding or vanishing gradients.</p>
                                <div className="mt-2 text-xs bg-slate-800/50 p-2 rounded inline-block">
                                    <span className="text-slate-300">Key HPs:</span> <MathEquation formula="\eta" /> ≈ 0.001, <MathEquation formula="\beta" /> ≈ 0.9
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AdamW */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                        <h4 className="text-xl font-bold text-white mb-2">AdamW (Decoupled Weight Decay)</h4>
                        <div className="mb-4 bg-black/40 p-3 rounded-lg overflow-x-auto flex flex-col items-center">
                            <MathEquation block formula="\theta_{t+1} = \theta_t - \eta \left( \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} + \lambda \theta_t \right)" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong className="text-pink-400">Intuition:</strong>
                                <p className="mt-1 text-slate-400">In standard Adam, L2 regularization (weight decay) gets divided by the moving average of squared gradients, rendering it ineffective for sparse features. AdamW completely decouples weight decay, applying it directly to the weights, restoring its full regularizing power.</p>
                            </div>
                            <div>
                                <strong className="text-pink-400">Best Used When:</strong>
                                <p className="mt-1 text-slate-400">The modern state-of-the-art default for training Transformers (LLMs, Vision Transformers). You should almost always use AdamW instead of standard Adam today.</p>
                                <div className="mt-2 text-xs bg-slate-800/50 p-2 rounded inline-block">
                                    <span className="text-slate-300">Key HP:</span> Weight Decay (<MathEquation formula="\lambda" />) ≈ 0.01
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lion */}
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00f3ff]"></div>
                        <h4 className="text-xl font-bold text-white mb-2">Lion (EvoLved Sign Momentum)</h4>
                        <div className="mb-4 bg-black/40 p-3 rounded-lg overflow-x-auto flex flex-col items-center">
                            <MathEquation block formula="c_t = \beta_1 m_{t-1} + (1-\beta_1) g_t" />
                            <MathEquation block formula="\theta_{t+1} = \theta_t - \eta \cdot \text{sign}(c_t)" />
                            <MathEquation block formula="m_t = \beta_2 m_{t-1} + (1-\beta_2) g_t" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong className="text-[#00f3ff]">Intuition:</strong>
                                <p className="mt-1 text-slate-400">Discovered by an AI using symbolic search (Google Brain). It entirely drops the computationally heavy variance tracking (second moment) and instead just takes the <i>sign</i> (±1) of the momentum update. Highly memory efficient.</p>
                            </div>
                            <div>
                                <strong className="text-[#00f3ff]">Best Used When:</strong>
                                <p className="mt-1 text-slate-400">Training massive models where GPU memory is the main bottleneck. Lion uses less VRAM per parameter than Adam but can match or beat its convergence.</p>
                                <div className="mt-2 text-xs bg-slate-800/50 p-2 rounded inline-block">
                                    <span className="text-slate-300">Key HPs:</span> <MathEquation formula="\eta" /> ≈ 1e-4 (usually 1/10th of Adam's LR), <MathEquation formula="\beta_1" /> ≈ 0.9, <MathEquation formula="\beta_2" /> ≈ 0.99
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <OptimizerRace3D />
                </div>
            </section>

            {/* 3. Loss Functions */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <Target className="text-rose-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">3. Loss Functions Reference</h3>
                </div>

                <div className="grid gap-6">
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            MSE (Mean Squared Error)
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Regression</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center">
                            <MathEquation formula="L = \frac{1}{N}\sum_{i=1}^N (y_i - \hat{y}_i)^2" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> Large errors disproportionately heavily because of the squaring operation.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Performing standard regression tasks where outliers are either rare or signify crucial errors that the model absolutely must not ignore.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            Cross-Entropy
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Classification</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center">
                            <MathEquation formula="L = -\frac{1}{N}\sum_{i=1}^N \sum_{c=1}^C y_{i,c} \log(\hat{y}_{i,c})" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> Confident but incorrect predictions extremely heavily, pushing the model's predicted probabilities close to absolute 0 or 1.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Solving classification tasks (binary or multi-class) outputting probabilities via sigmoid or softmax activations.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            Huber Loss
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Robust Regression</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center overflow-x-auto">
                            <MathEquation formula="L = \begin{cases} \frac{1}{2}(y-\hat{y})^2 & \text{for } |y-\hat{y}| \le \delta \\ \delta |y-\hat{y}| - \frac{1}{2}\delta^2 & \text{otherwise} \end{cases}" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> Small errors quadratically (like MSE) but large errors linearly (like MAE), providing mathematical robustness to extreme outliers.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Doing regression tasks with noisy data where you want the stability and smoothness of MSE near the minimum, but the outlier-resistance of MAE.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            MAE (Mean Absolute Error) / L1 Loss
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Robust Regression</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center">
                            <MathEquation formula="L = \frac{1}{N}\sum_{i=1}^N |y_i - \hat{y}_i|" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> All errors purely linearly. Outliers are not squared, meaning they do not pull the model as aggressively as in MSE.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Outliers in your dataset are mostly noise or anomalies that the model should ignore, rather than critical edge cases.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            Focal Loss
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Imbalanced Classification</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center overflow-x-auto">
                            <MathEquation formula="L = -\alpha_t (1 - p_t)^\gamma \log(p_t)" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> Modifies standard Cross-Entropy by drastically down-weighting the loss assigned to easily classified examples, forcing the model to focus purely on hard, misclassified cases.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Dealing with extreme class imbalances, such as Object Detection (where 99% of bounding boxes are background) or rare disease classification.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            Hinge Loss
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Max-Margin Classification</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center">
                            <MathEquation formula="L = \max(0, 1 - y \cdot \hat{y})" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> Predictions that are on the wrong side of the decision boundary, OR on the right side but too close to the margin.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Training Support Vector Machines (SVMs) or when you specifically want a maximum-margin separator rather than probabilistic outputs.</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center justify-between">
                            Dice Loss
                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Segmentation</span>
                        </h4>
                        <div className="bg-black/30 p-4 rounded-lg mb-4 flex justify-center">
                            <MathEquation formula="L = 1 - \frac{2 \sum (p \cdot y)}{\sum p + \sum y + \epsilon}" />
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong className="text-rose-400">Penalizes:</strong> Directly minimizes the Sorensen-Dice coefficient, maximizing the overlap area between the predicted and true masks.</p>
                            <p><strong className="text-rose-400">Prefer when:</strong> Performing image segmentation, particularly when the region of interest covers only a small percentage of the total image (e.g., medical lesions).</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <LossVisualizer />
                </div>
            </section>

            {/* 4. Hyperparameter Reference Table */}
            <section className="space-y-6">
                <HyperparameterSandbox />
            </section>

            {/* 5. Learning Rate Schedules */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <TrendingDown className="text-cyan-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">5. Learning Rate Schedules</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col h-full">
                        <h4 className="font-bold text-white mb-2 text-center">Step Decay</h4>
                        <div className="bg-black/30 py-3 px-2 rounded-lg mb-4 text-center">
                            <MathEquation formula="\eta_t = \eta_0 \gamma^{\lfloor t/s \rfloor}" />
                        </div>
                        <p className="text-xs text-slate-400 mt-auto">
                            <strong className="text-cyan-400 block mb-1">When to use:</strong>
                            Standard choice in computer vision (e.g., ResNet) where the validation loss plateaus and needs a sudden drop to settle into a narrower, deeper minimum.
                        </p>
                    </div>

                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col h-full">
                        <h4 className="font-bold text-white mb-2 text-center">Cosine Annealing</h4>
                        <div className="bg-black/30 py-3 px-2 rounded-lg mb-4 text-center overflow-x-auto">
                            <MathEquation formula="\eta_t = \eta_{min} + \frac{1}{2}(\eta_{max} - \eta_{min})(1 + \cos(\frac{T_{cur}}{T_{max}}\pi))" />
                        </div>
                        <p className="text-xs text-slate-400 mt-auto">
                            <strong className="text-cyan-400 block mb-1">When to use:</strong>
                            Provides smooth, continuous decay, often yielding better convergence and generalization than step decay without needing manual milestone tuning.
                        </p>
                    </div>

                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col h-full">
                        <h4 className="font-bold text-white mb-2 text-center">Warmup</h4>
                        <div className="bg-black/30 py-3 px-2 rounded-lg mb-4 text-center">
                            <MathEquation formula="\eta_t = \frac{t}{t_{warmup}} \eta_{base}" />
                        </div>
                        <p className="text-xs text-slate-400 mt-auto">
                            <strong className="text-cyan-400 block mb-1">When to use:</strong>
                            Essential when training Transformers or using very large batch sizes, preventing early divergence when network parameters are initially random.
                        </p>
                    </div>
                </div>

                <div className="pt-8">
                    <LRSchedulerGraph />
                </div>
            </section>

            {/* 6. Convergence & Regularization */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <ShieldAlert className="text-purple-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">6. Convergence & Regularization</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 space-y-2 w-full">
                            <h4 className="font-bold text-white text-lg">Early Stopping</h4>
                            <p className="text-sm text-slate-400">Prevents overfitting by halting training when the model's performance on a held-out validation set begins to degrade.</p>
                            <div className="text-sm mt-2 border-l-2 border-purple-500 pl-3 italic text-slate-300">
                                <strong>Practical Tip:</strong> Set a patience parameter large enough (e.g., 5-10 epochs) to ride out local noise in the validation loss curve before terminating training.
                            </div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg w-full md:w-auto overflow-x-auto">
                            <MathEquation formula="\text{Stop if } V_{loss}(t) > \min_{i < t} V_{loss}(i)" />
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 space-y-2 w-full">
                            <h4 className="font-bold text-white text-lg">Batch Normalization</h4>
                            <p className="text-sm text-slate-400">Normalizes the inputs to a layer for each mini-batch, reducing internal covariate shift.</p>
                            <div className="text-sm mt-2 border-l-2 border-purple-500 pl-3 italic text-slate-300">
                                <strong>Practical Tip:</strong> Apply it immediately before or after activation functions to stabilize the network and allow for significantly higher learning rates.
                            </div>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg w-full md:w-auto overflow-x-auto flex flex-col gap-2">
                            <MathEquation formula="\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}" />
                            <MathEquation formula="y_i = \gamma \hat{x}_i + \beta" />
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <RegularizationViz />
                </div>
            </section>


            {/* 7. Mixed Precision Training */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <Server className="text-blue-400" size={24} />
                    <h3 className="text-2xl font-bold text-white">7. Mixed Precision Training</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-white mb-2 text-blue-400">FP32 (Single Precision)</h4>
                        <p className="text-sm text-slate-400">The traditional default. Uses 32 bits (1 sign, 8 exponent, 23 fraction). Highly precise and mathematically stable, but uses 4 bytes of VRAM per parameter, which becomes a bottleneck for modern LLMs.</p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-bl">Needs Scaling</div>
                        <h4 className="font-bold text-white mb-2 text-blue-400">FP16 (Half Precision)</h4>
                        <p className="text-sm text-slate-400">Uses 16 bits (1 sign, 5 exponent, 10 fraction). Cuts memory in half and doubles compute speed on Tensor Cores, but the tiny 5-bit exponent means tiny gradients often round down to absolute zero (underflow).</p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-bl">Modern Standard</div>
                        <h4 className="font-bold text-white mb-2 text-blue-400">BF16 (Brain Float)</h4>
                        <p className="text-sm text-slate-400">Created by Google Brain. Uses 16 bits but reallocates them (1 sign, 8 exponent, 7 fraction). It matches the exponent range of FP32, making it completely immune to gradient underflow, though slightly less precise.</p>
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <h4 className="font-bold text-white mb-2">Gradient Scaling (The Fix for FP16)</h4>
                        <p className="text-sm text-slate-400">To prevent the underflow problem in FP16, we multiply the Loss by a large scaling factor (e.g., $2^{16}$) <span className="italic">before</span> calling backpropagation. This mathematically scales all the gradients up into a safe, representable range. Before applying the optimizer update, we simply divide the gradients back down.</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg flex-shrink-0">
                        <MathEquation formula="L_{scaled} = L \times S" block />
                        <MathEquation formula="\nabla W_{scaled} = \frac{\partial L_{scaled}}{\partial W}" block />
                        <MathEquation formula="\nabla W = \frac{\nabla W_{scaled}}{S}" block />
                    </div>
                </div>
            </section>

            {/* Quiz Component */}
            <div className="pt-12 pb-8">
                <QuizComponent questions={quizQuestions} />
            </div>
        </div>
    );
};
