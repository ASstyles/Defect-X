'use server';
/**
 * @fileOverview A Genkit flow for predicting equipment failures and suggesting proactive maintenance schedules.
 *
 * - predictiveMaintenanceRecommendation - A function that analyzes historical data to predict failures and recommend maintenance.
 * - PredictiveMaintenanceInput - The input type for the predictiveMaintenanceRecommendation function.
 * - PredictiveMaintenanceOutput - The return type for the predictiveMaintenanceRecommendation function.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveMaintenanceInputSchema = z.object({
  historicalDefects: z
    .array(
      z.object({
        machineId: z.string().describe('Unique identifier for the machine.'),
        defectType: z.string().describe('Type of defect observed (e.g., "Crack", "Scratch").'),
        severity: z
          .enum(['Critical', 'High', 'Medium', 'Low'])
          .describe('Severity of the defect.'),
        detectionDate: z.string().describe('ISO 8601 date string when the defect was detected.'),
        details: z.string().optional().describe('Additional details about the defect.'),
      })
    )
    .describe('Historical data on detected defects for various machines.'),
  machinePerformanceMetrics: z
    .array(
      z.object({
        machineId: z.string().describe('Unique identifier for the machine.'),
        metricDate: z.string().describe('ISO 8601 date string when the metrics were recorded.'),
        runHours: z.number().optional().describe('Total operational hours of the machine.'),
        temperature: z.number().optional().describe('Operating temperature in Celsius.'),
        vibration: z.number().optional().describe('Vibration levels in mm/s.'),
        pressure: z.number().optional().describe('Operating pressure in PSI.'),
        // Add other relevant performance metrics as needed
      })
    )
    .describe('Historical performance metrics for various machines.'),
});
export type PredictiveMaintenanceInput = z.infer<typeof PredictiveMaintenanceInputSchema>;

const PredictiveMaintenanceOutputSchema = z.object({
  predictions: z
    .array(
      z.object({
        machineId: z.string().describe('Identifier of the machine for which a prediction is made.'),
        predictedFailureType: z
          .string()
          .describe('e.g., "bearing failure", "pump seal leak", "electrical fault".'),
        confidence: z.number().min(0).max(1).describe('Confidence score (0-1) in the prediction.'),
        likelihood: z
          .enum(['Low', 'Medium', 'High', 'Critical'])
          .describe('Likelihood of failure in the near future.'),
        estimatedTimeUntilFailure: z
          .string()
          .optional()
          .describe('Estimated timeframe until the predicted failure (e.g., "within 2 weeks", "3 months").'),
      })
    )
    .describe('A list of predicted equipment failures.'),
  maintenanceRecommendations: z
    .array(
      z.object({
        machineId: z
          .string()
          .describe('Identifier of the machine for which a recommendation is made.'),
        recommendedAction: z
          .string()
          .describe('Specific action to take (e.g., "Inspect bearing assembly", "Replace worn belt").'),
        timeframe: z
          .string()
          .describe('Suggested timeframe for the action (e.g., "within 5 days", "next scheduled shutdown").'),
        reason: z.string().describe('Explanation for why this recommendation is being made.'),
      })
    )
    .describe('A list of proactive maintenance recommendations.'),
});
export type PredictiveMaintenanceOutput = z.infer<typeof PredictiveMaintenanceOutputSchema>;

export async function predictiveMaintenanceRecommendation(
  input: PredictiveMaintenanceInput
): Promise<PredictiveMaintenanceOutput> {
  return predictiveMaintenanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveMaintenancePrompt',
  input: {schema: PredictiveMaintenanceInputSchema},
  output: {schema: PredictiveMaintenanceOutputSchema},
  prompt: `You are an expert industrial maintenance manager and data analyst. Your task is to analyze historical defect data and machine performance metrics to predict potential equipment failures and suggest proactive maintenance schedules.

Analyze the provided data:

Historical Defects:
{{#each historicalDefects}}
Machine ID: {{{machineId}}}
Defect Type: {{{defectType}}}
Severity: {{{severity}}}
Detection Date: {{{detectionDate}}}
Details: {{{details}}}
---
{{/each}}

Machine Performance Metrics:
{{#each machinePerformanceMetrics}}
Machine ID: {{{machineId}}}
Metric Date: {{{metricDate}}}
Run Hours: {{{runHours}}}
Temperature: {{{temperature}}}
Vibration: {{{vibration}}}
Pressure: {{{pressure}}}
---
{{/each}}

Based on this information, provide:
1. A list of predicted equipment failures, including the machine ID, the type of failure predicted, a confidence score, the likelihood of failure, and an estimated time until failure if discernible.
2. A list of proactive maintenance recommendations, including the machine ID, the specific action to take, a suggested timeframe, and the reason for the recommendation.

Focus on identifying trends, anomalies, and patterns that indicate impending failures. Your goal is to help prevent downtime and optimize maintenance operations by providing actionable insights.`,
});

const predictiveMaintenanceFlow = ai.defineFlow(
  {
    name: 'predictiveMaintenanceFlow',
    inputSchema: PredictiveMaintenanceInputSchema,
    outputSchema: PredictiveMaintenanceOutputSchema,
  },
  async input => {
    const {output} = await runWithRetry(prompt, input);
    return output!;
  }
);
