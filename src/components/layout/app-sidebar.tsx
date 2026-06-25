"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Camera,
  Search,
  Wrench,
  MessageSquareCode,
  AlertTriangle,
  Activity,
  Cpu,
  Settings,
  ShieldCheck,
  FileText,
  UserCheck,
  LogOut,
  ChevronsUpDown,
  User
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { ThemeToggle } from "@/components/theme-toggle"
import { logoutUser } from "@/lib/auth-service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const items = [
  {
    title: "Digital Twin",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Live Inspection",
    url: "/inspection",
    icon: Camera,
  },
  {
    title: "Defect Analysis",
    url: "/analysis",
    icon: Search,
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Expert Assistant",
    url: "/chatbot",
    icon: MessageSquareCode,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const db = useFirestore()
  const router = useRouter()
  const { user } = useUser()
  const auth = useAuth()

  const handleLogout = async () => {
    if (!auth) return;
    await logoutUser(auth);
    router.push('/login');
  }

  // Real-time alert count for the badge
  const alertsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "alerts"), where("status", "==", "active"));
  }, [db]);

  const { data: alerts } = useCollection(alertsQuery);
  const activeAlertCount = alerts?.length || 0;

  const factoryItems = [
    {
      title: "PPE Check",
      url: "/ppe",
      icon: UserCheck,
    },
    {
      title: "Alerts",
      url: "/alerts",
      icon: AlertTriangle,
      badge: activeAlertCount > 0 ? activeAlertCount.toString() : undefined,
    },
    {
      title: "Line Performance",
      url: "/performance",
      icon: Activity,
    },
    {
      title: "Compliance",
      url: "/compliance",
      icon: ShieldCheck,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
  ]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Cpu className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-bold text-lg tracking-tight">DEFECT X</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">AI Inspection</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Control Center</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Manufacturing Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {factoryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-3 w-full"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.email || 'default')}`} alt={user?.displayName || "Operator"} />
                    <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold">
                      {user?.displayName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "OP"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user?.displayName || 'Operator'}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email || 'operator@defectx.ai'}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-zinc-950 border border-border shadow-xl p-1"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.email || 'default')}`} alt={user?.displayName || "Operator"} />
                      <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold">
                        {user?.displayName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "OP"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.displayName || 'Operator'}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email || 'operator@defectx.ai'}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40 my-1" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer gap-2 px-2 py-1.5 rounded" onClick={() => router.push('/settings')}>
                    <Settings className="size-4" />
                    <span className="text-sm">Control Panel Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer gap-2 px-2 py-1.5 rounded" onClick={() => router.push('/settings')}>
                    <User className="size-4" />
                    <span className="text-sm">Operator Profile</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/40 my-1" />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Dark Theme</span>
                  <ThemeToggle />
                </div>
                <DropdownMenuSeparator className="bg-border/40 my-1" />
                <DropdownMenuItem 
                  className="text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer gap-2 px-2 py-1.5 rounded"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  <span className="text-sm">Log out operator</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
