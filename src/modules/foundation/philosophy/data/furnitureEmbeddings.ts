export interface FurnitureEmbedding {
    id: string;
    name: string;
    vector: number[];
    description: string;
}

// Normalized 8-dimensional embeddings for furniture concepts
export const furnitureEmbeddings: FurnitureEmbedding[] = [{
    id: 'chair',
    name: 'Chair',
    description: 'A seat with a back, for one person',
    vector: [0.85, 0.2, 0.6, -0.3, 0.4, 0.7, -0.1, 0.5]
},
{
    id: 'table',
    name: 'Table',
    description: 'A flat surface supported by legs',
    vector: [0.3, 0.9, 0.1, 0.6, -0.2, 0.5, 0.4, -0.3]
},
{
    id: 'stool',
    name: 'Stool',
    description: 'A seat without a back or arms',
    vector: [0.75, 0.15, 0.55, -0.25, 0.35, 0.4, -0.05, 0.45]
},
{
    id: 'bench',
    name: 'Bench',
    description: 'A long seat for multiple people',
    vector: [0.6, 0.4, 0.7, -0.1, 0.5, 0.6, 0.2, 0.3]
},
{
    id: 'desk',
    name: 'Desk',
    description: 'A table for working or writing',
    vector: [0.4, 0.85, 0.2, 0.5, -0.15, 0.6, 0.35, -0.2]
},
];

// Calculate Euclidean distance between two vectors
export function calculateDistance(vec1: number[], vec2: number[]): number {
    return Math.sqrt(
        vec1.reduce((sum, val, idx) => sum + Math.pow(val - vec2[idx], 2), 0)
    );
}

// Linear interpolation between two vectors
export function interpolateVectors(vec1: number[], vec2: number[], t: number): number[] {
    return vec1.map((val, idx) => val + (vec2[idx] - val) * t);
}

// Find the closest furniture concept to a given vector
export function findClosestConcept(vector: number[]): FurnitureEmbedding {
    let closest = furnitureEmbeddings[0];
    let minDistance = calculateDistance(vector, closest.vector);

    for (const embedding of furnitureEmbeddings) {
        const dist = calculateDistance(vector, embedding.vector);
        if (dist < minDistance) {
            minDistance = dist;
            closest = embedding;
        }
    }

    return closest;
}

// Get similarity scores for all concepts relative to given vector
export function getSimilarityScores(vector: number[]): Array<{ concept: string; similarity: number }> {
    return furnitureEmbeddings.map(emb => {
        const distance = calculateDistance(vector, emb.vector);
        // Convert distance to similarity (0-1), where lower distance = higher similarity
        const maxDistance = 3.0; // Approximate max distance in our normalized space
        const similarity = Math.max(0, 1 - (distance / maxDistance));
        return { concept: emb.name, similarity };
    }).sort((a, b) => b.similarity - a.similarity);
}
