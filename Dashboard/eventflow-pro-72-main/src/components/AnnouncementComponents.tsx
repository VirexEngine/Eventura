import { useEffect, useState } from 'react';
import { useAnnouncements, Announcement } from '@/contexts/AnnouncementContext';
import { X, Megaphone, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── floating popup ────────────────────────────────────────────────────────────
const typeConfig = {
  urgent:  { icon: AlertTriangle, bg: 'bg-red-500/95',     border: 'border-red-400', text: 'text-white' },
  success: { icon: CheckCircle,  bg: 'bg-emerald-600/95',  border: 'border-emerald-400', text: 'text-white' },
  warning: { icon: AlertTriangle,bg: 'bg-amber-600/95',    border: 'border-amber-400', text: 'text-white' },
  info:    { icon: Info,          bg: 'bg-blue-600/95',     border: 'border-blue-400', text: 'text-white' },
};

export function AnnouncementPopup() {
  const { popupAnnouncement, dismissPopup } = useAnnouncements();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (popupAnnouncement) {
      setVisible(true);
      // Auto-dismiss after 8 seconds
      const t = setTimeout(() => handleDismiss(), 8000);
      return () => clearTimeout(t);
    }
  }, [popupAnnouncement]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(dismissPopup, 300);
  };

  if (!popupAnnouncement) return null;

  const cfg = typeConfig[popupAnnouncement.type];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[200] max-w-sm w-full rounded-xl border shadow-2xl p-4',
        cfg.bg, cfg.border, cfg.text,
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      id="announcement-popup"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-white/20 flex-shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">{popupAnnouncement.title}</p>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{popupAnnouncement.body}</p>
          <p className="text-[10px] opacity-60 mt-1">{popupAnnouncement.author}</p>
        </div>
        <button onClick={handleDismiss} className="text-white/80 hover:text-white flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── inline panel item ─────────────────────────────────────────────────────────
export function AnnouncementItem({ a }: { a: Announcement }) {
  const { markRead } = useAnnouncements();
  const cfg = typeConfig[a.type];
  const Icon = cfg.icon;
  const timeAgo = getTimeAgo(a.createdAt);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        a.read ? 'bg-muted/20 border-border/40' : 'bg-muted/40 border-primary/20'
      )}
    >
      <div className={cn('p-1.5 rounded-lg flex-shrink-0 mt-0.5',
        a.type === 'urgent'  ? 'bg-red-500/20 text-red-400' :
        a.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
        a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                               'bg-blue-500/20 text-blue-400'
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-semibold leading-tight', a.read ? 'text-muted-foreground' : 'text-foreground')}>
            {a.title}
          </p>
          {!a.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.body}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-muted-foreground/60">{timeAgo} · {a.author}</p>
          {!a.read && (
            <button onClick={() => markRead(a.id)}
              className="text-[10px] text-primary hover:underline font-medium">
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
