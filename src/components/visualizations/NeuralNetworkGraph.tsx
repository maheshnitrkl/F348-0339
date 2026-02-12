import { useState } from 'react';
import { motion } from 'framer-motion';

export function NeuralNetworkGraph() {
    const [activeNeuron, setActiveNeuron] = useState<string | null>(null);

    // Network structure: Layers of neurons
    const layers = [3, 4, 4, 2]; // Input, Hidden 1, Hidden 2, Output

    // Generate neuron positions
    const neurons = layers.flatMap((count, layerIdx) =>
        Array.from({ length: count }).map((_, neuronIdx) => ({
            id: `l${layerIdx}-n${neuronIdx}`,
            layer: layerIdx,
            index: neuronIdx,
            x: 100 + layerIdx * 150,
            y: (600 - (count - 1) * 80) / 2 + neuronIdx * 80,
            value: Math.random().toFixed(2)
        }))
    );

    // Generate connections
    const connections = neurons.flatMap(neuron => {
        if (neuron.layer === layers.length - 1) return [];
        const nextLayerNeurons = neurons.filter(n => n.layer === neuron.layer + 1);
        return nextLayerNeurons.map(target => ({
            start: neuron,
            end: target,
            weight: Math.random() * 2 - 1
        }));
    });

    return (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-black/40 relative overflow-hidden rounded-xl">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((conn, idx) => (
                    <motion.path
                        key={`${conn.start.id}-${conn.end.id}`}
                        d={`M ${conn.start.x} ${conn.start.y} C ${conn.start.x + 50} ${conn.start.y}, ${conn.end.x - 50} ${conn.end.y}, ${conn.end.x} ${conn.end.y}`}
                        stroke={activeNeuron === conn.start.id || activeNeuron === conn.end.id ? "var(--color-electric-cyan)" : "rgba(255,255,255,0.1)"}
                        strokeWidth={activeNeuron === conn.start.id || activeNeuron === conn.end.id ? 2 : 1}
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: idx * 0.01 }}
                    />
                ))}
            </svg>

            {neurons.map(neuron => (
                <motion.div
                    key={neuron.id}
                    className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer z-10 transition-colors duration-300
                ${activeNeuron === neuron.id
                            ? 'bg-[var(--color-electric-cyan)] border-white shadow-[0_0_15px_var(--color-electric-cyan)]'
                            : 'bg-black border-white/20 hover:border-[var(--color-electric-cyan)]'
                        }`}
                    style={{ left: neuron.x, top: neuron.y, marginLeft: -24, marginTop: -24 }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setActiveNeuron(neuron.id === activeNeuron ? null : neuron.id)}
                >
                    <div className="text-[10px] font-mono text-white pointer-events-none">
                        {activeNeuron === neuron.id ? neuron.value : ""}
                    </div>
                </motion.div>
            ))}

            <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">
                Interactive Forward Pass Visualization
            </div>
        </div>
    );
}
