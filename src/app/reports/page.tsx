"use client"

import { useState } from "react";
import { runShiftReport, type ShiftReportOutput } from "@/ai/flows/generate-shift-report-flow";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  History,
  FileSearch,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ShiftReportOutput | null>(null);
  const db = useFirestore();

  const detectionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "detections"), orderBy("timestamp", "desc"), limit(50));
  }, [db]);
  const { data: detections } = useCollection(detectionsQuery);

  const alertsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "alerts"), orderBy("timestamp", "desc"), limit(20));
  }, [db]);
  const { data: alerts } = useCollection(alertsQuery);

  const generateReport = async () => {
    setLoading(true);
    try {
      const input = {
        shiftId: "Shift 02-B (Current)",
        detections: detections?.map(d => ({
          type: d.type,
          severity: d.severity,
          machineId: d.machineId || "Unknown",
          timestamp: d.timestamp?.toDate?.()?.toLocaleString() || new Date().toLocaleString()
        })) || [],
        alerts: alerts?.map(a => ({
          severity: a.severity,
          message: a.message,
          status: a.status,
          timestamp: a.timestamp?.toDate?.()?.toLocaleString() || new Date().toLocaleString()
        })) || [],
      };

      const result = await runShiftReport(input);
      setReport(result);
      toast({ title: "Report Generated", description: "Gemini has synthesized the current shift data." });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation Failed", description: "AI report engine encountered an error.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) {
      toast({ title: "No Data", description: "Please generate a report first.", variant: "destructive" });
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Details\n";
    csvContent += `Overall Status,${report.keyMetrics.overallStatus}\n`;
    csvContent += `Defect Rate Status,${report.keyMetrics.defectRateStatus}\n`;
    csvContent += `Critical Escalations,${report.keyMetrics.criticalEscalations}\n\n`;
    
    csvContent += "TOP CONCERNS\n";
    csvContent += "Issue,Impact,Recommendation\n";
    report.topConcerns.forEach(c => {
      csvContent += `"${c.issue.replace(/"/g, '""')}","${c.impact.replace(/"/g, '""')}","${c.recommendation.replace(/"/g, '""')}"\n`;
    });
    
    csvContent += "\nDETECTIONS LOG\n";
    csvContent += "Type,Severity,Machine,Timestamp\n";
    detections?.forEach(d => {
      const ts = d.timestamp?.toDate?.()?.toLocaleString() || 'N/A';
      csvContent += `"${d.type}","${d.severity}","${d.machineId}","${ts}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Defect_X_Shift_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "CSV Exported", description: "Your data is ready for spreadsheet analysis." });
  };

  const exportToPDF = () => {
    if (!report) {
      toast({ title: "No Data", description: "Please generate a report first.", variant: "destructive" });
      return;
    }
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Stable': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Needs Attention': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto print:p-0 print:max-w-none">
      <header className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
            <FileText className="size-7" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Shift Report Center</h1>
            <p className="text-muted-foreground mt-1">AI-synthesized operational summaries and trend analysis.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <History className="size-4" /> History
          </Button>
          <Button onClick={generateReport} disabled={loading} className="gap-2 bg-primary">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Synthesizing..." : "Generate AI Shift Report"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:block">
        <div className="lg:col-span-3 space-y-6">
          {!report ? (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-secondary/5 border-border/40 text-center p-12 print:hidden">
              <div className="h-20 w-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                <FileSearch className="size-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-2">No Active Report</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Generate a report to see an AI-driven summary of current detections, alert escalations, and performance metrics.
              </p>
            </div>
          ) : (
            <Card className="border-border/50 shadow-xl overflow-hidden relative print:shadow-none print:border-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 print:hidden" />
              <CardHeader className="flex flex-row items-start justify-between border-b bg-muted/20 print:bg-white print:border-b-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-headline font-bold">Shift Performance Summary</CardTitle>
                    <Badge variant="outline" className={getStatusColor(report.keyMetrics.overallStatus)}>
                      {report.keyMetrics.overallStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Generated on {new Date().toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-1 print:hidden">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportToPDF}><Printer className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={exportToCSV}><Download className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="size-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8 print:p-4">
                <section className="space-y-3">
                  <h3 className="text-sm uppercase font-black tracking-widest text-primary flex items-center gap-2">
                    <TrendingUp className="size-4" /> Executive Overview
                  </h3>
                  <div className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap p-4 bg-secondary/20 rounded-xl border border-border/40 italic print:bg-white print:border-none print:p-0">
                    {report.executiveSummary}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                  <Card className="bg-secondary/10 border-border/40 print:bg-white print:border-none">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-headline">Yield & Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Defect Rate Status</span>
                        <Badge variant="secondary" className="text-[10px]">{report.keyMetrics.defectRateStatus}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Critical Escalations</span>
                        <span className="font-bold text-rose-500">{report.keyMetrics.criticalEscalations}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/10 border-border/40 print:bg-white print:border-none">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-headline">Incoming Shift Guidance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="space-y-2">
                        {report.operationalTips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="size-3 mt-0.5 text-primary shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <section className="space-y-4">
                  <h3 className="text-sm uppercase font-black tracking-widest text-muted-foreground px-1">Critical Concerns & Recommendations</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {report.topConcerns.map((concern, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-all flex gap-4 print:border-none print:p-2">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 print:hidden">
                          <AlertCircle className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-foreground">{concern.issue}</div>
                          <div className="text-xs text-muted-foreground"><span className="font-bold uppercase tracking-tighter text-[9px] mr-1">Impact:</span>{concern.impact}</div>
                          <div className="text-xs text-primary font-medium mt-1 italic">AI Recommendation: {concern.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 print:hidden">
          <Card className="bg-secondary/10 border-border/40 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <History className="size-4" /> Recent Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] px-4">
                <div className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest sticky top-0 bg-background py-1 z-10">Detections</h4>
                    {detections?.slice(0, 5).map((d, i) => (
                      <div key={i} className="text-xs p-2 rounded bg-background border border-border/30">
                        <div className="font-bold">{d.type}</div>
                        <div className="text-[10px] text-muted-foreground">{d.machineId} • {d.severity}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest sticky top-0 bg-background py-1 z-10">Alerts</h4>
                    {alerts?.slice(0, 5).map((a, i) => (
                      <div key={i} className="text-xs p-2 rounded bg-background border border-border/30">
                        <div className="font-bold line-clamp-1">{a.message}</div>
                        <div className="text-[10px] text-muted-foreground">{a.severity} • {a.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline">Export Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs"
                onClick={exportToPDF}
                disabled={!report}
              >
                <Printer className="size-3" /> PDF Document (.pdf)
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-xs"
                onClick={exportToCSV}
                disabled={!report}
              >
                <FileSpreadsheet className="size-3" /> Spreadsheet (.csv)
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" disabled={!report}>
                <Download className="size-3" /> JSON Telemetry (.json)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
