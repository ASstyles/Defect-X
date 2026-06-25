import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [googleAI(apiKey ? { apiKey } : undefined)],
  model: 'googleai/gemini-2.5-flash',
});

/**
 * Executes a Genkit prompt action with automatic retries, exponential backoff, and
 * fallback to alternative model options if the primary model is unavailable.
 */
export async function runWithRetry<I, O>(
  promptFn: (input: I, options?: any) => Promise<{ output?: O | null }>,
  input: I,
  retries = 2,
  delay = 1000,
  models = ['googleai/gemini-2.5-flash', 'googleai/gemini-2.0-flash', 'googleai/gemini-2.5-flash-lite', 'googleai/gemini-2.0-flash-lite']
): Promise<{ output?: O | null }> {
  for (const model of models) {
    for (let r = 0; r < retries; r++) {
      try {
        return await promptFn(input, { model });
      } catch (error: any) {
        const errorStr = (String(error) + " " + String(error.message || "") + " " + String(error.status || "")).toUpperCase();
        const isTransient = 
          errorStr.includes('503') || 
          errorStr.includes('UNAVAILABLE') || 
          errorStr.includes('429') ||
          errorStr.includes('RESOURCE_EXHAUSTED') ||
          errorStr.includes('HIGH DEMAND') ||
          errorStr.includes('TEMPORARY') ||
          error.status === 503 ||
          error.status === 429;

        if (isTransient && (r < retries - 1 || model !== models[models.length - 1])) {
          const currentDelay = delay * Math.pow(2, r);
          console.warn(`Transient API error on model ${model}. Retrying in ${currentDelay}ms... (Attempt ${r + 1}/${retries}). Error:`, error.message || error);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        } else if (!isTransient) {
          throw error;
        }
      }
    }
    console.warn(`Model ${model} failed all attempts. Trying fallback model...`);
  }
  throw new Error("All Google Gemini models (2.5, 2.0, 1.5) are currently experiencing high demand. Please try again in a few moments.");
}
