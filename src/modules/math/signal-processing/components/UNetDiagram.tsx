
import React from 'react';
import { motion } from 'framer-motion';

export const UNetDiagram: React.FC = () => {
    // Configuration for blocks
    const blocks = [
        { id: 'enc1', x: 50, y: 50, h: 160, color: '#3b82f6', label: 'Input' },
        { id: 'enc2', x: 150, y: 80, h: 100, color: '#3b82f6', label: 'Enc 1' },
        { id: 'enc3', x: 250, y: 110, h: 40, color: '#3b82f6', label: 'Enc 2' },
        { id: 'latent', x: 350, y: 110, h: 40, color: '#8b5cf6', label: 'Latent' },
        { id: 'dec2', x: 450, y: 110, h: 40, color: '#f97316', label: 'Dec 1' },
        { id: 'dec1', x: 550, y: 80, h: 100, color: '#f97316', label: 'Dec 2' },
        { id: 'out', x: 650, y: 50, h: 160, color: '#f97316', label: 'Output' },
    ];

    const arrows = [
        { from: 'enc1', to: 'enc2', type: 'down' },
        { from: 'enc2', to: 'enc3', type: 'down' },
        { from: 'enc3', to: 'latent', type: 'right' },
        { from: 'latent', to: 'dec2', type: 'right' },
        { from: 'dec2', to: 'dec1', type: 'up' },
        { from: 'dec1', to: 'out', type: 'up' },
    ];

    const skips = [
        { from: 'enc1', to: 'out' },
        { from: 'enc2', to: 'dec1' },
        { from: 'enc3', to: 'dec2' },
    ];

    return (
        <div className="w-full h-80 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center p-8 overflow-hidden relative group">
            <svg width="700" height="250" viewBox="0 0 750 250" className="w-full h-full">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                    <marker id="arrow-skip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
                    </marker>
                </defs>

                {/* Skip Connections (Behind) */}
                {skips.map((skip, i) => {
                    const fromBlock = blocks.find(b => b.id === skip.from)!;
                    const toBlock = blocks.find(b => b.id === skip.to)!;
                    return (
                        <motion.path
                            key={`skip-${i}`}
                            d={`M ${fromBlock.x + 40} ${fromBlock.y + fromBlock.h / 2} L ${toBlock.x} ${toBlock.y + toBlock.h / 2}`}
                            stroke="#9ca3af"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            markerEnd="url(#arrow-skip)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.5 }}
                            transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
                        />
                    );
                })}

                {/* Main Path Arrows */}
                {arrows.map((arrow, i) => {
                    const fromBlock = blocks.find(b => b.id === arrow.from)!;
                    const toBlock = blocks.find(b => b.id === arrow.to)!;

                    let d = '';
                    if (arrow.type === 'down') {
                        d = `M ${fromBlock.x + 20} ${fromBlock.y + fromBlock.h} L ${toBlock.x + 20} ${toBlock.y}`; // Simple line from bottom to top... wait, layout is horizontal
                        // Left to Right flow actually
                        d = `M ${fromBlock.x + 40} ${fromBlock.y + fromBlock.h / 2} L ${toBlock.x} ${toBlock.y + toBlock.h / 2}`;
                    } else {
                        d = `M ${fromBlock.x + 40} ${fromBlock.y + fromBlock.h / 2} L ${toBlock.x} ${toBlock.y + toBlock.h / 2}`;
                    }

                    return (
                        <motion.path
                            key={`arrow-${i}`}
                            d={d}
                            stroke="#64748b"
                            strokeWidth="2"
                            markerEnd="url(#arrow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                        />
                    );
                })}

                {/* Blocks */}
                {blocks.map((block, i) => (
                    <g key={block.id}>
                        <motion.rect
                            x={block.x}
                            y={block.y}
                            width="40"
                            height={block.h}
                            rx="4"
                            fill={block.color}
                            opacity="0.8"
                            stroke="white"
                            strokeWidth="1"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.8 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ scale: 1.05, opacity: 1 }}
                        />
                        <text
                            x={block.x + 20}
                            y={block.y + block.h + 20}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                            className="font-mono"
                        >
                            {block.label}
                        </text>
                    </g>
                ))}
            </svg>

            <div className="absolute top-4 right-4 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
                Skip Connections (Dashed) preserve high-freq details
            </div>
        </div>
    );
};
