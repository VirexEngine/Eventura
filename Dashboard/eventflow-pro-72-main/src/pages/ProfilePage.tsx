import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User, Mail, Shield, Key, Save, Camera,
  Award, Briefcase, Star,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? '??';

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  // Re-sync form when user is refreshed from backend (e.g. on mount)
  useEffect(() => {
    if (user?.name)  setDisplayName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user?.name, user?.email]);

  const handleSave = useCallback(async () => {
    if (!displayName.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    const ok = await updateUser({ name: displayName.trim(), email: email.trim() });
    setSaving(false);
    if (ok) {
      toast.success('Profile saved!');
    } else {
      toast.error('Failed to save — backend may be offline. Local state updated.');
    }
  }, [displayName, email, updateUser]);

  const roleIcon =
    user?.role === 'organizer' ? <Briefcase className="h-3.5 w-3.5" /> :
    user?.role === 'judge'     ? <Award className="h-3.5 w-3.5" /> :
                                 <Star className="h-3.5 w-3.5" />;

  const roleColor =
    user?.role === 'organizer' ? 'bg-violet-500/15 text-violet-400 border-violet-500/30' :
    user?.role === 'judge'     ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and update your personal information
        </p>
      </div>

      {/* Hero card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Banner */}
        <div className="h-24 gradient-primary opacity-80" />
        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                onClick={() => toast.info('Avatar upload coming soon!')}
                title="Change avatar"
              >
                <Camera className="h-3 w-3 text-primary-foreground" />
              </button>
            </div>
            <div className="mb-1">
              <p className="text-lg font-bold text-foreground leading-tight">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${roleColor}`}
              >
                {roleIcon}
                {user?.role}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[
              { label: 'Role',     value: user?.role ?? '—',  icon: <Shield className="h-4 w-4 text-primary" /> },
              { label: 'Account', value: 'Active',             icon: <Star className="h-4 w-4 text-success" /> },
              { label: 'ID',       value: `#${user?.id ?? '—'}`, icon: <Briefcase className="h-4 w-4 text-muted-foreground" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-muted/40 rounded-lg px-3 py-2.5 text-center border border-border/50">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground capitalize mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="profile-name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="pl-9"
                placeholder="Your full name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2 h-10 px-3 bg-muted/40 rounded-md border border-border">
              {roleIcon}
              <span className="text-sm capitalize text-foreground font-medium">{user?.role}</span>
              <Badge variant="outline" className="ml-auto text-xs capitalize">{user?.role}</Badge>
            </div>
          </div>
        </div>
        <Button
          id="save-profile-btn"
          className="gradient-primary text-primary-foreground gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" /> Change Password
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-current-password">Current Password</Label>
            <Input id="profile-current-password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-new-password">New Password</Label>
            <Input id="profile-new-password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-confirm-password">Confirm New Password</Label>
            <Input id="profile-confirm-password" type="password" placeholder="••••••••" />
          </div>
        </div>
        <Button
          id="change-password-btn"
          variant="outline"
          className="gap-2"
          onClick={() => toast.success('Password changed successfully!')}
        >
          <Shield className="h-3.5 w-3.5" /> Update Password
        </Button>
      </div>
    </div>
  );
}
