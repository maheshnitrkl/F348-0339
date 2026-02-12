import React from 'react';
import { motion } from 'framer-motion';
import { roadmapData, tracks, type SkillNode as SkillNodeType } from '../data/roadmapData';
import { SkillNode } from '../components/SkillNode';
import { ChevronRight } from 'lucide-react';

interface RoadmapProps {
    onNavigate: (view: string, moduleId?: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    foundation: '#64748b',
    math: '#3b82f6',
    advanced: '#8b5cf6',
    application: '#06b6d4',
};

export function Roadmap({ onNavigate }: RoadmapProps) {
    // Group nodes by track
    const nodesByTrack = React.useMemo(() => {
        const grouped: Record<string, SkillNodeType[]> = {};
        for (const track of tracks) {
            grouped[track.id] = roadmapData
                .filter(n => n.track === track.id)
                .sort((a, b) => a.order - b.order);
        }
        return grouped;
    }, []);

    // Progress stats
    const totalNodes = roadmapData.length;
    const completedNodes = roadmapData.filter(n => n.status === 'completed').length;
    const inProgressNodes = roadmapData.filter(n => n.status === 'in-progress').length;
    const progressPct = Math.round((completedNodes / totalNodes) * 100);

    const handleNodeClick = (node: SkillNodeType) => {
        onNavigate('lesson', node.id);
    };

    return (
        <div className="relative w-full min-h-screen overflow-y-auto bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">

            {/* Subtle background pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

                {/* Hero Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-mono tracking-widest uppercase mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Your Learning Path
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                        Learning Architecture
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto mb-8">
                        A structured journey from philosophical foundations through deep mathematical theory to cutting-edge applications.
                    </p>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>{completedNodes} of {totalNodes} modules completed</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                            />
                        </div>
                        <div className="flex justify-center gap-6 mt-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {completedNodes} Done
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> {inProgressNodes} Active
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-gray-600" /> {totalNodes - completedNodes - inProgressNodes} Remaining
                            </span>
                        </div>
                    </div>
                </motion.header>

                {/* Tracks */}
                <div className="space-y-16">
                    {tracks.map((track, trackIdx) => {
                        const nodes = nodesByTrack[track.id] || [];
                        const trackColor = CATEGORY_COLORS[track.category] || '#fff';

                        return (
                            <motion.section
                                key={track.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: trackIdx * 0.15 }}
                            >
                                {/* Track Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                        style={{ backgroundColor: `${trackColor}15`, border: `1px solid ${trackColor}30` }}
                                    >
                                        {track.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-white">{track.label}</h2>
                                            <div className="h-px flex-1 max-w-xs" style={{ background: `linear-gradient(to right, ${trackColor}30, transparent)` }} />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{track.description}</p>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono">
                                        {nodes.filter(n => n.status === 'completed').length}/{nodes.length}
                                    </span>
                                </div>

                                {/* Track Nodes — horizontal scrollable row */}
                                <div className="flex items-stretch gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                    {nodes.map((node, nodeIdx) => (
                                        <React.Fragment key={node.id}>
                                            <SkillNode
                                                node={node}
                                                onClick={handleNodeClick}
                                                index={trackIdx * 4 + nodeIdx}
                                            />
                                            {/* Connector arrow between nodes */}
                                            {nodeIdx < nodes.length - 1 && (
                                                <div className="flex items-center px-1 shrink-0">
                                                    <ChevronRight size={16} className="text-gray-700" />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Cross-track connections hint */}
                                {nodes.some(n => n.connections.some(c => !nodes.find(nn => nn.id === c))) && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {nodes.flatMap(n =>
                                            n.connections
                                                .filter(c => !nodes.find(nn => nn.id === c))
                                                .map(c => {
                                                    const target = roadmapData.find(r => r.id === c);
                                                    if (!target) return null;
                                                    const targetTrack = tracks.find(t => t.id === target.track);
                                                    const targetColor = CATEGORY_COLORS[target.category] || '#fff';
                                                    return (
                                                        <span
                                                            key={`${n.id}-${c}`}
                                                            className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border font-mono"
                                                            style={{
                                                                borderColor: `${targetColor}30`,
                                                                color: `${targetColor}`,
                                                                backgroundColor: `${targetColor}08`,
                                                            }}
                                                        >
                                                            {n.label}
                                                            <span className="text-gray-600">&rarr;</span>
                                                            {targetTrack?.icon} {target.label}
                                                        </span>
                                                    );
                                                })
                                        )}
                                    </div>
                                )}
                            </motion.section>
                        );
                    })}
                </div>

                {/* Footer */}
                <footer className="text-center mt-20 pb-12">
                    <p className="text-xs text-gray-600">
                        {totalNodes} modules &middot; {tracks.length} tracks &middot; Keep learning
                    </p>
                </footer>
            </div>
        </div>
    );
}
