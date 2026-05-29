import React, { useRef, useEffect } from 'react';
import type { NeuralNet } from '../PlaygroundEngine';

interface NeuronHeatmapProps {
    network: NeuralNet | null;
    layerIndex: number;
    neuronIndex: number;
    resolution?: number; // small resolution for tiny heatmaps, e.g. 15
}

export const NeuronHeatmap: React.FC<NeuronHeatmapProps> = ({ network, layerIndex, neuronIndex, resolution = 12 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        if (!network) {
            ctx.clearRect(0, 0, w, h);
            return;
        }

        const stepX = w / resolution;
        const stepY = h / resolution;

        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const cx = i * stepX + stepX / 2;
                const cy = j * stepY + stepY / 2;

                const x = (cx / w) * 2.4 - 1.2;
                const y = -((cy / h) * 2.4 - 1.2);

                const { activations } = network.forward([x, y]);
                
                // +1 because activations[0] is input layer
                const act = activations[layerIndex + 1][neuronIndex];

                // Normalize for visualization:
                // Activation ranges: relu(0..inf), tanh(-1..1), sigmoid(0..1)
                // Let's normalize around 0.
                let normalized = act;
                if (network.config.activation === 'relu') {
                    normalized = Math.min(act / 2, 1); // cap at 2 for viz
                } else if (network.config.activation === 'tanh') {
                    normalized = (act + 1) / 2;
                }

                // Color map: 0 = orange, 1 = blue
                const r = Math.round(251 * (1 - normalized) + 59 * normalized);
                const g = Math.round(146 * (1 - normalized) + 130 * normalized);
                const b = Math.round(60 * (1 - normalized) + 246 * normalized);

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(Math.floor(i * stepX), Math.floor(j * stepY), Math.ceil(stepX), Math.ceil(stepY));
            }
        }
    }, [network, layerIndex, neuronIndex, resolution, network?.t]);

    return (
        <canvas 
            ref={canvasRef} 
            width={resolution} 
            height={resolution} 
            className="w-full h-full object-cover rounded-sm opacity-80"
        />
    );
};
