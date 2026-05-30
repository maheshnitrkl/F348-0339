# NeuralNexus — Interactive AI & ML Learning Platform

An interactive, web-based learning platform for Artificial Intelligence and Machine Learning. Built with React, TypeScript, and Tailwind CSS, featuring structured learning paths, deep theoretical content, live visualizations, and a real-time neural network playground.

## Features

### 🧠 Structured Learning Roadmap
A 4-track learning architecture spanning Foundation → Mathematics → Advanced → Applications, with 16+ modules covering topics from Philosophy of AI to Diffusion Models. Modules have dependency connections and status tracking (locked/unlocked/in-progress/completed).

### 📚 Deep Learning Modules (11 interactive modules)
Each module features up to three views:
- **Theory** — Rich, detailed explanations with mathematical notation (KaTeX)
- **Code** — Implementation walkthroughs and examples
- **Visualization** — Interactive simulations and animations

Available modules include:
- Philosophy of AI
- Linear Algebra
- Calculus & Probability
- Backpropagation
- Signal Processing
- Neural Networks
- Statistical Learning
- Training Optimization (DL Efficiency)
- Medical Image Processing
- 3D Cephalometry
- And more...

### ⚡ Neural Network Playground
A TensorFlow-Playground-style sandbox built from scratch:
- **Full neural network engine** with forward pass and backpropagation
- **Adam optimizer** with Xavier weight initialization
- Configurable activation functions (ReLU, Sigmoid, Tanh, Linear)
- L1/L2 regularization
- Multiple dataset types (spiral, circle, XOR, clusters, etc.)
- Real-time **decision boundary visualization** on HTML Canvas
- Interactive **network architecture builder** — add/remove layers and neurons
- Live **weight heatmaps** per neuron

### 🎨 Design
- Dark glassmorphism UI with `backdrop-blur` and `border-white/10` effects
- Electric Cyan (`#00f3ff`) + Soft Violet (`#c084fc`) accent palette
- Smooth Framer Motion animations
- Inter typeface via Google Fonts

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **React Router** | Client-side routing |
| **KaTeX** | Mathematical notation rendering |
| **Lucide React** | Icon library |
| **Three.js / R3F** | 3D visualizations (select modules) |
| **mathjs** | Mathematical computations |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd F348-0339

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/           # Shared UI components
│   ├── Layout.tsx        # Sidebar + main content layout
│   ├── GlassCard.tsx     # Reusable glass-effect card
│   ├── SkillNode.tsx     # Roadmap node component
│   └── visualizations/   # Shared visualization components
├── pages/                # Top-level page views
│   ├── Dashboard.tsx     # Home page with stats & quick links
│   ├── Roadmap.tsx       # Learning path visualization
│   ├── LessonView.tsx    # Module theory/code/viz viewer
│   ├── Modules.tsx       # Module catalog
│   ├── Playground.tsx    # Neural network sandbox
│   └── playground/       # Playground engine & components
├── modules/              # Learning module content
│   ├── registry.ts       # Module registry (plug-and-play)
│   ├── foundation/       # Foundation track modules
│   ├── math/             # Mathematics track modules
│   ├── advanced/         # Advanced track modules
│   ├── application/      # Application track modules
│   └── medical-imaging/  # Medical imaging module
├── data/                 # Static data (roadmap nodes, content)
├── types/                # TypeScript type definitions
├── App.tsx               # Root component with Routes
├── main.tsx              # Entry point with BrowserRouter
└── index.css             # Global styles & Tailwind theme
```

## License

Private project.
