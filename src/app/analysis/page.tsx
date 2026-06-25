"use client"

import { useState, useRef, useEffect } from "react";
import { defectInsightAnalysis, type DefectInsightAnalysisInput, type DefectInsightAnalysisOutput } from "@/ai/flows/defect-insight-analysis-flow";
import { factoryExpertChatbotInteraction } from "@/ai/flows/factory-expert-chatbot-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Search, 
  BrainCircuit, 
  ShieldAlert, 
  Zap, 
  History, 
  Upload, 
  X, 
  Image as ImageIcon,
  MessageSquareText,
  Send,
  Bot,
  User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function DefectAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DefectInsightAnalysisOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "I'm the Defect X Expert. Do you have any doubts about a specific defect or our quality standards?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState<DefectInsightAnalysisInput>({
    defectType: "Crack",
    defectDescription: "Visible crack on the engine housing flange, approximately 3.2cm in length.",
    productType: "Engine Component",
    material: "Aluminum Alloy",
    manufacturingProcess: "Die Casting",
    environmentalConditions: "High humidity, 32°C ambient",
    photoDataUri: undefined,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 4MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setInput(prev => ({ ...prev, photoDataUri: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setInput(prev => ({ ...prev, photoDataUri: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAnalysis = async () => {
    if (!input.defectDescription || !input.defectType) {
      toast({ title: "Validation Error", description: "Please fill in the defect description and type.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await defectInsightAnalysis(input);
      setAnalysis(result);
      toast({ title: "Analysis Complete", description: "Gemini has generated insights based on your data and image." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate analysis. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await factoryExpertChatbotInteraction({ question: userMsg });
      setChatMessages(prev => [...prev, { role: "assistant", content: response.answer }]);
    } catch (error) {
      console.error("Chatbot interaction error:", error);
      setChatMessages(prev => [...prev, { role: "assistant", content: "I encountered an error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const severityStyles = {
    Critical: {
      card: "border-rose-500/30 bg-rose-950/10 shadow-[0_0_25px_rgba(244,63,94,0.15)]",
      badge: "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
      alert: "bg-rose-500/10 border-rose-500/20 text-rose-200",
      text: "text-rose-400",
      accent: "bg-rose-500"
    },
    High: {
      card: "border-orange-500/30 bg-orange-950/10 shadow-[0_0_25px_rgba(249,115,22,0.15)]",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]",
      alert: "bg-orange-500/10 border-orange-500/20 text-orange-200",
      text: "text-orange-400",
      accent: "bg-orange-500"
    },
    Medium: {
      card: "border-amber-500/30 bg-amber-950/10 shadow-[0_0_25px_rgba(245,158,11,0.12)]",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
      alert: "bg-amber-500/10 border-amber-500/20 text-amber-200",
      text: "text-amber-400",
      accent: "bg-amber-500"
    },
    Low: {
      card: "border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_25px_rgba(16,185,129,0.12)]",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
      alert: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
      text: "text-emerald-400",
      accent: "bg-emerald-500"
    },
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto relative text-foreground font-body">
      <header className="flex items-center justify-between pb-2 border-b border-sky-950/10">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-wide">Defect Insight Analysis</h1>
          <p className="text-zinc-400 text-xs mt-1.5 font-medium">AI-powered multimodal root cause analysis and severity scoring.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-zinc-950/40 border-sky-950/20 hover:bg-zinc-900/60 hover:text-white transition-all text-xs h-9">
            <History className="size-4 text-sky-400" /> Previous Scans
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border border-sky-400/20 text-white shadow-md text-xs h-9 font-bold">
                <MessageSquareText className="size-4" /> Ask Expert
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-zinc-950 border-l border-sky-950/30 text-foreground">
              <SheetHeader className="p-6 border-b border-sky-950/30 bg-zinc-950/90 backdrop-blur-md">
                <SheetTitle className="flex items-center gap-2 font-headline text-lg text-white">
                  <Bot className="size-5 text-sky-400 animate-pulse" /> Factory Expert Assistant
                </SheetTitle>
                <SheetDescription className="text-zinc-400 text-xs">
                  Clear your doubts about defects, root causes, or compliance standards.
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2.5 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${m.role === 'user' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold' : 'bg-zinc-900 border border-sky-950/50 text-sky-400'}`}>
                          {m.role === 'user' ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                        </div>
                        <div className={`p-3.5 rounded-xl text-xs leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-sky-500/10 border border-sky-500/20 text-sky-200' : 'bg-zinc-900/40 border border-sky-950/15 text-zinc-300'}`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-zinc-900 border border-sky-950/50 flex items-center justify-center animate-pulse">
                          <Bot className="size-3.5 text-sky-400" />
                        </div>
                        <div className="bg-zinc-900/40 border border-sky-950/15 p-3 rounded-xl flex items-center gap-2">
                          <Loader2 className="size-3. animate-spin text-sky-400" />
                          <span className="text-[11px] text-zinc-500 font-mono font-bold uppercase tracking-wider">Evaluating query...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
 
              <div className="p-4 border-t border-sky-950/30 bg-zinc-950/80 backdrop-blur-md">
                <form onSubmit={handleChatSend} className="flex gap-2">
                  <Input 
                    placeholder="Type your doubt here..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    className="bg-zinc-950/60 border-sky-950/20 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/60 text-xs text-white"
                  />
                  <Button type="submit" size="icon" disabled={isChatLoading} className="bg-sky-500 hover:bg-sky-400 text-white size-9">
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="bg-zinc-950/40 border border-sky-950/20 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
            <BrainCircuit className="size-36 text-sky-400" />
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold font-headline flex items-center gap-2 text-white">
              <Search className="size-5 text-sky-400" /> Defect Parameters
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs font-medium">Upload inspection image and input target specs for AI evaluation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-[11px] font-semibold uppercase tracking-wider font-mono">Defect Image (Recommended)</Label>
              <div 
                className={`relative border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center min-h-[170px] group cursor-pointer overflow-hidden ${
                  imagePreview 
                    ? 'border-sky-500/30 bg-zinc-950/60' 
                    : 'border-sky-950/40 hover:border-sky-500/40 bg-zinc-950/20 hover:bg-zinc-950/60'
                }`}
                onClick={() => !imagePreview && fileInputRef.current?.click()}
              >
                {/* HUD Viewfinder corner brackets */}
                <div className="absolute top-2.5 left-2.5 size-3.5 border-t-2 border-l-2 border-sky-500/20 group-hover:border-sky-500/50 transition-colors pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 size-3.5 border-t-2 border-r-2 border-sky-500/20 group-hover:border-sky-500/50 transition-colors pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 size-3.5 border-b-2 border-l-2 border-sky-500/20 group-hover:border-sky-500/50 transition-colors pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 size-3.5 border-b-2 border-r-2 border-sky-500/20 group-hover:border-sky-500/50 transition-colors pointer-events-none" />

                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Image src={imagePreview} alt="Defect Preview" fill className="object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2.5 right-2.5 size-7 rounded-full shadow-2xl bg-rose-600 hover:bg-rose-500 text-white z-10"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    >
                      <X className="size-3.5" />
                    </Button>
                    <div className="absolute bottom-2 left-2 z-10 bg-zinc-950/80 border border-sky-950/50 px-2 py-0.5 rounded font-mono text-[7px] text-sky-400">
                      IMG_LOADED // READY_FOR_INFERENCE
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <div className="h-11 w-11 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all duration-300">
                      <Upload className="size-5 animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-200">Load Inspection Frame</p>
                      <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">PNG, JPG UP TO 4MB</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-[11px] font-semibold uppercase tracking-wider font-mono">Defect Category</Label>
                <Select value={input.defectType} onValueChange={(v) => setInput({...input, defectType: v})}>
                  <SelectTrigger className="bg-zinc-950/60 border-sky-950/20 focus:ring-sky-500/30 focus:border-sky-500/60 hover:border-sky-500/20 text-xs text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-sky-950/30 text-white text-xs">
                    {["Crack", "Scratch", "Dent", "Corrosion", "Surface Irregularity", "Packaging"].map(t => (
                      <SelectItem key={t} value={t} className="focus:bg-sky-500/15 focus:text-white cursor-pointer">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-[11px] font-semibold uppercase tracking-wider font-mono">Product Line</Label>
                <Input 
                  placeholder="e.g. Engine Housing" 
                  value={input.productType} 
                  onChange={e => setInput({...input, productType: e.target.value})}
                  className="bg-zinc-950/60 border-sky-950/20 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/60 hover:border-sky-500/20 text-xs text-white placeholder:text-zinc-650 transition-all"
                />
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-[11px] font-semibold uppercase tracking-wider font-mono">Material</Label>
                <Input 
                  placeholder="e.g. Cast Iron" 
                  value={input.material} 
                  onChange={e => setInput({...input, material: e.target.value})}
                  className="bg-zinc-950/60 border-sky-950/20 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/60 hover:border-sky-500/20 text-xs text-white placeholder:text-zinc-650 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-[11px] font-semibold uppercase tracking-wider font-mono">Manufacturing Process</Label>
                <Input 
                  placeholder="e.g. Die Casting" 
                  value={input.manufacturingProcess} 
                  onChange={e => setInput({...input, manufacturingProcess: e.target.value})}
                  className="bg-zinc-950/60 border-sky-950/20 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/60 hover:border-sky-500/20 text-xs text-white placeholder:text-zinc-650 transition-all"
                />
              </div>
            </div>
 
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-[11px] font-semibold uppercase tracking-wider font-mono">Detailed Observation</Label>
              <div className="relative">
                <Textarea 
                  placeholder="Describe dimensions, location, and visual details..." 
                  className="min-h-[90px] pr-10 bg-zinc-950/60 border-sky-950/20 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/60 hover:border-sky-500/20 text-xs text-white placeholder:text-zinc-650 transition-all leading-relaxed" 
                  value={input.defectDescription}
                  onChange={e => setInput({...input, defectDescription: e.target.value})}
                />
                <Badge variant="outline" className="absolute bottom-2.5 right-2.5 text-[8px] opacity-40 font-mono tracking-wider">MARKDOWN SUPPORTED</Badge>
              </div>
            </div>
 
            <Button className="w-full mt-4 h-11 text-base font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/10 hover:shadow-sky-500/25 active:scale-[0.98] border border-sky-400/20 transition-all duration-300" disabled={loading} onClick={runAnalysis}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> Loading Inference Pipeline...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" /> Start Neural Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
 
        <div className="space-y-6">
          {!analysis && !loading ? (
            <div className="h-full min-h-[445px] flex flex-col items-center justify-center text-center p-12 border border-sky-950/20 rounded-xl bg-zinc-950/20 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 cyber-dots opacity-20 pointer-events-none" />
              {/* HUD corner borders */}
              <div className="absolute top-2.5 left-2.5 size-3 border-t border-l border-zinc-800" />
              <div className="absolute top-2.5 right-2.5 size-3 border-t border-r border-zinc-800" />
              <div className="absolute bottom-2.5 left-2.5 size-3 border-b border-l border-zinc-800" />
              <div className="absolute bottom-2.5 right-2.5 size-3 border-b border-r border-zinc-800" />
              
              <div className="h-16 w-16 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex items-center justify-center mb-4 text-zinc-500 shadow-xl">
                <ImageIcon className="size-7 animate-pulse text-zinc-600" />
              </div>
              <h3 className="font-headline font-bold text-base mb-1.5 text-zinc-300">Awaiting Telemetry Data</h3>
              <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">Upload a component image and configure target properties to trigger the neural inference analysis engine.</p>
            </div>
          ) : loading ? (
            <div className="h-full min-h-[445px] flex flex-col items-center justify-center p-8 border border-sky-500/20 bg-zinc-950/40 rounded-xl relative overflow-hidden shadow-2xl">
              {/* Radar sweep lines */}
              <div className="absolute inset-0 cyber-grid opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] aspect-square max-w-[280px] rounded-full border border-sky-500/10 relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t border-sky-500/30 animate-radar-sweep" />
                  <div className="absolute w-[60%] aspect-square rounded-full border border-sky-500/5 animate-pulse" />
                  <div className="absolute w-[30%] aspect-square rounded-full border border-sky-500/5" />
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="absolute size-14 rounded-full bg-sky-500/10 animate-ping" />
                  <div className="size-10 rounded-xl bg-zinc-900 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <BrainCircuit className="size-5 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-bold tracking-wide text-white font-headline text-lg">Inference Engine Active</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Evaluating pixels & structural data...</div>
                </div>
                {imagePreview && (
                  <div className="relative w-48 aspect-video rounded-lg border border-sky-500/25 overflow-hidden opacity-60 mt-2 shadow-2xl">
                    <Image src={imagePreview} alt="Scanning" fill className="object-cover filter grayscale contrast-125" />
                    <div className="scan-line" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* assigned severity with neon border glows */}
              <Card className={`border backdrop-blur-md ${severityStyles[analysis!.severity].card}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-lg font-bold font-headline flex items-center gap-2 text-white">
                    <ShieldAlert className={`size-5 ${severityStyles[analysis!.severity].text}`} /> Assigned Severity
                  </CardTitle>
                  <Badge className={`text-xs px-3.5 py-0.5 uppercase font-black font-mono border ${severityStyles[analysis!.severity].badge}`}>
                    {analysis!.severity}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-300">{analysis!.severityReason}</p>
                </CardContent>
              </Card>
 
              {/* root cause card */}
              <Card className="bg-zinc-950/40 border border-sky-950/20 backdrop-blur-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-sky-500/5 blur-[30px]" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold font-headline flex items-center gap-2 text-white">
                    <Zap className="size-4 text-sky-400 animate-pulse" /> Probable Root Cause
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-zinc-950/80 rounded-lg border border-sky-950/40 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                    {analysis!.rootCause}
                  </div>
                </CardContent>
              </Card>
 
              {/* Action plan card */}
              <Card className="bg-zinc-950/40 border border-sky-950/20 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold font-headline text-white">Impact & Action Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-zinc-500">Functional Impact</span>
                    <p className="text-xs text-zinc-350 leading-relaxed">{analysis!.potentialImpact}</p>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full animate-pulse ${severityStyles[analysis!.severity].accent}`} />
                      <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-sky-450">Immediate Action Required</span>
                    </div>
                    <div className={`p-4 border rounded-lg text-xs leading-relaxed font-semibold font-mono tracking-wide ${severityStyles[analysis!.severity].alert} shadow-inner`}>
                      {analysis!.suggestedAction}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
