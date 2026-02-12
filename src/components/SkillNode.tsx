import { motion } from 'framer-motion';
import { Check, Lock, Loader } from 'lucide-react';
import type { SkillNode as SkillNodeType } from '../data/roadmapData';

interface SkillNodeProps {
    node: SkillNodeType;
    onClick: (node: SkillNodeType) => void;
    index: number;
}

const CATEGORY_STYLES = {
    foundation: {
        border: 'border-slate-500/40',
        glow: 'hover:shadow-[0_0_30px_rgba(100,116,139,0.3)]',
        accent: 'bg-slate-500',
        accentText: 'text-slate-400',
        iconBg: 'bg-slate-500/20',
    },
    math: {
        border: 'border-blue-500/40',
        glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
        accent: 'bg-blue-500',
        accentText: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
    },
    advanced: {
        border: 'border-violet-500/40',
        glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
        accent: 'bg-violet-500',
        accentText: 'text-violet-400',
        iconBg: 'bg-violet-500/20',
    },
    application: {
        border: 'border-cyan-500/40',
        glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
        accent: 'bg-cyan-500',
        accentText: 'text-cyan-400',
        iconBg: 'bg-cyan-500/20',
    },
};

const STATUS_CONFIG = {
    completed: {
        icon: Check,
        badge: 'Completed',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        cardExtra: 'opacity-90',
    },
    'in-progress': {
        icon: Loader,
        badge: 'In Progress',
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        cardExtra: 'ring-1 ring-amber-500/30',
    },
    unlocked: {
        icon: null,
        badge: 'Ready',
        badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        cardExtra: '',
    },
    locked: {
        icon: Lock,
        badge: 'Locked',
        badgeClass: 'bg-gray-700/50 text-gray-500 border-gray-600/30',
        cardExtra: 'opacity-50 grayscale-[30%]',
    },
};

export function SkillNode({ node, onClick, index }: SkillNodeProps) {
    const catStyle = CATEGORY_STYLES[node.category];
    const statusCfg = STATUS_CONFIG[node.status];
    const StatusIcon = statusCfg.icon;
    const isClickable = node.status !== 'locked';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            onClick={() => isClickable && onClick(node)}
            className={`
                group relative flex flex-col
                w-56 min-h-[140px] p-[1px] rounded-xl
                bg-gradient-to-br from-white/10 to-white/5
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${catStyle.glow}
                transition-all duration-300
                ${statusCfg.cardExtra}
            `}
        >
            {/* Inner card with glassmorphism */}
            <div className={`
                flex-1 flex flex-col rounded-xl p-4
                bg-gray-900/80 backdrop-blur-xl
                border ${catStyle.border}
                ${isClickable ? 'group-hover:bg-gray-800/80' : ''}
                transition-colors duration-300
            `}>
                {/* Top row: accent bar + status */}
                <div className="flex items-center justify-between mb-3">
                    <div className={`h-1 w-8 rounded-full ${catStyle.accent}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
                        {statusCfg.badge}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-sm mb-1.5 leading-tight ${isClickable ? 'text-white' : 'text-gray-400'}`}>
                    {StatusIcon && (
                        <StatusIcon
                            size={14}
                            className={`inline-block mr-1.5 -mt-0.5 ${node.status === 'in-progress' ? 'animate-spin' : ''} ${catStyle.accentText}`}
                        />
                    )}
                    {node.label}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 flex-1">
                    {node.description}
                </p>

                {/* Bottom: Enter hint */}
                {isClickable && (
                    <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${catStyle.accentText} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        Enter Module &rarr;
                    </div>
                )}
            </div>
        </motion.div>
    );
}
