import React, { useState, useEffect, useCallback } from 'react';

// --- Mini Autograd Engine ---

class Value {
    data: number;
    grad: number;
    _backward: () => void;
    prev: Set<Value>;
    op: string;
    label: string;

    constructor(data: number, _children: Value[] = [], _op: string = '', label: string = '') {
        this.data = data;
        this.grad = 0;
        this._backward = () => { };
        this.prev = new Set(_children);
        this.op = _op;
        this.label = label;
    }

    add(other: Value | number): Value {
        other = other instanceof Value ? other : new Value(other);
        const out = new Value(this.data + other.data, [this, other], '+');

        out._backward = () => {
            this.grad += 1.0 * out.grad;
            (other as Value).grad += 1.0 * out.grad;
        };
        return out;
    }

    mul(other: Value | number): Value {
        other = other instanceof Value ? other : new Value(other);
        const out = new Value(this.data * other.data, [this, other], '*');

        out._backward = () => {
            this.grad += (other as Value).data * out.grad;
            (other as Value).grad += this.data * out.grad;
        };
        return out;
    }

    relu(): Value {
        const out = new Value(this.data < 0 ? 0 : this.data, [this], 'ReLU');
        out._backward = () => {
            this.grad += (out.data > 0 ? 1 : 0) * out.grad;
        };
        return out;
    }

    backward() {
        // Topological sort
        const topo: Value[] = [];
        const visited = new Set<Value>();
        const buildTopo = (v: Value) => {
            if (!visited.has(v)) {
                visited.add(v);
                v.prev.forEach(child => buildTopo(child));
                topo.push(v);
            }
        };
        buildTopo(this);

        this.grad = 1.0;
        for (let i = topo.length - 1; i >= 0; i--) {
            topo[i]._backward();
        }
    }
}

// --- Component ---

export const AutogradDemo: React.FC = () => {
    const [outputs, setOutputs] = useState<{ label: string, data: number, grad: number }[]>([]);

    // Initial weights and inputs
    const [w1v, setW1] = useState(2.0);
    const [w2v, setW2] = useState(0.0);
    const [x1v, setX1] = useState(-1.0);
    const [x2v, setX2] = useState(3.0);
    const [b, setB] = useState(6.88);

    const runEngine = useCallback(() => {
        // Inputs
        const x1 = new Value(x1v, [], '', 'x1');
        const x2 = new Value(x2v, [], '', 'x2');

        // Weights
        const w1 = new Value(w1v, [], '', 'w1');
        const w2 = new Value(w2v, [], '', 'w2');

        // Bias
        const b_val = new Value(b, [], '', 'b');

        // x1*w1 + x2*w2 + b
        const x1w1 = x1.mul(w1); x1w1.label = 'x1*w1';
        const x2w2 = x2.mul(w2); x2w2.label = 'x2*w2';
        const x1w1x2w2 = x1w1.add(x2w2); x1w1x2w2.label = 'sum';
        const n = x1w1x2w2.add(b_val); n.label = 'n';

        // Activation
        const o = n.relu(); o.label = 'o';

        // Backward
        o.backward();

        // Collect results for visualization
        const allNodes = [x1, w1, x2, w2, b_val, x1w1, x2w2, x1w1x2w2, n, o];
        setOutputs(allNodes.map(node => ({
            label: node.label || node.op,
            data: node.data,
            grad: node.grad
        })));

    }, [w1v, w2v, x1v, x2v, b]);

    useEffect(() => {
        runEngine();
    }, [runEngine]);

    return (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 my-6">
            <h3 className="text-lg font-bold text-white mb-4">Mini-Autograd Engine</h3>
            <p className="text-sm text-gray-400 mb-6">
                A tiny implementation of a reverse-mode autodiff engine (like PyTorch) running live in your browser.
                Adjust the network paramters to see how gradients change.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Inputs & Weights</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Control label="x1 (Input)" value={x1v} onChange={setX1} color="text-blue-400" />
                            <Control label="w1 (Weight)" value={w1v} onChange={setW1} color="text-green-400" />
                            <Control label="x2 (Input)" value={x2v} onChange={setX2} color="text-blue-400" />
                            <Control label="w2 (Weight)" value={w2v} onChange={setW2} color="text-green-400" />
                            <Control label="bias" value={b} onChange={setB} color="text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Visualization of the value objects */}
                <div className="bg-black/80 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-[300px] border border-white/10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-500">
                                <th className="pb-2">Node</th>
                                <th className="pb-2">Value (Forward)</th>
                                <th className="pb-2">Grad (Backward)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outputs.map((node, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="py-2 text-gray-300">{node.label}</td>
                                    <td className="py-2 text-cyan-400">{node.data.toFixed(4)}</td>
                                    <td className="py-2 text-pink-400">{node.grad.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
                Formula: <code className="bg-black/30 px-1 rounded text-gray-300">o = ReLU(x1*w1 + x2*w2 + b)</code>
            </div>
        </div>
    );
};

const Control: React.FC<{ label: string, value: number, onChange: (n: number) => void, color: string }> = ({ label, value, onChange, color }) => (
    <div className="flex flex-col">
        <label className={`text-xs ${color} mb-1`}>{label}</label>
        <input
            type="number" step={0.1}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-cyan-500 outline-none"
        />
    </div>
);
