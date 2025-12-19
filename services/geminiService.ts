
import { GoogleGenAI, Type } from "@google/genai";
import { TakeawaySection, SummaryTemplate } from "../types";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMeetingTakeaways = async (
  transcript: string,
  template: SummaryTemplate,
  duration: number
): Promise<{ summary: string; takeaways: TakeawaySection[] }> => {
  const ai = getGeminiClient();

  const prompt = `
    Analyze the following meeting transcript. The transcript contains [MM:SS] markers.
    Total Meeting Duration: ${duration} seconds.
    Template Style: ${template}
    
    **CRITICAL OBJECTIVES**:
    1. **EXTRACT TIMESTAMPS**: For EVERY SINGLE item (Key Takeaway, Topic Detail, Action Item), you MUST extract the most relevant timestamp from the transcript and include it in the JSON as 'timestamp' (in total seconds).
    2. **VALIDATE TIMESTAMPS**: 
       - All timestamps MUST be <= ${duration}. 
       - If a specific timestamp is unclear for a "Next Step", use the timestamp of the discussion that led to it.
       - DO NOT simply increment timestamps arbitrarily. If you cannot find a source, do not invent one > ${duration}.
    3. **DETAIL & PRECISION**: Capture specific numbers, dollar amounts, names, and technical specs. Avoid vague summaries.
    4. **STRICT HIERARCHY**: Follow the section structure below exactly.

    **Structure:**

    I. **Meeting Purpose** (Map to 'summary')
       - A clear, definitive statement of why the meeting occurred.

    II. **Key Takeaways**
       - High-level critical points.
       - **FORMAT**: "Label: Description" (e.g. "Sales Campaign: Launching a campaign...")
       - **TIMESTAMP**: Required.

    III. **Topics & Discussions**
       - Break down into logical sub-categories.
       - **DEPTH**: Use 3 levels of nesting:
         - Level 1: Main Topic (e.g. "A. Client Issues") - *Timestamp optional*
         - Level 2: Specific Issue (e.g. "Demo Material: $1k lost...") - **TIMESTAMP REQUIRED**
         - Level 3: Resolution/Details (e.g. "Action: Re-print by Friday") - **TIMESTAMP REQUIRED**

    IV. **Next Steps**
       - **TYPE**: Must be "checklist".
       - **STRUCTURE**: 
         - Top Level: Person's Name (e.g. "Mauricio")
         - Nested Items: The specific Action Items/Tasks (e.g. "Export list").
       - **TIMESTAMP**: Required for the specific tasks.

    **Example Output JSON Structure**:
    {
      "summary": "...",
      "takeaways": [
        {
          "title": "II. Key Takeaways",
          "type": "bullets",
          "items": [
            { "text": "Label: Content...", "timestamp": 65 }
          ]
        },
        {
          "title": "III. Topics & Discussions",
          "type": "bullets",
          "items": [
            {
              "text": "A. Main Topic",
              "items": [
                 { 
                   "text": "Issue: Description...", "timestamp": 120,
                   "items": [ { "text": "Resolution: ...", "timestamp": 140 } ]
                 }
              ]
            }
          ]
        },
        {
          "title": "IV. Next Steps",
          "type": "checklist",
          "items": [
            {
              "text": "Mauricio",
              "items": [
                { "text": "Task 1...", "timestamp": 200 }
              ]
            }
          ]
        }
      ]
    }

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
                        description: "Nested Level 2 items",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            text: { type: Type.STRING },
                            timestamp: { type: Type.NUMBER },
                            items: {
                                type: Type.ARRAY,
                                description: "Nested Level 3 items",
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
