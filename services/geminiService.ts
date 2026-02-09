
import { GoogleGenAI, Type, Chat, GenerateContentParameters } from "@google/genai";
import { PatientState, AssessmentResult, MedicalImage } from "../types";

export const analyzeConstraints = async (patient: PatientState, image?: MedicalImage): Promise<AssessmentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const textPart = {
    text: `
      Act as the Abythral Medical Engine (AFCE-M).
      Analyze the patient's systemic health state-space.
      
      PATIENT DATA:
      - Name: ${patient.name}
      - Age: ${patient.age}
      - Variability Index: ${patient.variabilityIndex}
      - Recovery Half-Life: ${patient.recoveryHalfLife}s
      - Domain Data: ${JSON.stringify(patient.domains)}
      
      ${image ? `VISUAL DATA ATTACHED: ${image.label}. Please ground your assessment in both the systemic data and this visual evidence (e.g., PET scan, cytometry chart).` : ''}

      Provide a detailed assessment in JSON format:
      1. summary: Global physiological geometry summary.
      2. risks: Array of {domain, finding, level} for the 6 domains.
      3. interventions: Array of strings.
      4. visualGrounding: (If image provided) A specific analysis of how the visual evidence confirms or shifts the state-space prediction.
    `
  };

  const contents: any[] = [{ parts: [textPart] }];
  
  if (image) {
    contents[0].parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  domain: { type: Type.STRING },
                  finding: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] }
                },
                required: ['domain', 'finding', 'level']
              }
            },
            interventions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            visualGrounding: { type: Type.STRING }
          },
          required: ['summary', 'risks', 'interventions']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const createChatSession = (patient: PatientState) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const systemInstruction = `
    You are the Abythral Medical Engine (AFCE-M) core intelligence.
    Expertise: Systems biology, molecular dynamics, systemic homeostasis.
    Style: Scientific, system-oriented, "state-space" terminology.
    
    You can now process multi-modal inputs. If a clinician uploads a scan (PET, MRI, Flow Cytometry), ground your reasoning in the visual evidence and explain how it maps to the patient's current flexibility/rigidity indices.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });
};
