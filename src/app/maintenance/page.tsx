
"use client"

import { useState } from "react";
import { predictiveMaintenanceRecommendation, type PredictiveMaintenanceInput, type PredictiveMaintenanceOutput } from "@/ai/flows/predictive-maintenance-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  Gauge, 
  Activity, 
  Clock,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MOCK_HISTORICAL_DATA: PredictiveMaintenanceInput = {
  historicalDefects: [
    { machineId: "M-002", defectType: "Precision Drift", severity: "Medium", detectionDate: "2024-05-15", details: "0.2mm variance detected in laser path" },
    { machineId: "M-002", defectType: "Thermal Inconsistency", severity: "High", detectionDate: "2024-05-20", details: "Heat sink efficiency dropped by 15%" },
  ],
  machinePerformanceMetrics: [
    { machineId: "M-002", metricDate: "2024-05-22", runHours: 1240, temperature: 88, vibration: 4.2, pressure: 120 },
    { machineId: "M-001", metricDate: "2024-05-22", runHours: 2100, temperature: 45, vibration: 0.8, pressure: 95 },
  ]
};

export default function MaintenanceForecast() {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<PredictiveMaintenanceOutput | null>(null);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const result = await predictiveMaintenanceRecommendation(MOCK_HISTORICAL_DATA);
      setForecast(result);
      toast({ title: "Forecast Generated", description: "Maintenance schedules updated based on Gemini AI." });
    } catch (error) {
      console.error("Predictive maintenance forecast failed:", error);
      toast({ title: "Error", description: "Failed to generate maintenance forecast.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Predictive Maintenance</h1>
          <p className="text-muted-foreground mt-1">AI-driven failure prediction and proactive schedules.</p>
        </div>
        <Button className="gap-2 h-11 font-headline font-bold" onClick={generateForecast} disabled={loading}>
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          Generate Gemini Forecast
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <AlertTriangle className="size-5 text-rose-500" /> Critical Failure Risks
              </CardTitle>
              <CardDescription>Probability based failure predictions for active machinery</CardDescription>
            </CardHeader>
            <CardContent>
              {!forecast ? (
                <div className="text-center py-20 bg-secondary/10 border-2 border-dashed border-border/40 rounded-lg">
                  <Activity className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active predictions. Run forecast to analyze trends.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forecast.predictions.map((p, i) => (
                    <div key={i} className="p-4 rounded-lg bg-background border border-border/40 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{p.machineId}</div>
                          <div className="font-headline font-bold text-lg">{p.predictedFailureType}</div>
                        </div>
                        <Badge className={`${p.likelihood === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {p.likelihood} Risk
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Confidence Score</span>
                          <span className="font-mono">{Math.round(p.confidence * 100)}%</span>
                        </div>
                        <Progress value={p.confidence * 100} className="h-1.5" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 p-2 rounded">
                        <Clock className="size-3.5" />
                        Est. window: <span className="font-semibold text-foreground">{p.estimatedTimeUntilFailure}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <Wrench className="size-5 text-primary" /> Maintenance Roadmap
              </CardTitle>
              <CardDescription>Suggested actions to mitigate identified failure risks</CardDescription>
            </CardHeader>
            <CardContent>
               {!forecast ? (
                 <div className="h-40 flex items-center justify-center italic text-muted-foreground">
                   Roadmap pending analysis...
                 </div>
               ) : (
                 <div className="space-y-4">
                    {forecast.maintenanceRecommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg border border-border/30 bg-secondary/10 group hover:border-primary/40 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Wrench className="size-5" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-headline font-bold text-base">{rec.recommendedAction}</span>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-accent border-accent/20 bg-accent/5">
                              {rec.timeframe}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            Target Machine: <span className="text-foreground">{rec.machineId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Gauge className="size-5 text-primary" /> Active Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "M-002 Thermal Load", val: 88, max: 100, unit: "°C" },
                { label: "M-002 Vibration Index", val: 4.2, max: 10, unit: "mm/s" },
                { label: "M-001 Mechanical Wear", val: 24, max: 100, unit: "%" },
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-mono font-bold">{m.val}{m.unit}</span>
                  </div>
                  <Progress value={(m.val / m.max) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-secondary/40 border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Calendar className="size-4" /> Next Scheduled Stop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-headline font-bold mb-1">May 28, 2024</div>
              <p className="text-xs text-muted-foreground">Full facility maintenance window. (02:00 - 06:00)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
