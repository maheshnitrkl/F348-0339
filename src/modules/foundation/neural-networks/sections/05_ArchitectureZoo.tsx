import React from 'react';
import { ArchitectureCards } from '../components/ArchitectureCards';

export const ArchitectureZoo: React.FC = () => {
    return (
        <section className="space-y-16">

            {/* ── 13 · Architecture Zoo ──────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-sm">
                    <span>13</span>
                    <div className="h-px bg-amber-500/50 w-8" />
                    <span>Architecture Zoo</span>
                </div>
                <h2 className="text-4xl font-bold text-white">Specialized Architectures</h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                    The MLP is the foundation, but modern deep learning has evolved dozens of specialized
                    architectures — each designed for a specific type of data or problem.
                    From image recognition to language modeling to medical imaging.
                </p>
            </div>

            {/* Architecture Cards */}
            <ArchitectureCards />

            {/* ── The Architecture Selection Guide ────────────── */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">How to Choose an Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { question: 'Is your data an image or spatial grid?', answer: 'Use a CNN. Its convolution layers exploit spatial structure and weight sharing.', color: '#3b82f6' },
                        { question: 'Is your data a sequence (text, time series)?', answer: 'Use RNN or LSTM for short sequences. Use Transformer for long-range dependencies.', color: '#0891b2' },
                        { question: 'Do you have tabular / structured data?', answer: 'Start with MLP. Also try gradient boosted trees (XGBoost) as a baseline.', color: '#8b5cf6' },
                        { question: 'Do you need to generate or denoise data?', answer: 'Use an Autoencoder (for compression/denoising) or Diffusion Model (for generation).', color: '#ec4899' },
                        { question: 'Do you need to process multiple modalities?', answer: 'Use a Transformer — its attention mechanism naturally handles cross-modal data.', color: '#f59e0b' },
                        { question: 'Working with medical images specifically?', answer: 'CNN for classification/segmentation. U-Net for pixel-level segmentation. DDPMs for MRI synthesis.', color: '#34d399' },
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                            <p className="text-sm font-semibold text-white">❓ {item.question}</p>
                            <p className="text-sm text-slate-400" style={{ borderLeft: `2px solid ${item.color}`, paddingLeft: 8 }}>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Architecture Timeline</h3>
                <div className="relative pl-6 border-l border-slate-800 space-y-4">
                    {[
                        { year: '1943', name: 'McCulloch-Pitts Neuron', desc: 'First mathematical model of a neuron — binary logic.' },
                        { year: '1958', name: 'Perceptron', desc: 'Rosenblatt\'s trainable linear classifier.' },
                        { year: '1986', name: 'MLP + Backprop', desc: 'Rumelhart et al. Multi-layer networks + backpropagation.', highlight: true },
                        { year: '1989', name: 'CNN (LeNet)', desc: 'LeCun\'s convolutional network for digit recognition.' },
                        { year: '1997', name: 'LSTM', desc: 'Hochreiter & Schmidhuber solve vanishing gradients for RNNs.' },
                        { year: '2012', name: 'AlexNet', desc: 'Deep CNN wins ImageNet. Deep learning revolution begins.', highlight: true },
                        { year: '2015', name: 'ResNet', desc: 'Skip connections enable 100+ layer networks.' },
                        { year: '2017', name: 'Transformer', desc: '"Attention is All You Need" — Vaswani et al. Replaces RNNs.', highlight: true },
                        { year: '2020+', name: 'Foundation Models', desc: 'GPT-3, DALL-E, SAM, AlphaFold2, DDPM. Scale changes everything.', highlight: true },
                    ].map((event, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 -ml-7 ${event.highlight ? 'bg-violet-400 ring-2 ring-violet-400/30' : 'bg-slate-600'}`} />
                            <div>
                                <span className="text-xs font-mono text-slate-500">{event.year}</span>
                                <span className={`ml-3 text-sm font-bold ${event.highlight ? 'text-violet-300' : 'text-slate-300'}`}>{event.name}</span>
                                <p className="text-slate-500 text-xs mt-0.5">{event.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer: What's Next */}
            <div className="border-t border-white/10 pt-12 pb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Backpropagation', color: '#22d3ee', desc: 'Deep dive into how gradients are computed with the chain rule.', icon: '⬅️' },
                        { title: 'DL Efficiency', color: '#a78bfa', desc: 'Batch norm, dropout, weight decay — making training practical.', icon: '⚡' },
                        { title: 'Medical Imaging', color: '#34d399', desc: 'Apply CNNs and diffusion models to MRI and medical data.', icon: '🏥' },
                    ].map(item => (
                        <div key={item.title} className="p-6 bg-slate-900 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors group cursor-pointer space-y-2">
                            <div className="text-2xl">{item.icon}</div>
                            <h4 className="font-bold text-sm group-hover:brightness-125 transition-all" style={{ color: item.color }}>{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
};
