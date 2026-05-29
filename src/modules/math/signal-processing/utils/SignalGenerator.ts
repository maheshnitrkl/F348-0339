/* eslint-disable */

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';

export class SignalGenerator {
    static generate(
        type: WaveformType,
        frequency: number,
        sampleRate: number,
        duration: number,
        amplitude: number = 1,
        phase: number = 0,
        noiseLevel: number = 0
    ): number[] {
        const numSamples = Math.floor(sampleRate * duration);
        const signal: number[] = new Array(numSamples);
        const angularFreq = 2 * Math.PI * frequency;

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let value = 0;

            switch (type) {
                case 'sine':
                    value = Math.sin(angularFreq * t + phase);
                    break;
                case 'square':
                    value = Math.sign(Math.sin(angularFreq * t + phase));
                    break;
                case 'sawtooth':
                    // 2 * (t * f - floor(t*f + 0.5))
                    // Standard sawtooth: rising from -1 to 1
                    const wrap = (t * frequency + phase / (2 * Math.PI)) % 1;
                    value = 2 * (wrap - 0.5); // centered 0
                    // fix javascript modulo of negative numbers if phase is negative?
                    // actually simple mapping: (x % 1 + 1) % 1
                    break;
                case 'triangle':
                    // 2 * abs(2 * (t * f - floor(t*f + 0.5))) - 1
                    const triWrap = ((t * frequency + phase / (2 * Math.PI)) % 1 + 1) % 1;
                    value = 2 * Math.abs(2 * (triWrap - 0.5)) - 1;
                    break;
                case 'noise':
                    value = (Math.random() * 2 - 1);
                    break;
            }

            // Add pure noise if requested
            if (type !== 'noise' && noiseLevel > 0) {
                value += (Math.random() * 2 - 1) * noiseLevel;
            } else if (type === 'noise') {
                value *= amplitude; // Noise is the signal
            }

            // If not just noise, apply amplitude
            if (type !== 'noise') {
                signal[i] = value * amplitude;
            } else {
                signal[i] = value;
            }
        }

        return signal;
    }

    static generateECG(
        sampleRate: number,
        duration: number,
        heartRateBPM: number = 60,
        noiseLevel: number = 0
    ): number[] {
        const numSamples = Math.floor(sampleRate * duration);
        const signal = new Array(numSamples).fill(0);

        // ECG Parameters (P, Q, R, S, T waves)
        // Approximate timing relative to R-peak (in seconds)
        const p_offset = -0.2;
        const q_offset = -0.05;
        const r_offset = 0;
        const s_offset = 0.05;
        const t_offset = 0.3;

        // Widths (sigma)
        const p_width = 0.04;
        const q_width = 0.02;
        const r_width = 0.02; // Sharp R
        const s_width = 0.02;
        const t_width = 0.08;

        // Amplitudes
        const p_amp = 0.15;
        const q_amp = -0.15;
        const r_amp = 1.0;
        const s_amp = -0.25;
        const t_amp = 0.35;

        const beatInterval = 60 / heartRateBPM;
        const numBeats = Math.ceil(duration / beatInterval) + 1;

        // Generate Gaussian pulse
        const gaussian = (x: number, mu: number, sigma: number, amp: number) => {
            return amp * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        };

        for (let b = 0; b < numBeats; b++) {
            const beatTime = b * beatInterval;

            // Add waves for this beat
            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                const dt = t - beatTime;

                // Only calculate if reasonably close to beat (opt)
                if (Math.abs(dt) > 0.5 * beatInterval) continue;

                signal[i] += gaussian(dt, p_offset, p_width, p_amp);
                signal[i] += gaussian(dt, q_offset, q_width, q_amp);
                signal[i] += gaussian(dt, r_offset, r_width, r_amp);
                signal[i] += gaussian(dt, s_offset, s_width, s_amp);
                signal[i] += gaussian(dt, t_offset, t_width, t_amp);
            }
        }

        // Add noise/baseline wander
        for (let i = 0; i < numSamples; i++) {
            if (noiseLevel > 0) {
                signal[i] += (Math.random() * 2 - 1) * noiseLevel;
            }
            // Baseline wander (low freq sine)
            signal[i] += 0.05 * Math.sin(2 * Math.PI * 0.5 * (i / sampleRate));
        }

        return signal;
    }

    static generateEEG(
        sampleRate: number,
        duration: number,
        state: 'relaxed' | 'active' | 'drowsy' | 'deep_sleep'
    ): number[] {
        // Superposition of brain wave bands
        // Delta (0.5-4Hz), Theta (4-8Hz), Alpha (8-13Hz), Beta (13-30Hz), Gamma (>30Hz)

        let weights = { delta: 1, theta: 1, alpha: 1, beta: 1, gamma: 1 };

        switch (state) {
            case 'deep_sleep': // Dominant Delta
                weights = { delta: 8, theta: 2, alpha: 0.5, beta: 0.1, gamma: 0 };
                break;
            case 'drowsy': // Dominant Theta
                weights = { delta: 3, theta: 6, alpha: 2, beta: 0.5, gamma: 0.1 };
                break;
            case 'relaxed': // Dominant Alpha (eyes closed)
                weights = { delta: 1, theta: 2, alpha: 8, beta: 1, gamma: 0.5 };
                break;
            case 'active': // Dominant Beta/Gamma (thinking)
                weights = { delta: 0.5, theta: 1, alpha: 2, beta: 6, gamma: 2 };
                break;
        }

        const numSamples = Math.floor(sampleRate * duration);
        const signal = new Array(numSamples).fill(0);

        // Helper to add band noise (pink noise filtered-ish)
        // Simply summing sines for demo
        const addBand = (minF: number, maxF: number, weight: number) => {
            const numComponents = 10;
            for (let n = 0; n < numComponents; n++) {
                const f = minF + Math.random() * (maxF - minF);
                const phase = Math.random() * 2 * Math.PI;
                // 1/f amplitude scaling mostly
                const amp = weight * (1 / (f + 1));

                for (let i = 0; i < numSamples; i++) {
                    const t = i / sampleRate;
                    signal[i] += amp * Math.sin(2 * Math.PI * f * t + phase);
                }
            }
        };

        addBand(0.5, 4, weights.delta);
        addBand(4, 8, weights.theta);
        addBand(8, 13, weights.alpha);
        addBand(13, 30, weights.beta);
        addBand(30, 50, weights.gamma);

        // Normalize roughly
        const maxVal = Math.max(...signal.map(Math.abs)) || 1;
        return signal.map(s => s / maxVal);
    }

    static mix(signals: number[][]): number[] {
        if (signals.length === 0) return [];
        const length = signals[0].length;
        const result = new Array(length).fill(0);

        for (let i = 0; i < length; i++) {
            for (const sig of signals) {
                if (sig[i] !== undefined) {
                    result[i] += sig[i];
                }
            }
        }
        return result;
    }
}
