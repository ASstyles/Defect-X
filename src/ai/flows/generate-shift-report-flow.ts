'use server';
/**
 * @fileOverview A Genkit flow for generating comprehensive manufacturing shift reports.
 * It synthesizes detections, alerts, and performance data into an executive summary.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const ShiftReportInputSchema = z.object({
  shiftId: z.string().describe('The identifier for the production shift (e.g., "Shift 02-B").'),
  detections: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    machineId: z.string(),
    timestamp: z.string(),
  })).describe('List of defects detected during the shift.'),
  alerts: z.array(z.object({
    severity: z.string(),
    message: z.string(),
    status: z.string(),
    timestamp: z.string(),
  })).describe('List of system alerts logged during the shift.'),
});
export type ShiftReportInput = z.infer<typeof ShiftReportInputSchema>;

const ShiftReportOutputSchema = z.object({
  executiveSummary: z.string().describe('High-level overview of shift performance.'),
  keyMetrics: z.object({
    defectRateStatus: z.string().describe('Evaluation of the current defect rate (e.g., Stable, Increasing).'),
    criticalEscalations: z.number().describe('Number of issues requiring immediate engineering attention.'),
    overallStatus: z.enum(['Optimal', 'Stable', 'Needs Attention', 'Critical']),
  }),
  topConcerns: z.array(z.object({
    issue: z.string(),
    impact: z.string(),
    recommendation: z.string(),
  })).describe('Specific areas of concern identified by AI analysis.'),
  operationalTips: z.array(z.string()).describe('Practical tips for the next shift supervisor.'),
});
export type ShiftReportOutput = z.infer<typeof ShiftReportOutputSchema>;

export async function runShiftReport(input: ShiftReportInput): Promise<ShiftReportOutput> {
  return generateShiftReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShiftReportPrompt',
  input: {schema: ShiftReportInputSchema},
  output: {schema: ShiftReportOutputSchema},
  prompt: `You are a Production Operations Director for Defect X.
Generate a detailed shift report for {{{shiftId}}}.

Detections Log:
{{#each detections}}
- {{{type}}} ({{{severity}}}) on {{{machineId}}} at {{{timestamp}}}
{{/each}}

Alerts Log:
{{#each alerts}}
- {{{severity}}}: {{{message}}} (Status: {{{status}}}) at {{{timestamp}}}
{{/each}}

Analyze the data to identify patterns (e.g., if a specific machine is causing multiple defects). 
Provide a professional executive summary, quantify metrics, and offer actionable recommendations for the incoming shift team. 
Focus on safety, quality yield, and equipment reliability.`,
});

const generateShiftReportFlow = ai.defineFlow(
  {
    name: 'generateShiftReportFlow',
    inputSchema: ShiftReportInputSchema,
    outputSchema: ShiftReportOutputSchema,
  },
  async (input) => {
    const {output} = await runWithRetry(prompt, input);
    if (!output) throw new Error('Failed to generate shift report.');
    return output;
  }
);
