import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Book, Maximize2 } from 'lucide-react';
import { getModule } from '../modules/registry';

export function LessonView() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [viewMode, setViewMode] = useState<'theory' | 'code' | 'visualization'>('theory');

    // Handle legacy ID and default
    const targetModuleId = moduleId === 'math-1' ? 'math-lin-alg' : (moduleId || 'math-lin-alg');
    const module = getModule(targetModuleId);

    if (!module) {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Module Not Found</h2>
                    <p className="text-gray-400">The requested learning module "{moduleId}" does not exist.</p>
                </div>
            </div>
        );
    }

    const { components } = module;
    const TheoryComponent = components.Theory;
    const CodeComponent = components.Code;
    const VisualizationComponent = components.Visualization;

    // Check if this is a self-contained module with its own navigation
    const isSelfContained = !VisualizationComponent && TheoryComponent;

    // layout: 'full' → module owns its own sidebar + internal scroll (e.g. Neural Networks, Statistical Learning)
    // layout: undefined/other → module renders a long scrollable content page (e.g. Backpropagation)
    if (isSelfContained) {
        const ownsLayout = module.layout === 'full';
        return (
            <div className={`h-[calc(100vh-100px)] ${ownsLayout ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
                <TheoryComponent />
            </div>
        );
    }

    // Traditional dual-pane layout turned into Unified Tabbed Layout
    // User requested "separate places", so we switch from side-by-side to full-screen tabs.

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            {/* Top Navigation Bar */}
            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl w-fit border border-white/10 mx-auto backdrop-blur-md z-10">
                <button
                    onClick={() => setViewMode('theory')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'theory' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Book size={18} /> Theory
                </button>

                {VisualizationComponent && (
                    <>
                        <div className="w-px h-6 bg-white/10" />
                        <button
                            onClick={() => setViewMode('visualization')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'visualization' ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Maximize2 size={18} /> Simulation
                        </button>
                    </>
                )}

                {CodeComponent && (
                    <>
                        <div className="w-px h-6 bg-white/10" />
                        <button
                            onClick={() => setViewMode('code')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'code' ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(167,139,250,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Code size={18} /> Implementation
                        </button>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode='wait'>
                    {viewMode === 'theory' && (
                        <motion.div
                            key="theory"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto px-8 w-full scrollbar-hide"
                        >
                            <h1 className="text-4xl font-bold mb-6 text-left bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{module.title}</h1>
                            <div className="prose prose-invert prose-lg max-w-none w-full pb-20">
                                <TheoryComponent onNavigate={(view: 'theory' | 'code' | 'visualization') => setViewMode(view)} />
                            </div>
                        </motion.div>
                    )}

                    {viewMode === 'visualization' && VisualizationComponent && (
                        <motion.div
                            key="visualization"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full w-full custom-scroll-container"
                        >
                            {/* Pass a prop if the component accepts height to fill container, or wrap it */}
                            <div className="h-full w-full overflow-y-auto p-4">
                                <VisualizationComponent />
                            </div>
                        </motion.div>
                    )}

                    {viewMode === 'code' && CodeComponent && (
                        <motion.div
                            key="code"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto max-w-5xl mx-auto"
                        >
                            <CodeComponent />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
