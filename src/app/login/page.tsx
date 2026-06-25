'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { 
  loginWithEmail, 
  loginWithGoogleProvider, 
  isFirebasePlaceholder,
  sendPasswordResetEmailService
} from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Cpu, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  Gauge,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setDevMode(isFirebasePlaceholder());
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your email address.',
      });
      return;
    }

    setResetting(true);
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      await sendPasswordResetEmailService(auth, resetEmail);
      toast({
        title: 'Reset Email Sent',
        description: `A password reset link has been dispatched to ${resetEmail}.`,
      });
      setResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message || 'An error occurred during password reset.',
      });
    } finally {
      setResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter both email and password.',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      await loginWithEmail(auth, email, password);
      toast({
        title: 'Welcome Back',
        description: 'Successfully authenticated to Defect X.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An error occurred during sign in.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      await loginWithGoogleProvider(auth);
      toast({
        title: 'Welcome Back',
        description: 'Successfully authenticated with Google.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An error occurred during Google sign in.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerBypass = async () => {
    setSubmitting(true);
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      await loginWithEmail(auth, 'operator.alpha@defectx.ai', 'bypasspassword123');
      toast({
        title: 'Bypass Successful',
        description: 'Logged in as mock administrator.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Bypass Failed',
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#02040a] text-foreground font-body">
      {/* Film grain noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.025] pointer-events-none mix-blend-overlay z-30" />

      {/* Background ambient nebula glowing orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_left,rgba(0,191,255,0.18),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none z-0" />

      {/* Grid background */}
      <div className="absolute inset-0 cyber-dots opacity-[0.45] pointer-events-none z-0" />

      {/* Floating particles */}
      <div className="absolute top-[18%] left-[10%] w-1.5 h-1.5 rounded-full bg-[#00bfff]/50 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '24s' }} />
      <div className="absolute top-[52%] left-[22%] w-1 h-1 rounded-full bg-blue-400/40 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '30s', animationDelay: '2s' }} />
      <div className="absolute top-[75%] left-[8%] w-2 h-2 rounded-full bg-indigo-400/30 blur-[1px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '28s', animationDelay: '4s' }} />
      <div className="absolute top-[22%] left-[45%] w-1.5 h-1.5 rounded-full bg-sky-300/45 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '26s', animationDelay: '1s' }} />
      <div className="absolute top-[82%] left-[40%] w-1 h-1 rounded-full bg-purple-400/45 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '32s', animationDelay: '3s' }} />
      <div className="absolute top-[40%] left-[35%] w-2 h-2 rounded-full bg-sky-500/30 blur-[1px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '34s', animationDelay: '5s' }} />

      {/* LEFT COLUMN: Visual Branding (Balanced & Glowing) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-16 xl:p-24 relative z-10 select-none overflow-hidden border-r border-zinc-900/40 min-h-screen">
        {/* Animated HUD scanner beam sweeping across column */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="scanner-beam-line">
            <div className="scanner-endpoint" />
          </div>
        </div>

        {/* Empty header block to balance layout */}
        <div />

        {/* Center / middle content */}
        <div className="space-y-6 max-w-lg relative z-20">
          <div className="relative inline-block">
            {/* Soft breathing radial glow behind logo */}
            <div className="absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(0,191,255,0.25)_0%,transparent_70%)] pointer-events-none z-0 animate-pulse" />
            
            {/* Rotating concentric radar SVG target overlay centered around/behind the logo */}
            <div className="absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] pointer-events-none opacity-60 z-0">
              <svg viewBox="0 0 400 400" className="w-full h-full text-sky-500/25 fill-none stroke-current">
                {/* 6 concentric circles with varying styles */}
                <circle cx="200" cy="200" r="190" strokeDasharray="1.5 5" strokeWidth="1" className="opacity-30 animate-[spin_180s_linear_infinite]" />
                <circle cx="200" cy="200" r="170" strokeWidth="0.5" className="opacity-15" />
                <circle cx="200" cy="200" r="150" strokeDasharray="16 8" strokeWidth="1.2" className="opacity-45 animate-[spin_60s_linear_infinite_reverse]" />
                <circle cx="200" cy="200" r="130" strokeDasharray="2 10" strokeWidth="1.5" className="opacity-25 animate-[spin_90s_linear_infinite]" />
                <circle cx="200" cy="200" r="105" strokeWidth="0.5" className="opacity-20" />
                <circle cx="200" cy="200" r="80" strokeDasharray="8 4" strokeWidth="1.2" className="opacity-35 animate-[spin_40s_linear_infinite]" />
                <circle cx="200" cy="200" r="55" strokeDasharray="2 4" strokeWidth="0.5" className="opacity-25" />
                
                {/* Radial tick marks around circumference */}
                <circle cx="200" cy="200" r="180" strokeDasharray="2 12" strokeWidth="3" className="opacity-55 animate-[spin_100s_linear_infinite]" />
                <circle cx="200" cy="200" r="160" strokeDasharray="1 8" strokeWidth="2" className="opacity-40" />
                
                {/* Crosshairs */}
                <line x1="10" y1="200" x2="390" y2="200" strokeWidth="0.5" strokeDasharray="4 8" className="opacity-20" />
                <line x1="200" y1="10" x2="200" y2="390" strokeWidth="0.5" strokeDasharray="4 8" className="opacity-20" />
                <line x1="65" y1="65" x2="335" y2="335" strokeWidth="0.5" strokeDasharray="2 6" className="opacity-10" />
                <line x1="65" y1="335" x2="335" y2="65" strokeWidth="0.5" strokeDasharray="2 6" className="opacity-10" />
                
                {/* Rotating radar sweep pointer with glowing endpoint and pulse */}
                <g className="origin-[200px_200px] animate-[radar-sweep_25s_linear_infinite]">
                  <line x1="200" y1="200" x2="320" y2="320" strokeWidth="1.5" stroke="url(#sweepGrad)" className="animate-pulse" />
                  {/* Glowing endpoint */}
                  <circle cx="320" cy="320" r="4.5" fill="#00bfff" className="shadow-[0_0_15px_#00bfff] fill-sky-300" />
                  <circle cx="320" cy="320" r="12" fill="none" stroke="#00bfff" strokeWidth="1.5" className="animate-ping opacity-75 origin-[320px_320px]" />
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="sweepGrad" x1="200" y1="200" x2="320" y2="320" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00bfff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-8xl font-extrabold tracking-tight font-headline leading-none relative z-10 pointer-events-none select-none">
              <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] drop-shadow-[0_0_30px_rgba(0,200,255,0.2)]">Defect</span>
              <span className="bg-gradient-to-r from-[#00BFFF] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent filter drop-shadow-[0_0_25px_rgba(0,191,255,0.85)] drop-shadow-[0_0_55px_rgba(124,58,237,0.7)]">X</span>
            </h1>

            {/* Logo Reflection */}
            <div className="absolute top-[92%] left-0 font-extrabold tracking-tight font-headline leading-none select-none pointer-events-none scale-y-[-0.4] opacity-15 blur-[2.5px] origin-top z-0 logo-reflection-mask">
              <span className="bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent">Defect</span>
              <span className="bg-gradient-to-r from-[#00BFFF] to-[#7C3AED] bg-clip-text text-transparent">X</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-zinc-550 uppercase tracking-[0.25em] text-[11px] font-mono font-medium">
                Defects, caught in motion
              </p>
            </div>
            
            {/* Dashed indicator lines */}
            <div className="flex gap-1.5 text-sky-400/80 font-semibold tracking-widest text-sm">
              <span className="h-[2px] w-6 bg-sky-500/50 rounded-full" />
              <span className="h-[2px] w-3 bg-sky-500/50 rounded-full" />
            </div>
            
            <p className="text-white/72 text-base leading-relaxed max-w-md font-sans antialiased font-light whitespace-pre-line">
              AI-powered defect detection
              {'\n'}that sees what others miss.
              {'\n'}For smarter manufacturing
              {'\n'}and uncompromised quality.
            </p>
          </div>
        </div>

        {/* Trust Badge at bottom left */}
        <div className="relative z-20">
          <div className="inline-flex items-center gap-3.5 border border-zinc-800/80 bg-[#02040a]/40 backdrop-blur-md px-5 py-4 rounded-xl max-w-xs shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <ShieldCheck className="size-6 text-sky-400 shrink-0" />
            <div className="space-y-0.5 leading-snug">
              <p className="text-zinc-400 text-[11px] font-medium tracking-wide">Trusted by industrial teams</p>
              <p className="text-zinc-500 text-[10px] font-mono">to deliver zero-defect quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The Auth Form */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-[radial-gradient(circle_at_center,rgba(8,23,44,0.12)_0%,transparent_100%)]">
        {/* Mobile Logo Header */}
        <div className="lg:hidden flex flex-col items-center gap-1.5 mb-8 select-none">
          <div className="flex items-center gap-2 bg-zinc-950/50 border border-sky-950/50 px-3 py-1.5 rounded-lg">
            <Cpu className="size-4 text-sky-400 animate-pulse" />
            <h1 className="text-2xl font-bold font-headline text-white leading-none tracking-wide text-glow-sky">
              DEFECT<span className="text-sky-400">X</span>
            </h1>
          </div>
          <p className="text-zinc-550 uppercase tracking-[0.2em] text-[8px] font-semibold font-mono">
            DEFECTS, CAUGHT IN MOTION
          </p>
        </div>

        <div className="w-full max-w-[420px] space-y-6">
          {/* Dev Mode Banner */}
          {devMode && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs backdrop-blur-md shadow-[0_4px_20px_rgba(245,158,11,0.05)] space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="size-4.5 shrink-0 text-amber-400 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-bold tracking-wide">Development Bypass Mode Active</p>
                  <p className="text-amber-400/70 leading-relaxed text-[11px]">
                    No active Firebase keys found. Any email and password will work to authorize entry.
                  </p>
                </div>
              </div>
              <Button 
                onClick={triggerBypass}
                type="button" 
                variant="outline" 
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border-amber-500/30 transition-all font-mono py-1.5 h-8 text-[11px] hover:text-white"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <span>Auto Bypass (Log in as Admin)</span>
                )}
              </Button>
            </div>
          )}

          <div className="custom-glass-card rounded-2xl p-8 md:p-10 relative overflow-hidden card-entrance">
            {/* Ambient inner soft cyan glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#00b0ff]/10 blur-2xl pointer-events-none" />

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-1 text-center pb-3">
                <h2 className="text-[48px] font-bold font-headline leading-none tracking-tight text-white select-none flex flex-col gap-1.5">
                  <span className="text-xl font-normal tracking-wide text-zinc-400">Welcome to</span>
                  <span className="flex items-center justify-center gap-1 pb-1">
                    <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">Defect</span>
                    <span className="bg-gradient-to-r from-[#00BFFF] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(0,191,255,0.75)]">X</span>
                  </span>
                </h2>
                <p className="text-zinc-400 text-xs font-normal">
                  Sign in to access your command center
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-400 text-xs font-medium">Email</Label>
                  <div className="relative group/input">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 group-focus-within/input:text-sky-400 transition-colors pointer-events-none" />
                    <Input 
                      id="email" 
                      placeholder="you@defectx.ai" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 custom-input text-white placeholder:text-zinc-600 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-zinc-400 text-xs font-medium">Password</Label>
                    <button 
                      type="button"
                      onClick={() => setResetDialogOpen(true)} 
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium bg-transparent border-none p-0 cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 group-focus-within/input:text-sky-400 transition-colors pointer-events-none" />
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 custom-input text-white placeholder:text-zinc-600 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={submitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 custom-cta-button shimmer-btn text-white font-semibold transition-all duration-300 rounded-lg border-none flex items-center justify-center gap-1.5"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...
                    </>
                  ) : (
                    <span>Get Started &gt;</span>
                  )}
                </Button>

                <div className="relative flex items-center justify-center w-full my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-900/60" />
                  </div>
                  <span className="relative px-3 text-[9px] uppercase bg-[#0b0f19]/70 text-zinc-500 tracking-wider font-mono font-bold z-10">
                    or continue with
                  </span>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 bg-[#090d16]/80 hover:bg-[#0d1524] border-zinc-800/85 hover:border-[#00bfff]/30 hover:text-white transition-all flex items-center justify-center gap-2.5 text-xs text-zinc-350 py-2.5 rounded-lg"
                  onClick={handleGoogleLogin}
                  disabled={submitting}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
              </div>

              <p className="text-center text-xs text-zinc-500 pt-1">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-sky-400 hover:text-sky-300 hover:underline font-semibold transition-colors">
                  Sign up
                </Link>
              </p>

              <div className="text-center text-[10px] text-zinc-500 border-t border-zinc-900/60 pt-4 font-mono select-none tracking-wider uppercase">
                Powered by <span className="text-[#38bdf8] font-semibold">YOLOv8</span> &amp; <span className="text-[#a855f7] font-semibold">Gemini AI</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="custom-glass-card text-foreground max-w-sm rounded-xl backdrop-blur-xl border-none">
          <form onSubmit={handleResetPassword}>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-bold font-headline text-white flex items-center gap-2">
                <Cpu className="size-5 text-sky-400 animate-pulse" /> Reset credential key
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Enter your email address and we will dispatch a secure reset key token link.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="reset-email" className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">Email Address</Label>
              <div className="relative group/input">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500 group-focus-within/input:text-sky-400 transition-colors pointer-events-none" />
                <Input 
                  id="reset-email" 
                  placeholder="operator.alpha@defectx.ai" 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-9 custom-input text-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
                  disabled={resetting}
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0">
              <Button 
                type="submit" 
                className="w-full h-10 custom-cta-button shimmer-btn text-white font-bold transition-all duration-305 rounded-lg"
                disabled={resetting}
              >
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <span>Send reset link</span>
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full h-10 border border-sky-950/40 hover:bg-zinc-900 transition-colors hover:text-white text-zinc-400 rounded-lg text-xs font-semibold mt-1"
                onClick={() => setResetDialogOpen(false)}
                disabled={resetting}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
