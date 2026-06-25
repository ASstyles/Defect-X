"use client"

import { useState } from "react";
import { runComplianceAudit, type ComplianceAuditOutput } from "@/ai/flows/compliance-audit-flow";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ShieldCheck, 
  FileText, 
  AlertOctagon, 
  CheckCircle, 
  ClipboardCheck, 
  Loader2, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  History
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ComplianceHub() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceAuditOutput | null>(null);
  const db = useFirestore();

  const detectionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "detections"), orderBy("timestamp", "desc"), limit(10));
  }, [db]);
  const { data: detections } = useCollection(detectionsQuery);

  const alertsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "alerts");
  }, [db]);
  const { data: alerts } = useCollection(alertsQuery);

  const startAudit = async () => {
    setLoading(true);
    try {
      const input = {
        recentDetections: detections?.map(d => ({
          type: d.type,
          severity: d.severity,
          timestamp: d.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        })) || [],
        machineUptime: 96.4,
        activeAlerts: alerts?.filter(a => a.status === 'active').length || 0,
      };

      const result = await runComplianceAudit(input);
      setReport(result);
      toast({ title: "Audit Complete", description: "AI Compliance report has been generated." });
    } catch (error) {
      console.error("Compliance audit failure:", error);
      toast({ title: "Audit Failed", description: "Unable to connect to the audit engine.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Compliance & Standards</h1>
            <p className="text-muted-foreground mt-1">ISO 9001:2015 Regulatory Monitoring & AI Auditing.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <History className="size-4" /> Audit History
          </Button>
          <Button onClick={startAudit} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Auditing Data..." : "Run AI Compliance Audit"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Active Certification</CardDescription>
            <CardTitle className="text-xl font-headline">ISO 9001:2015</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
              <CheckCircle className="size-4" /> Certified & Active
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Standard: Quality Management Systems. Next recertification audit due in 142 days.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Health Score</CardDescription>
            <CardTitle className="text-xl font-headline">{report ? `${report.overallScore}%` : '---'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Progress value={report?.overallScore || 0} className="h-2" />
             <div className="text-[11px] text-muted-foreground italic">
               Gemini-powered evaluation of real-time operational data.
             </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Safety Compliance</CardDescription>
            <CardTitle className="text-xl font-headline">OSHA 1910</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-2 text-sm text-amber-500 font-medium">
              <AlertOctagon className="size-4" /> 2 Minor Warnings
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Based on active system alerts in Sector 7G and 4B.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!report ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-secondary/5 border-border/40 text-center p-8">
              <ClipboardCheck className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-headline font-bold mb-2">No Active Audit Report</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Run an AI audit to evaluate recent defect patterns and telemetry against industrial standards.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <FileText className="size-5 text-emerald-500" /> Executive Audit Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/90">{report.summary}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-sm uppercase font-black tracking-widest text-muted-foreground px-1">Detailed Findings</h3>
                {report.findings.map((finding, i) => (
                  <Card key={i} className="bg-card border-border/50 hover:border-primary/30 transition-all">
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          finding.riskLevel === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                          finding.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          <ShieldAlert className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold">{finding.standard}</CardTitle>
                          <Badge variant="outline" className="text-[9px] h-4 mt-1">{finding.riskLevel} RISK</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="size-4" /></Button>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 space-y-3">
                      <div className="text-sm font-medium text-foreground/80">{finding.result}</div>
                      <div className="p-3 bg-secondary/30 rounded-md border border-border/40 text-xs text-muted-foreground italic">
                        <span className="font-bold text-foreground block mb-1 uppercase tracking-tighter">Remediation:</span>
                        {finding.remediation}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-secondary/10 border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-headline">Compliance Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Internal Audit Log", status: "complete" },
                { label: "Corrective Action Reports", status: "pending" },
                { label: "Shift Training Logs", status: "complete" },
                { label: "Calibration Records", status: "complete" },
                { label: "Supplier Certificates", status: "missing" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <Badge variant={item.status === 'complete' ? 'outline' : 'secondary'} className={`text-[9px] ${
                    item.status === 'complete' ? 'border-emerald-500/30 text-emerald-500' : 
                    item.status === 'missing' ? 'bg-rose-500/10 text-rose-500' : ''
                  }`}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <AlertOctagon className="size-4 text-primary" /> Regulatory Watch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-card border border-border/40 rounded-lg text-xs leading-relaxed">
                <span className="font-bold block mb-1">New EU AI Act (Industrial)</span>
                Proposed changes to vision system transparency and error logging. Review by Q3.
              </div>
              <div className="p-3 bg-card border border-border/40 rounded-lg text-xs leading-relaxed">
                <span className="font-bold block mb-1">ISO 14001 Update</span>
                New environmental impact reporting requirements for scrap recycling.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
