import type { DataPoint } from './PlaygroundEngine';

export type DatasetType = 'spiral' | 'circle' | 'xor' | 'gaussian' | 'medical-anomaly';

export function generateDataset(type: DatasetType, numPoints: number, noise: number): DataPoint[] {
    const points: DataPoint[] = [];

    const addPoint = (x1: number, x2: number, label: number) => {
        const nx1 = x1 + (Math.random() - 0.5) * noise;
        const nx2 = x2 + (Math.random() - 0.5) * noise;
        points.push({ x: [nx1, nx2], y: label });
    };

    if (type === 'spiral') {
        for (let i = 0; i < numPoints; i++) {
            const label = i % 2;
            const r = (i / numPoints) * 5;
            const t = 1.25 * i / numPoints * 2 * Math.PI + (label * Math.PI);
            addPoint(r * Math.sin(t), r * Math.cos(t), label);
        }
    } else if (type === 'circle') {
        for (let i = 0; i < numPoints; i++) {
            const r = Math.random() * 5;
            const t = Math.random() * 2 * Math.PI;
            const label = r < 2.5 ? 1 : 0;
            addPoint(r * Math.sin(t), r * Math.cos(t), label);
        }
    } else if (type === 'xor') {
        for (let i = 0; i < numPoints; i++) {
            const x1 = Math.random() * 10 - 5;
            const x2 = Math.random() * 10 - 5;
            const label = (x1 > 0 && x2 > 0) || (x1 < 0 && x2 < 0) ? 1 : 0;
            addPoint(x1, x2, label);
        }
    } else if (type === 'gaussian') {
        for (let i = 0; i < numPoints; i++) {
            const label = i % 2;
            const cx = label === 1 ? 2 : -2;
            const cy = label === 1 ? 2 : -2;
            
            // Box-Muller transform for gaussian noise
            const u1 = Math.random();
            const u2 = Math.random();
            const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            const z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
            
            points.push({ x: [cx + z1 * noise, cy + z2 * noise], y: label });
        }
    } else if (type === 'medical-anomaly') {
        // Tumor cluster (anomaly) and healthy tissue (surrounding)
        for (let i = 0; i < numPoints; i++) {
            const isTumor = Math.random() < 0.25; // 25% tumor
            if (isTumor) {
                // Dense cluster in top right (anomaly)
                const cx = 3, cy = 3;
                const r = Math.random() * 1.5;
                const t = Math.random() * 2 * Math.PI;
                addPoint(cx + r * Math.cos(t), cy + r * Math.sin(t), 1);
            } else {
                // Healthy tissue spread everywhere, mostly around center
                const r = Math.random() * 6;
                const t = Math.random() * 2 * Math.PI;
                // Leave a little gap near tumor for easier classification
                let px = r * Math.cos(t);
                const py = r * Math.sin(t);
                const distToTumor = Math.sqrt((px - 3)**2 + (py - 3)**2);
                if (distToTumor < 1.5) {
                    px = -px; // flip away
                }
                addPoint(px, py, 0);
            }
        }
    }

    // Normalize coordinates to be roughly between -1 and 1
    let maxX = 0;
    let maxY = 0;
    points.forEach(p => {
        maxX = Math.max(maxX, Math.abs(p.x[0]));
        maxY = Math.max(maxY, Math.abs(p.x[1]));
    });
    
    const scale = Math.max(maxX, maxY) || 1;
    
    points.forEach(p => {
        p.x[0] /= scale;
        p.x[1] /= scale;
    });

    return points;
}
