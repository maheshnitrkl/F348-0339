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
    try {
        const html = katex.renderToString(formula, {
            displayMode: block,
            throwOnError: false,
            output: 'html',
        });

        return (
            <span
                className={`katex-container ${block ? 'block my-4 text-center' : 'inline-block'} ${className}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    } catch (error) {
        console.error("KaTeX rendering error:", error);
        return <span className="text-red-400 font-mono text-sm">{formula}</span>;
    }
};
