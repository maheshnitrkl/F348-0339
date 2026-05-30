import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllModules } from '../modules/registry';
import { roadmapData } from '../data/roadmapData';
import {
    Search, BookOpen, Sigma, Cpu, Rocket,
    Check, Loader, Lock, Unlock, ArrowRight,
    Sparkles, GraduationCap
} from 'lucide-react';

// Category visual configuration
const CATEGORY_CONFIG: Record<string, {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    gradient: string;
    accentColor: string;
    glowColor: string;
    bgGradient: string;
    borderColor: string;
    emoji: string;
}> = {
    Foundation: {
        label: 'Foundation',
        icon: BookOpen,
        gradient: 'from-slate-500 to-slate-700',
        accentColor: 'text-slate-300',
        glowColor: 'rgba(100,116,139,0.4)',
        bgGradient: 'from-slate-500/10 to-slate-700/5',
        borderColor: 'border-slate-500/30',
        emoji: '🧠',
    },
    Mathematics: {
        label: 'Mathematics',
        icon: Sigma,
        gradient: 'from-blue-500 to-indigo-600',
        accentColor: 'text-blue-400',
        glowColor: 'rgba(59,130,246,0.4)',
        bgGradient: 'from-blue-500/10 to-indigo-600/5',
        borderColor: 'border-blue-500/30',
        emoji: '∑',
    },
    Advanced: {
        label: 'Advanced',
        icon: Cpu,
        gradient: 'from-violet-500 to-purple-600',
        accentColor: 'text-violet-400',
        glowColor: 'rgba(139,92,246,0.4)',
        bgGradient: 'from-violet-500/10 to-purple-600/5',
        borderColor: 'border-violet-500/30',
        emoji: '⚡',
    },
    Applications: {
        label: 'Applications',
        icon: Rocket,
        gradient: 'from-cyan-500 to-teal-600',
        accentColor: 'text-cyan-400',
        glowColor: 'rgba(6,182,212,0.4)',
        bgGradient: 'from-cyan-500/10 to-teal-600/5',
        borderColor: 'border-cyan-500/30',
        emoji: '🚀',
    },
    Other: {
        label: 'Other',
        icon: Sparkles,
        gradient: 'from-amber-500 to-orange-600',
        accentColor: 'text-amber-400',
        glowColor: 'rgba(245,158,11,0.4)',
        bgGradient: 'from-amber-500/10 to-orange-600/5',
        borderColor: 'border-amber-500/30',
        emoji: '✨',
    },
};

const STATUS_CONFIG = {
    completed: {
        icon: Check,
        label: 'Completed',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500',
    },
    'in-progress': {
        icon: Loader,
        label: 'In Progress',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-500 animate-pulse',
    },
    unlocked: {
        icon: Unlock,
        label: 'Ready',
        badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        dotClass: 'bg-cyan-500',
    },
    locked: {
        icon: Lock,
        label: 'Locked',
        badgeClass: 'bg-gray-700/40 text-gray-500 border-gray-600/30',
        dotClass: 'bg-gray-600',
    },
};

// Categorize module by ID prefix
function getCategory(id: string): string {
    if (id.startsWith('foundation-')) return 'Foundation';
    if (id.startsWith('math-') || id.startsWith('med-')) return 'Mathematics';
    if (id.startsWith('adv-')) return 'Advanced';
    if (id.startsWith('app-')) return 'Applications';
    return 'Other';
}

// Get roadmap status for a module
function getStatus(moduleId: string) {
    const node = roadmapData.find(n => n.id === moduleId);
    return node?.status || 'unlocked';
}

export function Modules() {
    const navigate = useNavigate();
    const modules = getAllModules();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Filtered & grouped
    const { grouped, filteredCount } = useMemo(() => {
        const filtered = modules.filter(m => {
            const matchesSearch = searchQuery === '' ||
                m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !activeFilter || getCategory(m.id) === activeFilter;
            return matchesSearch && matchesFilter;
        });

        const grouped: Record<string, typeof modules> = {};
        for (const m of filtered) {
            const cat = getCategory(m.id);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(m);
        }
        return { grouped, filteredCount: filtered.length };
    }, [modules, searchQuery, activeFilter]);

    // Stats
    const totalModules = modules.length;
    const completedCount = modules.filter(m => getStatus(m.id) === 'completed').length;
    const inProgressCount = modules.filter(m => getStatus(m.id) === 'in-progress').length;

    // Ordered categories
    const categoryOrder = ['Foundation', 'Mathematics', 'Advanced', 'Applications', 'Other'];

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Header */}
            <motion.header
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-mono tracking-widest uppercase">
                        <GraduationCap size={14} />
                        Module Catalog
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
                    Learning Modules
                </h1>
                <p className="text-gray-500 max-w-2xl text-lg">
                    Explore {totalModules} interactive modules across {categoryOrder.filter(c => modules.some(m => getCategory(m.id) === c)).length} tracks.
                    <span className="text-emerald-400 font-medium"> {completedCount} completed</span>,
                    <span className="text-amber-400 font-medium"> {inProgressCount} in progress</span>.
                </p>
            </motion.header>

            {/* Search & Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4"
            >
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[var(--color-electric-cyan)]/50 focus:bg-white/8 transition-all backdrop-blur-md"
                    />
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveFilter(null)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                            !activeFilter
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
                        }`}
                    >
                        All ({totalModules})
                    </button>
                    {categoryOrder.filter(c => modules.some(m => getCategory(m.id) === c)).map(cat => {
                        const config = CATEGORY_CONFIG[cat];
                        const count = modules.filter(m => getCategory(m.id) === cat).length;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${
                                    activeFilter === cat
                                        ? `bg-gradient-to-r ${config.gradient} border-transparent text-white shadow-lg`
                                        : `bg-transparent ${config.borderColor} ${config.accentColor} hover:bg-white/5`
                                }`}
                            >
                                <span>{config.emoji}</span>
                                {cat} ({count})
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Module Grid by Category */}
            {filteredCount === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <Search size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500 text-lg">No modules match your search.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setActiveFilter(null); }}
                        className="mt-4 text-sm text-[var(--color-electric-cyan)] hover:text-white transition-colors"
                    >
                        Clear filters
                    </button>
                </motion.div>
            ) : (
                categoryOrder.filter(cat => grouped[cat]?.length).map((category, catIdx) => {
                    const config = CATEGORY_CONFIG[category];
                    const CategoryIcon = config.icon;
                    const categoryModules = grouped[category];

                    return (
                        <motion.section
                            key={category}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: catIdx * 0.1 }}
                        >
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}
                                     style={{ boxShadow: `0 4px 20px ${config.glowColor}` }}>
                                    <CategoryIcon size={22} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-white">{category}</h2>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${config.borderColor} ${config.accentColor}`}>
                                            {categoryModules.length} module{categoryModules.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className={`h-px flex-1 max-w-xs bg-gradient-to-r ${config.bgGradient}`} />
                            </div>

                            {/* Module Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {categoryModules.map((module, idx) => {
                                    const status = getStatus(module.id);
                                    const statusCfg = STATUS_CONFIG[status];
                                    const StatusIcon = statusCfg.icon;
                                    const isLocked = status === 'locked';

                                    return (
                                        <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: catIdx * 0.1 + idx * 0.06, duration: 0.4 }}
                                            onClick={() => !isLocked && navigate(`/lesson/${module.id}`)}
                                            className={`group relative rounded-xl border overflow-hidden transition-all duration-300 ${
                                                isLocked
                                                    ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900/30'
                                                    : `cursor-pointer border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 hover:shadow-xl`
                                            }`}
                                            style={!isLocked ? { ['--glow' as string]: config.glowColor } : {}}
                                        >
                                            {/* Top gradient accent strip */}
                                            <div className={`h-1 w-full bg-gradient-to-r ${config.gradient} ${isLocked ? 'opacity-30' : 'opacity-70 group-hover:opacity-100'} transition-opacity`} />

                                            <div className="p-5">
                                                {/* Header row: status badge */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusCfg.badgeClass}`}>
                                                        <StatusIcon size={10} className={status === 'in-progress' ? 'animate-spin' : ''} />
                                                        {statusCfg.label}
                                                    </span>
                                                    {!isLocked && (
                                                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-white/10 transition-all">
                                                            <ArrowRight size={14} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h3 className={`text-lg font-bold mb-2 leading-tight transition-colors ${
                                                    isLocked ? 'text-gray-500' : `text-white group-hover:${config.accentColor}`
                                                }`}>
                                                    {module.title}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                                                    {module.description}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                    <span className="text-[10px] font-mono text-gray-600 tracking-wider">
                                                        {module.id}
                                                    </span>
                                                    {!isLocked && (
                                                        <span className={`text-xs font-semibold ${config.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                            {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'} →
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hover glow effect */}
                                            {!isLocked && (
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                                                    style={{ boxShadow: `inset 0 0 60px ${config.glowColor.replace('0.4', '0.06')}` }}
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    );
                })
            )}
        </div>
    );
}
