import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { roadmapData, type SkillNode } from '../data/roadmapData';
import {
    ProgressContext,
    PROGRESS_STORAGE_KEY,
    type ModuleStatus,
    type ProgressContextValue,
    type ProgressStats,
    type SavedProgress,
    type SavedStatus,
} from './progressContext';

function readProgress(): SavedProgress {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return {};
        const clean: SavedProgress = {};
        for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
            if (value === 'completed' || value === 'in-progress') clean[id] = value;
        }
        return clean;
    } catch {
        // Corrupt or unavailable storage must never take the app down.
        return {};
    }
}

function writeProgress(progress: SavedProgress) {
    try {
        window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
        // Private browsing / quota errors are non-fatal: progress stays in memory.
    }
}

/** Nodes whose `connections` point at `nodeId` — i.e. that node's prerequisites. */
function prerequisitesOf(nodeId: string): SkillNode[] {
    return roadmapData.filter((n) => n.connections.includes(nodeId));
}

/**
 * The roadmap ships with seeded statuses; a saved status always wins. Locked
 * nodes unlock automatically once every node pointing at them is completed, so
 * finishing a module actually opens up the next stages of the path.
 */
function resolveStatus(node: SkillNode, saved: SavedProgress, completedIds: Set<string>): ModuleStatus {
    const savedStatus = saved[node.id];
    if (savedStatus) return savedStatus;
    if (node.status === 'locked') {
        const prerequisites = prerequisitesOf(node.id);
        if (prerequisites.length > 0 && prerequisites.every((p) => completedIds.has(p.id))) {
            return 'unlocked';
        }
    }
    return node.status;
}

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [saved, setSaved] = useState<SavedProgress>(readProgress);

    useEffect(() => {
        writeProgress(saved);
    }, [saved]);

    // Keep multiple tabs in sync.
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === PROGRESS_STORAGE_KEY) setSaved(readProgress());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Seeded completions count too, otherwise the shipped starting point would
    // never unlock anything.
    const completedIds = useMemo(() => {
        const ids = new Set<string>();
        for (const node of roadmapData) {
            if (saved[node.id] === 'completed' || node.status === 'completed') ids.add(node.id);
        }
        return ids;
    }, [saved]);

    const statusOf = useCallback(
        (node: SkillNode) => resolveStatus(node, saved, completedIds),
        [saved, completedIds]
    );

    const statusOfNodeId = useCallback(
        (nodeId: string) => {
            const node = roadmapData.find((n) => n.id === nodeId);
            return node ? statusOf(node) : undefined;
        },
        [statusOf]
    );

    const nodeForModule = useCallback((moduleId: string) => {
        return (
            roadmapData.find((n) => n.id === moduleId) ??
            roadmapData.find((n) => n.moduleId === moduleId)
        );
    }, []);

    const statusOfModule = useCallback(
        (moduleId: string) => {
            const node = nodeForModule(moduleId);
            return node ? statusOf(node) : 'unlocked';
        },
        [nodeForModule, statusOf]
    );

    const setStatus = useCallback((nodeId: string, status: SavedStatus) => {
        setSaved((prev) => (prev[nodeId] === status ? prev : { ...prev, [nodeId]: status }));
    }, []);

    const markVisited = useCallback((nodeId: string) => {
        setSaved((prev) => {
            if (prev[nodeId]) return prev; // already completed or in progress
            return { ...prev, [nodeId]: 'in-progress' };
        });
    }, []);

    const toggleComplete = useCallback((nodeId: string) => {
        setSaved((prev) => {
            const next = { ...prev };
            if (next[nodeId] === 'completed') delete next[nodeId];
            else next[nodeId] = 'completed';
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setSaved({});
        try {
            window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
        } catch {
            // ignore
        }
    }, []);

    const stats = useMemo<ProgressStats>(() => {
        let completed = 0;
        let inProgress = 0;
        let ready = 0;
        let locked = 0;
        for (const node of roadmapData) {
            switch (statusOf(node)) {
                case 'completed': completed += 1; break;
                case 'in-progress': inProgress += 1; break;
                case 'unlocked': ready += 1; break;
                default: locked += 1;
            }
        }
        const total = roadmapData.length;
        return {
            completed,
            inProgress,
            ready,
            locked,
            total,
            pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }, [statusOf]);

    const value = useMemo<ProgressContextValue>(
        () => ({
            saved,
            statusOf,
            statusOfNodeId,
            nodeForModule,
            statusOfModule,
            markVisited,
            toggleComplete,
            setStatus,
            reset,
            stats,
        }),
        [saved, statusOf, statusOfNodeId, nodeForModule, statusOfModule, markVisited, toggleComplete, setStatus, reset, stats]
    );

    return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};
