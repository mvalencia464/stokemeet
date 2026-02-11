
import { GoogleGenAI } from "@google/genai";
import { MeetingType } from "../types";
import { MEETING_TYPES_CONFIG } from "../constants";

/// <reference types="vite/client" />

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateMeetingSummary(
  transcript: string,
  type: MeetingType | string,
  meetingDate?: string,
  attendeeNames?: string[],
  customSystemPrompt?: string
): Promise<{ content: string, actionItems: { text: string; assignee: string }[] }> {
  const attendeeList = attendeeNames && attendeeNames.length > 0
    ? attendeeNames.join(', ')
    : 'Not specified';

  // Get the system prompt from config or use custom one
  const config = MEETING_TYPES_CONFIG[type as MeetingType];
  const frameworkInstruction = customSystemPrompt || config?.systemPrompt || 'Provide a clear, structured summary of the meeting.';
  const displayType = customSystemPrompt ? type : type;

  const prompt = `
    You are an expert meeting analyst for StokeMeet. Based on the transcript provided, generate a clean, structured meeting summary.
    
    Framework Instructions: ${frameworkInstruction}
    
    Meeting Metadata:
    - Date: ${meetingDate || 'Not specified'}
    - Attendees: ${attendeeList}
    - Summary Type: ${displayType}
    
    Transcript:
    """
    ${transcript}
    """
    
    Instructions:
    1. Apply the framework instructions above to guide your analysis and summary structure.
    2. Use the provided date and attendee names - DO NOT try to infer them from the transcript.
    3. When assigning action items in the "Next Steps" section, ONLY use names from the attendee list provided above.
    4. Extract specific details, numbers, and decisions from the transcript.
    5. Start with a "glanceable" Executive Summary in a blockquote.
    6. Format the "Action Items" section with checkable markdown boxes.
    7. Tone: Professional, concise, and modern.
    
    Output Format (Markdown):
    # ${displayType} Summary
    
    > **Executive Summary:** [A 2-3 sentence high-level overview of the meeting's core value and decisions. Make this punchy and useful.]
    
    **Date:** ${meetingDate || 'Not specified'}
    **Attendees:** ${attendeeList}
    
    ## Purpose
    [One distinct sentence explaining the primary goal of the meeting.]
    
    ## Key Takeaways
    [Provide a few high-level bullet points summarizing the most critical outcomes.]
    *   **[Topic Name/Category]:** [Detailed point explaining the takeaway, specific figures, and decisions.]
    *   **[Topic Name/Category]:** [Detailed point...]
    
    ## Topics & Discussion
    ### [Major Topic 1]
    [Brief intro or context if needed]
    *   **[Sub-point]:** [Detail about specific discussion points, conflicts, or resolutions.]
    *   **[Sub-point]:** [Detail...]
    
    ### [Major Topic 2]
    *   **[Sub-point]:** [Detail...]
    
    ## Next Steps
    **[Person Name from attendee list]:**
    *   [Task 1]
    *   [Task 2]
    
    **[Another person from attendee list]:**
    *   [Task 1]
    
    ## Action Items
    - [ ] [Specific, actionable task] - [Assignee name from attendee list] - WATCH (5 secs)
    - [ ] [Specific, actionable task] - [Assignee name from attendee list] - WATCH (5 secs)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text || "Failed to generate summary.";

    // Parse action items and extract assignee names
    // Expected format: - [ ] [Task description] - [Assignee Name] - WATCH (5 secs)
    const actionItems: { text: string; assignee: string }[] = [];
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('* [ ]')) {
        const cleaned = line.replace(/[-*]\s*\[\s*\]\s*/, '').trim();

        // Try to extract assignee (format: task - assignee - WATCH)
        const parts = cleaned.split(' - ');
        if (parts.length >= 2) {
          const task = parts[0].trim();
          const assignee = parts[1].trim();
          actionItems.push({ text: task, assignee });
        } else {
          // Fallback if no assignee found
          actionItems.push({ text: cleaned, assignee: 'Unassigned' });
        }
      }
    });

    return {
      content: text,
      actionItems
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      content: "Error generating content. Please check your API key and connection.",
      actionItems: []
    };
  }
}

export async function askMeetingQuestion(transcript: string, question: string): Promise<string> {
  const prompt = `
    You are an intelligent meeting assistant for StokeMeet.
    
    Context (Meeting Transcript):
    """
    ${transcript}
    """
    
    User Question: "${question}"
    
    Instructions:
    1. Answer the question specifically based on the provided transcript.
    2. If the answer is not in the transcript, state that clearly.
    3. Keep the answer concise and direct.
    4. If there were specific quotes, you can reference them.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text || "I couldn't generate an answer at this time.";
  } catch (error) {
    console.error("Gemini Q&A Error:", error);
    return "Sorry, I encountered an error while processing your question.";
  }
}

export async function generateFollowUpEmail(
  summaryContent: string,
  actionItems: { text: string; assignee: string }[],
  userName: string,
  meetingUrl?: string
): Promise<string> {
  const prompt = `
    You are an expert meeting assistant for StokeMeet. Generate a casual, professional follow-up email based on the meeting summary and action items provided.
    
    Meeting Summary:
    """
    ${summaryContent}
    """
    
    Action Items:
    ${actionItems.map(item => `- ${item.assignee}: ${item.text}`).join('\n')}
    
    User's Name: ${userName}
    Meeting URL: ${meetingUrl || 'N/A'}
    
    Instructions:
    1. Create a casual, friendly follow-up email
    2. Start with "Subject: Action items from today's call"
    3. Use a casual greeting like "Hey team,"
    4. Include a brief opening line referencing the meeting energy/vibe
    5. List "My action items:" (only items assigned to ${userName})
    6. Add a "Key callouts:" section with 3-4 bullet points from the summary
    7. End with a brief closing and the user's signature
    8. Add "P.S. You can view the StokeMeet recording of our meeting here: [URL]" if URL is provided
    9. Tone: Casual, upbeat, professional but friendly
    
    Output the complete email text ready to copy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text || "Could not generate follow-up email.";
  } catch (error) {
    console.error("Gemini Email Generation Error:", error);
    return "Sorry, I encountered an error while generating the email.";
  }
}
