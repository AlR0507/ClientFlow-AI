import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Palette, Mail, Smartphone } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 max-w-3xl space-y-8">
        {/* Profile Section */}
        <section className="rounded-xl bg-card border border-border p-6 shadow-card animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your personal information</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">First Name</label>
              <Input defaultValue="John" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <Input defaultValue="Doe" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input defaultValue="john@example.com" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Company</label>
              <Input defaultValue="Acme Corp" className="mt-1" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="rounded-xl bg-card border border-border p-6 shadow-card animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">How you want to be notified</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive reminders and updates via email</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
                </div>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Reminder Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified about upcoming follow-ups</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="rounded-xl bg-card border border-border p-6 shadow-card animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Secure your account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline">Update Password</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
