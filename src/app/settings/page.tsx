"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  User, 
  Bell, 
  Factory, 
  Shield, 
  Save, 
  RefreshCcw,
  MonitorSmartphone,
  Mail,
  Smartphone
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useUser, useAuth } from "@/firebase"
import { useRouter } from "next/navigation"
import { updateUserProfile, updateUserPassword, logoutUser } from "@/lib/auth-service"

export default function SettingsPage() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Security states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.displayName || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (!auth) throw new Error("Authentication not initialized");

      // 1. Update Profile name if changed
      if (name && name !== user?.displayName) {
        await updateUserProfile(auth, name);
      }

      // 2. Update Password if fields are filled
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
          throw new Error("Current password is required to change password.");
        }
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match.");
        }
        if (newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters.");
        }
        await updateUserPassword(auth, currentPassword, newPassword);
        // Clear password fields on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update preferences.",
      });
    } finally {
      setSaving(false);
    }
  }

  const handleLogout = async () => {
    try {
      if (!auth) throw new Error("Authentication not initialized");
      await logoutUser(auth);
      toast({
        title: "Logged Out",
        description: "Logged out successfully.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Settings className="size-7" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">System Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your Defect X platform and user preferences.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <RefreshCcw className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="general" className="gap-2">
            <User className="size-4" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="factory" className="gap-2">
            <Factory className="size-4" /> Factory Info
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal details and account presence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Operational Role</Label>
                <Select defaultValue="quality-manager">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Shift Operator</SelectItem>
                    <SelectItem value="quality-manager">Quality Manager</SelectItem>
                    <SelectItem value="admin">System Administrator</SelectItem>
                    <SelectItem value="engineer">Maintenance Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Channels</CardTitle>
              <CardDescription>Configure how you receive critical system and quality alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <MonitorSmartphone className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive real-time alerts in your browser.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Mail className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Email Summaries</Label>
                    <p className="text-xs text-muted-foreground">Get shift reports and weekly analytics via email.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Smartphone className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">SMS Escalations</Label>
                    <p className="text-xs text-muted-foreground">Receive text messages for "Critical" severity alerts only.</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facility Configuration</CardTitle>
              <CardDescription>Define the operational context for detection meta-data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facility-name">Facility Name</Label>
                <Input id="facility-name" defaultValue="Sector 7G - Main Plant" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="line">Default Line</Label>
                  <Select defaultValue="alpha">
                    <SelectTrigger id="line">
                      <SelectValue placeholder="Select line" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">Alpha Line</SelectItem>
                      <SelectItem value="beta">Beta Line</SelectItem>
                      <SelectItem value="gamma">Gamma Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Reporting Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="cet">CET (Central European Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access & Security</CardTitle>
              <CardDescription>Secure your account and manage active sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pass">Current Password</Label>
                <Input 
                  id="current-pass" 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input 
                    id="new-pass" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Confirm Password</Label>
                  <Input 
                    id="confirm-pass" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button 
                variant="outline" 
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/20"
                onClick={handleLogout}
              >
                Log out of all devices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
