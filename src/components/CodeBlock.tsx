import React, { useState } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';

export type CodeLanguage = 'python' | 'typescript' | 'javascript' | 'text';

interface CodeBlockProps {
    code: string;
    language?: CodeLanguage;
    /** Optional filename shown in the header bar (e.g. "backprop.py"). */
    title?: string;
}

/** Byte ranges the renderer should leave untouched (copy uses the raw string). */
const KEYWORDS: Record<CodeLanguage, string[]> = {
    python: [
        'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
        'import', 'from', 'as', 'lambda', 'None', 'True', 'False', 'self', 'try', 'except', 'raise',
        'with', 'yield', 'pass', 'break', 'continue', 'global', 'assert', 'del', 'async', 'await',
    ],
    typescript: [
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'of', 'in', 'new',
        'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'interface',
        'type', 'enum', 'as', 'implements', 'private', 'public', 'readonly', 'static', 'null',
        'undefined', 'true', 'false', 'this', 'try', 'catch', 'finally', 'throw', 'switch', 'case',
    ],
    javascript: [],
    text: [],
};
KEYWORDS.typescript.forEach((k) => { if (!KEYWORDS.javascript.includes(k)) KEYWORDS.javascript.push(k); });

const PYTHON_BUILTINS = ['range', 'len', 'print', 'list', 'dict', 'set', 'tuple', 'enumerate', 'zip', 'float', 'int', 'max', 'min', 'sum', 'abs'];

interface Token {
    text: string;
    className: string;
}

/**
 * Tiny single-pass tokenizer producing [leading, match, rest] groups.
 * Kept intentionally simple — syntax highlighting was missing entirely and this
 * avoids adding a prism/shiki dependency to the bundle.
 */
function tokenizeLine(line: string, language: CodeLanguage): Token[] {
    // Single-pass tokenizer: comment / decorator / string / number / word / ops.
    const commentPrefix = language === 'python' ? /^(\s*#)/ : /^(\s*\/\/)/;
    const tokens: Token[] = [];

    let rest = line;
    while (rest.length > 0) {
        let consumed = 0;

        const comment = commentPrefix.exec(rest);
        const stringMatch = /^(("""[\s\S]*?"""|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))/.exec(rest);
        const numberMatch = /^(\b\d[\d_.]*(?:e[+-]?\d+)?)/i.exec(rest);
        const wordMatch = /^(\b[A-Za-z_][A-Za-z0-9_]*\b)/.exec(rest);
        const decoratorMatch = language === 'python' ? /^(@[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)*)/.exec(rest) : null;

        if (comment) {
            tokens.push({ text: rest, className: 'text-slate-500 italic' });
            break;
        } else if (decoratorMatch) {
            tokens.push({ text: decoratorMatch[0], className: 'text-yellow-400' });
            consumed = decoratorMatch[0].length;
        } else if (stringMatch) {
            tokens.push({ text: stringMatch[0], className: 'text-emerald-400' });
            consumed = stringMatch[0].length;
        } else if (numberMatch) {
            tokens.push({ text: numberMatch[0], className: 'text-orange-400' });
            consumed = numberMatch[0].length;
        } else if (wordMatch) {
            const word = wordMatch[1];
            let className: string;
            if (KEYWORDS[language].includes(word)) className = 'text-violet-400 font-semibold';
            else if (language === 'python' && PYTHON_BUILTINS.includes(word)) className = 'text-cyan-400';
            else if (/^[A-Z]/.test(word)) className = 'text-blue-300';
            else className = '';
            tokens.push({ text: word, className: className });
            consumed = wordMatch[0].length;
        } else {
            // Punctuation / operators / whitespace: single char.
            const opMatch = /^([+\-*/%<>=!&|^~?:;,.()[\]{}#\s]+)/.exec(rest);
            if (opMatch) {
                tokens.push({ text: opMatch[0], className: 'text-slate-400' });
                consumed = opMatch[0].length;
            } else {
                tokens.push({ text: rest[0], className: '' });
                consumed = 1;
            }
        }
        rest = rest.slice(consumed);
    }
    return tokens;  // items are single tokens, list is line-order
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'python', title }) => {
    const [copied, setCopied] = useState(false);
    const lines = code.replace(/\t/g, '    ').split('\n');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard unavailable (e.g. insecure context) — no-op.
        }
    };

    return (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden my-6">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <FileCode2 size={14} />
                    {title ?? language.toUpperCase()}
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
                >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-6 font-mono">
                <code>
                    {lines.map((line, i) => {
                        const tokens = tokenizeLine(line, language);
                        return (
                            <div key={i} className="flex">
                                <span className="select-none w-8 shrink-0 text-right pr-3 text-slate-700">{i + 1}</span>
                                <span className="whitespace-pre">
                                    {tokens.length === 0 ? ' '
                                        : tokens.map((token, j) => (
                                            <span key={j} className={token.className}>{token.text}</span>
                                        ))}
                                </span>
                            </div>
                        );
                    })}
                </code>
            </pre>
        </div>
    );
};
