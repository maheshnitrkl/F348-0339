/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Code2, Layers } from 'lucide-react';
import { NodeGraph } from './NodeGraph';

export type TransferModelType = 'vgg' | 'inception' | 'resnet' | 'xception' | 'mobilenet' | 'vit' | 'bert';

export interface LayerNode {
    id: string;
    op: string;      // e.g., 'Conv2D', 'Linear', 'Attention'
    params: string;  // e.g., 'kernel=3x3, out=64'
    shape: string;   // e.g., '[B, 64, 224, 224]'
    frozen: boolean;
    isEllipsis?: boolean; // Use true to render a "..." skipping block
}

interface ModelConfig {
    name: string;
    importCode: string;
    loadCode: string;
    sourceCode: string;
    nodes: LayerNode[];
    getFreezeCode: (nodes: LayerNode[], isAllFrozen: boolean, isAllUnfrozen: boolean) => string;
    getHeadCode: (headSwapped: boolean) => string;
}

const MODEL_CONFIGS: Record<TransferModelType, ModelConfig> = {
    vgg: {
        name: 'VGG-16',
        importCode: 'import torchvision.models as models',
        loadCode: "model = models.vgg16(weights='IMAGENET1K_V1')",
        nodes: [
            { id: 'input', op: 'InputImage', params: 'RGB', shape: '[B, 3, 224, 224]', frozen: true },
            { id: 'features.0', op: 'Conv2d', params: '3x3, 64', shape: '[B, 64, 224, 224]', frozen: true },
            { id: 'features.1', op: 'ReLU', params: 'inplace=True', shape: '[B, 64, 224, 224]', frozen: true },
            { id: 'features.2', op: 'Conv2d', params: '3x3, 64', shape: '[B, 64, 224, 224]', frozen: true },
            { id: 'features.3', op: 'ReLU', params: 'inplace=True', shape: '[B, 64, 224, 224]', frozen: true },
            { id: 'features.4', op: 'MaxPool2d', params: '2x2, stride=2', shape: '[B, 64, 112, 112]', frozen: true },
            { id: 'features.5', op: 'Conv2d', params: '3x3, 128', shape: '[B, 128, 112, 112]', frozen: true },
            { id: 'skip1', op: '...', params: '11 more Conv layers', shape: '[B, 512, 7, 7]', frozen: true, isEllipsis: true },
            { id: 'classifier.0', op: 'Linear', params: 'in=25088, out=4096', shape: '[B, 4096]', frozen: true },
        ],
        sourceCode: `import torch.nn as nn

class VGG(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            # ... more layers
        )
        self.classifier = nn.Sequential(
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(True),
            nn.Dropout(p=0.5),
            nn.Linear(4096, 1000),
        )

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `# Example: selectively freeze early features\nfor i in range(6):\n    for param in model.features[i].parameters():\n        param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `import torch.nn as nn\nnum_ftrs = model.classifier[6].in_features\nmodel.classifier[6] = nn.Linear(num_ftrs, 2)`
            : `# Default 1000-class head`
    },
    inception: {
        name: 'Inception v3',
        importCode: 'import torchvision.models as models',
        loadCode: "model = models.inception_v3(weights='IMAGENET1K_V1')",
        nodes: [
            { id: 'input', op: 'InputImage', params: 'RGB', shape: '[B, 3, 299, 299]', frozen: true },
            { id: 'Conv2d_1a_3x3', op: 'BasicConv2d', params: '3x3, 32, stride=2', shape: '[B, 32, 149, 149]', frozen: true },
            { id: 'Conv2d_2a_3x3', op: 'BasicConv2d', params: '3x3, 32', shape: '[B, 32, 147, 147]', frozen: true },
            { id: 'skip1', op: '...', params: 'Stem Convs', shape: '[B, 192, 35, 35]', frozen: true, isEllipsis: true },
            { id: 'Mixed_5b', op: 'InceptionA', params: 'Concat 4 branches', shape: '[B, 256, 35, 35]', frozen: true },
            { id: 'skip2', op: '...', params: 'More Inception Blocks', shape: '[B, 2048, 8, 8]', frozen: true, isEllipsis: true },
        ],
        sourceCode: `import torch
import torch.nn as nn

class InceptionA(nn.Module):
    def __init__(self, in_channels, pool_features):
        super().__init__()
        # Branch 1: 1x1 conv
        self.branch1x1 = BasicConv2d(in_channels, 64, kernel_size=1)
        
        # Branch 2: 1x1 -> 5x5
        self.branch5x5_1 = BasicConv2d(in_channels, 48, kernel_size=1)
        self.branch5x5_2 = BasicConv2d(48, 64, kernel_size=5, padding=2)
        
        # Branch 3: 1x1 -> 3x3 -> 3x3
        self.branch3x3dbl_1 = BasicConv2d(in_channels, 64, kernel_size=1)
        self.branch3x3dbl_2 = BasicConv2d(64, 96, kernel_size=3, padding=1)
        self.branch3x3dbl_3 = BasicConv2d(96, 96, kernel_size=3, padding=1)
        
        # Branch 4: MaxPool -> 1x1
        self.branch_pool = BasicConv2d(in_channels, pool_features, kernel_size=1)

    def forward(self, x):
        branch1x1 = self.branch1x1(x)
        branch5x5 = self.branch5x5_2(self.branch5x5_1(x))
        branch3x3dbl = self.branch3x3dbl_3(self.branch3x3dbl_2(self.branch3x3dbl_1(x)))
        
        branch_pool = nn.functional.max_pool2d(x, kernel_size=3, stride=1, padding=1)
        branch_pool = self.branch_pool(branch_pool)

        # Concatenate branches along channel dim
        return torch.cat([branch1x1, branch5x5, branch3x3dbl, branch_pool], 1)`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `for name, param in model.named_parameters():\n    if name.startswith('Conv2d'): param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `import torch.nn as nn\nnum_ftrs = model.fc.in_features\nmodel.fc = nn.Linear(num_ftrs, 2)`
            : `# Default 1000-class head`
    },
    resnet: {
        name: 'ResNet-50',
        importCode: 'import torchvision.models as models',
        loadCode: "model = models.resnet50(weights='IMAGENET1K_V1')",
        nodes: [
            { id: 'input', op: 'InputImage', params: 'RGB', shape: '[B, 3, 224, 224]', frozen: true },
            { id: 'conv1', op: 'Conv2d', params: '7x7, 64, stride=2', shape: '[B, 64, 112, 112]', frozen: true },
            { id: 'bn1', op: 'BatchNorm2d', params: 'eps=1e-5', shape: '[B, 64, 112, 112]', frozen: true },
            { id: 'relu', op: 'ReLU', params: 'inplace=True', shape: '[B, 64, 112, 112]', frozen: true },
            { id: 'maxpool', op: 'MaxPool2d', params: '3x3, stride=2', shape: '[B, 64, 56, 56]', frozen: true },
            { id: 'layer1.0', op: 'Bottleneck', params: 'Downsample, out=256', shape: '[B, 256, 56, 56]', frozen: true },
            { id: 'skip1', op: '...', params: '15 more Bottlenecks', shape: '[B, 2048, 7, 7]', frozen: true, isEllipsis: true },
        ],
        sourceCode: `import torch.nn as nn

class Bottleneck(nn.Module):
    def __init__(self, inplanes, planes, stride=1):
        super().__init__()
        # 1x1 squeeze
        self.conv1 = nn.Conv2d(inplanes, planes, kernel_size=1, bias=False)
        self.bn1 = nn.BatchNorm2d(planes)
        
        # 3x3 process
        self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(planes)
        
        # 1x1 expand
        self.conv3 = nn.Conv2d(planes, planes * 4, kernel_size=1, bias=False)
        self.bn3 = nn.BatchNorm2d(planes * 4)
        
        self.shortcut = nn.Sequential() # skip matching logic

    def forward(self, x):
        identity = self.shortcut(x)

        out = self.relu(self.bn1(self.conv1(x)))
        out = self.relu(self.bn2(self.conv2(out)))
        out = self.bn3(self.conv3(out))

        # SKIP CONNECTION: F(x) + x
        out += identity
        out = self.relu(out)

        return out`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `for param in model.conv1.parameters(): param.requires_grad = False\nfor param in model.bn1.parameters(): param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `import torch.nn as nn\nnum_ftrs = model.fc.in_features\nmodel.fc = nn.Linear(num_ftrs, 2)`
            : `# Default 1000-class head`
    },
    xception: {
        name: 'Xception',
        importCode: 'import timm',
        loadCode: "model = timm.create_model('xception', pretrained=True)",
        nodes: [
            { id: 'input', op: 'InputImage', params: 'RGB', shape: '[B, 3, 299, 299]', frozen: true },
            { id: 'conv1', op: 'Conv2d', params: '3x3, 32, stride=2', shape: '[B, 32, 149, 149]', frozen: true },
            { id: 'conv2', op: 'Conv2d', params: '3x3, 64', shape: '[B, 64, 147, 147]', frozen: true },
            { id: 'block1.rep.0', op: 'SeparableConv2d', params: 'Depthwise + Pointwise', shape: '[B, 128, 147, 147]', frozen: true },
            { id: 'skip1', op: '...', params: 'Middle Flow Blocks', shape: '[B, 728, 19, 19]', frozen: true, isEllipsis: true },
            { id: 'block12', op: 'SeparableConv2d', params: 'Exit Flow', shape: '[B, 1024, 19, 19]', frozen: true },
        ],
        sourceCode: `import torch.nn as nn

class SeparableConv2d(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=1, stride=1, padding=0):
        super().__init__()
        
        # Step 1: Depthwise Convolution
        # groups=in_channels forces each filter to operate on just one input channel
        self.depthwise = nn.Conv2d(
            in_channels, in_channels, kernel_size, 
            stride, padding, groups=in_channels, bias=False
        )
        
        # Step 2: Pointwise Convolution (1x1)
        # Mixes the independent channels together
        self.pointwise = nn.Conv2d(
            in_channels, out_channels, 
            kernel_size=1, stride=1, padding=0, bias=False
        )

    def forward(self, x):
        x = self.depthwise(x)
        x = self.pointwise(x)
        return x`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `for name, param in model.named_parameters():\n    if 'conv1' in name or 'conv2' in name: param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `import torch.nn as nn\nnum_ftrs = model.get_classifier().in_features\nmodel.reset_classifier(2)`
            : `# Default 1000-class head`
    },
    mobilenet: {
        name: 'MobileNetV3',
        importCode: 'import torchvision.models as models',
        loadCode: "model = models.mobilenet_v3_large(weights='IMAGENET1K_V1')",
        nodes: [
            { id: 'input', op: 'InputImage', params: 'RGB', shape: '[B, 3, 224, 224]', frozen: true },
            { id: 'features.0', op: 'ConvNormActivation', params: '3x3, 16', shape: '[B, 16, 112, 112]', frozen: true },
            { id: 'features.1', op: 'InvertedResidual', params: 'expand=16, squeeze', shape: '[B, 16, 112, 112]', frozen: true },
            { id: 'features.2', op: 'InvertedResidual', params: 'expand=64, stride=2', shape: '[B, 24, 56, 56]', frozen: true },
            { id: 'skip1', op: '...', params: '13 more Inv. Residuals', shape: '[B, 160, 7, 7]', frozen: true, isEllipsis: true },
            { id: 'features.16', op: 'ConvNormActivation', params: '1x1, 960', shape: '[B, 960, 7, 7]', frozen: true },
        ],
        sourceCode: `import torch.nn as nn

class InvertedResidual(nn.Module):
    def __init__(self, inp, oup, stride, expand_ratio):
        super().__init__()
        hidden_dim = round(inp * expand_ratio)
        self.use_res_connect = stride == 1 and inp == oup
        
        self.conv = nn.Sequential(
            # Step 1: Pointwise Expand (1x1)
            nn.Conv2d(inp, hidden_dim, 1, 1, 0, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            
            # Step 2: Depthwise Convolution (3x3)
            nn.Conv2d(hidden_dim, hidden_dim, 3, stride, 1, groups=hidden_dim, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            
            # Step 3: Pointwise Squeeze (1x1)
            nn.Conv2d(hidden_dim, oup, 1, 1, 0, bias=False),
            nn.BatchNorm2d(oup),
        )

    def forward(self, x):
        # Skip connection only if stride==1 and channels match
        if self.use_res_connect:
            return x + self.conv(x)
        return self.conv(x)`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `for i in range(5):\n    for param in model.features[i].parameters():\n        param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `import torch.nn as nn\nnum_ftrs = model.classifier[3].in_features\nmodel.classifier[3] = nn.Linear(num_ftrs, 2)`
            : `# Default 1000-class head`
    },
    vit: {
        name: 'Vision Transformer (ViT)',
        importCode: 'import torchvision.models as models',
        loadCode: "model = models.vit_b_16(weights='IMAGENET1K_V1')",
        nodes: [
            { id: 'input', op: 'InputImage', params: 'RGB', shape: '[B, 3, 224, 224]', frozen: true },
            { id: 'conv_proj', op: 'Conv2d', params: '16x16, stride=16 (Patching)', shape: '[B, 768, 14, 14]', frozen: true },
            { id: 'flatten', op: 'Flatten', params: 'start_dim=2', shape: '[B, 768, 196]', frozen: true },
            { id: 'cat', op: 'Concat', params: 'Prepend Class Token', shape: '[B, 768, 197]', frozen: true },
            { id: 'encoder.0', op: 'EncoderBlock', params: 'Multi-Head Attention', shape: '[B, 197, 768]', frozen: true },
            { id: 'skip1', op: '...', params: '11 more Encoder Blocks', shape: '[B, 197, 768]', frozen: true, isEllipsis: true },
        ],
        sourceCode: `import torch
import torch.nn as nn

class VisionTransformer(nn.Module):
    def __init__(self, image_size=224, patch_size=16, dim=768):
        super().__init__()
        num_patches = (image_size // patch_size) ** 2
        
        # 1. Patch Embedding via Convolution
        self.patch_embed = nn.Conv2d(3, dim, kernel_size=patch_size, stride=patch_size)
        
        # 2. Learnable Classification Token & Position Embeddings
        self.cls_token = nn.Parameter(torch.zeros(1, 1, dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, num_patches + 1, dim))
        
        # 3. Transformer Blocks
        self.blocks = nn.Sequential(*[
            TransformerBlock(dim, num_heads=12) for _ in range(12)
        ])
        
        self.head = nn.Linear(dim, 1000)

    def forward(self, x):
        # Create Patches: [B, 3, 224, 224] -> [B, 768, 14, 14] -> [B, 196, 768]
        x = self.patch_embed(x).flatten(2).transpose(1, 2)
        
        # Prepend CLS token and add Position Encodings
        cls_tokens = self.cls_token.expand(x.shape[0], -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x = x + self.pos_embed
        
        # Pass through Transformer
        x = self.blocks(x)
        
        # Classification prediction uses only the state of the CLS token
        return self.head(x[:, 0])`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `for param in model.conv_proj.parameters(): param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `import torch.nn as nn\nnum_ftrs = model.heads.head.in_features\nmodel.heads.head = nn.Linear(num_ftrs, 2)`
            : `# Default 1000-class head`
    },
    bert: {
        name: 'BERT (HuggingFace)',
        importCode: 'from transformers import BertForSequenceClassification',
        loadCode: "model = BertForSequenceClassification.from_pretrained('bert-base-uncased')",
        nodes: [
            { id: 'input', op: 'InputTokens', params: 'WordPiece', shape: '[B, SeqLen]', frozen: true },
            { id: 'embeddings', op: 'BertEmbeddings', params: 'Word + Pos + Token', shape: '[B, SeqLen, 768]', frozen: true },
            { id: 'encoder.layer.0', op: 'BertLayer', params: 'Self-Attention', shape: '[B, SeqLen, 768]', frozen: true },
            { id: 'encoder.layer.1', op: 'BertLayer', params: 'Self-Attention', shape: '[B, SeqLen, 768]', frozen: true },
            { id: 'skip1', op: '...', params: '10 more BertLayers', shape: '[B, SeqLen, 768]', frozen: true, isEllipsis: true },
            { id: 'pooler', op: 'BertPooler', params: 'Extract [CLS]', shape: '[B, 768]', frozen: true },
        ],
        sourceCode: `import torch.nn as nn

class BertLayer(nn.Module):
    def __init__(self, config):
        super().__init__()
        
        # 1. Multi-Head Self-Attention
        self.attention = BertAttention(config)
        
        # 2. Feed-Forward Network
        self.intermediate = BertIntermediate(config)
        
        # 3. Output Projection & Residual
        self.output = BertOutput(config)

    def forward(self, hidden_states, attention_mask=None):
        # Self-Attention (Bidirectional)
        attention_output = self.attention(hidden_states, attention_mask)
        
        # Feed-Forward + Skip Connection + LayerNorm
        intermediate_output = self.intermediate(attention_output)
        layer_output = self.output(intermediate_output, attention_output)
        
        return layer_output`,
        getFreezeCode: (nodes, allF, allU) => {
            if (allF) return `for param in model.bert.parameters():\n    param.requires_grad = False\n`;
            if (allU) return `# All layers trainable\n`;
            return `for param in model.bert.embeddings.parameters(): param.requires_grad = False\n`;
        },
        getHeadCode: (swapped) => swapped 
            ? `# HuggingFace automatically creates a new uninitialized classification head\n# when you pass num_labels=2 to from_pretrained()`
            : `# Default head`
    }
};

interface TransferLearningVizProps {
    modelType: TransferModelType;
}

export const TransferLearningViz: React.FC<TransferLearningVizProps> = ({ modelType }) => {
    const config = MODEL_CONFIGS[modelType];
    const [nodes, setNodes] = useState<LayerNode[]>(config.nodes);
    const [headSwapped, setHeadSwapped] = useState(false);
    const [codeView, setCodeView] = useState<'transfer' | 'source'>('transfer');

    useEffect(() => {
        setNodes(config.nodes);
        setHeadSwapped(false);
    }, [modelType, config.nodes]);

    const toggleNode = (id: string) => {
        setNodes(prev => prev.map(n => {
            if (n.isEllipsis || n.id === 'input') return n; // Don't toggle purely structural elements
            return n.id === id ? { ...n, frozen: !n.frozen } : n;
        }));
    };

    const isAllFrozen = nodes.filter(n => !n.isEllipsis && n.id !== 'input').every(n => n.frozen);
    const isAllUnfrozen = nodes.filter(n => !n.isEllipsis && n.id !== 'input').every(n => !n.frozen);

    const getCode = () => {
        let code = `# 1. Load Pre-trained ${config.name}\n`;
        code += `${config.importCode}\n`;
        code += `${config.loadCode}\n\n`;

        code += `# 2. Freeze/Unfreeze Layers\n`;
        code += config.getFreezeCode(nodes, isAllFrozen, isAllUnfrozen);
        code += `\n`;

        code += `# 3. Replace Classification Head\n`;
        code += config.getHeadCode(headSwapped);
        return code;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Layers size={18} className="text-violet-400" />
                    <span className="font-bold">Architect: {config.name}</span>
                </div>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button 
                        onClick={() => setCodeView('transfer')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${codeView === 'transfer' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                        Transfer Learning Script
                    </button>
                    <button 
                        onClick={() => setCodeView('source')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${codeView === 'source' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                        Architecture Source Code
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[400px]">
                
                {/* Visualizer Side */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-950">
                    <div className="w-full max-w-lg space-y-4">
                        
                        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest text-center border-b border-slate-800 pb-2 mb-4">
                            Detailed Tensor Flow
                        </div>
                        
                        <NodeGraph nodes={nodes} toggleNode={toggleNode} />

                        <div className="flex justify-center py-2">
                            <div className="w-0.5 h-6 bg-slate-800"></div>
                        </div>

                        <motion.button
                            layout
                            onClick={() => setHeadSwapped(!headSwapped)}
                            className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
                                headSwapped
                                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-200'
                                    : 'bg-slate-800/80 border-slate-600 text-white'
                            }`}
                        >
                            <div className="text-left font-mono">
                                <div className="font-bold text-sm">
                                    {headSwapped ? 'Linear (Custom)' : 'Linear (Pre-trained Head)'}
                                </div>
                                <div className={`text-xs mt-1 ${headSwapped ? 'text-orange-400/60' : 'text-slate-400'}`}>
                                    {headSwapped ? 'Output Tensor: [B, 2]' : 'Output Tensor: [B, 1000]'}
                                </div>
                            </div>
                            <div className={`p-2 rounded-md ${headSwapped ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'}`}>
                                <RefreshCw size={16} className={headSwapped ? 'rotate-180 transition-transform duration-500' : ''} />
                            </div>
                        </motion.button>

                    </div>
                </div>

                {/* Code Side */}
                <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 p-6 flex flex-col lg:max-w-xl">
                    <div className="text-xs text-slate-500 font-mono mb-4 flex items-center justify-between">
                        <span>PyTorch Implementation</span>
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-400">
                            {codeView === 'transfer' ? 'transfer.py' : 'model.py'}
                        </span>
                    </div>
                    <div className="flex-1 bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden relative group">
                        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto h-full whitespace-pre-wrap break-all">
                            <code>
                                {(codeView === 'transfer' ? getCode() : config.sourceCode).split('\n').map((line, i) => {
                                    let coloredLine = line.replace(/\b(import|from|class|def|return|as|for|in|False|True|self)\b/g, (match) => {
                                        if (['False', 'True', 'self'].includes(match)) {
                                            return `<span class="text-blue-400">${match}</span>`;
                                        }
                                        return `<span class="text-rose-400">${match}</span>`;
                                    });
                                        
                                    if (line.trim().startsWith('#')) {
                                        coloredLine = `<span class="text-slate-500">${line}</span>`;
                                    }

                                    return (
                                        <div key={i} dangerouslySetInnerHTML={{ __html: coloredLine || ' ' }} className="break-all whitespace-pre-wrap" />
                                    );
                                })}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
