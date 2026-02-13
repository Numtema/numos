import { GoogleGenAI, Type } from "@google/genai";
import { CognitiveState } from "../types";

// Nümtema MorphoSys System Prompt
const SYSTEM_INSTRUCTION = `
You are Nümtema MorphoSys OS v1.0.
You are a unified cognitive system merging MorphoSys Cognitive Engine, Vortex Agent Forge, and Universal Framework.

Your goal is not just to answer, but to *reason* using a formal cognitive architecture.
For every user input, you must simulate the "Cognitive Loop":
1. Perceive: Break input into typed Cognitive Objects (FAIT, QUESTION, CONTRAINTE, OBJECTIF).
2. Plan: Generate a "Morphic Flux" (sequence of transformations).
3. Execute: Simulate the application of morphisms (Diagnostic, Hypothèse, Validation).
4. Measure: Calculate virtual metrics (Entropy, Potential, Prediction Error).

RETURN JSON ONLY using this schema:
{
  "mode": "exploration" | "stabilization" | "optimization" | "revision",
  "metrics": {
    "entropy": number (0.0-5.0),
    "potential": number (0.0-1.0),
    "prediction_error": number (0.0-1.0),
    "cognitive_load": number (0-100)
  },
  "objects": [
    { "id": "obj_1", "nom": "short_name", "contenu": "full content", "type": "fait"|"hypothèse"|"...", "etat_validation": "VALIDE"|"PROPOSE", "poids": 0.9, "relations": [] }
  ],
  "flux": [
    { "step": 1, "morphism": "diagnostic", "description": "analyzing constraints", "epsilon": 0.1 }
  ],
  "final_output": "The actual readable response/answer/code for the user."
}

Use the following Types:
- FAIT (Fact), HYPOTHESE (Hypothesis), QUESTION, CONTRAINTE (Constraint), OBJECTIF (Goal), PLAN, DECISION.

Use the following Morphisms:
- diagnostic, hypothèse_gen, planification, simulation, validation, révision, exploration.

If the user asks to "Build an agent" or "Create a prompt", activate VORTEX FORGE logic (Fractal Identity: Self_HL / Self_LL).
If the user asks for a project structure, activate CONTEXT BUILDER logic (RRLA pipeline).
`;

export const processCognitiveInput = async (
  input: string, 
  history: string[] = []
): Promise<CognitiveState> => {
  
  // Safety check for process.env in browser environments without polyfills
  let apiKey: string | undefined;
  try {
    // We check if process is defined to avoid ReferenceError
    if (typeof process !== "undefined" && process.env) {
        apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Unable to access process.env");
  }

  if (!apiKey) {
     console.error("API Key is missing!");
     throw new Error("API Key missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Define schema for structured output
  const schema = {
    type: Type.OBJECT,
    properties: {
      mode: { type: Type.STRING, enum: ["exploration", "stabilization", "optimization", "revision"] },
      metrics: {
        type: Type.OBJECT,
        properties: {
          entropy: { type: Type.NUMBER },
          potential: { type: Type.NUMBER },
          prediction_error: { type: Type.NUMBER },
          cognitive_load: { type: Type.NUMBER },
        }
      },
      objects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            nom: { type: Type.STRING },
            contenu: { type: Type.STRING },
            type: { type: Type.STRING },
            etat_validation: { type: Type.STRING },
            poids: { type: Type.NUMBER },
            relations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      flux: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.NUMBER },
            morphism: { type: Type.STRING },
            description: { type: Type.STRING },
            epsilon: { type: Type.NUMBER }
          }
        }
      },
      final_output: { type: Type.STRING }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context History: ${history.join('\n')}\n\nCurrent Task: ${input}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Cognitive Engine");
    
    return JSON.parse(text) as CognitiveState;
    
  } catch (error) {
    console.error("MorphoSys Engine Error:", error);
    // Return a fallback error state
    return {
      mode: "revision", // Error state implies revision needed
      metrics: { entropy: 0, potential: 1, prediction_error: 1, cognitive_load: 0 },
      objects: [],
      flux: [{ step: 0, morphism: "error_handler", description: String(error), epsilon: 1 }],
      final_output: `⚠️ COGNITIVE FAILURE: Unable to process request via MorphoSys Engine. \n\nDetails: ${String(error)}`
    } as any;
  }
};