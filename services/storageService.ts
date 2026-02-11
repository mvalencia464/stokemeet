import { supabase } from './supabaseClient';

export interface StoredSummary {
    content: string;
    actionItems: (string | { text: string; assignee: string })[];
    timestamp: number;
}

const STORAGE_PREFIX = 'stokemeet_summary_';

// Local Storage Functions
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

// Supabase Storage Functions
export async function saveRemoteSummary(userId: string, meetingId: string, type: string, summary: StoredSummary): Promise<void> {
    try {
        const { error } = await supabase
            .from('SM_summaries')
            .upsert({
                user_id: userId,
                meeting_id: meetingId,
                meeting_type: type,
                content: summary.content,
                action_items: summary.actionItems,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, meeting_id, meeting_type' });

        if (error) throw error;
    } catch (error) {
        console.error('Failed to save summary to Supabase:', error);
        // Fallback to local storage if remote save fails
        saveSummary(meetingId, type, summary);
    }
}

export async function loadRemoteSummary(userId: string, meetingId: string, type: string): Promise<StoredSummary | null> {
    try {
        const { data, error } = await supabase
            .from('SM_summaries')
            .select('content, action_items, updated_at')
            .eq('user_id', userId)
            .eq('meeting_id', meetingId)
            .eq('meeting_type', type)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No data found
            // Fallback to local storage if remote load fails or not found? 
            // Actually, if it's not found remotely, we might still want to check local.
            return loadSummary(meetingId, type);
        }

        if (data) {
            // Check if remote is newer than local? 
            // For now, let's just prefer remote if available.
            return {
                content: data.content,
                actionItems: data.action_items,
                timestamp: new Date(data.updated_at).getTime()
            };
        }
        return loadSummary(meetingId, type);
    } catch (error) {
        console.warn('Failed to load summary from Supabase:', error);
        // Fallback to local storage
        return loadSummary(meetingId, type);
    }
}
