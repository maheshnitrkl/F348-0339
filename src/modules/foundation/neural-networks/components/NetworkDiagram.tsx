import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import type { TransferModelType } from './TransferLearningViz';

interface LayerBlock {
    id: string;
    name: string;
    desc: string;
    frozen: boolean;
}

interface NetworkDiagramProps {
    modelType: TransferModelType;
    layers: LayerBlock[];
    toggleLayer: (id: string) => void;
}

// ── Shared Subcomponents ──────────────────────────────────────────────────

const Block: React.FC<{ layer: LayerBlock; onClick: () => void; isWide?: boolean; children?: React.ReactNode; height?: string }> = ({ layer, onClick, isWide, children, height = 'h-24' }) => {
    return (
        <motion.button
            layout
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center border-2 rounded-xl transition-all group overflow-hidden ${
                isWide ? 'w-48' : 'w-32'
            } ${height} ${
                layer.frozen 
                    ? 'bg-slate-800/80 border-slate-600 text-slate-400' 
                    : 'bg-violet-500/10 border-violet-500/50 text-violet-200'
            }`}
        >
            <div className="absolute top-2 right-2 text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                {layer.frozen ? <Lock size={12} className="text-slate-400" /> : <Unlock size={12} className="text-violet-400" />}
            </div>
            
            <div className="z-10 flex flex-col items-center justify-center px-2">
                <span className="font-bold text-xs text-center leading-tight mb-1">{layer.name}</span>
                <span className={`text-[10px] text-center leading-tight ${layer.frozen ? 'text-slate-500' : 'text-violet-400/60'}`}>{layer.desc}</span>
            </div>

            {/* Background architectural hint (optional) */}
            {children && (
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
                    {children}
                </div>
            )}
        </motion.button>
    );
};

const ArrowDown = () => (
    <div className="flex justify-center my-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
            <line x1="12" y1="0" x2="12" y2="24"></line>
            <polyline points="7 19 12 24 17 19"></polyline>
        </svg>
    </div>
);

// ── Specific Architecture Renderers ─────────────────────────────────────────

const VGGDiagram: React.FC<{ layers: LayerBlock[]; toggleLayer: (id: string) => void }> = ({ layers, toggleLayer }) => (
    <div className="flex flex-col items-center py-4">
        {layers.map((l, i) => (
            <React.Fragment key={l.id}>
                <Block layer={l} onClick={() => toggleLayer(l.id)} isWide>
                    {/* Visual hint of shrinking spatial size but increasing channels */}
                    <div className="flex gap-1 items-end h-full pt-4">
                        <div className={`bg-current w-1 rounded-sm`} style={{ height: `${20 + i*15}%` }} />
                        <div className={`bg-current w-1 rounded-sm`} style={{ height: `${20 + i*15}%` }} />
                        <div className={`bg-current w-1 rounded-sm`} style={{ height: `${20 + i*15}%` }} />
                    </div>
                </Block>
                {i < layers.length - 1 && <ArrowDown />}
            </React.Fragment>
        ))}
    </div>
);

const ResNetDiagram: React.FC<{ layers: LayerBlock[]; toggleLayer: (id: string) => void }> = ({ layers, toggleLayer }) => (
    <div className="flex flex-col items-center py-4">
        {layers.map((l, i) => (
            <React.Fragment key={l.id}>
                <div className="relative">
                    {/* The main block */}
                    <Block layer={l} onClick={() => toggleLayer(l.id)} isWide>
                        <div className="flex gap-2">
                            <div className="w-4 h-4 rounded bg-current opacity-50" />
                            <div className="w-4 h-4 rounded bg-current opacity-20" />
                            <div className="w-4 h-4 rounded bg-current opacity-50" />
                        </div>
                    </Block>
                    
                    {/* Skip connection arrow (except for stem) */}
                    {i > 0 && (
                        <svg className="absolute top-0 -left-12 h-full w-12 text-slate-600 pointer-events-none" preserveAspectRatio="none">
                            <path d={`M 12 10 Q 0 ${48} 12 ${86}`} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                            <polyline points="8,80 12,86 16,80" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    )}
                </div>
                {i < layers.length - 1 && <ArrowDown />}
            </React.Fragment>
        ))}
    </div>
);

const InceptionDiagram: React.FC<{ layers: LayerBlock[]; toggleLayer: (id: string) => void }> = ({ layers, toggleLayer }) => (
    <div className="flex flex-col items-center py-4">
        {layers.map((l, i) => (
            <React.Fragment key={l.id}>
                <Block layer={l} onClick={() => toggleLayer(l.id)} isWide height="h-28">
                    {i > 0 && (
                        <div className="absolute inset-0 flex flex-col justify-end pb-2 opacity-30 gap-1 px-4">
                            <div className="flex justify-between w-full h-1/3">
                                <div className="w-1/5 bg-current rounded-sm" />
                                <div className="w-1/5 bg-current rounded-sm" />
                                <div className="w-1/5 bg-current rounded-sm" />
                                <div className="w-1/5 bg-current rounded-sm" />
                            </div>
                            <div className="w-full h-1 bg-current rounded-sm" />
                        </div>
                    )}
                </Block>
                {i < layers.length - 1 && <ArrowDown />}
            </React.Fragment>
        ))}
    </div>
);

const TransformerDiagram: React.FC<{ layers: LayerBlock[]; toggleLayer: (id: string) => void }> = ({ layers, toggleLayer }) => (
    <div className="flex flex-col items-center py-4">
        {layers.map((l, i) => (
            <React.Fragment key={l.id}>
                <Block layer={l} onClick={() => toggleLayer(l.id)} isWide>
                    {i > 0 ? (
                        <div className="absolute inset-0 flex justify-center items-center opacity-20 gap-2">
                            <div className="w-3 h-3 rounded-full bg-current" />
                            <div className="w-8 h-1 bg-current" />
                            <div className="w-3 h-3 rounded-full bg-current" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-20 gap-1 p-4">
                            {[...Array(8)].map((_, idx) => <div key={idx} className="w-3 h-3 bg-current rounded-sm" />)}
                        </div>
                    )}
                </Block>
                {i < layers.length - 1 && <ArrowDown />}
            </React.Fragment>
        ))}
    </div>
);

// ── Main Component ──────────────────────────────────────────────────────────

export const NetworkDiagram: React.FC<NetworkDiagramProps> = ({ modelType, layers, toggleLayer }) => {
    switch (modelType) {
        case 'vgg':
        case 'mobilenet':
        case 'xception':
            return <VGGDiagram layers={layers} toggleLayer={toggleLayer} />;
        case 'resnet':
            return <ResNetDiagram layers={layers} toggleLayer={toggleLayer} />;
        case 'inception':
            return <InceptionDiagram layers={layers} toggleLayer={toggleLayer} />;
        case 'vit':
        case 'bert':
            return <TransformerDiagram layers={layers} toggleLayer={toggleLayer} />;
        default:
            return <VGGDiagram layers={layers} toggleLayer={toggleLayer} />;
    }
};
