
import { GoogleGenAI } from "@google/genai";
import { MeetingType } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateMeetingSummary(transcript: string, type: MeetingType): Promise<{ content: string, actionItems: string[] }> {
  const prompt = `
    You are an expert meeting analyst. Based on the transcript provided, generate a detailed meeting summary using the following framework: **${type}**.
    
    Transcript:
    """
    ${transcript}
    """
    
    Instructions:
    1. Structure the output EXACTLY as shown below.
    2. Extract specific details, numbers, dates, and names.
    3. Use professional, concise language.
    
    Output Format (Markdown):
    # ${type} Summary
    
    **Meeting Date:** [Date from transcript or 'N/A']
    **Attendees:** [List specific names mentioned or speakers]
    
    ## VIEW RECORDING - [Duration if known, else 'See Video']
    *(No highlights)*
    
    ## Meeting Purpose
    [One distinct sentence explaining the primary goal of the meeting.]
    
    ## Key Takeaways
    *   **[Topic Name/Category]:** [Detailed point explaining the takeaway, specific figures, and decisions.]
    *   **[Topic Name/Category]:** [Detailed point...]
    *   **[Topic Name/Category]:** [Detailed point...]
    
    ## Topics
    ### [Major Topic 1]
    *   **[Sub-point]:** [Detail about specific discussion points, conflicts, or resolutions.]
    *   **[Sub-point]:** [Detail...]
    
    ### [Major Topic 2]
    *   **[Sub-point]:** [Detail...]
    
    ## Next Steps
    **[Person Name 1]:**
    *   [Task 1]
    *   [Task 2]
    
    **[Person Name 2]:**
    *   [Task 1]
    
    ## Action Items
    - [ ] [Specific, actionable task] - WATCH (5 secs)
    - [ ] [Specific, actionable task] - WATCH (5 secs)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text || "Failed to generate summary.";

    // Simple parsing logic for action items if they are in the text
    const actionItems: string[] = [];
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('* [ ]')) {
        actionItems.push(line.replace(/[-*]\s*\[\s*\]\s*/, '').trim());
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
