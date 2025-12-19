
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
    
    Tasks:
    1. Create a concise executive summary paragraph.
    2. Identify key decisions, action items (with owners), and next steps.
    3. For every item identified, extract the most relevant timestamp from the [MM:SS] markers in the transcript.
    4. Convert the [MM:SS] format to total seconds (e.g., [01:30] = 90).
    
    Constraint: Do NOT return items as a single long text block. Each point must be a separate object in the 'items' array.
    
    Format the response as a structured JSON.
    
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
          summary: { type: Type.STRING },
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
                      timestamp: { type: Type.NUMBER, description: "Seconds from the start of the meeting." }
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
    Context (Meeting Transcript):
    ${transcript}

    Question: ${question}

    Answer the question based ONLY on the provided transcript. If the information is not present, say you don't know. 
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
