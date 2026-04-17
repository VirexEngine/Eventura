import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User, Mail, Shield, Key, Save, Camera,
  Award, Briefcase, Star, Calendar, Upload, Megaphone,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="space-y-6 animate-fade-in w-full">
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
              { label: 'Events Joined',     value: '4',  icon: <Calendar className="h-4 w-4 text-primary" /> },
              { label: 'Projects Submitted', value: '2',  icon: <Upload className="h-4 w-4 text-success" /> },
              { label: 'Orgs Joined',       value: user?.organisations?.length || 0, icon: <Briefcase className="h-4 w-4 text-muted-foreground" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-muted/40 rounded-lg px-3 py-2.5 text-center border border-border/50">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{stat.value}</p>
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

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <Tabs defaultValue="events">
          <TabsList className="grid grid-cols-3 bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="events" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold gap-2">
              <Calendar className="w-3.5 h-3.5" /> My Events
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold gap-2">
              <Upload className="w-3.5 h-3.5" /> My Projects
            </TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs font-semibold gap-2">
              <Megaphone className="w-3.5 h-3.5" /> Announcements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-4 outline-none">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto space-x-6 mb-4">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 text-xs">Upcoming</TabsTrigger>
                <TabsTrigger value="live" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 text-xs"><span className="w-1.5 h-1.5 bg-live rounded-full mr-1.5 live-pulse"></span>Live</TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 text-xs">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-3">
                <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">UI/UX Designathon</h4>
                    <p className="text-xs text-muted-foreground">Design Council • Today, 3:00 PM</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px]">UPCOMING</Badge>
                </div>
              </TabsContent>
              <TabsContent value="live" className="space-y-3">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">Code Sprint 3.0</h4>
                    <p className="text-xs text-muted-foreground">TechFest IIT • Happening Now</p>
                  </div>
                  <Badge className="bg-live/10 text-live hover:bg-live/20 border-0 text-[10px]"><span className="w-1.5 h-1.5 bg-live rounded-full mr-1.5 live-pulse"></span>LIVE</Badge>
                </div>
              </TabsContent>
              <TabsContent value="past" className="space-y-3">
                <div className="p-4 rounded-xl border border-border/50 bg-card flex items-center justify-between opacity-70">
                  <div>
                    <h4 className="font-semibold text-sm">Basketball 3v3</h4>
                    <p className="text-xs text-muted-foreground">Sports Board • Ended yesterday</p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">ENDED</Badge>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="projects" className="mt-4 outline-none space-y-4">
            <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">EduTech Platform Redesign</h4>
                  <p className="text-xs text-muted-foreground">UI/UX Designathon</p>
                </div>
                <Badge className="bg-success/15 text-success hover:bg-success/25 border-0">Winner</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2">A complete redesign of the university's learning management system focusing on accessibility and mobile-first approach.</p>
              <p className="text-[10px] text-muted-foreground mt-3">Submitted on Oct 12, 2023</p>
            </div>
            
            <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">Quantum Algorithm Simulator</h4>
                  <p className="text-xs text-muted-foreground">Code Sprint 3.0</p>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Pending</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Submitted today at 11:45 AM</p>
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="mt-4 outline-none space-y-4">
            <div className="p-4 rounded-lg border-l-2 border-primary bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[9px] h-4 leading-none py-0">TechFest IIT</Badge>
                <span className="text-[10px] text-muted-foreground">2 hours ago</span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">Code Sprint Submission Deadline Extended</h4>
              <p className="text-xs text-muted-foreground mt-1">Good news! We are extending the deadline by 2 hours. You now have until 8:00 PM to submit your projects.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
