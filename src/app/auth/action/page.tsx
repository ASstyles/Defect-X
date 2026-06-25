'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { isFirebasePlaceholder } from '@/lib/auth-service';
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cpu, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

function ActionHandlerContent() {
  const router = useRouter();
  const auth = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [status, setStatus] = useState<'verifying' | 'ready' | 'success' | 'error'>('verifying');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionTitle, setActionTitle] = useState('Verifying...');

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setErrorMessage('Invalid action link. The action code or mode query parameter is missing.');
      return;
    }

    const isPlaceholder = isFirebasePlaceholder();

    if (mode === 'resetPassword') {
      setActionTitle('Reset Password');
      if (isPlaceholder) {
        // Mock success verifying code
        setTimeout(() => {
          setEmail('operator.alpha@defectx.ai');
          setStatus('ready');
        }, 1200);
      } else {
        if (!auth) return;
        verifyPasswordResetCode(auth, oobCode)
          .then((userEmail) => {
            setEmail(userEmail);
            setStatus('ready');
          })
          .catch((error) => {
            setStatus('error');
            setErrorMessage(error.message || 'The password reset link has expired or is invalid.');
          });
      }
    } else if (mode === 'verifyEmail') {
      setActionTitle('Verify Email');
      if (isPlaceholder) {
        setTimeout(() => {
          setStatus('success');
        }, 1200);
      } else {
        if (!auth) return;
        applyActionCode(auth, oobCode)
          .then(() => {
            setStatus('success');
          })
          .catch((error) => {
            setStatus('error');
            setErrorMessage(error.message || 'The verification link has expired or is invalid.');
          });
      }
    } else {
      setStatus('error');
      setErrorMessage(`Unsupported action mode: ${mode}`);
    }
  }, [mode, oobCode, auth]);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in both password fields.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Passwords do not match.',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    setSubmitting(true);
    const isPlaceholder = isFirebasePlaceholder();

    try {
      if (isPlaceholder) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setStatus('success');
        toast({
          title: 'Success',
          description: 'Mock password update successful!',
        });
      } else {
        if (!auth || !oobCode) throw new Error('Auth or code not initialized');
        await confirmPasswordReset(auth, oobCode, password);
        setStatus('success');
        toast({
          title: 'Password Changed',
          description: 'Your DefectX account password has been updated.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message || 'An error occurred during password update.',
      });
      setStatus('error');
      setErrorMessage(error.message || 'Failed to confirm the new password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] space-y-6">
      <div className="custom-glass-card rounded-2xl p-8 md:p-10 relative overflow-hidden card-entrance">
        {/* Ambient inner soft cyan glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#00b0ff]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="space-y-1 text-center pb-3">
            <h2 className="text-[48px] font-bold font-headline leading-none tracking-tight text-white select-none flex flex-col gap-1.5">
              <span className="text-xl font-normal tracking-wide text-zinc-400">{actionTitle}</span>
              <span className="flex items-center justify-center gap-1 pb-1">
                <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">Defect</span>
                <span className="bg-gradient-to-r from-[#00BFFF] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(0,191,255,0.75)]">X</span>
              </span>
            </h2>
            {status === 'verifying' && (
              <p className="text-zinc-400 text-xs">Validating security key token...</p>
            )}
            {status === 'ready' && (
              <p className="text-zinc-400 text-xs">Resetting password for <span className="text-sky-400 font-medium">{email}</span></p>
            )}
            {status === 'success' && (
              <p className="text-zinc-400 text-xs">Action complete. Redirect to dashboard.</p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-xs">Security code verification failure.</p>
            )}
          </div>

          {status === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="size-10 text-sky-400 animate-spin" />
              <p className="text-xs font-mono text-zinc-550 uppercase tracking-wider">Awaiting Handshake</p>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pass" className="text-zinc-400 text-xs font-medium">New Password</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 group-focus-within/input:text-sky-400 transition-colors pointer-events-none" />
                    <Input 
                      id="pass" 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 custom-input text-white placeholder:text-zinc-650 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPass" className="text-zinc-400 text-xs font-medium">Confirm New Password</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 group-focus-within/input:text-sky-400 transition-colors pointer-events-none" />
                    <Input 
                      id="confirmPass" 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 custom-input text-white placeholder:text-zinc-650 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 custom-cta-button shimmer-btn text-white font-semibold transition-all duration-300 rounded-lg border-none flex items-center justify-center gap-1.5 pt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Key...
                  </>
                ) : (
                  <span>Commit Password Update &gt;</span>
                )}
              </Button>
            </form>
          )}

          {status === 'success' && (
            <div className="space-y-6 text-center py-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-500/10 p-3 border border-emerald-500/20">
                  <CheckCircle2 className="size-10 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Security Action Completed</h3>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  Your credentials have been successfully updated and saved. You can now use your new password keys to login.
                </p>
              </div>
              <Link href="/login" passHref className="block">
                <Button className="w-full h-11 custom-cta-button shimmer-btn text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 text-center py-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-500/10 p-3 border border-red-500/20">
                  <AlertCircle className="size-10 text-red-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Authentication Fault</h3>
                <p className="text-xs text-red-400/80 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Link href="/login" passHref className="block">
                <Button variant="outline" className="w-full h-11 bg-zinc-950/80 border-zinc-800 hover:bg-zinc-900 transition-colors text-white font-semibold rounded-lg">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center text-[10px] text-zinc-500 border-t border-zinc-900/60 pt-4 font-mono select-none tracking-wider uppercase">
            Powered by <span className="text-[#38bdf8] font-semibold">YOLOv8</span> &amp; <span className="text-[#a855f7] font-semibold">Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActionHandlerPage() {
  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#02040a] text-foreground font-body">
      {/* Film grain noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.025] pointer-events-none mix-blend-overlay z-30" />

      {/* Background ambient nebula glowing orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_left,rgba(0,191,255,0.18),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none z-0" />

      {/* Grid background */}
      <div className="absolute inset-0 cyber-dots opacity-[0.45] pointer-events-none z-0" />

      {/* Floating particles */}
      <div className="absolute top-[18%] left-[10%] w-1.5 h-1.5 rounded-full bg-[#00bfff]/50 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '24s' }} />
      <div className="absolute top-[52%] left-[22%] w-1 h-1 rounded-full bg-blue-400/40 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '30s', animationDelay: '2s' }} />
      <div className="absolute top-[75%] left-[8%] w-2 h-2 rounded-full bg-indigo-400/30 blur-[1px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '28s', animationDelay: '4s' }} />
      <div className="absolute top-[22%] left-[45%] w-1.5 h-1.5 rounded-full bg-sky-300/45 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '26s', animationDelay: '1s' }} />
      <div className="absolute top-[82%] left-[40%] w-1 h-1 rounded-full bg-purple-400/45 blur-[0.5px] animate-blob-float pointer-events-none z-0" style={{ animationDuration: '32s', animationDelay: '3s' }} />

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
              <p className="text-zinc-550 text-[10px] font-mono">to deliver zero-defect quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The Auth Action Form */}
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

        <Suspense fallback={
          <div className="w-full max-w-[420px] flex items-center justify-center p-12 custom-glass-card rounded-2xl">
            <Loader2 className="size-8 text-sky-400 animate-spin" />
          </div>
        }>
          <ActionHandlerContent />
        </Suspense>
      </div>
    </div>
  );
}
