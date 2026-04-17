import { useState } from 'react';
import { mockEvents, mockTeams, mockJudges, Event, EventCategory } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, MapPin, Users, Gavel, FileText, Search, X,
  Tag, Clock, ChevronRight, Trophy, Info, Target, Layers,
  BarChart2, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<EventCategory, { emoji: string; color: string }> = {
  Tech:    { emoji: '💻', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  Sports:  { emoji: '🏆', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  Dance:   { emoji: '💃', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  Music:   { emoji: '🎵', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  Drama:   { emoji: '🎭', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  Others:  { emoji: '✨', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
};

function CategoryBadge({ category }: { category: EventCategory }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.Others;
  return (
    <Badge className={`text-[11px] font-semibold border gap-1 ${cfg.color}`}>
      {cfg.emoji} {category}
    </Badge>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'live'      ? 'bg-success/15 text-success border-success/30' :
    status === 'upcoming'  ? 'bg-warning/15 text-warning border-warning/30' :
                             'bg-muted/50 text-muted-foreground border-border/50';
  const label = status === 'live' ? '🔴 Live' : status === 'upcoming' ? 'Upcoming' : 'Completed';
  return <Badge className={`text-xs border font-medium ${cfg}`}>{label}</Badge>;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const catCfg = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.Others;
  const teamsInEvent = mockTeams.filter(t => t.eventIds.includes(event.id));
  const judgesInEvent = mockJudges.filter(j => j.eventsAssigned.includes(event.id));
  const winnerTeam    = event.winnerTeamId ? mockTeams.find(t => t.id === event.winnerTeamId) : undefined;
  const runnerUpTeam  = event.runnerUpTeamId ? mockTeams.find(t => t.id === event.runnerUpTeamId) : undefined;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[hsl(var(--card))] border border-border rounded-2xl shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[hsl(var(--card))] border-b border-border px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CategoryBadge category={event.category} />
              <EventStatusBadge status={event.status} />
            </div>
            <h2 className="text-xl font-bold font-heading text-foreground leading-tight">{event.title}</h2>
            <p className={`text-sm font-semibold mt-0.5 ${catCfg.color.split(' ')[1]}`}>{event.theme}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0" id="close-event-modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> About This Event
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: 'Start Date',  val: fmtDate(event.startDate) },
              { icon: Calendar, label: 'End Date',    val: fmtDate(event.endDate) },
              { icon: MapPin,   label: 'Venue',       val: event.venue },
              { icon: Tag,      label: 'Category',    val: `${catCfg.emoji} ${event.category}` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-muted/20 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">{val}</p>
              </div>
            ))}
          </div>

          {/* Team size & participation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users,    label: 'Min Members',   val: event.minMembers },
              { icon: Users,    label: 'Max Members',   val: event.maxMembers },
              { icon: Layers,   label: 'Teams Joined',  val: `${teamsInEvent.length} / ${event.teamsCount}` },
              { icon: Gavel,    label: 'Judges',        val: judgesInEvent.length },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-muted/20 rounded-xl p-3 text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold font-heading text-foreground leading-none">{val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Prizes */}
          {event.prizes && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" /> Prize Pool
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-xs bg-yellow-400/15 text-yellow-400 border-yellow-400/30 gap-1.5 py-1">
                  🥇 {event.prizes.first}
                </Badge>
                <Badge className="text-xs bg-slate-400/15 text-slate-300 border-slate-400/30 gap-1.5 py-1">
                  🥈 {event.prizes.second}
                </Badge>
                {event.prizes.third && (
                  <Badge className="text-xs bg-amber-600/15 text-amber-500 border-amber-600/30 gap-1.5 py-1">
                    🥉 {event.prizes.third}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Results (if completed + winner declared) */}
          {event.status === 'completed' && winnerTeam && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-yellow-400" /> Results
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥇</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{winnerTeam.name}</p>
                      <p className="text-xs text-muted-foreground">{winnerTeam.submission?.projectTitle ?? 'Winner'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">{event.winnerScore} pts</span>
                </div>
                {runnerUpTeam && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-400/10 border border-slate-400/30">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🥈</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{runnerUpTeam.name}</p>
                        <p className="text-xs text-muted-foreground">{runnerUpTeam.submission?.projectTitle ?? 'Runner-up'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-slate-300 border-slate-400/30">Runner-up</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Judges */}
          {judgesInEvent.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Gavel className="h-3.5 w-3.5" /> Assigned Judges
              </h4>
              <div className="flex flex-wrap gap-2">
                {judgesInEvent.map(j => (
                  <div key={j.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                    <div className="h-5 w-5 rounded-md gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-bold text-primary-foreground">{j.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground leading-tight">{j.name}</p>
                      <p className="text-[10px] text-muted-foreground">{j.expertise}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams */}
          {teamsInEvent.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Registered Teams ({teamsInEvent.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {teamsInEvent.map(t => (
                  <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/40">
                    <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-primary-foreground">{t.name.slice(0,2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.members.length} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
      id={`event-card-${event.id}`}
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryBadge category={event.category} />
            <EventStatusBadge status={event.status} />
          </div>
          <h3 className="font-heading font-bold text-foreground text-base leading-tight mt-1">{event.title}</h3>
          <p className="text-xs text-primary font-medium mt-0.5">{event.theme}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors mt-1" />
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{event.description}</p>

      <div className="grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{event.venue}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          {event.teamsCount} teams · {event.minMembers}–{event.maxMembers} members
        </span>
        <span className="flex items-center gap-1.5">
          <Gavel className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          {event.judgesCount} judges
        </span>
      </div>

      {event.status === 'completed' && event.winnerTeamId && (() => {
        const w = mockTeams.find(t => t.id === event.winnerTeamId);
        return w ? (
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs text-yellow-400 font-medium">
            <Trophy className="h-3.5 w-3.5" /> Winner: {w.name}
          </div>
        ) : null;
      })()}

      {event.submissionsCount > 0 && !event.winnerTeamId && (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {event.submissionsCount} submissions received
        </div>
      )}

      <p className="text-[10px] text-primary/60 mt-3 group-hover:text-primary transition-colors">
        Click for full details →
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type FilterStatus = 'all' | 'live' | 'upcoming' | 'completed';

const ALL_CATEGORIES: ('all' | EventCategory)[] = ['all', 'Tech', 'Sports', 'Dance', 'Music', 'Drama', 'Others'];

export default function EventsPage() {
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState<FilterStatus>('all');
  const [category, setCategory] = useState<'all' | EventCategory>('all');
  const [selected, setSelected] = useState<Event | null>(null);

  const filtered = mockEvents.filter(ev => {
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase()) ||
      ev.theme.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = status   === 'all' || ev.status   === status;
    const matchCategory = category === 'all' || ev.category === category;
    return matchSearch && matchStatus && matchCategory;
  });

  const statusCounts: Record<FilterStatus, number> = {
    all:       mockEvents.length,
    live:      mockEvents.filter(e => e.status === 'live').length,
    upcoming:  mockEvents.filter(e => e.status === 'upcoming').length,
    completed: mockEvents.filter(e => e.status === 'completed').length,
  };

  const statusButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all',       label: 'All Events' },
    { key: 'live',      label: '🔴 Live' },
    { key: 'upcoming',  label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {selected && (
        <EventDetailModal event={selected} onClose={() => setSelected(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Events</h1>
          <p className="text-muted-foreground text-sm">Manage and monitor all events · {mockEvents.length} total</p>
        </div>
        {/* Quick stats */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Live',      val: statusCounts.live,      cls: 'bg-success/10 text-success border-success/30' },
            { label: 'Upcoming',  val: statusCounts.upcoming,  cls: 'bg-warning/10 text-warning border-warning/30' },
            { label: 'Completed', val: statusCounts.completed, cls: 'bg-muted/30 text-muted-foreground border-border/40' },
          ].map(({ label, val, cls }) => (
            <Badge key={label} className={`text-xs border gap-1 ${cls}`}>
              {val} {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="events-search"
          placeholder="Search events, themes, venues..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusButtons.map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={status === key ? 'default' : 'outline'}
            onClick={() => setStatus(key)}
            className={cn(status === key && 'gradient-primary text-primary-foreground border-transparent')}
            id={`filter-status-${key}`}
          >
            {label}
            <Badge
              variant={status === key ? 'secondary' : 'outline'}
              className="ml-1.5 h-4 text-[10px] min-w-[18px] px-1"
            >
              {statusCounts[key]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <BarChart2 className="h-3.5 w-3.5" /> Category:
        </span>
        {ALL_CATEGORIES.map(cat => {
          const cfg = cat !== 'all' ? CATEGORY_CONFIG[cat] : null;
          const count = cat === 'all' ? mockEvents.length : mockEvents.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              id={`filter-cat-${cat}`}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'
              )}
            >
              {cfg ? `${cfg.emoji} ` : ''}{cat === 'all' ? 'All' : cat}
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(event => (
          <EventCard key={event.id} event={event} onClick={() => setSelected(event)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No events found</p>
            <p className="text-sm mt-1">Try adjusting your search, status or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
