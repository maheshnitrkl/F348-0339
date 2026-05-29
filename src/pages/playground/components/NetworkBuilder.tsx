import React, { useMemo } from 'react';
import type { NeuralNet } from '../PlaygroundEngine';
import { NeuronHeatmap } from './NeuronHeatmap';

interface NetworkBuilderProps {
    hiddenLayers: number[];
    onLayersChange: (layers: number[]) => void;
    network: NeuralNet | null;
}

export const NetworkBuilder: React.FC<NetworkBuilderProps> = ({ hiddenLayers, onLayersChange, network }) => {
    
    const addLayer = () => {
        if (hiddenLayers.length < 6) onLayersChange([...hiddenLayers, 4]);
    };
    const removeLayer = (index: number) => {
        const newLayers = [...hiddenLayers];
        newLayers.splice(index, 1);
        onLayersChange(newLayers);
    };
    const updateNeurons = (index: number, delta: number) => {
        const newLayers = [...hiddenLayers];
        const val = newLayers[index] + delta;
        if (val >= 1 && val <= 8) {
            newLayers[index] = val;
            onLayersChange(newLayers);
        }
    };

    // Calculate node positions for SVG lines
    const W = 800; // virtual width
    const H = 350; // virtual height
    const PAD_X = 60;

    const layerSizes = useMemo(() => [2, ...hiddenLayers, 1], [hiddenLayers]); // Input, Hidden, Output
    
    const nodePositions = useMemo(() => {
        const pos: {x: number, y: number}[][] = [];
        const numLayers = layerSizes.length;
        const spacingX = (W - 2 * PAD_X) / Math.max(1, numLayers - 1);

        layerSizes.forEach((size, lIdx) => {
            const layerPos: {x: number, y: number}[] = [];
            const x = PAD_X + lIdx * spacingX;
            const spacingY = Math.min(45, H / (size + 1));
            const startY = H / 2 - ((size - 1) * spacingY) / 2;
            
            for (let nIdx = 0; nIdx < size; nIdx++) {
                layerPos.push({ x, y: startY + nIdx * spacingY });
            }
            pos.push(layerPos);
        });
        return pos;
    }, [layerSizes]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Controls Overlay */}
            <div className="absolute top-2 left-0 right-0 flex justify-center gap-12 px-16 pointer-events-none z-20">
                {hiddenLayers.map((numNeurons, idx) => (
                    <div key={idx} className="flex flex-col items-center pointer-events-auto bg-slate-950/80 rounded-lg px-2 py-1 border border-slate-800/50 backdrop-blur-sm" style={{ transform: `translateX(${(idx - (hiddenLayers.length-1)/2) * ( (W - 2*PAD_X)/Math.max(1, layerSizes.length-1) )}px)` }}>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateNeurons(idx, -1)} disabled={numNeurons <= 1} className="text-slate-500 hover:text-white">-</button>
                            <span className="text-xs font-mono text-cyan-400">{numNeurons}</span>
                            <button onClick={() => updateNeurons(idx, 1)} disabled={numNeurons >= 8} className="text-slate-500 hover:text-white">+</button>
                        </div>
                        <button onClick={() => removeLayer(idx)} className="text-[10px] text-rose-500 hover:text-rose-400 uppercase tracking-widest mt-1">Remove</button>
                    </div>
                ))}
            </div>

            {/* SVG Background for Lines */}
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[400px]">
                {/* Draw Weights (Lines) */}
                {network && network.weights.map((wLayer, l) => {
                    return wLayer.map((wNeuron, n) => {
                        return wNeuron.map((weightValue, prevN) => {
                            const from = nodePositions[l][prevN];
                            const to = nodePositions[l + 1][n];
                            
                            // Line thickness based on weight magnitude
                            const thickness = Math.min(8, Math.max(0.5, Math.abs(weightValue) * 1.5));
                            // Color based on sign
                            const color = weightValue > 0 ? '#3b82f6' : '#fb923c';
                            // Opacity based on magnitude
                            const opacity = Math.min(0.8, Math.max(0.1, Math.abs(weightValue)));

                            return (
                                <line 
                                    key={`w-${l}-${n}-${prevN}`}
                                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                    stroke={color}
                                    strokeWidth={thickness}
                                    strokeOpacity={opacity}
                                    style={{ transition: 'stroke-width 0.2s, stroke-opacity 0.2s, stroke 0.2s' }}
                                />
                            );
                        });
                    });
                })}
                
                {/* Default Lines if no network */}
                {!network && nodePositions.map((layer, l) => {
                    if (l === nodePositions.length - 1) return null;
                    const nextLayer = nodePositions[l + 1];
                    return layer.map((from, prevN) => (
                        nextLayer.map((to, n) => (
                            <line 
                                key={`def-${l}-${prevN}-${n}`}
                                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                stroke="#1e293b"
                                strokeWidth="1"
                            />
                        ))
                    ));
                })}

                {/* Draw Nodes */}
                {nodePositions.map((layer, l) => (
                    layer.map((pos, n) => {
                        const isInput = l === 0;
                        const isOutput = l === nodePositions.length - 1;
                        const isHidden = !isInput && !isOutput;

                        return (
                            <g key={`node-${l}-${n}`}>
                                <circle 
                                    cx={pos.x} cy={pos.y} 
                                    r={16} 
                                    fill="#0f172a" 
                                    stroke={isInput ? "#64748b" : isOutput ? "#f97316" : "#06b6d4"} 
                                    strokeWidth={2} 
                                />
                                {isInput && (
                                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">X{n+1}</text>
                                )}
                                {isOutput && (
                                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#fdba74" fontSize="10" fontFamily="monospace">Y</text>
                                )}
                                
                                {/* Embed Heatmap for hidden layers */}
                                {isHidden && (
                                    <foreignObject x={pos.x - 12} y={pos.y - 12} width={24} height={24}>
                                        <div className="w-full h-full rounded-full overflow-hidden border border-cyan-500/30">
                                            <NeuronHeatmap network={network} layerIndex={l - 1} neuronIndex={n} />
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        );
                    })
                ))}
            </svg>
            
            {hiddenLayers.length < 6 && (
                <div className="mt-4">
                    <button onClick={addLayer} className="px-4 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 text-xs font-bold transition-colors">
                        + ADD LAYER
                    </button>
                </div>
            )}
        </div>
    );
};
