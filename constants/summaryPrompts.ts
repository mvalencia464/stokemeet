import { MeetingType } from '../types';

export const SUMMARY_SYSTEM_PROMPTS: Record<MeetingType, string> = {
  [MeetingType.CHRONOLOGICAL]: `Focus on a chapter-by-chapter summary of the meeting. Break the transcript into distinct topics or time segments and provide a short summary for each. Keep it concise and chronological.`,

  [MeetingType.GENERAL]: `Focus on the discovery process and insights. Capture any call's insights and key takeaways. Identify major discussion points, decisions made, and key action items without requiring a specific framework.`,

  [MeetingType.SALES]: `Focus on the discovery process. Identify the prospect's primary needs, the specific business challenges they are facing, and where they currently sit in their buying journey (e.g., researching, comparing, ready to buy).`,

  [MeetingType.SALES_SANDLER]: `Analyze the call using the Sandler Selling System. Specifically identify: 1. Pain (The emotional/business reason for change), 2. Budget (Ability and willingness to pay), and 3. Decision (Who, how, and when the decision is made).`,

  [MeetingType.SALES_SPICED]: `Summarize using the SPICED framework: Situation (Context), Pain (The problem), Impact (Consequences of the pain), Critical Event (The deadline), and Decision Criteria.`,

  [MeetingType.SALES_MEDDPICC]: `Extract details for: Metrics (Economic impact), Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identified Pain, Champions, and Competition.`,

  [MeetingType.SALES_BANT]: `Identify the four pillars of BANT: Budget (Is there a budget?), Authority (Who has the final say?), Need (What is the core problem?), and Timeline (When do they need a solution?).`,

  [MeetingType.QA]: `Identify every distinct question asked during the session and provide the corresponding answer given. Format as a clean List of Questions and Answers.`,

  [MeetingType.DEMO]: `Highlight the features or workflows showcased during the demo. Record the prospect's reaction to each feature and the specific business impact/value they associated with those features.`,

  [MeetingType.CUSTOMER_SUCCESS]: `Focus on the customer's health. Identify their current experience with the product, specific technical or business challenges mentioned, their short-term goals, and any questions they asked.`,

  [MeetingType.CUSTOMER_SUCCESS_REACH]: `Summarize using the REACH™ framework: Retention signals, Expansion opportunities, Adoption levels, Community involvement, and Health score indicators.`,

  [MeetingType.ONE_ON_ONE]: `Summarize the interaction focusing on: Employee updates, top priorities for the week, signals where support/coaching is needed, and a list of feedback exchanged.`,

  [MeetingType.PROJECT_UPDATE]: `Create a status report. For every task mentioned, identify its current Status (On track/Blocked/Done), a summary of the discussion around it, and the specific next steps.`,

  [MeetingType.PROJECT_KICK_OFF]: `Summarize the project launch details: The overarching Vision, specific Targets/KPIs, assigned Resources/Teams, and the immediate timeline.`,

  [MeetingType.CANDIDATE_INTERVIEW]: `Evaluate the candidate based on the transcript. Summarize their relevant experience, their stated career goals, and their specific responses to technical or behavioral questions.`,

  [MeetingType.RETROSPECTIVE]: `Organize the summary into three categories: Start (New processes to implement), Stop (Inefficiencies to remove), and Continue (Successes to double down on).`,

  [MeetingType.STAND_UP]: `Extract the three standard stand-up components for each participant: 1. What was done yesterday, 2. What is being done today, and 3. Any obstacles or 'blockers' in the way.`,

  [MeetingType.CUSTOM]: `Apply the custom framework instructions provided by the user.`,
};
