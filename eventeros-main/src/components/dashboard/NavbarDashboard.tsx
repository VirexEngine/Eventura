import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Bell, LogOut, User, Settings, Search, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const notifTypeColors = {
  info:    'border-l-2 border-info',
  success: 'border-l-2 border-success',
  warning: 'border-l-2 border-warning',
  error:   'border-l-2 border-destructive',
};

interface PortalDropdownProps {
  open: boolean;
  rect: DOMRect | null;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
  name: string;
  email?: string;
  role?: string;
}

function PortalDropdown({
  open, rect, anchorRef, onClose,
  onProfile, onSettings, onLogout,
  name, email, role,
}: PortalDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !rect) return null;

  const top   = rect.bottom + 8;
  const right = (document.documentElement.clientWidth || window.innerWidth) - rect.right;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      id="profile-dropdown-menu"
      role="menu"
      aria-label="Profile menu"
      style={{
        position: 'fixed',
        top:   `${top}px`,
        right: `${right}px`,
        zIndex: 99999,
        minWidth: '220px',
      }}
      className={cn(
        'rounded-xl py-1 overflow-hidden animate-scale-in',
        'backdrop-blur-xl',
        'bg-card/90 dark:bg-[hsl(223_28%_9%/0.95)]',
        'border border-border/50 dark:border-white/[0.08]',
        'shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]',
      )}
    >
      <div className="h-px w-full bg-gradient-to-r from-primary/60 via-accent/60 to-transparent" />
      <div className="px-4 py-3 border-b border-border/50">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        {email && <p className="text-xs text-muted-foreground mt-0.5">{email}</p>}
        {role && (
          <span className="inline-block mt-1.5 text-[10px] capitalize px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
            {role}
          </span>
        )}
      </div>
      <div className="py-1">
        <button
          id="dropdown-profile"
          role="menuitem"
          onClick={onProfile}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/8 dark:hover:bg-primary/10 active:bg-primary/15 transition-all duration-200 text-left group"
        >
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors duration-200" />
          My Profile
        </button>
      </div>
      <div className="border-t border-border/40 py-1">
        <button
          id="dropdown-settings"
          role="menuitem"
          onClick={onSettings}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-primary/8 dark:hover:bg-primary/10 active:bg-primary/15 transition-all duration-200 text-left group"
        >
          <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors duration-200" />
          Settings
        </button>
        <button
          id="dropdown-logout"
          role="menuitem"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all duration-200 text-left"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>,
    document.body
  );
}

export function NavbarDashboard() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useData();
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const navigate   = useNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? '??';

  const openProfile = useCallback(() => {
    if (triggerRef.current) {
      setDropdownRect(triggerRef.current.getBoundingClientRect());
    }
    setProfileOpen(true);
  }, []);

  const closeProfile = useCallback(() => {
    setProfileOpen(false);
  }, []);

  const handleTriggerClick = useCallback(() => {
    if (profileOpen) {
      closeProfile();
    } else {
      openProfile();
    }
  }, [profileOpen, openProfile, closeProfile]);

  const go = useCallback((path: string) => {
    setProfileOpen(false);
    navigate(path);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setProfileOpen(false);
    logout();
  }, [logout]);

  const profileRoute = user?.role === 'team' ? '/team-profile' : '/profile';

  return (
    <div
      className={cn(
        'flex-1 flex items-center justify-between px-2 md:px-6 lg:px-10',
        'isolate transition-all duration-300',
      )}
    >
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="global-search"
            placeholder="Search events, teams..."
            className="pl-9 w-64 h-9 text-sm focus:w-80 transition-all duration-300 input-glow bg-muted/40 border-border/50 dark:bg-white/[0.04] dark:border-white/[0.08]"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-lg" style={{ zIndex: 9999 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs gap-1 text-primary">
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors',
                        !n.read && 'bg-accent/20',
                        notifTypeColors[n.type as keyof typeof notifTypeColors]
                      )}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
        <button
          ref={triggerRef}
          id="profile-dropdown-trigger"
          type="button"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          aria-controls="profile-dropdown-menu"
          onClick={handleTriggerClick}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer select-none',
            'transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            profileOpen
              ? 'bg-primary/10 dark:bg-primary/15 border border-primary/25 shadow-glow'
              : 'hover:bg-primary/8 dark:hover:bg-primary/10 border border-transparent hover:border-primary/20'
          )}
        >
          <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 pointer-events-none shadow-glow">
            <span className="text-white text-[10px] font-bold">{initials}</span>
          </div>
          <div className="hidden sm:block text-left pointer-events-none">
            <p className="text-xs font-semibold leading-tight text-foreground">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize leading-tight">{user?.role}</p>
          </div>
        </button>
        <PortalDropdown
          open={profileOpen}
          rect={dropdownRect}
          anchorRef={triggerRef}
          onClose={closeProfile}
          onProfile={() => go(profileRoute)}
          onSettings={() => go('/settings')}
          onLogout={handleLogout}
          name={user?.name ?? ''}
          email={user?.email}
          role={user?.role}
        />
      </div>
    </div>
  );
}
