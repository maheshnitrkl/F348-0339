/* eslint-disable */

import React, { useState, useRef } from 'react';
import { Play, Square, Loader } from 'lucide-react';

interface AudioSampleProps {
    label: string;
    type: 'robotic' | 'natural';
    description?: string;
}

export const AudioComparison: React.FC<{ samples: AudioSampleProps[] }> = ({ samples }) => {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);

    const playSound = (index: number, type: 'robotic' | 'natural') => {
        // Stop current if any
        stopSound();

        setPlayingIndex(index);

        // Init Audio Context
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'robotic') {
            // Sawtooth wave, constant pitch, harsh envelope
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.5); // robot sweep

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 2); // 2 sec duration
            osc.start(now);
            osc.stop(now + 2);
        } else {
            // Natural: Sine wave, vibrato, smooth envelope
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);

            // Vibrato LFO
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 5; // 5Hz vibrato
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 10; // Vibrato depth
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 2);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
            gain.gain.linearRampToValueAtTime(0, now + 2);
            osc.start(now);
            osc.stop(now + 2);
        }

        oscillatorRef.current = osc;

        // Reset state after play
        setTimeout(() => {
            setPlayingIndex(null);
        }, 2000);
    };

    const stopSound = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
            } catch (e) {
                // ignore
            }
            oscillatorRef.current = null;
        }
        setPlayingIndex(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            {samples.map((sample, i) => (
                <div
                    key={i}
                    className={`p-6 rounded-xl border transition-all ${playingIndex === i
                            ? 'bg-cyan-900/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                            : 'bg-black/40 border-white/10 hover:bg-white/5'
                        }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${sample.type === 'robotic' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                {sample.type === 'robotic' ? 'Traditional' : 'Neural'}
                            </span>
                            <h4 className="font-bold text-white mt-2">{sample.label}</h4>
                        </div>
                        <button
                            onClick={() => playingIndex === i ? stopSound() : playSound(i, sample.type)}
                            className={`p-3 rounded-full transition-all ${playingIndex === i
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {playingIndex === i ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        </button>
                    </div>
                    {sample.description && (
                        <p className="text-sm text-gray-400">{sample.description}</p>
                    )}

                    {/* Visualizer Bar (Simulated) */}
                    <div className="mt-4 flex items-end gap-1 h-8">
                        {Array.from({ length: 20 }).map((_, barI) => (
                            <div
                                key={barI}
                                className={`w-full rounded-t-sm transition-all duration-100 ${playingIndex === i ? 'bg-cyan-500' : 'bg-white/10'
                                    }`}
                                style={{
                                    height: playingIndex === i ? `${Math.random() * 100}%` : '20%'
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
