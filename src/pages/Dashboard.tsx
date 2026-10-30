import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Brain, Calculator, Code, Zap, RotateCcw } from 'lucide-react';
import { roadmapData, lessonPathFor, tracks } from '../data/roadmapData';
import { useProgress } from '../hooks/progressContext';

export function Dashboard() {
    const navigate = useNavigate();
    const { statusOf, stats, reset } = useProgress();

    // Derived from the learner's own progress, not the seeded roadmap labels
    const totalNodes = stats.total;
    const completedNodes = stats.completed;
    const progressPct = stats.pct;
    const inProgressNodes = roadmapData.filter(n => statusOf(n) === 'in-progress');
    const unlockedNodes = roadmapData.filter(n => statusOf(n) === 'unlocked');

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                    Welcome to NeuralNexus
                </h1>
                <p className="text-gray-400">Your journey into AI & Machine Learning.</p>
            </header>

            {/* Hero Stats — derived from actual roadmap data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: Brain, label: "Modules Completed", value: `${completedNodes}`, color: "text-emerald-400" },
                    { icon: Calculator, label: "In Progress", value: `${inProgressNodes.length}`, color: "text-amber-400" },
                    { icon: Code, label: "Ready to Start", value: `${unlockedNodes.length}`, color: "text-[var(--color-electric-cyan)]" },
                    { icon: Zap, label: "Overall Progress", value: `${progressPct}%`, color: "text-[var(--color-soft-violet)]" },
                ].map((stat, idx) => (
                    <GlassCard key={idx} hoverEffect className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Overall Progress Bar */}
            <GlassCard className="p-6">
                <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span className="font-semibold text-white">Learning Progress</span>
                    <span className="flex items-center gap-3">
                        {completedNodes} of {totalNodes} modules
                        <button
                            onClick={reset}
                            title="Reset all saved progress"
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            <RotateCcw size={12} /> Reset
                        </button>
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 mb-3">
                    <div
                        className="bg-gradient-to-r from-[var(--color-electric-cyan)] to-[var(--color-soft-violet)] h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex gap-6 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> {completedNodes} Completed
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> {inProgressNodes.length} Active
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" /> {unlockedNodes.length} Ready
                    </span>
                </div>
            </GlassCard>

            {/* Per-Track Progress Breakdown */}
            <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-white text-sm">Progress by Track</span>
                    <button
                        onClick={() => navigate('/roadmap')}
                        className="text-xs text-[var(--color-electric-cyan)] hover:underline"
                    >
                        open roadmap
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tracks.map((track) => {
                        const nodes = roadmapData.filter(n => n.track === track.id);
                        const done = nodes.filter(n => statusOf(n) === 'completed').length;
                        const active = nodes.filter(n => ['in-progress', 'unlocked'].includes(statusOf(n))).length;
                        const pct = nodes.length > 0 ? Math.round((done / nodes.length) * 100) : 0;
                        // Categorical color per roadmap track (matches SkillNode badges)
                        const color =
                            track.category === 'foundation' ? 'from-cyan-400' :
                            track.category === 'math' ? 'from-violet-400' :
                            track.category === 'advanced' ? 'from-amber-400' : 'from-rose-400';
                        return (
                            <button
                                key={track.id}
                                onClick={() => navigate('/roadmap')}
                                className="text-left bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                        <span>{track.icon}</span> {track.label}
                                    </span>
                                    <span className="font-mono text-xs text-gray-500">{done}/{nodes.length}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full bg-gradient-to-r ${color} to-white/30 transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    {pct}% complete · {active > 0 ? `${active} open` : `${nodes.length - done} remaining`}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Continue Learning Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">Continue Learning</h2>
                {inProgressNodes.length === 0 && unlockedNodes.length === 0 && (
                    <GlassCard className="p-6 text-gray-400">
                        Nothing is open right now. Finish a prerequisite on the{' '}
                        <button onClick={() => navigate('/roadmap')} className="text-[var(--color-electric-cyan)] hover:underline">
                            roadmap
                        </button>{' '}
                        to unlock the next module.
                    </GlassCard>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Show in-progress modules dynamically */}
                    {inProgressNodes
                        .map(node => (
                            <GlassCard
                                key={node.id}
                                hoverEffect
                                className="p-0 group cursor-pointer"
                                onClick={() => navigate(lessonPathFor(node))}
                            >
                                <div className="h-32 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-electric-cyan)]/10 to-[var(--color-soft-violet)]/10" />
                                    <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/30 backdrop-blur-md">
                                            In Progress
                                        </span>
                                        <h3 className="text-xl font-bold text-white mt-2">{node.label}</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-400 text-sm mb-4">
                                        {node.description}
                                    </p>
                                    <button className="text-sm text-[var(--color-electric-cyan)] font-medium hover:text-white transition-colors">
                                        Continue Learning →
                                    </button>
                                </div>
                            </GlassCard>
                        ))}

                    {/* Show next unlocked modules */}
                    {unlockedNodes
                        .slice(0, Math.max(0, 2 - inProgressNodes.length))
                        .map(node => (
                            <GlassCard
                                key={node.id}
                                hoverEffect
                                className="p-0 group cursor-pointer"
                                onClick={() => navigate(lessonPathFor(node))}
                            >
                                <div className="h-32 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
                                    <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30 backdrop-blur-md">
                                            Ready
                                        </span>
                                        <h3 className="text-xl font-bold text-white mt-2">{node.label}</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-400 text-sm mb-4">
                                        {node.description}
                                    </p>
                                    <button className="text-sm text-cyan-400 font-medium hover:text-white transition-colors">
                                        Start Module →
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                </div>
            </section>

            {/* Quick Links */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">Explore</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GlassCard hoverEffect className="p-5 cursor-pointer" onClick={() => navigate('/roadmap')}>
                        <Brain className="text-[var(--color-electric-cyan)] mb-3" size={28} />
                        <h3 className="font-bold text-white mb-1">Learning Roadmap</h3>
                        <p className="text-xs text-gray-500">Visualize your entire learning path</p>
                    </GlassCard>
                    <GlassCard hoverEffect className="p-5 cursor-pointer" onClick={() => navigate('/modules')}>
                        <Code className="text-[var(--color-soft-violet)] mb-3" size={28} />
                        <h3 className="font-bold text-white mb-1">All Modules</h3>
                        <p className="text-xs text-gray-500">Browse all {totalNodes} learning modules</p>
                    </GlassCard>
                    <GlassCard hoverEffect className="p-5 cursor-pointer" onClick={() => navigate('/playground')}>
                        <Zap className="text-yellow-400 mb-3" size={28} />
                        <h3 className="font-bold text-white mb-1">Neural Playground</h3>
                        <p className="text-xs text-gray-500">Build and train networks in real-time</p>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
}
