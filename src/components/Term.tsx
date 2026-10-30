import React, { useState } from 'react';
import { lookupTerm } from '../data/glossary';

interface TermProps {
    /** The glossary term to look up (case-insensitive). Rendered text by default. */
    word: string;
    /** Optional child content to render instead of the term string itself. */
    children?: React.ReactNode;
}

/**
 * Inline glossary tooltip. Renders the term with a dotted underline; hovering
 * (or tapping on touch devices) shows its definition. Falls back to plain text
 * when the word is not in the glossary, so it is safe to sprinkle anywhere.
 */
export const Term: React.FC<TermProps> = ({ word, children }) => {
    const entry = lookupTerm(word);
    const [open, setOpen] = useState(false);

    if (!entry) {
        return <span>{children ?? word}</span>;
    }

    return (
        <span className="relative inline-block group">
            <button
                type="button"
                aria-label={`What is ${entry.term}?`}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onClick={() => setOpen(o => !o)}
                className="text-inherit font-medium underline decoration-dotted decoration-[var(--color-electric-cyan)] decoration-2 underline-offset-4 cursor-help"
            >
                {children ?? entry.term}
            </button>
            {open && (
                <span
                    className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-lg bg-slate-950 border border-white/15 shadow-2xl text-xs font-sans font-normal text-slate-300 leading-relaxed normal-case whitespace-normal text-left"
                >
                    <span className="block font-bold text-[var(--color-electric-cyan)] mb-1">{entry.term}</span>
                    {entry.definition}
                </span>
            )}
        </span>
    );
};
