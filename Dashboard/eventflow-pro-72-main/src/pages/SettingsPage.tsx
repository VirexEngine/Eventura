import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const initials = user?.name.split(' ').map(n => n[0]).join('') ?? '??';

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Profile
        </h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="outline" className="mt-1 capitalize text-xs">{user?.role}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Display Name</Label>
            <Input id="settings-name" defaultValue={user?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email Address</Label>
            <Input id="settings-email" type="email" defaultValue={user?.email} />
          </div>
        </div>
        <Button
          className="gradient-primary text-primary-foreground gap-2"
          onClick={() => toast.success('Profile updated successfully!')}
          id="save-profile-btn"
        >
          <Save className="h-3.5 w-3.5" /> Save Changes
        </Button>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" /> Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Notifications
        </h2>
        {[
          { id: 'notif-submissions', label: 'New Submissions', desc: 'Get notified when teams submit projects' },
          { id: 'notif-evaluations', label: 'Evaluation Updates', desc: 'Get notified when scores are saved' },
          { id: 'notif-deadlines', label: 'Deadline Reminders', desc: 'Reminders 24 hours before deadlines' },
        ].map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <input
              id={item.id}
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-primary cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> Security
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="••••••••" />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success('Password changed successfully!')}
          id="change-password-btn"
        >
          Change Password
        </Button>
      </div>
    </div>
  );
}
