import React, { useState } from 'react';
import { InteractiveSignalLab } from './InteractiveSignalLab';
import { BiomedicalLab } from './BiomedicalLab';
import { WaveletDemo } from './WaveletDemo';
import { ConvolutionDemo } from './ConvolutionDemo';

type Tab = 'fundamentals' | 'biomedical' | 'research';

export const SignalProcessingHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('fundamentals');

    return (
        <div className="flex flex-col gap-6">
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-4">
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('fundamentals')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'fundamentals' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Fundamentals
                    </button>
                    <button
                        onClick={() => setActiveTab('biomedical')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'biomedical' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Biomedical (ECG/EEG)
                    </button>
                    <button
                        onClick={() => setActiveTab('research')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'research' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Research & Advanced
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="transition-all duration-300">
                {activeTab === 'fundamentals' && (
                    <div className="animate-fade-in">
                        <InteractiveSignalLab />
                    </div>
                )}
                {activeTab === 'biomedical' && (
                    <div className="animate-fade-in">
                        <BiomedicalLab />
                    </div>
                )}
                {activeTab === 'research' && (
                    <div className="animate-fade-in space-y-6">
                        <ConvolutionDemo />
                        <WaveletDemo />
                        {/* Placeholder for Sampling Theorem or other research topics */}
                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 text-center text-gray-500 italic">
                            More advanced research modules coming soon...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
