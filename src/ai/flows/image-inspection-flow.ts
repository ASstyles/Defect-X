'use server';
/**
 * @fileOverview This file implements a Genkit flow for detecting defects in an image.
 * It identifies the type, location (coordinates), and severity of defects.
 *
 * - detectImageDefects - A function that handles the visual inspection of an image.
 * - DetectImageDefectsInput - The input type for the detectImageDefects function.
 * - DetectImageDefectsOutput - The return type for the detectImageDefects function.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const DetectImageDefectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the component to inspect, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectImageDefectsInput = z.infer<typeof DetectImageDefectsInputSchema>;

const DetectImageDefectsOutputSchema = z.object({
  detections: z.array(z.object({
    type: z.string().describe('The category of defect (e.g., Crack, Scratch, Dent, Corrosion).'),
    x: z.number().describe('X coordinate percentage (0-100) of the top-left corner.'),
    y: z.number().describe('Y coordinate percentage (0-100) of the top-left corner.'),
    w: z.number().describe('Width percentage (0-100) of the bounding box.'),
    h: z.number().describe('Height percentage (0-100) of the bounding box.'),
    severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
    confidence: z.number().describe('Confidence score (0-1).'),
  })).describe('A list of detected defects with their bounding boxes and metadata.'),
});
export type DetectImageDefectsOutput = z.infer<typeof DetectImageDefectsOutputSchema>;

export async function detectImageDefects(input: DetectImageDefectsInput): Promise<DetectImageDefectsOutput> {
  return detectImageDefectsFlow(input);
}

const detectImageDefectsPrompt = ai.definePrompt({
  name: 'detectImageDefectsPrompt',
  input: {schema: DetectImageDefectsInputSchema},
  output: {schema: DetectImageDefectsOutputSchema},
  prompt: `You are an advanced computer vision system for manufacturing quality control.
Analyze the provided image and detect any physical defects such as cracks, scratches, dents, or corrosion.

For each defect found, provide:
1. The type of defect.
2. The bounding box coordinates as percentages (0-100) relative to the image size (x, y for top-left, and w, h for dimensions).
3. The severity level based on the size and nature of the defect.
4. Your confidence score.

Image to inspect: {{media url=photoDataUri}}`,
});

const detectImageDefectsFlow = ai.defineFlow(
  {
    name: 'detectImageDefectsFlow',
    inputSchema: DetectImageDefectsInputSchema,
    outputSchema: DetectImageDefectsOutputSchema,
  },
  async (input) => {
    const {output} = await runWithRetry(detectImageDefectsPrompt, input);
    if (!output) {
      throw new Error('Failed to perform image inspection.');
    }
    return output;
  }
);
