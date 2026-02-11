
import { GoogleGenAI } from "@google/genai";
import { MeetingType } from "../types";

/// <reference types="vite/client" />

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateMeetingSummary(transcript: string, type: MeetingType): Promise<{ content: string, actionItems: string[] }> {
  const prompt = `
    You are an expert meeting analyst for StokeMeet. Based on the transcript provided, generate a detailed meeting summary using the following framework: **${type}**.
    
    Transcript:
    """
    ${transcript}
    """
    
    Instructions:
    1. Structure the output EXACTLY as shown below.
    2. Extract specific details, numbers, dates, and names.
    3. Use professional, concise language.
    4. Format the "Action Items" section very specifically with checkable markdown boxes.
    
    Output Format (Markdown):
    # ${type} Summary
    
    **Meeting Date:** [Date from transcript or 'N/A']
    **Attendees:** [List specific names mentioned or speakers]
    
    ## VIEW RECORDING - [Duration if known, else 'See Video']
    *(No highlights)*
    
    ## Meeting Purpose
    [One distinct sentence explaining the primary goal of the meeting.]
    
    ## Key Takeaways
    [Provide a few high-level bullet points summarizing the most critical outcomes.]
    *   **[Topic Name/Category]:** [Detailed point explaining the takeaway, specific figures, and decisions.]
    *   **[Topic Name/Category]:** [Detailed point...]
    
    ## Topics
    ### [Major Topic 1]
    [Brief intro or context if needed]
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
