
export type WindowFunctionType = 'rectangular' | 'hamming' | 'hanning' | 'blackman' | 'bartlett';

export class WindowFunctions {
    static apply(signal: number[], type: WindowFunctionType): number[] {
        const N = signal.length;
        const windowedSignal = new Array(N);

        for (let n = 0; n < N; n++) {
            let w = 1.0;
            switch (type) {
                case 'rectangular':
                    w = 1.0;
                    break;
                case 'hamming':
                    // 0.54 - 0.46 * cos(2*pi*n / (N-1))
                    w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
                    break;
                case 'hanning':
                    // 0.5 * (1 - cos(2*pi*n / (N-1)))
                    w = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
                    break;
                case 'blackman':
                    // 0.42 - 0.5*cos(2*pi*n/(N-1)) + 0.08*cos(4*pi*n/(N-1))
                    w = 0.42 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1)) + 0.08 * Math.cos((4 * Math.PI * n) / (N - 1));
                    break;
                case 'bartlett':
                    // 1 - | (n - (N-1)/2) / ((N-1)/2) |
                    w = 1 - Math.abs((n - (N - 1) / 2) / ((N - 1) / 2));
                    break;
            }
            windowedSignal[n] = signal[n] * w;
        }

        return windowedSignal;
    }

    static getWindowWeights(size: number, type: WindowFunctionType): number[] {
        // Just return the weights for visualization if needed
        const weights = new Array(size);
        for (let n = 0; n < size; n++) {
            let w = 1.0;
            switch (type) {
                case 'rectangular': w = 1.0; break;
                case 'hamming': w = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (size - 1)); break;
                case 'hanning': w = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (size - 1))); break;
                case 'blackman': w = 0.42 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1)) + 0.08 * Math.cos((4 * Math.PI * n) / (size - 1)); break;
                case 'bartlett': w = 1 - Math.abs((n - (size - 1) / 2) / ((size - 1) / 2)); break;
            }
            weights[n] = w;
        }
        return weights;
    }
}
