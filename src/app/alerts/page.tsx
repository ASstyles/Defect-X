
"use client"

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Loader2, 
  RefreshCcw,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AlertsPage() {
  const db = useFirestore();

  const alertsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "alerts"), orderBy("timestamp", "desc"));
  }, [db]);

  const { data: alerts, loading } = useCollection(alertsQuery);

  const resolveAlert = (alertId: string) => {
    if (!db) return;
    const alertRef = doc(db, "alerts", alertId);
    updateDoc(alertRef, { status: "resolved" })
      .catch(async (error) => {
        console.error("Failed to resolve alert:", error);
        const permissionError = new FirestorePermissionError({
          path: `alerts/${alertId}`,
          operation: 'update',
          requestResourceData: { status: "resolved" },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    toast({ title: "Alert Resolved", description: "The system status has been updated." });
  };

  const generateMockAlert = () => {
    if (!db) return;
    const newAlert = {
      severity: ["Critical", "Warning", "Info"][Math.floor(Math.random() * 3)],
      message: "System anomaly detected in Sector 7G. Precision drift suspected.",
      status: "active",
      timestamp: serverTimestamp(),
    };

    addDoc(collection(db, "alerts"), newAlert)
      .catch(async (error) => {
        console.error("Failed to add mock alert:", error);
        const permissionError = new FirestorePermissionError({
          path: "alerts",
          operation: 'create',
          requestResourceData: newAlert,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical': return "bg-rose-500/20 text-rose-500 border-rose-500/30";
      case 'Warning': return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      default: return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manufacturing Alerts</h1>
          <p className="text-muted-foreground mt-1">Manage system notifications and quality escalations.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2" onClick={generateMockAlert}>
            <Plus className="size-4" /> Trigger Alert
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <RefreshCcw className="size-4" /> Refresh
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}

        {!loading && alerts?.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-secondary/10">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold">All Systems Clear</h3>
            <p className="text-muted-foreground">No active alerts currently require your attention.</p>
          </div>
        )}

        {alerts?.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${alert.status === 'resolved' ? 'opacity-60 grayscale-[0.5]' : ''} ${
            alert.severity === 'Critical' ? 'border-l-rose-500' : 
            alert.severity === 'Warning' ? 'border-l-amber-500' : 'border-l-blue-500'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getSeverityStyles(alert.severity)}`}>
                  {alert.severity === 'Critical' ? <ShieldAlert className="size-5" /> : <AlertTriangle className="size-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{alert.severity} System Alert</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="size-3" /> 
                    {alert.timestamp?.toDate ? alert.timestamp.toDate().toLocaleString() : 'Just now'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={alert.status === 'resolved' ? 'outline' : 'default'} className={alert.status === 'active' ? 'bg-primary' : ''}>
                {alert.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-2">
              <p className="text-sm text-foreground/90 max-w-2xl leading-relaxed">
                {alert.message}
              </p>
              {alert.status === 'active' && (
                <Button variant="outline" size="sm" className="gap-2 hover:bg-emerald-500/10 hover:text-emerald-500 border-emerald-500/20" onClick={() => resolveAlert(alert.id)}>
                  <CheckCircle2 className="size-4" /> Resolve
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
