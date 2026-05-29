import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, MoreVertical, LogIn } from 'lucide-react';
import type { LayerNode } from './TransferLearningViz';

interface NodeGraphProps {
    nodes: LayerNode[];
    toggleNode: (id: string) => void;
}

export const NodeGraph: React.FC<NodeGraphProps> = ({ nodes, toggleNode }) => {
    return (
        <div className="flex flex-col items-center py-4 space-y-0 relative">
            {nodes.map((node, i) => {
                
                // Render Ellipsis Node
                if (node.isEllipsis) {
                    return (
                        <div key={node.id} className="flex flex-col items-center">
                            <div className="w-0.5 h-6 bg-slate-800" />
                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed text-slate-500">
                                <MoreVertical size={16} />
                                <span className="text-xs font-mono">{node.params}</span>
                                <MoreVertical size={16} />
                            </div>
                            <div className="text-[10px] font-mono text-cyan-500/50 mt-1">{node.shape}</div>
                            <div className="w-0.5 h-6 bg-slate-800" />
                        </div>
                    );
                }

                // Render Input Node
                if (node.id === 'input') {
                    return (
                        <div key={node.id} className="flex flex-col items-center">
                            <div className="w-full max-w-[280px] bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                        <LogIn size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-emerald-200">{node.op}</div>
                                        <div className="text-xs font-mono text-emerald-400/60">{node.params}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-400/80 mt-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                                {node.shape}
                            </div>
                            <div className="w-0.5 h-6 bg-slate-800" />
                        </div>
                    );
                }

                // Render Standard Operation Node
                return (
                    <div key={node.id} className="flex flex-col items-center">
                        <motion.button
                            layout
                            onClick={() => toggleNode(node.id)}
                            className={`w-full max-w-[280px] relative rounded-xl border flex flex-col items-start p-3 transition-all group overflow-hidden ${
                                node.frozen 
                                    ? 'bg-slate-900 border-slate-700 text-slate-400 shadow-lg' 
                                    : 'bg-violet-900/40 border-violet-500/50 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                            }`}
                        >
                            <div className="absolute top-3 right-3 text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                                {node.frozen ? <Lock size={14} className="text-slate-500" /> : <Unlock size={14} className="text-violet-400" />}
                            </div>

                            <div className="font-mono text-xs opacity-50 mb-1">{node.id}</div>
                            <div className="font-bold text-md leading-tight text-white mb-1 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${node.frozen ? 'bg-slate-600' : 'bg-violet-400'}`} />
                                {node.op}
                            </div>
                            <div className={`font-mono text-xs ${node.frozen ? 'text-slate-500' : 'text-violet-400/70'}`}>
                                {node.params}
                            </div>
                        </motion.button>
                        
                        <div className="text-[10px] font-mono text-cyan-400/80 mt-1 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                            {node.shape}
                        </div>

                        {/* Don't render arrow after the last node since TransferLearningViz handles the classification head arrow */}
                        {i < nodes.length - 1 && <div className="w-0.5 h-6 bg-slate-800 mt-1" />}
                    </div>
                );
            })}
        </div>
    );
};
