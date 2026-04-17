import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useAnnouncements } from '@/contexts/AnnouncementContext';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Calendar, Users, Gavel, Trophy, FileText,
  Settings, Settings2, ClipboardCheck, BarChart3, Upload, User as UserIcon,
  Trophy as TrophyIcon, Megaphone, Award, Globe, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

// ── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

// ── Nav configs ──────────────────────────────────────────────────────────────
function useOrganizerNav(): NavItem[] {
  const { teams }       = useData();
  const { unreadCount } = useAnnouncements();
  const pending = teams.filter(t => t.submission?.status === 'pending').length;
  return [
    { title: 'Dashboard',     url: '/dashboard',    icon: LayoutDashboard },
    { title: 'Events',        url: '/events',       icon: Calendar },
    { title: 'Teams',         url: '/teams',        icon: Users },
    { title: 'Judges',        url: '/judges',       icon: Gavel },
    { title: 'Submissions',   url: '/submissions',  icon: FileText, badge: pending || undefined },
    { title: 'Leaderboard',   url: '/leaderboard',  icon: Trophy },
    { title: 'Analytics',     url: '/analytics',    icon: BarChart3 },
    { title: 'Certificates',  url: '/certificates', icon: Award },
    { title: 'Announcements', url: '/announcements',icon: Megaphone, badge: unreadCount || undefined },
    { title: 'Public View',   url: '/public',       icon: Globe },
    { title: 'Cert Settings', url: '/cert-settings',icon: Settings2 },
    { title: 'Profile',       url: '/profile',      icon: UserIcon },
    { title: 'Settings',      url: '/settings',     icon: Settings },
  ];
}

function useJudgeNav(): NavItem[] {
  const { unreadCount } = useAnnouncements();
  return [
    { title: 'Dashboard',     url: '/dashboard',    icon: LayoutDashboard },
    { title: 'My Events',     url: '/events',       icon: Calendar },
    { title: 'Evaluate',      url: '/evaluate',     icon: ClipboardCheck },
    { title: 'Leaderboard',   url: '/leaderboard',  icon: Trophy },
    { title: 'Announcements', url: '/announcements',icon: Megaphone, badge: unreadCount || undefined },
    { title: 'Profile',       url: '/profile',      icon: UserIcon },
    { title: 'Settings',      url: '/settings',     icon: Settings },
  ];
}

function useTeamNav(): NavItem[] {
  const { unreadCount } = useAnnouncements();
  return [
    { title: 'Dashboard',     url: '/dashboard',    icon: LayoutDashboard },
    { title: 'My Events',     url: '/events',       icon: Calendar },
    { title: 'Team Profile',  url: '/team-profile', icon: UserIcon },
    { title: 'Submit Project',url: '/submit',       icon: Upload },
    { title: 'Leaderboard',   url: '/leaderboard',  icon: Trophy },
    { title: 'Announcements', url: '/announcements',icon: Megaphone, badge: unreadCount || undefined },
    { title: 'Certificates',  url: '/certificates', icon: Award },
    { title: 'Public View',   url: '/public',       icon: Globe },
  ];
}

// ── Sidebar Items ─────────────────────────────────────────────────────────────
function SidebarNavItems({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  const location = useLocation();

  return (
    <nav className="px-2 space-y-0.5">
      {items.map(item => {
        const isActive = location.pathname === item.url ||
          (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
        const Icon = item.icon;

        const linkEl = (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === '/dashboard'}
            title={collapsed ? item.title : undefined}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium',
              'transition-all duration-200 group relative',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              collapsed && 'justify-center px-0',
              isActive
                ? [
                    'text-primary font-semibold',
                    'dark:bg-primary/10 bg-primary/8',
                    'dark:border dark:border-primary/20 border border-primary/15',
                    'sidebar-active-glow',
                  ].join(' ')
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
            )}
          >
            <Icon
              className={cn(
                'h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200',
                isActive ? 'text-primary' : 'group-hover:text-primary/70'
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge className="h-4 min-w-[18px] px-1 text-[10px] bg-warning text-warning-foreground border-0 ml-auto flex-shrink-0">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
            {/* Dot badge when collapsed */}
            {collapsed && item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-warning flex-shrink-0" />
            )}
            {/* Active indicator bar */}
            {isActive && !collapsed && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary opacity-80" />
            )}
          </NavLink>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.title} delayDuration={300}>
              <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.title}
                {item.badge ? ` (${item.badge})` : ''}
              </TooltipContent>
            </Tooltip>
          );
        }

        return linkEl;
      })}
    </nav>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
const LS_KEY = 'eventflow-sidebar-collapsed';

export function AppSidebar() {
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(LS_KEY) === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, String(collapsed)); }
    catch { /* noop */ }
  }, [collapsed]);

  const organizerNav = useOrganizerNav();
  const judgeNav     = useJudgeNav();
  const teamNav      = useTeamNav();

  const navItems = user?.role === 'organizer' ? organizerNav
    : user?.role === 'judge' ? judgeNav
    : teamNav;

  const roleLabel = user?.role === 'organizer' ? 'Organizer'
    : user?.role === 'judge' ? 'Judge Panel'
    : 'Team Portal';

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() ?? '??';

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'relative flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden',
          'transition-[width] duration-300 ease-in-out',
          'isolate',
          /* Glass sidebar */
          'backdrop-blur-xl',
          'bg-sidebar border-r border-sidebar-border',
          'dark:bg-[--sidebar-dark] dark:border-r dark:border-white/[0.06]',
          collapsed ? 'w-[60px]' : 'w-[220px]'
        )}
        style={{
          '--sidebar-dark': 'hsl(225 30% 6% / 0.95)',
        } as React.CSSProperties}
        id="app-sidebar"
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Logo + toggle */}
        <div className={cn(
          'flex items-center border-b border-sidebar-border h-14 px-3 gap-2.5 flex-shrink-0',
          collapsed && 'justify-center px-0'
        )}>
          {/* Logo mark with glow */}
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow animate-glow">
            <TrophyIcon className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-heading font-bold text-sidebar-foreground text-sm leading-tight tracking-tight">
                EventFlow
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 font-medium">{roleLabel}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              id="sidebar-collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'absolute -right-3 top-[52px] z-50',
                'h-6 w-6 rounded-full bg-card border border-border shadow-md',
                'flex items-center justify-center',
                'text-muted-foreground hover:text-primary hover:border-primary/50',
                'transition-all duration-200 hover:scale-110 hover:shadow-glow'
              )}
            >
              {collapsed
                ? <ChevronRight className="h-3.5 w-3.5" />
                : <ChevronLeft  className="h-3.5 w-3.5" />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/35 px-4 mb-2 font-semibold">
              Navigation
            </p>
          )}
          <SidebarNavItems items={navItems} collapsed={collapsed} />
        </div>

        {/* Footer user info */}
        <div className={cn(
          'border-t border-sidebar-border p-3 flex items-center gap-2.5 flex-shrink-0',
          'bg-sidebar-accent/20',
          collapsed && 'justify-center px-0'
        )}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 cursor-default shadow-glow">
                <span className="text-white text-[10px] font-bold">{initials}</span>
              </div>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs opacity-70 capitalize">{user?.role}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize truncate">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </aside>
    </TooltipProvider>
  );
}
