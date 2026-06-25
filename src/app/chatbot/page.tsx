
"use client"

import { useState, useRef, useEffect } from "react";
import { factoryExpertChatbotInteraction } from "@/ai/flows/factory-expert-chatbot-flow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquareCode, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello, I am the Defect X Factory Expert. How can I assist you with quality standards or defect mitigation today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await factoryExpertChatbotInteraction({ question: userMsg });
      setMessages(prev => [...prev, { role: "assistant", content: response.answer }]);
    } catch (error) {
      console.error("Chatbot interaction error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error while processing your request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-8 overflow-hidden">
      <div className="flex gap-8 h-full">
        <div className="flex-1 flex flex-col gap-6">
          <header>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Bot className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-headline font-bold">Factory Expert AI</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Defect X Intelligent Assistant</p>
              </div>
            </div>
          </header>

          <Card className="flex-1 flex flex-col bg-card/40 border-border/50 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                        {m.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent/10 border border-accent/20 rounded-tr-none' : 'bg-secondary/40 border border-border/40 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                        <Bot className="size-4" />
                      </div>
                      <div className="bg-secondary/40 border border-border/40 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span className="text-xs font-medium text-muted-foreground italic">Consulting factory documentation...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/40 bg-card/60 backdrop-blur-md">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input 
                  placeholder="Ask about compliance standards, maintenance or root causes..." 
                  className="bg-background/40 border-border/40 focus:ring-primary h-12"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" size="icon" className="h-12 w-12" disabled={loading}>
                  <Send className="size-5" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="w-80 space-y-6 hidden lg:block">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Suggeted Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Why did recent cracks occur?",
                "Reducing casting defects",
                "ISO 9001 compliance check",
                "Machine 2 vibration limits",
              ].map((topic, i) => (
                <button 
                  key={i} 
                  className="w-full text-left p-3 text-xs bg-secondary/30 border border-border/40 rounded-md hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  onClick={() => setInput(topic)}
                >
                  {topic}
                  <span className="float-right opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <HelpCircle className="size-4 text-accent" /> Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
                <div className="text-[11px] leading-tight text-muted-foreground">
                  <span className="text-foreground font-bold block mb-0.5">Compliance Knowledge</span>
                  Instant lookups of ISO and safety manufacturing standards.
                </div>
              </div>
              <div className="flex gap-3">
                <Zap className="size-5 text-amber-500 shrink-0" />
                <div className="text-[11px] leading-tight text-muted-foreground">
                  <span className="text-foreground font-bold block mb-0.5">Root Cause Logic</span>
                  AI reasoning connecting sensor data to possible machine failures.
                </div>
              </div>
              <div className="flex gap-3">
                <MessageSquareCode className="size-5 text-blue-500 shrink-0" />
                <div className="text-[11px] leading-tight text-muted-foreground">
                  <span className="text-foreground font-bold block mb-0.5">Operational Guidance</span>
                  Step-by-step adjustment instructions for operators.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
