
import { GoogleGenAI, Type } from "@google/genai";
import { TakeawaySection, SummaryTemplate } from "../types";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMeetingTakeaways = async (
  transcript: string,
  template: SummaryTemplate
): Promise<{ summary: string; takeaways: TakeawaySection[] }> => {
  const ai = getGeminiClient();

  const prompt = `
    Analyze the following meeting transcript. The transcript contains [MM:SS] markers.
    Template Style: ${template}
    
    Structure the output strictly following this hierarchy:

    I. **Meeting Purpose**
       - Primary Objective: A clear, definitive statement of why the meeting occurred. (Map this to the 'summary' field).

    II. **Key Takeaways**
       - High-level critical points.
       - **CRITICAL FORMAT**: Every item MUST follow "Label: Description" pattern.
       - Label = 2-5 words that summarize the point (will be bolded in UI).
       - Example: "Sales Campaign: Launching a campaign to revive ~445 pending proposals with a 4-12% discount..."

    III. **Topics & Discussions**
       - Break down into logical sub-categories (A, B, C...).
       - **CRITICAL FORMAT**: Each detailed item MUST follow "Label: Description" pattern.
       - Support 3 LEVELS OF DEPTH:
         - Level 1: Main Topic (e.g. "A. Client & Team Issues")
         - Level 2: Specific Issue with Label format (e.g. "Demo Material Error: $1,000-$1,100 in new material...")
         - Level 3: Details/Resolution with Label format (e.g. "Resolution: Provide new material by EOW")

    IV. **Next Steps**
       - **CRITICAL JSON STRUCTURE**: 
         - Section title = "IV. Next Steps" (DO NOT include person names in title)
         - Each person is a SEPARATE ITEM with text = person's name
         - That person's tasks are nested in the "items" array of that person
       - **EXAMPLE JSON**:
         {
           "title": "IV. Next Steps",
           "type": "checklist",
           "items": [
             {
               "text": "Mauricio",
               "items": [
                 { "text": "Export pending proposals to Google Sheets." },
                 { "text": "Create How-To video for AI vetting tool." }
               ]
             },
             {
               "text": "Andrew",
               "items": [
                 { "text": "Clear 'Waiting on Andrew' list by EOW." },
                 { "text": "Initiate client outreach." }
               ]
             }
           ]
         }

    **Example Output**:
    "
    I. Meeting Purpose
    Primary Objective: To strategize a sales campaign...

    II. Key Takeaways
    Sales Campaign: Launching a campaign to revive ~445 pending proposals with a 4-12% discount (defaulting to 7%) and a Dec 20 expiration.
    AI-Assisted Vetting: Mauricio will build an AI tool to help Jordan vet proposals for profitability before sending.
    
    III. Topics & Discussions
    A. Client & Team Issues
    Demo Material Error: $1,000-$1,100 in new material to be provided after demo material was accidentally discarded.
    Permit Runner Conflict: Decided to automate the role after current runner expressed dissatisfaction despite ~$160/hr rate.
    
    IV. Next Steps
    Mauricio
    [ ] Export pending proposals to Google Sheets.
    [ ] Create How-To video for AI vetting tool.
    Andrew
    [ ] Clear 'Waiting on Andrew' list by EOW.
    "

    Constraint: Be very detailed. Capture specific numbers, names, and technical details.
    For timestamps: extract the most relevant [MM:SS] and convert to seconds.
    
    Format as JSON matching the schema.
    
    Transcript:
    ${transcript}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Meeting Purpose" },
          takeaways: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['bullets', 'checklist'] },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      timestamp: { type: Type.NUMBER, description: "Seconds from start" },
                      items: {
                        type: Type.ARRAY,
                        description: "Nested items (e.g. tasks for a person, or details for a topic)",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            text: { type: Type.STRING },
                            timestamp: { type: Type.NUMBER }
                          },
                          required: ["text"]
                        }
                      }
                    },
                    required: ["text"]
                  }
                }
              },
              required: ["title", "items", "type"]
            }
          }
        },
        required: ["summary", "takeaways"]
      }
    }
  });

  try {
    return JSON.parse((response as any).text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { summary: "Analysis failed.", takeaways: [] };
  }
};

export const askStokeMeet = async (
  transcript: string,
  question: string
): Promise<string> => {
  const ai = getGeminiClient();

  const prompt = `
  Context(Meeting Transcript):
    ${transcript}

  Question: ${question}

    Answer the question based ONLY on the provided transcript.If the information is not present, say you don't know. 
    Be concise and professional.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt
    });
    return (result as any).text || "No response generated.";
  } catch (e) {
    console.error("Ask StokeMeet failed", e);
    return "I'm sorry, I couldn't process that question right now.";
  }
};
