import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Brain, Calculator, Code, Zap } from 'lucide-react';
import { roadmapData } from '../data/roadmapData';

export function Dashboard() {
    const navigate = useNavigate();

    // Derive real stats from roadmap data
    const totalNodes = roadmapData.length;
    const completedNodes = roadmapData.filter(n => n.status === 'completed').length;
    const inProgressNodes = roadmapData.filter(n => n.status === 'in-progress').length;
    const unlockedNodes = roadmapData.filter(n => n.status === 'unlocked').length;
    const progressPct = Math.round((completedNodes / totalNodes) * 100);

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
                    { icon: Calculator, label: "In Progress", value: `${inProgressNodes}`, color: "text-amber-400" },
                    { icon: Code, label: "Ready to Start", value: `${unlockedNodes}`, color: "text-[var(--color-electric-cyan)]" },
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
                    <span>{completedNodes} of {totalNodes} modules</span>
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
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> {inProgressNodes} Active
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" /> {unlockedNodes} Ready
                    </span>
                </div>
            </GlassCard>

            {/* Continue Learning Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Show in-progress modules dynamically */}
                    {roadmapData
                        .filter(n => n.status === 'in-progress')
                        .map(node => (
                            <GlassCard
                                key={node.id}
                                hoverEffect
                                className="p-0 group cursor-pointer"
                                onClick={() => navigate(`/lesson/${node.id}`)}
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
                    {roadmapData
                        .filter(n => n.status === 'unlocked')
                        .slice(0, 2 - roadmapData.filter(n => n.status === 'in-progress').length)
                        .map(node => (
                            <GlassCard
                                key={node.id}
                                hoverEffect
                                className="p-0 group cursor-pointer"
                                onClick={() => navigate(`/lesson/${node.id}`)}
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
