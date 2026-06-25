'use server';
/**
 * @fileOverview A Genkit flow for performing automated compliance audits.
 * It evaluates factory operations and defect logs against ISO 9001 and safety standards.
 */

import {ai, runWithRetry} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceAuditInputSchema = z.object({
  recentDetections: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    timestamp: z.string(),
  })).describe('List of recent defect detections for audit.'),
  machineUptime: z.number().describe('Current facility uptime percentage.'),
  activeAlerts: z.number().describe('Number of unresolved system alerts.'),
});
export type ComplianceAuditInput = z.infer<typeof ComplianceAuditInputSchema>;

const ComplianceAuditOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Total compliance health score.'),
  status: z.enum(['Compliant', 'Warning', 'Non-Compliant']),
  findings: z.array(z.object({
    standard: z.string().describe('The standard being evaluated (e.g., ISO 9001:2015).'),
    result: z.string().describe('Specific finding or observation.'),
    riskLevel: z.enum(['Critical', 'High', 'Medium', 'Low']),
    remediation: z.string().describe('Steps to resolve the non-compliance.'),
  })),
  summary: z.string().describe('Executive summary of the audit.'),
});
export type ComplianceAuditOutput = z.infer<typeof ComplianceAuditOutputSchema>;

export async function runComplianceAudit(input: ComplianceAuditInput): Promise<ComplianceAuditOutput> {
  return complianceAuditFlow(input);
}

const prompt = ai.definePrompt({
  name: 'complianceAuditPrompt',
  input: {schema: ComplianceAuditInputSchema},
  output: {schema: ComplianceAuditOutputSchema},
  prompt: `You are a Senior Quality Compliance Auditor specializing in ISO 9001:2015 and industrial safety regulations.

Analyze the following factory telemetry and defect data to perform an automated audit:

Recent Detections:
{{#each recentDetections}}
- {{{type}}} (Severity: {{{severity}}}) at {{{timestamp}}}
{{/each}}

Operational Metrics:
- Uptime: {{{machineUptime}}}%
- Active Alerts: {{{activeAlerts}}}

Evaluate these against standard manufacturing quality frameworks. If there are multiple high-severity defects or unresolved alerts, lower the compliance score and flag specific ISO violations (e.g., Clause 8.7 Control of Nonconforming Outputs).

Provide a structured audit report including an overall score, specific findings per standard, and clear remediation steps.`,
});

const complianceAuditFlow = ai.defineFlow(
  {
    name: 'complianceAuditFlow',
    inputSchema: ComplianceAuditInputSchema,
    outputSchema: ComplianceAuditOutputSchema,
  },
  async (input) => {
    const {output} = await runWithRetry(prompt, input);
    if (!output) throw new Error('Compliance audit failed.');
    return output;
  }
);
