import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  dashboardStats, mockEvents, mockTeams, mockJudges, mockScores,
  judgeEventAssignments, EventCategory,
} from '@/data/mockData';
import {
  Calendar, Users, Gavel, FileText, Trophy, Clock,
  TrendingUp, CheckCircle, ArrowRight, MapPin, VideoOff, BarChart2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const submissionData = [
  { name: 'Mon', submitted: 4, pending: 2 },
  { name: 'Tue', submitted: 7, pending: 3 },
  { name: 'Wed', submitted: 5, pending: 1 },
  { name: 'Thu', submitted: 8, pending: 4 },
  { name: 'Fri', submitted: 12, pending: 2 },
  { name: 'Sat', submitted: 6, pending: 1 },
  { name: 'Sun', submitted: 3, pending: 0 },
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

function EventStatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'live'      ? 'bg-success/15 text-success border-success/30' :
    status === 'upcoming'  ? 'bg-warning/15 text-warning border-warning/30' :
                             'bg-muted/50 text-muted-foreground border-border/50';
  const label = status === 'live' ? '🔴 Live' : status === 'upcoming' ? 'Upcoming' : 'Completed';
  return <Badge className={`text-xs border font-medium ${cfg}`}>{label}</Badge>;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Tech: '💻', Sports: '🏆', Dance: '💃', Music: '🎵', Drama: '🎭', Others: '✨',
};

function OrganizerDashboard() {
  const stats = dashboardStats.organizer;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const realTeamCount    = mockTeams.length;
  const realJudgeCount   = mockJudges.length;
  const totalSubmissions = mockTeams.filter(t => !!t.submission).length;
  const pendingCount     = mockTeams.filter(t => t.submission?.status === 'pending').length;
  const liveEventCount   = mockEvents.filter(e => e.status === 'live').length;
  const completedEvents = mockEvents.filter(e => e.status === 'completed');

  const categoryBreakdown = (['Tech', 'Sports', 'Dance', 'Music', 'Drama', 'Others'] as EventCategory[])
    .map(cat => ({
      name: cat,
      events: mockEvents.filter(e => e.category === cat).length,
      teams:  mockTeams.filter(t => mockEvents.filter(e => e.category === cat).some(e => t.eventIds.includes(e.id))).length,
    }))
    .filter(c => c.events > 0);

  const filteredEvents = activeTab === 'all'
    ? mockEvents
    : mockEvents.filter(e => e.status === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Organizer Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of all events and activities</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Events" value={mockEvents.length}
          icon={Calendar} variant="primary"
          trend={`${liveEventCount} live · ${completedEvents.length} done`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredEvents.map(event => {
            const teamsCount  = mockTeams.filter(t => t.eventIds.includes(event.id)).length;
            const judgesCount = mockJudges.filter(j => j.eventsAssigned.includes(event.id)).length;
            return (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigate('/events')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent flex-shrink-0">
                    <span className="text-sm">{CATEGORY_EMOJI[event.category]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.venue} · {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 mt-2 sm:mt-0">
                  <div className="hidden sm:flex gap-3 text-xs text-muted-foreground">
                    <span>{teamsCount} teams</span>
                    <span>{judgesCount} judges</span>
                  </div>
                  <EventStatusBadge status={event.status} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
        <StatsCard title="Completed"         value={completedCount}         icon={Trophy} variant="accent" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> My Assigned Events
        </h3>
        <div className="space-y-3">
          {assignedEvents.map(event => (
            <div key={event.id} className="flex justify-between items-center p-4 rounded-xl bg-muted/30 border border-border/50">
              <div>
                <p className="font-semibold text-foreground">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.venue}</p>
              </div>
              <Button size="sm" onClick={() => navigate('/evaluate')}>Evaluate</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamDashboard() {
  const { user } = useAuth();
  const { teams } = useData();
  const navigate = useNavigate();

  const team  = teams.find(t => t.id === (user?.teamId ?? '1')) ?? teams[0];
  const joinedEvents = mockEvents.filter(e => (team?.eventIds ?? [team?.eventId]).includes(e.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Team Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {user?.name}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Events Joined" value={joinedEvents.length} icon={Calendar} variant="primary" />
        <StatsCard title="Submission" value={team?.submission ? 'Submitted' : 'Pending'} icon={FileText} />
      </div>

      {team?.submission ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">Current Submission</h3>
            <StatusBadge status={team.submission.status} />
          </div>
          <p className="text-lg font-bold text-foreground">{team.submission.projectTitle}</p>
          <p className="text-sm text-muted-foreground mt-1">{team.submission.description}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">No submission yet</p>
          <Button className="mt-4" onClick={() => navigate('/submit')}>Submit Project</Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'judge') return <JudgeDashboard />;
  if (user?.role === 'team')  return <TeamDashboard />;
  return <OrganizerDashboard />;
}
