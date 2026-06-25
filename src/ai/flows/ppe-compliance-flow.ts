'use server';
/**
 * @fileOverview A Genkit flow for checking Personal Protective Equipment (PPE) compliance.
 * It analyzes an image of a worker to ensure they are wearing required safety gear.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const PPEComplianceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A selfie or photo of the worker, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PPEComplianceInput = z.infer<typeof PPEComplianceInputSchema>;

const PPECheckSchema = z.object({
  item: z.string().describe('The PPE item being checked (e.g., Hard Hat, Safety Glasses, High-Vis Vest).'),
  present: z.boolean().describe('Whether the item is detected on the person.'),
  comments: z.string().describe('Observations about the item (e.g., "Wearing correctly", "Missing", "Improperly worn").'),
});

const PPEComplianceOutputSchema = z.object({
  isCompliant: z.boolean().describe('Overall determination if the worker meets safety standards.'),
  checks: z.array(PPECheckSchema).describe('Individual checks for specific PPE items.'),
  summary: z.string().describe('Executive summary of the safety check and required actions.'),
});
export type PPEComplianceOutput = z.infer<typeof PPEComplianceOutputSchema>;

export async function checkPPECompliance(input: PPEComplianceInput): Promise<PPEComplianceOutput> {
  return ppeComplianceFlow(input);
}

const ppeCompliancePrompt = ai.definePrompt({
  name: 'ppeCompliancePrompt',
  input: {schema: PPEComplianceInputSchema},
  output: {schema: PPEComplianceOutputSchema},
  prompt: `You are an expert Safety Compliance Officer for a high-tech manufacturing facility.
Analyze the provided image to verify if the individual is wearing all required Personal Protective Equipment (PPE).

Required PPE checklist:
1. Hard Hat (Safety Helmet)
2. Safety Glasses or Goggles
3. High-Visibility (Reflective) Vest

Instructions:
- Examine the image closely for each item in the checklist.
- Set "present" to true only if the item is clearly visible and worn correctly.
- Provide specific comments for each check.
- The overall "isCompliant" status should be true ONLY if all three primary items (Hard Hat, Glasses, Vest) are detected and correctly worn.

Image to analyze: {{media url=photoDataUri}}`,
});

const ppeComplianceFlow = ai.defineFlow(
  {
    name: 'ppeComplianceFlow',
    inputSchema: PPEComplianceInputSchema,
    outputSchema: PPEComplianceOutputSchema,
  },
  async (input) => {
    const {output} = await runWithRetry(ppeCompliancePrompt, input);
    if (!output) {
      throw new Error('Failed to perform PPE compliance check.');
    }
    return output;
  }
);
