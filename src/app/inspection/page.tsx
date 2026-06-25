
"use client"

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Settings2, 
  Maximize2, 
  Play, 
  Square, 
  ShieldAlert, 
  AlertCircle,
  Cpu,
  RefreshCcw,
  Plus,
  Loader2,
  Zap,
  Upload,
  X,
  SearchCode,
  CameraOff
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { detectImageDefects } from "@/ai/flows/image-inspection-flow";
import { toast } from "@/hooks/use-toast";

export default function LiveInspection() {
  const [isLive, setIsLive] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const db = useFirestore();

  // Fetch real-time detections from Firestore
  const detectionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "detections"), orderBy("timestamp", "desc"), limit(20));
  }, [db]);

  const { data: detections, loading } = useCollection(detectionsQuery);

  const factoryImg = PlaceHolderImages.find(img => img.id === "machine-component")?.imageUrl || "https://picsum.photos/seed/machine/800/600";

  // Handle camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({ 
          title: "Camera Error", 
          description: "Could not access camera. Please check permissions.", 
          variant: "destructive" 
        });
        setIsCameraMode(false);
      }
    };

    if (isCameraMode) {
      startCamera();
      setUploadedImage(null);
      setIsLive(false);
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [isCameraMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image must be under 4MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsLive(false);
        setIsCameraMode(false);
        toast({ title: "Frame Uploaded", description: "You can now run AI inspection on this static frame." });
      };
      reader.readAsDataURL(file);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setUploadedImage(dataUrl);
        setIsCameraMode(false);
        toast({ title: "Frame Captured", description: "Processing snapshot for AI inspection." });
      }
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setIsLive(true);
    setIsCameraMode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAiInspection = async () => {
    if (!uploadedImage || !db) return;
    setIsAnalyzing(true);
    try {
      const result = await detectImageDefects({ photoDataUri: uploadedImage });
      
      result.detections.forEach((det) => {
        addDoc(collection(db, "detections"), {
          ...det,
          machineId: isCameraMode ? "Live_Camera_Capture" : "Uploaded_Frame",
          timestamp: serverTimestamp(),
        }).catch(async (error) => {
          console.error("Failed to add detection doc:", error);
          const permissionError = new FirestorePermissionError({
            path: "detections",
            operation: "create",
            requestResourceData: det,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      });

      toast({ 
        title: "Inspection Complete", 
        description: `Gemini found ${result.detections.length} potential issues.` 
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Inspection Failed", description: "AI engine encountered an error.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateDetection = () => {
    if (!db) return;
    
    const types = ["Crack", "Scratch", "Dent", "Corrosion"];
    const severities = ["Critical", "High", "Medium", "Low"] as const;
    
    const newDetection = {
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      w: 5 + Math.random() * 10,
      h: 5 + Math.random() * 10,
      severity: severities[Math.floor(Math.random() * severities.length)],
      confidence: 0.85 + Math.random() * 0.14,
      machineId: "Cam_Alpha_01",
      timestamp: serverTimestamp(),
    };

    addDoc(collection(db, "detections"), newDetection)
      .catch(async (error) => {
        console.error("Failed to add simulated detection doc:", error);
        const permissionError = new FirestorePermissionError({
          path: "detections",
          operation: "create",
          requestResourceData: newDetection,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Camera className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">Live Inspection Hub</h1>
            <p className="text-sm text-muted-foreground">
              {isCameraMode ? "Live Device Camera Active" : uploadedImage ? "Manual Frame Analysis" : "Real-time YOLOv8 Inference Feed | Cam_Alpha_01"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isCameraMode ? (
            <Button variant="default" size="sm" className="gap-2 bg-primary" onClick={captureFrame}>
              <Camera className="size-4" /> Capture & Analyze
            </Button>
          ) : uploadedImage ? (
             <Button variant="default" size="sm" className="gap-2 bg-primary" onClick={runAiInspection} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <SearchCode className="size-4" />}
              {isAnalyzing ? "AI Scanning..." : "Run AI Inspection"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={simulateDetection}>
              <Zap className="size-4" /> Simulate Detection
            </Button>
          )}
          
          <Button 
            variant={isCameraMode ? "destructive" : "outline"} 
            size="sm" 
            className="gap-2" 
            onClick={() => setIsCameraMode(!isCameraMode)}
          >
            {isCameraMode ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
            {isCameraMode ? "Close Camera" : "Live Camera"}
          </Button>

          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" /> Upload Frame
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          {(uploadedImage || isCameraMode) && (
            <Button variant="ghost" size="sm" className="gap-2 text-rose-500 hover:text-rose-600" onClick={clearUpload}>
              <X className="size-4" /> Clear Frame
            </Button>
          )}

          {!uploadedImage && !isCameraMode && (
            <Button variant={isLive ? "destructive" : "default"} size="sm" className="gap-2" onClick={() => setIsLive(!isLive)}>
              {isLive ? <Square className="size-4" /> : <Play className="size-4" />}
              {isLive ? "Stop Stream" : "Start Stream"}
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Card className="bg-black border-border/40 overflow-hidden relative group aspect-video shadow-2xl">
            <div className="absolute inset-0">
              {isCameraMode ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image 
                  src={uploadedImage || factoryImg} 
                  alt="Inspection Hub" 
                  fill 
                  className={`object-cover ${!uploadedImage && 'grayscale opacity-40'}`}
                  data-ai-hint="industrial machine"
                />
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay Grid */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-10">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>

            {/* Scan Line */}
            {(isLive || isAnalyzing || isCameraMode) && <div className="scan-line" />}

            {/* Bounding Boxes */}
            {detections?.map((det) => (
              <div 
                key={det.id}
                className={`absolute border-2 pulse-glow transition-all duration-500 ${det.severity === 'Critical' ? 'border-rose-500 text-rose-500' : 'border-blue-500 text-blue-500'}`}
                style={{
                  left: `${det.x}%`,
                  top: `${det.y}%`,
                  width: `${det.w}%`,
                  height: `${det.h}%`
                }}
              >
                <div className="absolute -top-6 left-0 bg-current px-2 py-0.5 text-[10px] font-bold text-black uppercase flex items-center gap-1 shadow-md">
                   {det.type} {Math.round(det.confidence * 100)}%
                </div>
              </div>
            ))}

            {/* Stream Stats Overlay */}
            <div className="absolute top-4 left-4 flex gap-3 pointer-events-none">
              {isCameraMode ? (
                <Badge className="bg-primary/80 backdrop-blur-md border-primary-foreground/20 text-white animate-pulse">● LIVE CAMERA</Badge>
              ) : uploadedImage ? (
                <Badge className="bg-amber-500/80 backdrop-blur-md text-white border-amber-400">● STATIC FRAME</Badge>
              ) : isLive ? (
                <Badge className="bg-rose-500/80 backdrop-blur-md border-rose-400 text-white animate-pulse">● LIVE STREAM</Badge>
              ) : (
                <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white">● PAUSED</Badge>
              )}
              <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/20 text-white font-mono">1080p @ 60 FPS</Badge>
            </div>

            <div className="absolute bottom-4 right-4">
              <Button size="icon" variant="ghost" className="bg-black/40 backdrop-blur-md text-white hover:bg-black/60">
                <Maximize2 className="size-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Loader2 className="size-12 text-primary animate-spin" />
                    <SearchCode className="size-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-white font-headline font-bold text-lg tracking-wider animate-pulse uppercase">AI Analyzing Pixels</p>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Card className="bg-card/40 border-border/40">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center text-accent">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Severity Avg</div>
                  <div className="text-xl font-headline font-bold">
                    {detections && detections.length > 0 ? "Medium" : "Healthy"}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/40 border-border/40">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu className="size-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Processing Node</div>
                  <div className="text-xl font-headline font-bold">Edge_AI_Gemini</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/40 border-border/40">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <RefreshCcw className="size-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Quality Score</div>
                  <div className="text-xl font-headline font-bold">
                    {detections?.some(d => d.severity === 'Critical') ? '64.2%' : '92.4%'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border/50 h-full flex flex-col min-h-[400px]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between shrink-0">
              <div>
                <CardTitle className="text-lg">Inference Log</CardTitle>
                <CardDescription>Shift detection event stream</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {}}><RefreshCcw className="size-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && detections?.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                  No active detections in current buffer.
                </div>
              )}
              {detections?.map((det) => (
                <div key={det.id} className="p-3 rounded-md bg-secondary/30 border border-border/40 space-y-2 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-sm">{det.type} Detected</span>
                    <Badge variant={det.severity === 'Critical' ? 'destructive' : 'secondary'} className="text-[9px] px-1.5 h-4 uppercase">
                      {det.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <div>Conf: {Math.round(det.confidence * 100)}%</div>
                      <div>Source: {det.machineId}</div>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-[10px] text-accent font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Root Cause →
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t shrink-0">
               <Button variant="secondary" className="w-full text-xs font-bold uppercase tracking-widest h-9">
                Export Shift Report
              </Button>
            </div>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2 text-amber-500">
                <AlertCircle className="size-4" /> Operations Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Live camera mode captures high-resolution frames for detailed Gemini vision processing. Ensure adequate lighting for best results.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
