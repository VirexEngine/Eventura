import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  dashboardStats, mockEvents, mockTeams, mockJudges, mockScores,
  judgeEventAssignments, Event, EventCategory,
} from '@/data/mockData';
import {
  Calendar, Users, Gavel, FileText, Trophy, Clock,
  TrendingUp, CheckCircle, ArrowRight, MapPin, Video,
  VideoOff, Medal, BarChart2, Tag, X, Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Chart data ────────────────────────────────────────────────────────────────
const submissionData = [
  { name: 'Mon', submitted: 4, pending: 2 },
  { name: 'Tue', submitted: 7, pending: 3 },
  { name: 'Wed', submitted: 5, pending: 1 },
  { name: 'Thu', submitted: 8, pending: 4 },
  { name: 'Fri', submitted: 12, pending: 2 },
  { name: 'Sat', submitted: 6, pending: 1 },
  { name: 'Sun', submitted: 3, pending: 0 },
];

// Each slice counts its own exact status — no double-counting
const statusData = [
  { name: 'Submitted', value: mockTeams.filter(t => t.submission?.status === 'submitted').length, color: 'hsl(270, 95%, 65%)' },
  { name: 'Pending',   value: mockTeams.filter(t => t.submission?.status === 'pending').length,   color: 'hsl(38, 92%, 55%)' },
  { name: 'Approved',  value: mockTeams.filter(t => t.submission?.status === 'approved').length,  color: 'hsl(142, 76%, 42%)' },
  { name: 'Rejected',  value: mockTeams.filter(t => t.submission?.status === 'rejected').length,  color: 'hsl(0, 70%, 50%)' },
];

const chartTooltip = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

// ── helpers ───────────────────────────────────────────────────────────────────
function EventStatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'live'      ? 'bg-success/15 text-success border-success/30' :
    status === 'upcoming'  ? 'bg-warning/15 text-warning border-warning/30' :
                             'bg-muted/50 text-muted-foreground border-border/50';
  const label = status === 'live' ? '🔴 Live' : status === 'upcoming' ? 'Upcoming' : 'Completed';
  return <Badge className={`text-xs border font-medium ${cfg}`}>{label}</Badge>;
}

const CATEGORY_EMOJI: Record<EventCategory, string> = {
  Tech: '💻', Sports: '🏆', Dance: '💃', Music: '🎵', Drama: '🎭', Others: '✨',
};

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function OrganizerDashboard() {
  const stats = dashboardStats.organizer;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  // Stats derived from real arrays
  const realTeamCount    = mockTeams.length;
  const realJudgeCount   = mockJudges.length;
  // All teams that have ANY submission object (pending, submitted, approved, rejected)
  const totalSubmissions = mockTeams.filter(t => !!t.submission).length;
  // Pending = those still awaiting review
  const pendingCount     = mockTeams.filter(t => t.submission?.status === 'pending').length;
  const liveEventCount   = mockEvents.filter(e => e.status === 'live').length;
  const completedEvents = mockEvents.filter(e => e.status === 'completed');

  // ✅ ISSUE 3: Category breakdown chart data
  const categoryBreakdown = (['Tech', 'Sports', 'Dance', 'Music', 'Drama', 'Others'] as EventCategory[])
    .map(cat => ({
      name: cat,
      events: mockEvents.filter(e => e.category === cat).length,
      teams:  mockTeams.filter(t => mockEvents.filter(e => e.category === cat).some(e => t.eventIds.includes(e.id))).length,
    }))
    .filter(c => c.events > 0);

  // Filtered events by tab
  const filteredEvents = activeTab === 'all'
    ? mockEvents
    : mockEvents.filter(e => e.status === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Organizer Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of all events and activities</p>
      </div>

      {/* ✅ Stats — all derived from real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events" value={mockEvents.length}
          icon={Calendar} variant="primary"
          trend={`${liveEventCount} live · ${stats.completedEvents} done`}
        />
        <StatsCard
          title="Total Teams" value={realTeamCount}
          icon={Users} variant="accent"
          trend={`Across ${mockEvents.length} events`}
        />
        <StatsCard
          title="Judges" value={realJudgeCount}
          icon={Gavel}
          trend={`${mockJudges.filter(j => j.eventsAssigned.length > 1).length} multi-event`}
        />
        <StatsCard
          title="Submissions" value={totalSubmissions}
          icon={FileText}
          trend={`${pendingCount} pending review`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Submission Activity</h3>
            <Badge variant="outline" className="text-xs">This Week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={submissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip {...chartTooltip} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="submitted" fill="hsl(270,95%,65%)" radius={[4,4,0,0]} name="Submitted" />
              <Bar dataKey="pending"   fill="hsl(38,92%,55%)"  radius={[4,4,0,0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ ISSUE 3: Category breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Events by Category
            </h3>
            <Badge variant="outline" className="text-xs">{mockEvents.length} Total</Badge>
          </div>
          <div className="space-y-2">
            {categoryBreakdown.map(({ name, events, teams }) => {
              const cat = name as EventCategory;
              const pct = Math.round((events / mockEvents.length) * 100);
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-base w-5 flex-shrink-0">{CATEGORY_EMOJI[cat]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground">{events} events · {teams} teams</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ ISSUE 4: Event Results Table */}
      {completedEvents.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" /> Event Results
            </h3>
            <Badge className="bg-success/15 text-success border-success/30 text-xs gap-1">
              <CheckCircle className="h-3 w-3" /> {completedEvents.length} Completed
            </Badge>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50">
                  {['Event Name', 'Category', 'Winning Team 🏆', 'Runner-up', 'Score', 'Status'].map(h => (
                    <th key={h} className="pb-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {completedEvents.map(ev => {
                  const winner   = ev.winnerTeamId    ? mockTeams.find(t => t.id === ev.winnerTeamId)    : undefined;
                  const runnerUp = ev.runnerUpTeamId  ? mockTeams.find(t => t.id === ev.runnerUpTeamId)  : undefined;
                  return (
                    <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{CATEGORY_EMOJI[ev.category]}</span>
                          <span className="text-sm font-semibold text-foreground">{ev.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 pl-6">{ev.venue}</p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge className="text-[10px] border bg-muted/30 text-muted-foreground border-border/50 gap-1">
                          {CATEGORY_EMOJI[ev.category]} {ev.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        {winner ? (
                          <div className="flex items-center gap-1.5">
                            <span>🥇</span>
                            <div>
                              <p className="text-sm font-bold text-foreground">{winner.name}</p>
                              <p className="text-[10px] text-muted-foreground">{winner.submission?.projectTitle ?? '—'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">TBD</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {runnerUp ? (
                          <div className="flex items-center gap-1.5">
                            <span>🥈</span>
                            <span className="text-sm text-foreground">{runnerUp.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">TBD</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {ev.winnerScore !== undefined
                          ? <span className="font-bold font-heading text-primary">{ev.winnerScore}</span>
                          : <span className="text-muted-foreground/40 text-xs">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        <EventStatusBadge status={ev.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ ISSUE 2: My Events — clickable rows */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-heading font-semibold text-foreground">All Events</h3>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'live', 'upcoming', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/40'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'live' ? '🔴 Live' : tab === 'upcoming' ? 'Upcoming' : 'Completed'}
                <span className="ml-1 opacity-70">
                  ({tab === 'all' ? mockEvents.length : mockEvents.filter(e => e.status === tab).length})
                </span>
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-xs text-primary gap-1 h-7">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredEvents.map(event => {
            const teamsCount  = mockTeams.filter(t => t.eventIds.includes(event.id)).length;
            const judgesCount = mockJudges.filter(j => j.eventsAssigned.includes(event.id)).length;
            const winner = event.winnerTeamId ? mockTeams.find(t => t.id === event.winnerTeamId) : undefined;
            return (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate('/events')}
                id={`dash-event-${event.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent flex-shrink-0">
                    <span className="text-sm">{CATEGORY_EMOJI[event.category]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.venue} · {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {winner && (
                      <p className="text-xs text-yellow-400 font-medium mt-0.5">🏆 {winner.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 mt-2 sm:mt-0">
                  <div className="hidden sm:flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{teamsCount} teams</span>
                    <span className="flex items-center gap-1"><Gavel className="h-3 w-3" />{judgesCount} judges</span>
                  </div>
                  <EventStatusBadge status={event.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ ISSUE 1 FIX: Teams table — ALL teams rendered */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            All Teams
            <Badge variant="outline" className="text-xs ml-1">{mockTeams.length} total</Badge>
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/teams')} className="text-xs text-primary gap-1">
            Manage <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-border/50">
                {['Team', 'Members', 'Event', 'Submission', 'Video', 'Score'].map(h => (
                  <th key={h} className="pb-2 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {/* ✅ ALL teams — no slice, fully dynamic */}
              {mockTeams.map(team => {
                const event     = mockEvents.find(e => team.eventIds.includes(e.id));
                const score     = mockScores.find(s => s.teamId === team.id);
                const hasVideo  = !!(team.submission?.videoUrl?.trim());
                return (
                  <tr key={team.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-primary-foreground">{team.name.slice(0,2).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">{team.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-sm text-muted-foreground">{team.members.length}</td>
                    <td className="py-2.5 px-2">
                      {event
                        ? <span className="text-xs font-medium text-foreground">{event.title}</span>
                        : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </td>
                    <td className="py-2.5 px-2">
                      {team.submission
                        ? <StatusBadge status={team.submission.status} />
                        : <Badge variant="outline" className="text-xs text-muted-foreground border-border/50">None</Badge>}
                    </td>
                    <td className="py-2.5 px-2">
                      {hasVideo
                        ? <Badge className="text-[10px] bg-success/10 text-success border-success/30 gap-0.5">✅ Yes</Badge>
                        : <Badge variant="outline" className="text-[10px] text-warning border-warning/30 gap-0.5"><VideoOff className="h-2.5 w-2.5" /> No</Badge>}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {score?.evaluated
                        ? <span className="font-bold text-primary text-sm">{score.total}/40</span>
                        : <span className="text-muted-foreground/50 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ ISSUE 1 FIX: Judges table — ALL judges rendered */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <Gavel className="h-4 w-4 text-primary" />
            All Judges
            <Badge variant="outline" className="text-xs ml-1">{mockJudges.length} total</Badge>
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/judges')} className="text-xs text-primary gap-1">
            Manage <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Scrollable list for all judges */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {mockJudges.map(judge => {
            const assignedEvts = mockEvents.filter(e => judge.eventsAssigned.includes(e.id));
            return (
              <div key={judge.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary-foreground">
                    {judge.name.split(' ').filter((_,i,a) => i === 0 || i === a.length-1).map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{judge.name}</p>
                  <p className="text-xs text-primary font-medium">{judge.expertise}</p>
                  <p className="text-xs text-muted-foreground">{judge.organization}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assignedEvts.map(ev => (
                      <Badge key={ev.id} variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                        {CATEGORY_EMOJI[ev.category]} {ev.title}
                      </Badge>
                    ))}
                    {assignedEvts.length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic">No events yet</span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{assignedEvts.length} event{assignedEvts.length !== 1 ? 's' : ''}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JUDGE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function JudgeDashboard() {
  const { user } = useAuth();
  const { teams, scores } = useData();
  const navigate = useNavigate();

  const assignedEventIds = judgeEventAssignments[user?.id ?? '2'] ?? [];
  const assignedEvents   = mockEvents.filter(e => assignedEventIds.includes(e.id));

  const allTeamsWithScores = teams.map(team => ({
    team,
    score: scores.find(s => s.teamId === team.id),
  }));
  const completedCount = allTeamsWithScores.filter(({ score }) => score?.evaluated).length;
  const pendingCount   = allTeamsWithScores.filter(({ score }) => !score?.evaluated).length;
  const totalTeamCount = teams.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Judge Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome, <span className="font-medium text-foreground">{user?.name}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Assigned Events"   value={assignedEvents.length} icon={Calendar} variant="primary" />
        <StatsCard title="Teams to Evaluate" value={totalTeamCount}         icon={Users} />
        <StatsCard title="Completed"         value={completedCount}         icon={Trophy} variant="accent"
          trend={`${totalTeamCount > 0 ? Math.round((completedCount / totalTeamCount) * 100) : 0}% done`} />
        <StatsCard title="Pending"           value={pendingCount}           icon={Clock} />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> My Assigned Events
        </h3>
        {assignedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No events assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedEvents.map(event => (
              <div key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <span className="text-base">{CATEGORY_EMOJI[event.category]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.venue}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.teamsCount} teams</span>
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <EventStatusBadge status={event.status} />
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Role: Judge</Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm"
                  className="gradient-primary text-primary-foreground gap-1.5 flex-shrink-0 self-start sm:self-center"
                  onClick={() => navigate('/evaluate')}
                  id={`judge-evaluate-${event.id}`}
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Go to Evaluation
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Evaluation Progress
          </h3>
          <span className="text-xs text-muted-foreground">{completedCount}/{totalTeamCount} teams evaluated</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div className="h-full rounded-full gradient-primary transition-all"
            style={{ width: `${totalTeamCount > 0 ? (completedCount / totalTeamCount) * 100 : 0}%` }} />
        </div>
        {totalTeamCount === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No teams assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {allTeamsWithScores.map(({ team, score }) => {
              const evaluated = score?.evaluated ?? false;
              const hasVideo  = !!(team.submission?.videoUrl?.trim());
              return (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${evaluated ? 'bg-success/20' : 'bg-warning/20'}`}>
                      {evaluated ? <CheckCircle className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{team.submission?.projectTitle || 'No submission yet'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {hasVideo
                      ? <Badge className="text-[10px] bg-success/10 text-success border-success/30 py-0">✅ Video</Badge>
                      : <Badge variant="outline" className="text-[10px] text-warning border-warning/30 py-0">❌ No Video</Badge>}
                    {evaluated
                      ? <span className="text-sm font-bold text-primary">{score?.total}/40</span>
                      : <Badge variant="outline" className="text-xs text-warning border-warning/30">Pending</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button className="w-full mt-4 gradient-primary text-primary-foreground gap-2"
          onClick={() => navigate('/evaluate')} id="go-evaluate-btn">
          <TrendingUp className="h-4 w-4" /> Go to Evaluation
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function TeamDashboard() {
  const { user } = useAuth();
  const { teams, scores } = useData();
  const navigate = useNavigate();
  const stats = dashboardStats.team;

  const team  = teams.find(t => t.id === (user?.teamId ?? '1')) ?? teams[0];
  const score = scores.find(s => s.teamId === team?.id);
  const joinedEvents = mockEvents.filter(e => (team?.eventIds ?? [team?.eventId]).includes(e.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Team Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back, <span className="font-medium text-foreground">{user?.name ?? team?.name}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Events Joined" value={joinedEvents.length} icon={Calendar} variant="primary" />
        <StatsCard title="Submission" value={team?.submission ? 'Submitted' : 'Pending'} icon={FileText}
          variant={team?.submission?.status === 'submitted' ? 'accent' : 'default'} />
        <StatsCard title="Days Left" value={stats.daysUntilDeadline} icon={Clock} trend="Until deadline" />
      </div>

      {/* My Events */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> My Events
        </h3>
        {joinedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No events joined yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border/50">
                  {['Event Name', 'Date', 'Venue', 'Status', 'Your Role'].map(h => (
                    <th key={h} className="pb-3 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {joinedEvents.map(event => (
                  <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{CATEGORY_EMOJI[event.category]}</span>
                        <span className="text-sm font-semibold text-foreground">{event.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0" />{event.venue}</span>
                    </td>
                    <td className="py-3 px-2"><EventStatusBadge status={event.status} /></td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-xs text-primary border-primary/30">Participant</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission */}
      {team?.submission ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Current Submission</h3>
            <StatusBadge status={team.submission.status} />
          </div>
          <p className="text-lg font-bold text-foreground">{team.submission.projectTitle}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{team.submission.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {team.submission.techStack.map(tech => (
              <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
            ))}
          </div>
          {!team.submission.videoUrl && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between">
              <p className="text-sm text-warning font-medium">⚠️ Demo video not uploaded yet</p>
              <Button size="sm" variant="outline" onClick={() => navigate('/submit')} className="text-xs">Upload Video</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">No submission yet</p>
          <p className="text-sm text-muted-foreground mt-1">Submit your project before the deadline.</p>
          <Button className="mt-4 gradient-primary text-primary-foreground gap-2" onClick={() => navigate('/submit')}>
            Submit Project
          </Button>
        </div>
      )}

      {/* Score */}
      {score?.evaluated && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Current Standing
          </h3>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold font-heading text-primary">#{team?.rank}</div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Total Score: {score.total}/40</p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Innovation: {score.innovation}</span>
                <span>Technical: {score.technicalComplexity}</span>
                <span>Presentation: {score.presentation}</span>
                <span>Practical: {score.practicalUse}</span>
              </div>
              {score.comment && <p className="text-xs text-muted-foreground italic mt-1">"{score.comment}"</p>}
            </div>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Team Members
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {team?.members.map(member => (
            <div key={member.id} className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-tight">{member.name}</p>
                  <p className="text-xs text-primary font-medium">{member.role}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{member.contribution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'judge') return <JudgeDashboard />;
  if (user?.role === 'team')  return <TeamDashboard />;
  return <OrganizerDashboard />;
}
