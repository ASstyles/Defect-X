'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Loader2, Cpu } from 'lucide-react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage) {
        router.replace('/login');
      } else if (user && isAuthPage) {
        router.replace('/');
      }
    }
  }, [user, loading, isAuthPage, router]);

  // Show a premium loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20 opacity-75"></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Cpu className="size-6 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 mt-4">
          <span className="text-base font-bold tracking-wide text-foreground">DEFECT X</span>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Initializing Security...</span>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flash of protected dashboard if not logged in
  if (!user && !isAuthPage) {
    return null;
  }

  // Prevent flash of auth pages if already logged in
  if (user && isAuthPage) {
    return null;
  }

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-background">{children}</main>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
