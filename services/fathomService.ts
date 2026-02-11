
export interface FathomAttendee {
  is_external: boolean;
  name: string;
  email: string;
}

export interface FathomActionItem {
  description: string;
  user_generated: boolean;
  completed: boolean;
  recording_timestamp: string;
  recording_playback_url: string;
  assignee: {
    name: string;
    email: string;
    team: string;
  };
}

export interface FathomTranscriptItem {
  speaker: {
    display_name: string;
    matched_calendar_invitee_email: string;
  };
  text: string;
  timestamp: string;
}

export interface FathomMeeting {
  url: string; // Used as unique identifier
  title: string;
  share_url: string;
  recording_id: number;
  created_at: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  recording_start_time: string;
  recording_end_time: string;
  meeting_type: string;
  transcript_language: string;
  calendar_invitees: FathomAttendee[];
  recorded_by: {
    name: string;
    email: string;
    team: string;
  };
  transcript?: FathomTranscriptItem[];
  default_summary?: {
    template_name: string;
    markdown_formatted: string;
  };
  action_items?: FathomActionItem[];
}

export interface FathomListResponse {
  items: FathomMeeting[];
  limit: number;
  next_cursor: string | null;
}

const API_KEY = import.meta.env.VITE_FATHOM_API_KEY || '';
const BASE_URL = '/api/fathom';

export async function listMeetings(cursor?: string): Promise<FathomListResponse> {
  const url = new URL(`${BASE_URL}/meetings`, window.location.origin);
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Api-Key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Fathom API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getMeetingTranscript(recordingId: number): Promise<FathomTranscriptItem[]> {
  const response = await fetch(`${BASE_URL}/recordings/${recordingId}/transcript`, {
    headers: { 'X-Api-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to fetch transcript');
  const data = await response.json();
  return data.transcript || [];
}

export async function getMeetingSummary(recordingId: number): Promise<FathomMeeting['default_summary']> {
  const response = await fetch(`${BASE_URL}/recordings/${recordingId}/summary`, {
    headers: { 'X-Api-Key': API_KEY }
  });
  if (!response.ok) return { template_name: 'Default', markdown_formatted: 'No summary available.' };
  const data = await response.json();
  return data.summary || { template_name: 'Default', markdown_formatted: 'No summary available.' };
}

// Renamed to reflect it returns more than just a thumbnail
export async function getFathomData(shareUrl: string): Promise<{ thumbnail_url: string | null, html: string | null }> {
  if (!shareUrl) return { thumbnail_url: null, html: null };

  try {
    const oembedUrl = `/api/oembed?url=${encodeURIComponent(shareUrl)}&format=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return { thumbnail_url: null, html: null };

    const data = await res.json();
    return {
      thumbnail_url: data.thumbnail_url || null,
      html: data.html || null
    };
  } catch (error) {
    console.warn('Failed to fetch Fathom oEmbed data:', error);
    return { thumbnail_url: null, html: null };
  }
}
