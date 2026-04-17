import { useState } from 'react';
import { useAnnouncements, Announcement } from '@/contexts/AnnouncementContext';
import { AnnouncementItem } from '@/components/AnnouncementComponents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Send, CheckCheck, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AnnouncementType = Announcement['type'];

const TYPE_OPTIONS: { value: AnnouncementType; label: string; icon: any; cls: string }[] = [
  { value: 'info',    label: 'Info',    icon: Info,          cls: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
  { value: 'success', label: 'Success', icon: CheckCircle,   cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, cls: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  { value: 'urgent',  label: 'Urgent',  icon: AlertTriangle, cls: 'border-red-500/40 bg-red-500/10 text-red-400' },
];

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { announcements, unreadCount, addAnnouncement, markAllRead } = useAnnouncements();
  const [title, setTitle] = useState('');
  const [body,  setBody]  = useState('');
  const [type,  setType]  = useState<AnnouncementType>('info');
  const [sending, setSending] = useState(false);
  const isOrganizer = user?.role === 'organizer';

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Both title and message are required.');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    addAnnouncement({ title: title.trim(), body: body.trim(), type, author: `${user?.name} (Organizer)` });
    setTitle('');
    setBody('');
    setType('info');
    setSending(false);
    toast.success('Announcement sent to all users!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Announcements
          </h1>
          <p className="text-muted-foreground text-sm">System-wide messages broadcast to all users</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2 self-start">
            <CheckCheck className="h-4 w-4" /> Mark all read
            <Badge className="bg-primary text-primary-foreground text-xs ml-0.5">{unreadCount}</Badge>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose — organizer only */}
        {isOrganizer && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-20">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" /> Compose Announcement
              </h3>

              {/* Type selector */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {TYPE_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setType(opt.value)}
                        id={`announcement-type-${opt.value}`}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all',
                          type === opt.value ? opt.cls : 'bg-muted/20 border-border/50 text-muted-foreground hover:border-primary/30'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" /> {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  id="announcement-title"
                  placeholder="e.g. Final Round starts at 5 PM"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={80}
                />
                <p className="text-[10px] text-muted-foreground text-right">{title.length}/80</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea
                  id="announcement-body"
                  placeholder="Write your announcement message here..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={4}
                  className="resize-none bg-muted/30 text-sm"
                />
              </div>

              <Button
                id="send-announcement-btn"
                onClick={handleSend}
                disabled={sending || !title.trim() || !body.trim()}
                className="w-full gradient-primary text-primary-foreground gap-2"
              >
                {sending ? 'Sending…' : <><Send className="h-4 w-4" /> Broadcast Announcement</>}
              </Button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className={cn('space-y-3', isOrganizer ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-heading font-semibold text-foreground">All Announcements</h3>
            <Badge variant="outline" className="text-xs">{announcements.length}</Badge>
          </div>
          {announcements.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map(a => <AnnouncementItem key={a.id} a={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
