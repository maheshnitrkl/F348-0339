
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'none';

export class SimpleFilter {
    private x1: number = 0;
    private x2: number = 0;
    private y1: number = 0;
    private y2: number = 0;

    // Coefficients
    private b0: number = 1;
    private b1: number = 0;
    private b2: number = 0;
    private a1: number = 0;
    private a2: number = 0;

    constructor() {
        this.reset();
    }

    reset() {
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
    }

    /**
     * Updates coefficients for a standard Biquad Filter
     * Reference: Robert Bristow-Johnson's Audio EQ Cookbook
     */
    updateCoefficients(type: FilterType, cutoffFreq: number, sampleRate: number, q: number = 0.707) {
        if (type === 'none') {
            this.b0 = 1; this.b1 = 0; this.b2 = 0;
            this.a1 = 0; this.a2 = 0;
            return;
        }

        const omega = 2 * Math.PI * cutoffFreq / sampleRate;
        const alpha = Math.sin(omega) / (2 * q);
        const cosW = Math.cos(omega);

        let a0 = 1;

        switch (type) {
            case 'lowpass':
                this.b0 = (1 - cosW) / 2;
                this.b1 = 1 - cosW;
                this.b2 = (1 - cosW) / 2;
                a0 = 1 + alpha;
                this.a1 = -2 * cosW;
                this.a2 = 1 - alpha;
                break;
            case 'highpass':
                this.b0 = (1 + cosW) / 2;
                this.b1 = -(1 + cosW);
                this.b2 = (1 + cosW) / 2;
                a0 = 1 + alpha;
                this.a1 = -2 * cosW;
                this.a2 = 1 - alpha;
                break;
            case 'bandpass':
                this.b0 = alpha;
                this.b1 = 0;
                this.b2 = -alpha;
                a0 = 1 + alpha;
                this.a1 = -2 * cosW;
                this.a2 = 1 - alpha;
                break;
        }

        // Normalize by a0
        this.b0 /= a0;
        this.b1 /= a0;
        this.b2 /= a0;
        this.a1 /= a0;
        this.a2 /= a0;
    }

    process(input: number): number {
        // Direct Form I difference equation
        // y[n] = b0*x[n] + b1*x[n-1] + b2*x[n-2] - a1*y[n-1] - a2*y[n-2]

        const output = this.b0 * input + this.b1 * this.x1 + this.b2 * this.x2
            - this.a1 * this.y1 - this.a2 * this.y2;

        // Shift history
        this.x2 = this.x1;
        this.x1 = input;
        this.y2 = this.y1;
        this.y1 = output;

        return output;
    }

    processArray(inputSignal: number[]): number[] {
        // We often reset for visualization purposes to show steady state, 
        // or keep state if simulating a stream. For this viz, let's reset to avoid artifacts jumping around.
        this.reset();

        return inputSignal.map(sample => this.process(sample));
    }
}
