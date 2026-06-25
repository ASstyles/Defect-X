"use client"

import { useState, useRef, useEffect } from "react";
import { checkPPECompliance, type PPEComplianceOutput } from "@/ai/flows/ppe-compliance-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  CameraOff,
  UserCheck,
  RotateCcw
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function PPECompliancePage() {
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PPEComplianceOutput | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        toast({ title: "Camera Error", description: "Could not access camera. Please check permissions.", variant: "destructive" });
        setIsCameraMode(false);
      }
    };

    if (isCameraMode) {
      startCamera();
    } else if (stream) {
      (stream as MediaStream).getTracks().forEach(track => track.stop());
    }

    return () => {
      if (stream) {
        (stream as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhoto(dataUrl);
        setIsCameraMode(false);
        setResult(null);
      }
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runCheck = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    try {
      const output = await checkPPECompliance({ photoDataUri: photo });
      setResult(output);
      toast({ 
        title: output.isCompliant ? "Access Granted" : "Access Denied", 
        description: output.isCompliant ? "All required PPE detected." : "Safety violations identified.",
        variant: output.isCompliant ? "default" : "destructive"
      });
    } catch (error) {
      console.error("PPE Compliance check failed:", error);
      toast({ title: "Analysis Failed", description: "The AI engine could not process the photo.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setResult(null);
    setIsCameraMode(false);
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <UserCheck className="size-7" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">PPE Compliance Portal</h1>
            <p className="text-muted-foreground mt-1">AI-powered facial and safety gear verification for facility entry.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {photo && (
            <Button variant="outline" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="size-4" /> Reset
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-card border-border/50 overflow-hidden relative aspect-square shadow-xl">
            {isCameraMode ? (
              <div className="relative h-full w-full bg-black">
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <Button size="lg" className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-2xl" onClick={capturePhoto}>
                    <Camera className="size-8" />
                  </Button>
                </div>
                <Button variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/10" onClick={() => setIsCameraMode(false)}>
                  <X className="size-6" />
                </Button>
              </div>
            ) : photo ? (
              <div className="relative h-full w-full">
                <Image src={photo} alt="Selfie" fill className="object-cover" />
                {!isAnalyzing && !result && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button size="lg" className="gap-2 font-bold" onClick={runCheck}>
                      <ShieldCheck className="size-5" /> Run Safety Audit
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                  <Camera className="size-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Capture Safety Selfie</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Ensure your face, hard hat, and vest are clearly visible in the frame.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2" onClick={() => setIsCameraMode(true)}>
                    <Camera className="size-4" /> Start Camera
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="size-4" /> Upload Photo
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                </div>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-50">
                <Loader2 className="size-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-bold animate-pulse">Scanning PPE Compliance...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </Card>

          <Card className="bg-secondary/10 border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500" /> Compliance Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground space-y-1">
              <p>• <strong>Hard Hat:</strong> Must be worn squarely on head.</p>
              <p>• <strong>Eye Protection:</strong> Safety glasses or face shield required.</p>
              <p>• <strong>High-Vis:</strong> Reflective vest must be zipped or fastened.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-secondary/5 border-border/40 p-12">
              <ShieldCheck className="size-16 text-muted-foreground/20 mb-4" />
              <h3 className="font-bold text-muted-foreground">Waiting for Inference Data</h3>
              <p className="text-xs text-muted-foreground mt-2">Capture a photo to start the AI verification engine.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className={`border-2 ${result.isCompliant ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-headline font-bold">Audit Determination</CardTitle>
                    <CardDescription>ISO 45001 Safety Standard Match</CardDescription>
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${result.isCompliant ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {result.isCompliant ? <ShieldCheck className="size-7" /> : <ShieldAlert className="size-7" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={result.isCompliant ? "default" : "destructive"} className="text-lg px-6 py-1 mb-4 uppercase font-black">
                    {result.isCompliant ? "Compliant" : "Safety Alert"}
                  </Badge>
                  <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-sm uppercase font-black tracking-widest text-muted-foreground px-1">Checklist Breakdown</h3>
                {result.checks.map((check, i) => (
                  <Card key={i} className="bg-card border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${check.present ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {check.present ? <CheckCircle2 className="size-5" /> : <ShieldAlert className="size-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{check.item}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{check.present ? "Detected" : "Missing / Improper"}</div>
                        </div>
                      </div>
                      <div className="text-xs italic text-muted-foreground text-right max-w-[180px]">
                        {check.comments}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!result.isCompliant && (
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3">
                  <AlertCircle className="size-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-700 font-medium">
                    <strong>ENTRY DENIED:</strong> Please correct the items listed above and re-audit before entering the production floor.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
