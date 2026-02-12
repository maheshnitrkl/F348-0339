import { GlassCard } from '../components/GlassCard';
import { Brain, Calculator, Code, Zap } from 'lucide-react';

interface DashboardProps {
    onNavigate: (view: string, moduleId?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                    Welcome back, User
                </h1>
                <p className="text-gray-400">Continue your journey into the Neural Nexus.</p>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: Brain, label: "Concepts Mastered", value: "12", color: "text-[var(--color-electric-cyan)]" },
                    { icon: Calculator, label: "Math Proficiency", value: "85%", color: "text-[var(--color-soft-violet)]" },
                    { icon: Code, label: "Lines of Code", value: "1,240", color: "text-emerald-400" },
                    { icon: Zap, label: "Current Streak", value: "5 Days", color: "text-yellow-400" },
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

            {/* Continue Learning Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-white">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard hoverEffect className="p-0 group cursor-pointer" onClick={() => onNavigate('lesson', 'math-lin-alg')}>
                        <div className="h-40 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                                <span className="px-2 py-1 bg-[var(--color-electric-cyan)]/20 text-[var(--color-electric-cyan)] text-xs rounded border border-[var(--color-electric-cyan)]/30 backdrop-blur-md">
                                    In Progress
                                </span>
                                <h3 className="text-xl font-bold text-white mt-2">Calculus & Probability</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-400 text-sm mb-4">
                                Master gradients, optimization, and understanding uncertainty in machine learning.
                            </p>
                            <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                                <div className="bg-[var(--color-electric-cyan)] h-1.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>65% Complete</span>
                                <span>25 mins left</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard hoverEffect className="p-0 group cursor-pointer" onClick={() => onNavigate('lesson', 'foundation-1')}>
                        <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30 backdrop-blur-md">
                                    New Module
                                </span>
                                <h3 className="text-xl font-bold text-white mt-2">Philosophy of AI</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-400 text-sm mb-4">
                                Explore the fundamental questions of intelligence, the Turing Test, and machine consciousness.
                            </p>
                            <button
                                className="text-sm text-yellow-400 font-medium hover:text-white transition-colors"
                            >
                                Start Module &rarr;
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </section>
        </div>
    );
}
