import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface LoanApplicant {
    id: number;
    name: string;
    income: number;
    zipCode: string;
    education: number;
    approved?: boolean;
}

const initialDataset: LoanApplicant[] = [
    { id: 1, name: 'Alice', income: 80000, zipCode: '10001', education: 16 },
    { id: 2, name: 'Bob', income: 45000, zipCode: '90210', education: 14 },
    { id: 3, name: 'Carol', income: 95000, zipCode: '10001', education: 18 },
    { id: 4, name: 'David', income: 35000, zipCode: '60607', education: 12 },
    { id: 5, name: 'Eve', income: 72000, zipCode: '90210', education: 16 },
    { id: 6, name: 'Frank', income: 28000, zipCode: '60607', education: 12 },
];

// Simple decision tree: approve if income > 50k OR (education >= 16 AND zipCode is "good")
const goodZipCodes = ['10001', '90210'];

function trainDecisionTree(): (applicant: LoanApplicant) => boolean {
    return (applicant: LoanApplicant) => {
        if (applicant.income > 50000) return true;
        if (applicant.education >= 16 && goodZipCodes.includes(applicant.zipCode)) return true;
        return false;
    };
}

export const EthicsPlayground: React.FC = () => {
    const [dataset, setDataset] = useState<LoanApplicant[]>(initialDataset);
    const [trained, setTrained] = useState(false);

    const handleTrain = () => {
        const newModel = trainDecisionTree();
        const updatedDataset = dataset.map(applicant => ({
            ...applicant,
            approved: newModel(applicant)
        }));
        setDataset(updatedDataset);
        setTrained(true);
    };

    const updateApplicant = (id: number, field: keyof LoanApplicant, value: string | number) => {
        setDataset(prev => prev.map(app =>
            app.id === id ? { ...app, [field]: value, approved: undefined } : app
        ));
        setTrained(false);
    };

    // Calculate bias metrics
    const getMetrics = () => {
        const byZipCode = dataset.reduce((acc, app) => {
            if (!acc[app.zipCode]) acc[app.zipCode] = { total: 0, approved: 0 };
            acc[app.zipCode].total++;
            if (app.approved) acc[app.zipCode].approved++;
            return acc;
        }, {} as Record<string, { total: number; approved: number }>);

        return Object.entries(byZipCode).map(([zip, stats]) => ({
            zipCode: zip,
            approvalRate: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
            count: stats.total
        }));
    };

    const metrics = trained ? getMetrics() : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">⚖️ Ethics Playground: Bias Visualization</h2>
                <p className="text-gray-400">
                    Train a simple loan approval model and discover how algorithmic bias emerges from data.
                </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-red-200 text-sm font-semibold mb-1">Real-World Impact</p>
                    <p className="text-gray-300 text-xs">
                        This simplified model demonstrates how AI systems can perpetuate systemic discrimination.
                        Real lending algorithms have denied loans to qualified applicants based on zip code—
                        a proxy for race and socioeconomic status.
                    </p>
                </div>
            </div>

            {/* Dataset Editor */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Loan Applicant Dataset</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-2 px-3 text-gray-400 font-medium">Name</th>
                                <th className="text-left py-2 px-3 text-gray-400 font-medium">Income</th>
                                <th className="text-left py-2 px-3 text-gray-400 font-medium">Zip Code</th>
                                <th className="text-left py-2 px-3 text-gray-400 font-medium">Education (years)</th>
                                {trained && <th className="text-left py-2 px-3 text-gray-400 font-medium">Decision</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {dataset.map(applicant => (
                                <tr key={applicant.id} className="border-b border-white/5">
                                    <td className="py-2 px-3 text-white">{applicant.name}</td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            value={applicant.income}
                                            onChange={(e) => updateApplicant(applicant.id, 'income', parseInt(e.target.value))}
                                            className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="text"
                                            value={applicant.zipCode}
                                            onChange={(e) => updateApplicant(applicant.id, 'zipCode', e.target.value)}
                                            className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            value={applicant.education}
                                            onChange={(e) => updateApplicant(applicant.id, 'education', parseInt(e.target.value))}
                                            className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                                        />
                                    </td>
                                    {trained && (
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${applicant.approved
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {applicant.approved ? '✓ Approved' : '✗ Denied'}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={handleTrain}
                    className="mt-4 px-6 py-2 bg-[var(--color-electric-cyan)] text-black font-bold rounded-lg hover:brightness-110 transition-all"
                >
                    {trained ? '🔄 Retrain Model' : '🚀 Train Model'}
                </button>
            </div>

            {/* Bias Metrics */}
            {trained && metrics.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-yellow-900/20 to-red-900/20 border border-yellow-500/30 rounded-xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-4">📈 Bias Analysis: Approval Rates by Zip Code</h3>
                    <div className="space-y-4">
                        {metrics.map((metric) => (
                            <div key={metric.zipCode}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">
                                        Zip Code: <span className="font-mono font-bold">{metric.zipCode}</span>
                                        <span className="text-gray-500 text-sm ml-2">({metric.count} applicants)</span>
                                    </span>
                                    <span className={`font-bold ${metric.approvalRate > 50 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {metric.approvalRate.toFixed(0)}% approved
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${metric.approvalRate > 50 ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${metric.approvalRate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-200 text-sm font-semibold mb-2">⚠️ Algorithmic Redlining Detected</p>
                        <p className="text-gray-300 text-xs">
                            Notice how zip code strongly predicts loan approval? This is how algorithmic bias emerges.
                            If historical data shows certain neighborhoods were denied loans (due to past discrimination),
                            the AI learns to perpetuate that pattern—even if individual applicants are qualified.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Educational Insight */}
            <div className="bg-gradient-to-r from-[var(--color-electric-cyan)]/5 to-[var(--color-soft-violet)]/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-3">🎓 Why This Matters</h4>
                <div className="space-y-3 text-gray-300 text-sm">
                    <p>
                        <strong>Fairness vs. Accuracy:</strong> A model can be highly accurate while being deeply unfair.
                        If past lending was biased, training on that data creates a "perfect" predictor of biased outcomes,
                    </p>
                    <p>
                        <strong>Protected Proxies:</strong> Even if you remove race from the data, zip code serves as a
                        proxy—encoding racial and economic segregation. The model learns discrimination indirectly.
                    </p>
                    <p className="text-[var(--color-electric-cyan)] font-semibold">
                        This is why AI ethics isn't optional—it's a core engineering requirement. Philosophical questions
                        about fairness, justice, and representation have direct technical implications.
                    </p>
                </div>
            </div>
        </div>
    );
};
