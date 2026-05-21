import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio, Layers, Brain, Zap, ArrowRight, MousePointerClick } from 'lucide-react';

interface SPRoadmapProps {
    onStepClick?: (id: string) => void;
}

export const SPRoadmap: React.FC<SPRoadmapProps> = ({ onStepClick }) => {
    const steps = [
        {
            id: 'fft',
            title: 'Fourier Analysis',
            desc: 'The Foundation',
            icon: Radio,
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
            border: 'border-purple-500/30',
            hover: 'hover:bg-purple-500/30'
        },
        {
            id: 'stft',
            title: 'Windowing (STFT)',
            desc: 'Time-Frequency',
            icon: Layers,
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            hover: 'hover:bg-blue-500/30'
        },
        {
            id: 'wavelet',
            title: 'Wavelets',
            desc: 'Multi-Resolution',
            icon: Activity,
            color: 'text-green-400',
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            hover: 'hover:bg-green-500/30'
        },
        {
            id: 'dl',
            title: 'Deep Learning',
            desc: 'Feature Learning',
            icon: Brain,
            color: 'text-orange-400',
            bg: 'bg-orange-500/20',
            border: 'border-orange-500/30',
            hover: 'hover:bg-orange-500/30'
        },
        {
            id: 'gen',
            title: 'Generative AI',
            desc: 'Neural Synthesis',
            icon: Zap,
            color: 'text-pink-400',
            bg: 'bg-pink-500/20',
            border: 'border-pink-500/30',
            hover: 'hover:bg-pink-500/30'
        }
    ];

    return (
        <div className="w-full py-8 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[800px] px-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Step Node */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col items-center gap-3 relative z-10 group cursor-pointer`}
                            onClick={() => onStepClick?.(step.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className={`p-4 rounded-xl border ${step.bg} ${step.border} ${step.hover} backdrop-blur-sm transition-all duration-300 shadow-lg relative`}>
                                <step.icon className={`${step.color} w-8 h-8`} />
                                <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    Explore
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className={`font-bold ${step.color} text-sm flex items-center gap-1 justify-center`}>
                                    {step.title}
                                </h3>
                                <p className="text-xs text-gray-500">{step.desc}</p>
                            </div>
                        </motion.div>

                        {/* Connector Arrow */}
                        {index < steps.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: index * 0.1 + 0.05 }}
                                className="flex-1 h-[2px] bg-white/10 mx-4 relative"
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10">
                                    <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
