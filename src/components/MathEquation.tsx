import React from 'react';
import katex from 'katex';

interface MathEquationProps {
    formula: string;
    block?: boolean;
    className?: string;
}

export const MathEquation: React.FC<MathEquationProps> = ({
    formula,
    block = false,
    className = ''
}) => {
    let html: string | null = null;
    let hasError = false;

    try {
        html = katex.renderToString(formula, {
            displayMode: block,
            throwOnError: false,
            output: 'html',
        });
    } catch (error) {
        console.error("KaTeX rendering error:", error);
        hasError = true;
    }

    if (hasError || html === null) {
        return <span className="text-red-400 font-mono text-sm">{formula}</span>;
    }

    return (
        <span
            className={`katex-container ${block ? 'block my-4 text-center' : 'inline-block'} ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
