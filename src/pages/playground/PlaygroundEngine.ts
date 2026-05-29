export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'linear';

export interface NetworkConfig {
    inputSize: number;
    hiddenLayers: number[]; // e.g. [4, 4] for two layers of 4 neurons
    outputSize: number;
    activation: ActivationType;
    learningRate: number;
    regularizationType?: 'l1' | 'l2' | 'none';
    regularizationRate?: number;
}

export interface DataPoint {
    x: number[]; // usually [x1, x2]
    y: number;   // usually 0 or 1 for binary classification
}

export class NeuralNet {
    config: NetworkConfig;
    weights: number[][][]; // weights[layer][neuron][weight_from_prev_neuron]
    biases: number[][];    // biases[layer][neuron]

    // Adam Optimizer State
    mW: number[][][]; vW: number[][][];
    mB: number[][]; vB: number[][];
    t: number = 0;

    updateConfig(newConfig: Partial<NetworkConfig>) {
        this.config = { ...this.config, ...newConfig };
    }

    constructor(config: NetworkConfig) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        this.mW = []; this.vW = [];
        this.mB = []; this.vB = [];

        const layerSizes = [config.inputSize, ...config.hiddenLayers, config.outputSize];

        for (let l = 1; l < layerSizes.length; l++) {
            const numNeurons = layerSizes[l];
            const numInputs = layerSizes[l - 1];

            const wLayer: number[][] = [];
            const bLayer: number[] = [];
            const mwL: number[][] = [];
            const vwL: number[][] = [];
            const mbL: number[] = [];
            const vbL: number[] = [];

            // Xavier initialization
            const limit = Math.sqrt(6 / (numInputs + numNeurons));

            for (let n = 0; n < numNeurons; n++) {
                const wNeuron: number[] = [];
                const mwN: number[] = [];
                const vwN: number[] = [];
                for (let i = 0; i < numInputs; i++) {
                    wNeuron.push((Math.random() * 2 - 1) * limit);
                    mwN.push(0);
                    vwN.push(0);
                }
                wLayer.push(wNeuron);
                bLayer.push(0.0);
                
                mwL.push(mwN);
                vwL.push(vwN);
                mbL.push(0);
                vbL.push(0);
            }

            this.weights.push(wLayer);
            this.biases.push(bLayer);
            this.mW.push(mwL); this.vW.push(vwL);
            this.mB.push(mbL); this.vB.push(vbL);
        }
    }

    activate(z: number, type: ActivationType): number {
        switch (type) {
            case 'relu': return Math.max(0, z);
            case 'sigmoid': return 1 / (1 + Math.exp(-z));
            case 'tanh': return Math.tanh(z);
            case 'linear': return z;
        }
    }

    activateDeriv(a: number, type: ActivationType): number {
        // 'a' is the already-activated value!
        switch (type) {
            case 'relu': return a > 0 ? 1 : 0;
            case 'sigmoid': return a * (1 - a);
            case 'tanh': return 1 - a * a;
            case 'linear': return 1;
        }
    }

    forward(input: number[]): { activations: number[][], preActivations: number[][] } {
        const activations = [input];
        const preActivations = [input]; // dummy for input layer

        let currentA = input;

        for (let l = 0; l < this.weights.length; l++) {
            const wLayer = this.weights[l];
            const bLayer = this.biases[l];
            const nextA: number[] = [];
            const nextZ: number[] = [];

            // Output layer uses sigmoid for binary classification
            const actType = (l === this.weights.length - 1) ? 'sigmoid' : this.config.activation;

            for (let n = 0; n < wLayer.length; n++) {
                let z = bLayer[n];
                for (let i = 0; i < currentA.length; i++) {
                    z += currentA[i] * wLayer[n][i];
                }
                nextZ.push(z);
                nextA.push(this.activate(z, actType));
            }

            activations.push(nextA);
            preActivations.push(nextZ);
            currentA = nextA;
        }

        return { activations, preActivations };
    }

    trainBatch(batch: DataPoint[]) {
        const dW: number[][][] = this.weights.map(l => l.map(n => n.map(() => 0)));
        const dB: number[][] = this.biases.map(l => l.map(() => 0));
        let totalLoss = 0;

        for (const point of batch) {
            const { activations } = this.forward(point.x);
            const output = activations[activations.length - 1][0];
            const target = point.y;

            // Binary cross entropy loss
            totalLoss += - (target * Math.log(output + 1e-15) + (1 - target) * Math.log(1 - output + 1e-15));

            // Backprop
            const deltas: number[][] = activations.map(() => []);
            
            // Output layer delta (assuming sigmoid + BCE = output - target)
            deltas[deltas.length - 1] = [output - target];

            for (let l = this.weights.length - 1; l >= 0; l--) {
                const actPrev = activations[l];
                const deltaCurrent = deltas[l + 1];

                // Calculate gradients
                for (let n = 0; n < this.weights[l].length; n++) {
                    dB[l][n] += deltaCurrent[n];
                    for (let i = 0; i < this.weights[l][n].length; i++) {
                        dW[l][n][i] += deltaCurrent[n] * actPrev[i];
                    }
                }

                // Calculate deltas for previous layer (if not input layer)
                if (l > 0) {
                    const deltaPrev: number[] = [];
                    for (let i = 0; i < actPrev.length; i++) {
                        let error = 0;
                        for (let n = 0; n < this.weights[l].length; n++) {
                            error += deltaCurrent[n] * this.weights[l][n][i];
                        }
                        // Multiply by activation derivative
                        const dAct = this.activateDeriv(actPrev[i], this.config.activation);
                        deltaPrev.push(error * dAct);
                    }
                    deltas[l] = deltaPrev;
                }
            }
        }

        // Apply Adam Optimizer
        this.t++;
        const beta1 = 0.9;
        const beta2 = 0.999;
        const eps = 1e-8;
        const lr = this.config.learningRate;

        for (let l = 0; l < this.weights.length; l++) {
            for (let n = 0; n < this.weights[l].length; n++) {
                // Bias Adam
                const gradB = dB[l][n] / batch.length;
                this.mB[l][n] = beta1 * this.mB[l][n] + (1 - beta1) * gradB;
                this.vB[l][n] = beta2 * this.vB[l][n] + (1 - beta2) * gradB * gradB;
                const mHatB = this.mB[l][n] / (1 - Math.pow(beta1, this.t));
                const vHatB = this.vB[l][n] / (1 - Math.pow(beta2, this.t));
                this.biases[l][n] -= lr * mHatB / (Math.sqrt(vHatB) + eps);

                // Weight Adam
                for (let i = 0; i < this.weights[l][n].length; i++) {
                    let gradW = dW[l][n][i] / batch.length;
                    
                    // Add Regularization gradient
                    const regType = this.config.regularizationType || 'none';
                    const regRate = this.config.regularizationRate || 0;
                    if (regType === 'l1') {
                        gradW += regRate * Math.sign(this.weights[l][n][i]);
                    } else if (regType === 'l2') {
                        gradW += regRate * this.weights[l][n][i];
                    }

                    this.mW[l][n][i] = beta1 * this.mW[l][n][i] + (1 - beta1) * gradW;
                    this.vW[l][n][i] = beta2 * this.vW[l][n][i] + (1 - beta2) * gradW * gradW;
                    const mHatW = this.mW[l][n][i] / (1 - Math.pow(beta1, this.t));
                    const vHatW = this.vW[l][n][i] / (1 - Math.pow(beta2, this.t));
                    this.weights[l][n][i] -= lr * mHatW / (Math.sqrt(vHatW) + eps);
                }
            }
        }

        return totalLoss / batch.length;
    }
}
