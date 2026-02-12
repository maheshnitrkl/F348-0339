
export class DFT {
    /**
     * Computes the Discrete Fourier Transform (Magnitude)
     * Real-valued input, returns magnitude spectrum.
     * Naive O(N^2) implementation - sufficient for small visualization buffers.
     */
    static computeMagnitude(signal: number[]): number[] {
        const N = signal.length;
        const spectrum = new Array(Math.floor(N / 2)).fill(0);


        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;
            const angular = (2 * Math.PI * k) / N;

            for (let n = 0; n < N; n++) {
                const angle = angular * n;
                real += signal[n] * Math.cos(angle);
                imag -= signal[n] * Math.sin(angle);
            }

            // Magnitude = sqrt(real^2 + imag^2)
            // Normalize by N/2
            spectrum[k] = Math.sqrt(real * real + imag * imag) / (N / 2);
        }

        return spectrum;
    }

    /**
     * Generates frequency labels for the bins
     */
    static getFrequencyBins(sampleRate: number, bufferSize: number): number[] {
        const numBins = Math.floor(bufferSize / 2);
        const bins = new Array(numBins);
        const resolution = sampleRate / bufferSize;

        for (let i = 0; i < numBins; i++) {
            bins[i] = i * resolution;
        }
        return bins;
    }
}
