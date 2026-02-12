import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <motion.div
            className={twMerge(
                clsx(
                    "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl",
                    hoverEffect && "transition-colors duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-electric-cyan/20"
                ),
                className
            )}
            {...props}
        >
            {/* Glossy reflection effect */}
            <div className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

            {children}
        </motion.div>
    );
}
