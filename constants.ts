
import { MeetingType } from './types';

export interface MeetingTypeConfig {
  description: string;
  category?: 'Free' | 'Most Used' | 'Sales' | 'Customer Success' | 'Internal & Operations';
  systemPrompt: string;
}

export const MEETING_TYPES_CONFIG: Record<MeetingType, MeetingTypeConfig> = {
  [MeetingType.CHRONOLOGICAL]: {
    category: 'Free',
    description: 'Short summary of the meeting by chapter',
    systemPrompt: 'Focus on a chapter-by-chapter summary of the meeting. Break the transcript into distinct topics or time segments and provide a short summary for each. Keep it concise and chronological.'
  },
  [MeetingType.GENERAL]: {
    category: 'Most Used',
    description: "Capture any call's insights and key takeaways",
    systemPrompt: 'Focus on the discovery process and insights. Capture any call\'s insights and key takeaways. Identify major discussion points, decisions made, and key action items without requiring a specific framework.'
  },
  [MeetingType.SALES]: {
    category: 'Sales',
    description: "Unpack a prospect's needs, challenges, and buying journey",
    systemPrompt: 'Focus on the discovery process. Identify the prospect\'s primary needs, the specific business challenges they are facing, and where they currently sit in their buying journey (e.g., researching, comparing, ready to buy).'
  },
  [MeetingType.SALES_SANDLER]: {
    category: 'Sales',
    description: 'Notes based on Sandler Selling System',
    systemPrompt: 'Strictly follow the Sandler Selling System framework. Analyze the call and specifically identify: 1. Pain (The emotional/business reason for change), 2. Budget (Ability and willingness to pay), and 3. Decision (Who, how, and when the decision is made).'
  },
  [MeetingType.SALES_SPICED]: {
    category: 'Sales',
    description: 'Notes based on the SPICED sales methodology by Winning by Design',
    systemPrompt: 'Strictly follow the SPICED framework. Summarize using these exact categories: Situation (Context), Pain (The problem), Impact (Consequences of the pain), Critical Event (The deadline), and Decision Criteria.'
  },
  [MeetingType.SALES_MEDDPICC]: {
    category: 'Sales',
    description: 'Notes based on the MEDDPICC sales methodology',
    systemPrompt: 'Strictly follow the MEDDPICC framework. Extract details for: Metrics (Economic impact), Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identified Pain, Champions, and Competition.'
  },
  [MeetingType.SALES_BANT]: {
    category: 'Sales',
    description: 'Notes based on the BANT sales methodology',
    systemPrompt: 'Strictly follow the BANT framework. Identify the four pillars: Budget (Is there a budget?), Authority (Who has the final say?), Need (What is the core problem?), and Timeline (When do they need a solution?).'
  },
  [MeetingType.QA]: {
    category: 'Sales',
    description: 'Recap questions with answers',
    systemPrompt: 'Identify every distinct question asked during the session and provide the corresponding answer given. Format as a clean List of Questions and Answers.'
  },
  [MeetingType.DEMO]: {
    category: 'Sales',
    description: 'Showcased features, workflows, and prospect reactions',
    systemPrompt: 'Highlight the features or workflows showcased during the demo. Record the prospect\'s reaction to each feature and the specific business impact/value they associated with those features.'
  },
  [MeetingType.CUSTOMER_SUCCESS]: {
    category: 'Customer Success',
    description: 'Experiences, challenges, goals, and customer health indicators',
    systemPrompt: 'Focus on the customer\'s health. Identify their current experience with the product, specific technical or business challenges mentioned, their short-term goals, and any questions they asked.'
  },
  [MeetingType.CUSTOMER_SUCCESS_REACH]: {
    category: 'Customer Success',
    description: 'Notes based on REACH™ expansion framework by HelloCCO',
    systemPrompt: 'Strictly follow the REACH™ framework. Summarize using these exact categories: Retention signals, Expansion opportunities, Adoption levels, Community involvement, and Health score indicators.'
  },
  [MeetingType.ONE_ON_ONE]: {
    category: 'Internal & Operations',
    description: 'Updates, priorities, support signals, and feedback',
    systemPrompt: 'Summarize the interaction focusing on: Employee updates, top priorities for the week, signals where support/coaching is needed, and a list of feedback exchanged.'
  },
  [MeetingType.PROJECT_UPDATE]: {
    category: 'Internal & Operations',
    description: "Status report with task breakdown and next steps",
    systemPrompt: 'Create a status report. For every task mentioned, identify its current Status (On track/Blocked/Done), a summary of the discussion around it, and the specific next steps.'
  },
  [MeetingType.PROJECT_KICK_OFF]: {
    category: 'Internal & Operations',
    description: 'Vision, targets, resources, and timeline',
    systemPrompt: 'Summarize the project launch details: The overarching Vision, specific Targets/KPIs, assigned Resources/Teams, and the immediate timeline.'
  },
  [MeetingType.CANDIDATE_INTERVIEW]: {
    category: 'Internal & Operations',
    description: "Candidate experience, goals, and interview responses",
    systemPrompt: 'Evaluate the candidate based on the transcript. Summarize their relevant experience, their stated career goals, and their specific responses to technical or behavioral questions.'
  },
  [MeetingType.RETROSPECTIVE]: {
    category: 'Internal & Operations',
    description: 'Start, Stop, Continue framework for team processes',
    systemPrompt: 'Organize the summary into three categories: Start (New processes to implement), Stop (Inefficiencies to remove), and Continue (Successes to double down on).'
  },
  [MeetingType.STAND_UP]: {
    category: 'Internal & Operations',
    description: 'Daily progress, tasks, and blockers for each participant',
    systemPrompt: 'Extract the three standard stand-up components for each participant: 1. What was done yesterday, 2. What is being done today, and 3. Any obstacles or \'blockers\' in the way.'
  },
  [MeetingType.CUSTOM]: {
    description: 'Create a custom summary profile with your own instructions',
    systemPrompt: 'Apply the custom framework instructions provided by the user.'
  }
};

export const MOCK_TRANSCRIPT = `
Jordan: Hey everyone, thanks for joining the L10. We have a lot to cover regarding the end-of-year sales campaign.
Jackie: I have the dashboard pulled up. We have about 445 pending proposals.
Andrew: Some of those are duplicates though, we should clean that up.
Mauricio: I can export those to a Google Sheet for us to vet.
Jordan: Good. We need to hit that $10k decking purchase quota. Let's offer a discount to move these along. 4 to 12 percent, maybe 7 as a default.
Mauricio: I can build an AI tool to help vet these for profitability so Jordan doesn't have to manually check every single one.
Jordan: Exactly, like that McNeil project. The material cost was huge on that cedar roof. I don't want to discount those tight margin jobs.
Jackie: What about the permit runner?
Jordan: He's gone. Replacing that with AI automation. Jackie, you test the e-plan process.
Andrew: I'll clear my "Waiting on Andrew" list by Friday.
Mauricio: I'll handle the export today.
`;

export const MOCK_SUMMARY_BANT = `
### Budget
* Jordan wants to review and possibly reduce/adjust ad spend due to seasonality; card on Google Ads lapsed for ~2 weeks and was just updated. Considering whether to keep spending on Google and potentially add Facebook/Instagram.
* Winter promo plan: offer 4–10% discounts (likely default 7%) on older proposals to pull revenue forward before prices rise in spring. Target is to lock in decking purchases and quotas by year-end.

### Authority
* Jordan Webb (Freedom Brothers / Deck Masters): ultimate decision-maker; sets pricing strategy, discount windows, marketing budget posture.
* Andrew (sales): drives outreach, proposal cleanup, and client comms.
* Jackie (ops/admin): manages JobTread dashboards, metrics, proposal list curation.
* Mauricio (Stoke Leads): advisor/implementer on JobTread data, automation/AI.

### Need and Impact
* Need to revive ~445–545 open/pending proposals with a time-bound discount to drive signings before 12/20.
* Clean proposal hygiene: decline duplicates, keep newest live.
* Margin protection: avoid discounting already-tight jobs.

### Timeline
* Discount campaign: send updated proposals ASAP; all out by end of month; discount expiration set to December 20.
* Andrew to finish "Waiting on Andrew" backlog by end of this week.
`;
