
"use client"

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Clock, 
  Zap,
  ShieldAlert,
  ChevronRight,
  Loader2
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  CartesianGrid
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function LinePerformance() {
  const db = useFirestore();

  // Fetch real-time detections for quality analysis
  const detectionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "detections"), orderBy("timestamp", "desc"), limit(100));
  }, [db]);
  const { data: detections, loading } = useCollection(detectionsQuery);

  // Fetch active alerts for downtime/availability analysis
  const alertsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "alerts"), orderBy("timestamp", "desc"));
  }, [db]);
  const { data: alerts } = useCollection(alertsQuery);

  // Aggregation logic
  const lines = [
    { id: "A", name: "Alpha Line (High Precision)", baseOee: 94.2, machineIds: ["M-001", "M-004"] },
    { id: "B", name: "Beta Line (Heavy Welding)", baseOee: 88.5, machineIds: ["M-002", "M-003"] },
    { id: "C", name: "Gamma Line (Assembly)", baseOee: 91.8, machineIds: ["M-005", "M-006"] },
  ];

  const processedLines = lines.map(line => {
    const lineDetections = detections?.filter(d => 
      line.machineIds.includes(d.machineId) || d.machineId?.includes(line.id)
    ) || [];
    
    const lineAlerts = alerts?.filter(a => 
      a.status === 'active' && a.message.includes(`Sector ${line.id}`)
    ) || [];

    // Calculate simulated KPIs based on real data
    const qualityScore = Math.max(0, 99.5 - (lineDetections.length * 0.8));
    const availability = Math.max(0, 98.2 - (lineAlerts.length * 5.0));
    const performance = 96.4; // Simulated constant
    const oee = (availability * performance * qualityScore) / 10000;

    return {
      ...line,
      qualityScore: qualityScore.toFixed(1),
      availability: availability.toFixed(1),
      oee: oee.toFixed(1),
      defects: lineDetections.length,
      alerts: lineAlerts.length,
      trend: lineDetections.length > 5 ? 'down' : 'up'
    };
  });

  const chartData = processedLines.map(l => ({
    name: l.id,
    OEE: parseFloat(l.oee),
    Quality: parseFloat(l.qualityScore),
    Availability: parseFloat(l.availability),
  }));

  const historyData = [
    { time: "08:00", lineA: 94, lineB: 88, lineC: 91 },
    { time: "09:00", lineA: 95, lineB: 85, lineC: 92 },
    { time: "10:00", lineA: 93, lineB: 82, lineC: 90 },
    { time: "11:00", lineA: 94, lineB: 78, lineC: 89 },
    { time: "12:00", lineA: 96, lineB: 89, lineC: 93 },
    { time: "13:00", lineA: 95, lineB: 90, lineC: 92 },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Line Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time OEE tracking and quality yield correlation.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-8 border-primary/20 bg-primary/5 text-primary gap-1">
            <Clock className="size-3" /> Real-time Sync Active
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {processedLines.map((line) => (
          <Card key={line.id} className="relative overflow-hidden group border-border/50 hover:border-primary/30 transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full ${line.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="secondary" className="mb-2">Line {line.id}</Badge>
                  <CardTitle className="text-lg font-headline">{line.name}</CardTitle>
                </div>
                <div className={`p-2 rounded-full ${line.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {line.trend === 'up' ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-black font-headline">{line.oee}%</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Overall OEE Score</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${parseFloat(line.qualityScore) > 95 ? 'text-emerald-500' : 'text-amber-500'}`}>{line.qualityScore}%</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Quality Yield</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2 rounded bg-secondary/30 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Active Alerts</div>
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className={`size-3.5 ${line.alerts > 0 ? 'text-rose-500' : 'text-muted-foreground'}`} />
                    {line.alerts}
                  </div>
                </div>
                <div className="p-2 rounded bg-secondary/30 border border-border/40">
                  <div className="text-xs text-muted-foreground mb-1">Defects (Shift)</div>
                  <div className="font-bold flex items-center gap-1.5">
                    <Zap className="size-3.5 text-amber-500" />
                    {line.defects}
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full h-8 text-[10px] uppercase font-bold tracking-widest gap-1 group-hover:bg-primary/5">
                View Machine Health <ChevronRight className="size-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" /> KPI Comparison
            </CardTitle>
            <CardDescription>Cross-line benchmarking of OEE components</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              OEE: { label: "OEE", color: "hsl(var(--primary))" },
              Quality: { label: "Quality", color: "hsl(var(--accent))" },
              Availability: { label: "Availability", color: "hsl(var(--chart-3))" }
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="OEE" fill="var(--color-OEE)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Quality" fill="var(--color-Quality)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Availability" fill="var(--color-Availability)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Activity className="size-5 text-accent" /> Efficiency Trend
            </CardTitle>
            <CardDescription>Historical OEE variance over last 6 hours</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              lineA: { label: "Line A", color: "hsl(var(--primary))" },
              lineB: { label: "Line B", color: "hsl(var(--accent))" },
              lineC: { label: "Line C", color: "hsl(var(--chart-3))" }
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-lineA)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-lineA)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" />
                  <YAxis domain={[70, 100]} />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="lineA" stroke="var(--color-lineA)" fillOpacity={1} fill="url(#colorA)" />
                  <Area type="monotone" dataKey="lineB" stroke="var(--color-lineB)" fillOpacity={0} />
                  <Area type="monotone" dataKey="lineC" stroke="var(--color-lineC)" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
