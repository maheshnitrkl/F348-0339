import React from 'react';
import { 
    Sparkles, 
    AlertTriangle, 
    Terminal, 
    CheckCircle, 
    Activity, 
    HelpCircle 
} from 'lucide-react';

export const SectionTitle: React.FC<{ 
    children: React.ReactNode; 
    icon?: React.ReactNode; 
    color?: string; 
}> = ({ children, icon, color = '#6366f1' }) => (
    <div className="flex items-center gap-3 mb-6">
        {icon && (
            <div 
                className="p-2 rounded-xl" 
                style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}
            >
                {icon}
            </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-white">{children}</h2>
    </div>
);

export const Card: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
}> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 ${className}`}>
        {children}
    </div>
);

export type CalloutVariant = 'insight' | 'pitfall' | 'research' | 'engineering' | 'empirical' | 'intuition';

export const Callout: React.FC<{
    variant: CalloutVariant;
    title: string;
    children: React.ReactNode;
}> = ({ variant, title, children }) => {
    const config = {
        insight: { color: '#8b5cf6', icon: Sparkles, bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
        pitfall: { color: '#ef4444', icon: AlertTriangle, bg: 'bg-red-500/5', border: 'border-red-500/20' },
        research: { color: '#38bdf8', icon: Terminal, bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
        engineering: { color: '#10b981', icon: CheckCircle, bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        empirical: { color: '#fb923c', icon: Activity, bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
        intuition: { color: '#eab308', icon: HelpCircle, bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
    }[variant];

    const Icon = config.icon;

    return (
        <div className={`flex gap-3 p-5 rounded-xl border ${config.bg} ${config.border}`}>
            <Icon size={18} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
            <div>
                <span className="text-sm font-bold block mb-1" style={{ color: config.color }}>{title}</span>
                <span className="text-sm text-slate-300 leading-relaxed block font-sans">{children}</span>
            </div>
        </div>
    );
};
