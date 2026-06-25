'use server';
/**
 * @fileOverview This file implements a Genkit flow for the Factory Expert Chatbot.
 * It allows operators and quality managers to ask questions about defect causes,
 * compliance standards, and operational adjustments, receiving intelligent, context-aware answers.
 *
 * - factoryExpertChatbotInteraction - A function that handles the interaction with the expert chatbot.
 * - FactoryExpertChatbotInput - The input type for the factoryExpertChatbotInteraction function.
 * - FactoryExpertChatbotOutput - The return type for the factoryExpertChatbotInteraction function.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const FactoryExpertChatbotInputSchema = z.object({
  question: z
    .string()
    .describe('The question posed to the manufacturing expert AI regarding defect causes, compliance, or operational adjustments.'),
});
export type FactoryExpertChatbotInput = z.infer<typeof FactoryExpertChatbotInputSchema>;

const FactoryExpertChatbotOutputSchema = z.object({
  answer: z
    .string()
    .describe('The intelligent, context-aware answer from the manufacturing expert AI.'),
});
export type FactoryExpertChatbotOutput = z.infer<typeof FactoryExpertChatbotOutputSchema>;

export async function factoryExpertChatbotInteraction(
  input: FactoryExpertChatbotInput
): Promise<FactoryExpertChatbotOutput> {
  return factoryExpertChatbotFlow(input);
}

const factoryExpertChatbotPrompt = ai.definePrompt({
  name: 'factoryExpertChatbotPrompt',
  input: {schema: FactoryExpertChatbotInputSchema},
  output: {schema: FactoryExpertChatbotOutputSchema},
  prompt: `You are an expert manufacturing quality engineer for a factory named Defect X. Your primary role is to assist operators and quality managers by providing intelligent, context-aware answers regarding defect causes, compliance standards, and recommended operational adjustments.

When a user asks a question, analyze it thoroughly and provide a detailed, actionable response.

Consider the following:
- Defect Causes: Explain potential root causes for observed defects.
- Compliance Standards: Reference relevant quality and safety standards.
- Operational Adjustments: Suggest practical steps or changes to processes to mitigate issues or improve quality.

Always strive to be helpful, precise, and provide insights that improve manufacturing processes and product quality.

Question: {{{question}}}
Answer:`,
});

const factoryExpertChatbotFlow = ai.defineFlow(
  {
    name: 'factoryExpertChatbotFlow',
    inputSchema: FactoryExpertChatbotInputSchema,
    outputSchema: FactoryExpertChatbotOutputSchema,
  },
  async input => {
    const {output} = await runWithRetry(factoryExpertChatbotPrompt, input);
    return output!;
  }
);
