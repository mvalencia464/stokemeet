
import { MeetingType } from './types';

export const MEETING_TYPES_CONFIG: Record<MeetingType, { description: string }> = {
  [MeetingType.CHRONOLOGICAL]: { description: 'Short summary of the meeting by chapter.' },
  [MeetingType.GENERAL]: { description: "Capture any call's insights and key takeaways." },
  [MeetingType.SALES]: { description: "Unpack a prospect's needs, challenges, and buying journey." },
  [MeetingType.SALES_SANDLER]: { description: 'Notes based on Sandler Selling System.' },
  [MeetingType.SALES_SPICED]: { description: 'Notes based on the sales methodology by Winning by Design.' },
  [MeetingType.SALES_MEDDPICC]: { description: 'Notes based on the popular sales methodology.' },
  [MeetingType.SALES_BANT]: { description: 'Notes based on the popular sales methodology.' },
  [MeetingType.QA]: { description: 'Recap questions with answers.' },
  [MeetingType.DEMO]: { description: 'Showcased journeys and impact.' },
  [MeetingType.CUSTOMER_SUCCESS]: { description: 'Experiences, challenges, goals, and Q&A.' },
  [MeetingType.CUSTOMER_SUCCESS_REACH]: { description: 'Notes based on an expansion framework by HelloCCO.' },
  [MeetingType.ONE_ON_ONE]: { description: 'Updates, priorities, support signals, and discussion.' },
  [MeetingType.PROJECT_UPDATE]: { description: "Breakdown each task's status, discussion, and next steps." },
  [MeetingType.PROJECT_KICK_OFF]: { description: 'Vision, targets, and resources.' },
  [MeetingType.CANDIDATE_INTERVIEW]: { description: "Delve into a candidate's experience, goals, and responses." },
  [MeetingType.RETROSPECTIVE]: { description: 'Capture processes to start, stop, and continue.' },
  [MeetingType.STAND_UP]: { description: 'Track daily progress, tasks, and obstacles.' },
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
