
export enum MeetingType {
  CHRONOLOGICAL = 'Chronological',
  GENERAL = 'General',
  SALES = 'Sales',
  SALES_SANDLER = 'Sales - Sandler',
  SALES_SPICED = 'Sales - SPICED',
  SALES_MEDDPICC = 'Sales - MEDDPICC',
  SALES_BANT = 'Sales - BANT',
  QA = 'Q&A',
  DEMO = 'Demo',
  CUSTOMER_SUCCESS = 'Customer Success',
  CUSTOMER_SUCCESS_REACH = 'Customer Success - REACH™',
  ONE_ON_ONE = 'One-on-One',
  PROJECT_UPDATE = 'Project Update',
  PROJECT_KICK_OFF = 'Project Kick-Off',
  CANDIDATE_INTERVIEW = 'Candidate Interview',
  RETROSPECTIVE = 'Retrospective',
  STAND_UP = 'Stand Up',
  CUSTOM = 'Custom'
}

export interface CustomSummaryProfile {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  name: string;
  email?: string;
  role?: string;
  linkedIn?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  timestamp?: string;
  completed: boolean;
}

export interface MeetingData {
  id: string;
  title: string;
  date: string;
  duration: string;
  attendees: Attendee[];
  transcript: string;
  summaryContent: string;
  actionItems: ActionItem[];
  currentType: MeetingType | string;
  videoUrl?: string;
  customProfileId?: string;
}
