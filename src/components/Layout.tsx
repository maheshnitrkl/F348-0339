import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BookOpen, GitGraph, Activity, LayoutDashboard, Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: "Dashboard" },
        { to: '/roadmap', icon: Brain, label: "Neural Roadmap" },
        { to: '/modules', icon: BookOpen, label: "Modules" },
        { to: '/playground', icon: GitGraph, label: "Playground" },
    ];

    return (
        <div className="flex h-screen w-full bg-[#121212] text-white overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                className="h-full border-r border-white/10 bg-[#121212]/50 backdrop-blur-lg z-20 flex flex-col shrink-0"
            >
                <div className="p-6 flex items-center justify-between">
                    <motion.div
                        className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
                        animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    >
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-[var(--color-electric-cyan)] to-[var(--color-soft-violet)]">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            NeuralNexus
                        </span>
                    </motion.div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-4 w-full p-3 rounded-lg transition-all duration-300 group ${
                                    isActive
                                        ? 'bg-white/10 border border-white/5 text-[var(--color-electric-cyan)]'
                                        : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]' : ''}`} />
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="font-medium"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="w-6 h-6 shrink-0" />
                        {sidebarOpen && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Collapse</motion.span>
                        )}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-electric-cyan)] rounded-full blur-[120px] opacity-10 pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-soft-violet)] rounded-full blur-[120px] opacity-10 pointer-events-none" />

                <div className="h-full w-full relative z-10 scrollbar-hide overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
