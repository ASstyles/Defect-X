'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing detected manufacturing defects.
 * It classifies defect severity, identifies probable root causes, assesses potential impacts,
 * and suggests actions to be taken, using both textual descriptions and visual image data.
 *
 * - defectInsightAnalysis - A function that triggers the defect analysis process.
 * - DefectInsightAnalysisInput - The input type for the defectInsightAnalysis function.
 * - DefectInsightAnalysisOutput - The return type for the defectInsightAnalysis function.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const DefectInsightAnalysisInputSchema = z.object({
  defectType: z
    .string()
    .describe('The category of the detected defect (e.g., Cracks, Scratches, Dents, Corrosion).'),
  defectDescription: z
    .string()
    .describe(
      'Detailed description of the defect, including measurements if available (e.g., "Crack Length: 3.2 cm", "Dent Depth: 1.5 mm", "Surface irregularity: visible discoloration and pitting").'
    ),
  productType: z
    .string()
    .describe(
      'The type of product being inspected (e.g., "Automotive Chassis", "Electronic Circuit Board", "Plastic Casing").'
    ),
  material: z
    .string()
    .describe('The material of the product (e.g., "Steel", "Aluminum", "FR4 PCB", "ABS Plastic").'),
  manufacturingProcess: z
    .string()
    .describe(
      'The manufacturing process used (e.g., "Welding", "Injection Molding", "CNC Machining", "Wave Soldering").'
    ),
  environmentalConditions: z
    .string()
    .optional()
    .describe(
      'Optional: Current environmental conditions during manufacturing, if known (e.g., "High Humidity", "Low Temperature").'
    ),
  historicalContext: z
    .string()
    .optional()
    .describe(
      'Optional: Any relevant historical data or known issues related to this product, machine, or process.'
    ),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the defect, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DefectInsightAnalysisInput = z.infer<
  typeof DefectInsightAnalysisInputSchema
>;

const DefectInsightAnalysisOutputSchema = z.object({
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']).describe('The classified severity of the defect.'),
  severityReason: z.string().describe('A brief explanation for the assigned severity level.'),
  rootCause: z.string().describe('The probable root cause of the defect based on the provided information.'),
  potentialImpact: z
    .string()
    .describe(
      'An assessment of the potential impact of this defect on product functionality, safety, or longevity.'
    ),
  suggestedAction: z.string().describe('Recommended immediate actions or next steps to address the defect.'),
});
export type DefectInsightAnalysisOutput = z.infer<
  typeof DefectInsightAnalysisOutputSchema
>;

export async function defectInsightAnalysis(
  input: DefectInsightAnalysisInput
): Promise<DefectInsightAnalysisOutput> {
  return defectInsightAnalysisFlow(input);
}

const defectInsightAnalysisPrompt = ai.definePrompt({
  name: 'defectInsightAnalysisPrompt',
  input: {schema: DefectInsightAnalysisInputSchema},
  output: {schema: DefectInsightAnalysisOutputSchema},
  prompt: `You are an expert quality engineer specializing in manufacturing defect analysis.
Your task is to analyze a detected defect and provide a comprehensive assessment.

Based on the provided information and the image of the defect (if provided), determine the defect's severity, its probable root cause, its potential impact, and suggest immediate actions.

Defect Type: {{{defectType}}}
Defect Description: {{{defectDescription}}}
Product Type: {{{productType}}}
Material: {{{material}}}
Manufacturing Process: {{{manufacturingProcess}}}
{{#if environmentalConditions}}
Environmental Conditions: {{{environmentalConditions}}}
{{/if}}
{{#if historicalContext}}
Historical Context: {{{historicalContext}}}
{{/if}}

{{#if photoDataUri}}
Photo of Defect: {{media url=photoDataUri}}
{{/if}}

Think step by step and provide a professional quality assessment. Look closely at the visual characteristics in the image to confirm or refine the root cause.`,
});

const defectInsightAnalysisFlow = ai.defineFlow(
  {
    name: 'defectInsightAnalysisFlow',
    inputSchema: DefectInsightAnalysisInputSchema,
    outputSchema: DefectInsightAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await runWithRetry(defectInsightAnalysisPrompt, input);
    if (!output) {
      throw new Error('Failed to generate defect insight analysis.');
    }
    return output;
  }
);
