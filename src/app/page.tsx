
"use client"

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Timer, 
  TrendingUp, 
  Cpu, 
  Gauge, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const db = useFirestore();

  // Real-time detections
  const detectionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "detections"), orderBy("timestamp", "desc"), limit(50));
  }, [db]);
  const { data: detections, loading: loadingDetections } = useCollection(detectionsQuery);

  // Real-time alerts
  const alertsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "alerts"), orderBy("timestamp", "desc"));
  }, [db]);
  const { data: alerts } = useCollection(alertsQuery);

  const activeDefectsCount = detections?.length || 0;
  const criticalDefects = detections?.filter(d => d.severity === 'Critical').length || 0;
  const activeAlertsCount = alerts?.filter(a => a.status === 'active').length || 0;

  const machines = [
    { id: "M-001", name: "Primary Milling Unit", status: "Healthy", health: 98, load: 45, energy: 12.4, color: "text-emerald-500" },
    { id: "M-002", name: "Precision Laser Cutter", status: criticalDefects > 0 ? "Critical" : "Warning", health: 82, load: 88, energy: 45.2, color: criticalDefects > 0 ? "text-rose-500" : "text-amber-500" },
    { id: "M-003", name: "Automated Welder B", status: activeAlertsCount > 2 ? "Critical" : "Healthy", health: 94, load: 12, energy: 0.8, color: activeAlertsCount > 2 ? "text-rose-500" : "text-emerald-500" },
    { id: "M-004", name: "Surface Finisher", status: "Healthy", health: 95, load: 62, energy: 18.5, color: "text-emerald-500" },
    { id: "M-005", name: "Component Assembler", status: "Healthy", health: 92, load: 74, energy: 22.1, color: "text-emerald-500" },
    { id: "M-006", name: "Quality Test Station", status: "Healthy", health: 99, load: 30, energy: 5.4, color: "text-emerald-500" },
  ];

  const stats = [
    { 
      label: "OEE Score", 
      value: loadingDetections ? "..." : (94.2 - (criticalDefects * 1.5)).toFixed(1) + "%", 
      trend: "+2.1%", 
      icon: Gauge, 
      status: "success" 
    },
    { 
      label: "Active Defects", 
      value: loadingDetections ? "..." : activeDefectsCount.toString(), 
      trend: activeDefectsCount > 5 ? "+4" : "-2", 
      icon: AlertTriangle, 
      status: activeDefectsCount > 10 ? "destructive" : "warning" 
    },
    { 
      label: "Production Yield", 
      value: loadingDetections ? "..." : (98.8 - (activeDefectsCount * 0.1)).toFixed(1) + "%", 
      trend: "+0.5%", 
      icon: TrendingUp, 
      status: "success" 
    },
    { 
      label: "System Alerts", 
      value: activeAlertsCount.toString(), 
      trend: activeAlertsCount > 0 ? "Active" : "Stable", 
      icon: Activity, 
      status: activeAlertsCount > 0 ? "warning" : "neutral" 
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Digital Twin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time factory telemetry and production status.</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="size-3.5" /> Factory Live
          </Badge>
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Shift 02-B</div>
            <div className="text-xs text-muted-foreground/60">08:00 AM - 04:00 PM</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card/50 border-border/50 shadow-lg backdrop-blur-sm overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="size-12" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-widest font-semibold">{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-headline font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xs flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {stat.trend} <span className="text-muted-foreground">vs last shift</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-headline text-xl">Digital Factory View</CardTitle>
              <CardDescription>Visual machine status grid</CardDescription>
            </div>
            <Tabs defaultValue="grid" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="grid" className="text-xs">Grid</TabsTrigger>
                <TabsTrigger value="line" className="text-xs">Schematic</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {machines.map((m) => (
                <div key={m.id} className="p-4 rounded-lg border border-border/40 bg-background/40 hover:bg-secondary/20 transition-colors relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full animate-pulse ${m.color === 'text-emerald-500' ? 'bg-emerald-500' : m.color === 'text-amber-500' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="text-xs font-mono text-muted-foreground uppercase">{m.id}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] py-0 px-2 ${m.color} border-current/20`}>{m.status}</Badge>
                  </div>
                  <div className="font-headline font-semibold text-sm mb-4">{m.name}</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mechanical Health</span>
                      <span className="font-mono">{m.health}%</span>
                    </div>
                    <Progress value={m.health} className="h-1" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase">Load</span>
                          <span className="text-xs font-semibold">{m.load}%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase">Power</span>
                          <span className="text-xs font-semibold">{m.energy} kW</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Zap className="size-3 text-primary opacity-40" />
                        <Activity className="size-3 text-accent opacity-40" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-lg">Shift Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Line A", val: 94, defects: detections?.filter(d => d.machineId?.includes('Alpha') || d.machineId === 'M-001').length || 0 },
                { label: "Line B", val: 72, defects: detections?.filter(d => d.machineId?.includes('Beta') || d.machineId === 'M-002').length || 0 },
                { label: "Line C", val: 88, defects: detections?.filter(d => d.machineId?.includes('Gamma') || d.machineId === 'M-003').length || 0 },
              ].map((line, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{line.label}</span>
                    <span className={line.defects > 5 ? "text-rose-500 font-bold" : "text-emerald-500"}>{line.defects} defects</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={line.val} className="flex-1 h-2" />
                    <span className="text-xs font-mono w-10 text-right">{line.val}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
              <Activity className="size-24" />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                AI Production Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeDefectsCount > 0 ? (
                  <>
                    <span className="text-foreground font-bold">{activeDefectsCount} defects</span> detected in current shift. 
                    {criticalDefects > 0 && <span className="text-rose-500 font-bold ml-1">Critical issues found!</span>}
                    <span className="block mt-2">AI recommends reviewing Machine 2 calibration and checking material batches.</span>
                  </>
                ) : (
                  "Production lines are operating within optimal parameters. No significant anomalies detected."
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
