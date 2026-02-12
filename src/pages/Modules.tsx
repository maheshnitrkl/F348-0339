import { GlassCard } from '../components/GlassCard';
import { getAllModules } from '../modules/registry';
import { Book } from 'lucide-react';

interface ModulesProps {
    onNavigate: (view: string, moduleId?: string) => void;
}

export function Modules({ onNavigate }: ModulesProps) {
    const modules = getAllModules();

    console.log(`📚 [Modules] Loaded ${modules.length} modules from registry`);

    // Group modules by category
    const groupedModules = modules.reduce((acc, module) => {
        // Determine category from module ID prefix
        let category: string;
        if (module.id.startsWith('foundation-')) category = 'Foundation';
        else if (module.id.startsWith('math-')) category = 'Mathematics';
        else if (module.id.startsWith('adv-')) category = 'Advanced';
        else if (module.id.startsWith('app-')) category = 'Applications';
        else category = 'Other';

        if (!acc[category]) acc[category] = [];
        acc[category].push(module);
        return acc;
    }, {} as Record<string, typeof modules>);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                    Learning Modules
                </h1>
                <p className="text-gray-400">
                    Explore all available modules in your learning journey.
                </p>
            </header>

            {Object.entries(groupedModules).map(([category, categoryModules]) => (
                <section key={category}>
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                        <Book size={24} className="text-[var(--color-electric-cyan)]" />
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryModules.map((module) => (
                            <GlassCard
                                key={module.id}
                                hoverEffect
                                className="p-6 cursor-pointer group"
                                onClick={() => onNavigate('lesson', module.id)}
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-lg bg-white/5 text-[var(--color-electric-cyan)]">
                                        <Book size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--color-electric-cyan)] transition-colors">
                                            {module.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {module.id}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    {module.description}
                                </p>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <button className="text-sm text-[var(--color-electric-cyan)] font-medium hover:text-white transition-colors">
                                        Start Learning →
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>
            ))}

            {modules.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">No modules found in registry.</p>
                </div>
            )}
        </div>
    );
}
