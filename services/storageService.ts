export interface StoredSummary {
    content: string;
    actionItems: (string | { text: string; assignee: string })[];
    timestamp: number;
}

const STORAGE_PREFIX = 'stokemeet_summary_';

export function saveSummary(meetingId: string, type: string, summary: StoredSummary): void {
    try {
        const key = `${STORAGE_PREFIX}${meetingId}_${type}`;
        localStorage.setItem(key, JSON.stringify(summary));
    } catch (error) {
        console.warn('Failed to save summary to localStorage:', error);
    }
}

export function loadSummary(meetingId: string, type: string): StoredSummary | null {
    try {
        const key = `${STORAGE_PREFIX}${meetingId}_${type}`;
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        return JSON.parse(stored) as StoredSummary;
    } catch (error) {
        console.warn('Failed to load summary from localStorage:', error);
        return null;
    }
}

export function clearSummary(meetingId: string, type: string): void {
    try {
        const key = `${STORAGE_PREFIX}${meetingId}_${type}`;
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Failed to clear summary from localStorage:', error);
    }
}
