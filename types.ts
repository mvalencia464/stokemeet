
export interface TakeawayItem {
  text: string;
  timestamp?: number; // in seconds
  items?: TakeawayItem[];
}

export interface TakeawaySection {
  title: string;
  items: TakeawayItem[];
  type: 'bullets' | 'checklist';
}

export interface Meeting {
  id: string;
  title: string;
  timestamp: number;
  transcript: string;
  summary?: string;
  takeaways?: TakeawaySection[];
  duration: number; // in seconds
  audioData?: Blob | string;
  videoData?: Blob | string;
}

export type SummaryTemplate = 'Standard' | 'Executive' | 'Technical' | 'Sales' | 'Conflict Resolution';

export interface AppState {
  meetings: Meeting[];
  isRecording: boolean;
  currentMeetingId: string | null;
}
