'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Activity, ShieldAlert, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

export function AuthHud() {
  const [logs, setLogs] = useState<string[]>([
    '[SYS]: Initializing DefectX Neural Engine...',
    '[SYS]: Core initialized. Status: OK',
  ]);
  const [inferenceTime, setInferenceTime] = useState(14.2);
  const [fps, setFps] = useState(60.1);

  // Simulation of running telemetry logs
  useEffect(() => {
    const logPool = [
      '[KERN]: Loading YOLOv8 weights... [OK]',
      '[KERN]: Allocating TensorRT engine memory...',
      '[KERN]: GPU dynamic allocation successful (6.2 GB)',
      '[SYS]: Stream #1 connected (RTSP - Front Left Panel)',
      '[SYS]: Stream #2 connected (RTSP - Top Intake Flange)',
      '[DETECTION]: Class [Crack] detected on Component ID #409 (Conf: 94.1%)',
      '[DETECTION]: Class [Scratch] detected on Component ID #112 (Conf: 89.7%)',
      '[SYS]: Log dispatch synced with Firebase DB...',
      '[AI]: Running Gemini multimodal root-cause evaluation...',
      '[AI]: Resolution generated in 820ms',
      '[KERN]: Cleared memory heap successfully.',
      '[SYS]: System status: STANDBY / SECURE',
    ];

    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(-6), `[${timestamp}] ${randomLog}`]);
      
      // Jitter metrics a bit for realism
      setInferenceTime((prev) => Math.max(11.4, Math.min(18.5, +(prev + (Math.random() * 2 - 1)).toFixed(1))));
      setFps((prev) => Math.max(58.0, Math.min(62.5, +(prev + (Math.random() * 0.8 - 0.4)).toFixed(1))));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-screen flex flex-col justify-between p-8 overflow-hidden select-none bg-[#030712]">
      {/* Decorative grids and glows */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 cyber-dots opacity-40 pointer-events-none" />
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-sky-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </div>
          <span className="text-[10px] tracking-[0.2em] font-mono text-sky-400 font-bold uppercase">
            Live Stream Viewport // Camera_04
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-wider font-mono text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-900">
            FPS: {fps}
          </span>
          <span className="text-[10px] tracking-wider font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="size-2.5 animate-pulse" /> SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* CENTRAL VISUAL VIEWPORT (SCHEMATIC CAMERA SCANNER) */}
      <div className="relative flex-1 flex items-center justify-center my-6 z-10">
        {/* VIEWPORT OVERLAYS */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sky-500/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sky-500/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sky-500/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sky-500/40 rounded-br-sm pointer-events-none" />

        {/* SCANNER GRID CONTAINER */}
        <div className="relative w-[85%] aspect-square max-w-[340px] flex items-center justify-center border border-sky-950/20 bg-zinc-950/30 rounded-lg overflow-hidden">
          {/* Active Vertical Scan Line */}
          <div className="scan-line" />
          
          {/* High-tech tech SVG Gear/Turbine outline */}
          <svg className="w-[70%] h-[70%] text-zinc-800 animate-pulse duration-[4000ms]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
            <circle cx="50" cy="50" r="38" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="10" />
            {/* Turbine blades */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line 
                key={deg} 
                x1="50" 
                y1="50" 
                x2={50 + 30 * Math.cos((deg * Math.PI) / 180)} 
                y2={50 + 30 * Math.sin((deg * Math.PI) / 180)} 
              />
            ))}
            {/* outer gear teeth */}
            {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
              <path 
                key={deg} 
                d={`M ${50 + 38 * Math.cos((deg * Math.PI) / 180)} ${50 + 38 * Math.sin((deg * Math.PI) / 180)} L ${50 + 41 * Math.cos(((deg + 3) * Math.PI) / 180)} ${50 + 41 * Math.sin(((deg + 3) * Math.PI) / 180)} L ${50 + 41 * Math.cos(((deg + 7) * Math.PI) / 180)} ${50 + 41 * Math.sin(((deg + 7) * Math.PI) / 180)} L ${50 + 38 * Math.cos(((deg + 10) * Math.PI) / 180)} ${50 + 38 * Math.sin(((deg + 10) * Math.PI) / 180)}`}
              />
            ))}
          </svg>

          {/* YOLO Bounding Box Overlay #1 */}
          <div className="absolute top-[28%] left-[28%] w-[26%] h-[26%] border-2 border-rose-500/80 bg-rose-500/5 rounded shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
            <span className="absolute -top-4 -left-[1px] bg-rose-500 text-white font-mono text-[8px] font-black px-1 py-0.5 rounded-t tracking-wider">
              CRACK [98.4%]
            </span>
            <span className="absolute -bottom-1 -right-1 size-1.5 bg-rose-500 rounded-full" />
          </div>

          {/* YOLO Bounding Box Overlay #2 */}
          <div className="absolute bottom-[20%] right-[22%] w-[20%] h-[20%] border-2 border-amber-500/60 bg-amber-500/5 rounded shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse delay-700">
            <span className="absolute -top-4 -left-[1px] bg-amber-500 text-zinc-950 font-mono text-[8px] font-black px-1 py-0.5 rounded-t tracking-wider">
              SCUFF [89.1%]
            </span>
            <span className="absolute -bottom-1 -right-1 size-1.5 bg-amber-500 rounded-full" />
          </div>

          {/* Floating Telemetry Coordinates */}
          <div className="absolute top-2 left-3 font-mono text-[7px] text-sky-400/60 space-y-0.5">
            <div>CAM_LOC: LATENCY_04</div>
            <div>RES: 1080P @ 60FPS</div>
            <div>LEN_RAW: 12.083mm</div>
          </div>

          <div className="absolute bottom-2 right-3 font-mono text-[7px] text-zinc-500">
            GRID_COORD: 34.09X / -12.44Y
          </div>
        </div>

        {/* FLOATING METRICS WIDGETS */}
        <div className="absolute left-[3%] top-[10%] w-[120px] p-3 rounded-lg border border-sky-950/40 bg-zinc-950/60 backdrop-blur-md shadow-lg animate-hud-float">
          <div className="flex items-center gap-1.5 mb-1 text-sky-400">
            <Cpu className="size-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-headline">YOLOv8 Core</span>
          </div>
          <div className="text-lg font-black font-mono text-white leading-none">
            {inferenceTime} <span className="text-[10px] font-normal text-zinc-500">ms</span>
          </div>
          <div className="text-[7px] font-mono text-zinc-500 mt-1 uppercase">
            TensorRT GPU INFERENCE
          </div>
        </div>

        <div className="absolute right-[3%] bottom-[12%] w-[130px] p-3 rounded-lg border border-sky-950/40 bg-zinc-950/60 backdrop-blur-md shadow-lg animate-hud-float-delayed">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
            <Activity className="size-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider font-headline">Telemetry</span>
          </div>
          <div className="text-lg font-black font-mono text-white leading-none">
            99.8% <span className="text-[10px] font-normal text-zinc-500">ACC</span>
          </div>
          <div className="text-[7px] font-mono text-zinc-500 mt-1 uppercase">
            Inspection Model Health
          </div>
        </div>
      </div>

      {/* FOOTER TERMINAL STREAM */}
      <div className="z-10 bg-zinc-950/80 border border-sky-950/40 rounded-lg p-3 backdrop-blur-sm shadow-xl font-mono text-[9px] text-zinc-400 space-y-1">
        <div className="flex justify-between items-center pb-1.5 border-b border-sky-950/30 mb-1.5">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase text-[8px] tracking-wider">
            <Terminal className="size-3" /> Live Kernel Messages
          </div>
          <div className="size-1.5 rounded-full bg-sky-500 animate-blink" />
        </div>
        <div className="space-y-0.5 h-[80px] overflow-hidden leading-relaxed select-text select-all">
          {logs.map((log, index) => (
            <div key={index} className="truncate">
              {log.includes('OK') ? (
                <span className="text-emerald-400">{log}</span>
              ) : log.includes('DETECTION') ? (
                <span className="text-amber-400">{log}</span>
              ) : log.includes('AI') ? (
                <span className="text-cyan-400">{log}</span>
              ) : (
                log
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
