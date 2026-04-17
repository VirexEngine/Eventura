import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { mockEvents, mockTeams, mockJudges, mockScores, EventCategory } from '@/data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  TrendingUp, Users, FileText, Trophy, Download, BarChart2,
  Gavel, Star, Calendar, Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CATEGORY_EMOJI: Record<EventCategory, string> = {
  Tech: '💻', Sports: '🏆', Dance: '💃', Music: '🎵', Drama: '🎭', Others: '✨',
};

const chartTooltip = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

const submissionTrend = [
  { day: 'Mon', submissions: 4,  evaluations: 2  },
  { day: 'Tue', submissions: 7,  evaluations: 4  },
  { day: 'Wed', submissions: 5,  evaluations: 6  },
  { day: 'Thu', submissions: 9,  evaluations: 7  },
  { day: 'Fri', submissions: 12, evaluations: 10 },
  { day: 'Sat', submissions: 6,  evaluations: 5  },
  { day: 'Sun', submissions: 3,  evaluations: 3  },
];

type Tab = 'overview' | 'events' | 'judges' | 'export';

export default function AnalyticsPage() {
  const { teams, scores } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Derived stats
  const evaluatedCount   = scores.filter(s => s.evaluated).length;
  const evaluatedTeams   = teams.filter(t => { const s = scores.find(sc => sc.teamId === t.id); return s?.evaluated; });
  const avgScore         = evaluatedTeams.length > 0
    ? (evaluatedTeams.reduce((acc, t) => acc + (scores.find(s => s.teamId === t.id)?.total ?? 0), 0) / evaluatedTeams.length).toFixed(1)
    : '–';
  const videoCount       = teams.filter(t => t.submission?.videoUrl?.trim()).length;

  // Per-event chart
  const perEventData = mockEvents.map(ev => {
    const evTeams  = mockTeams.filter(t => t.eventIds.includes(ev.id));
    const evScores = mockScores.filter(s => evTeams.some(t => t.id === s.teamId) && s.evaluated);
    const avg = evScores.length > 0 ? evScores.reduce((a, b) => a + b.total, 0) / evScores.length : 0;
    return {
      name: ev.title.length > 16 ? ev.title.slice(0, 14) + '…' : ev.title,
      fullName: ev.title,
      category: ev.category,
      teams: evTeams.length,
      avgScore: parseFloat(avg.toFixed(1)),
      submissions: evTeams.filter(t => t.submission).length,
      judges: mockJudges.filter(j => j.eventsAssigned.includes(ev.id)).length,
    };
  });

  // Status distribution
  const statusDist = [
    { name: 'Submitted', value: teams.filter(t => t.submission?.status === 'submitted').length,  color: 'hsl(270, 95%, 65%)' },
    { name: 'Approved',  value: teams.filter(t => t.submission?.status === 'approved').length,   color: 'hsl(142, 76%, 42%)' },
    { name: 'Pending',   value: teams.filter(t => t.submission?.status === 'pending').length,    color: 'hsl(38, 92%, 55%)' },
    { name: 'Rejected',  value: teams.filter(t => t.submission?.status === 'rejected').length,   color: 'hsl(0, 70%, 50%)' },
  ];

  // Score distribution
  const scoreDistData = teams
    .filter(t => { const s = scores.find(sc => sc.teamId === t.id); return s?.evaluated && s.total > 0; })
    .map(t => ({ name: t.name, score: scores.find(s => s.teamId === t.id)?.total ?? 0 }))
    .sort((a, b) => b.score - a.score);

  // Tech stack popularity
  const techMap: Record<string, number> = {};
  teams.forEach(t => t.submission?.techStack.forEach(tech => { techMap[tech] = (techMap[tech] ?? 0) + 1; }));
  const techData = Object.entries(techMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([tech, count]) => ({ tech, count }));

  // Judge performance
  const judgePerf = mockJudges.map(j => {
    const jScores = mockScores.filter(s => s.judgeId === j.id && s.evaluated);
    const avg = jScores.length > 0 ? jScores.reduce((a, b) => a + b.total, 0) / jScores.length : 0;
    return {
      name: j.name.split(' ').slice(-1)[0], // last name
      fullName: j.name,
      evaluated: jScores.length,
      avgScore: parseFloat(avg.toFixed(1)),
      events: j.eventsAssigned.length,
    };
  }).filter(j => j.evaluated > 0);

  // Category breakdown
  const catData = (['Tech', 'Sports', 'Dance', 'Music', 'Drama', 'Others'] as EventCategory[])
    .map(cat => ({
      name: cat,
      events: mockEvents.filter(e => e.category === cat).length,
      teams:  mockTeams.filter(t => mockEvents.filter(e => e.category === cat).some(e => t.eventIds.includes(e.id))).length,
    }))
    .filter(c => c.events > 0);

  // Radar chart for scoring dimensions (average across all evaluations)
  const evalScores = mockScores.filter(s => s.evaluated);
  const radarData = [
    { category: 'Innovation',   value: evalScores.length > 0 ? parseFloat((evalScores.reduce((a, b) => a + b.innovation, 0) / evalScores.length).toFixed(1)) : 0 },
    { category: 'Technical',    value: evalScores.length > 0 ? parseFloat((evalScores.reduce((a, b) => a + b.technicalComplexity, 0) / evalScores.length).toFixed(1)) : 0 },
    { category: 'Presentation', value: evalScores.length > 0 ? parseFloat((evalScores.reduce((a, b) => a + b.presentation, 0) / evalScores.length).toFixed(1)) : 0 },
    { category: 'Practical',    value: evalScores.length > 0 ? parseFloat((evalScores.reduce((a, b) => a + b.practicalUse, 0) / evalScores.length).toFixed(1)) : 0 },
  ];

  const handleExportCSV = () => {
    const rows = [
      ['Team', 'Event', 'Score', 'Innovation', 'Technical', 'Presentation', 'Practical', 'Status', 'Has Video'],
      ...mockTeams.map(t => {
        const s   = mockScores.find(sc => sc.teamId === t.id);
        const ev  = mockEvents.find(e => t.eventIds.includes(e.id));
        return [
          t.name,
          ev?.title ?? '—',
          s?.total?.toString() ?? '—',
          s?.innovation?.toString() ?? '—',
          s?.technicalComplexity?.toString() ?? '—',
          s?.presentation?.toString() ?? '—',
          s?.practicalUse?.toString() ?? '—',
          t.submission?.status ?? 'none',
          t.submission?.videoUrl ? 'Yes' : 'No',
        ];
      }),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `eventflow-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview',     icon: BarChart2 },
    { key: 'events',   label: 'Per Event',    icon: Calendar },
    { key: 'judges',   label: 'Judge Stats',  icon: Gavel },
    { key: 'export',   label: 'Export Data',  icon: Download },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm">Event performance insights and trends</p>
        </div>
        <Button onClick={handleExportCSV} size="sm" variant="outline" className="gap-2 self-start" id="export-csv-btn">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            id={`analytics-tab-${key}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Total Teams',    value: String(mockTeams.length),   icon: Users,      color: 'text-primary' },
              { title: 'Submissions',    value: String(teams.filter(t => t.submission).length), icon: FileText, color: 'text-blue-400' },
              { title: 'Evaluated',      value: `${evaluatedCount}/${mockTeams.length}`,               icon: Trophy,     color: 'text-success' },
              { title: 'Avg Score',      value: `${avgScore}/40`,            icon: TrendingUp, color: 'text-warning' },
              { title: 'Video Uploads',  value: String(videoCount),          icon: Target,     color: 'text-pink-400' },
            ].map(k => (
              <div key={k.title} className="bg-card border border-border rounded-xl p-4 card-hover">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{k.title}</p>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <p className="text-2xl font-bold font-heading text-foreground mt-2">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submission trend */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Submission & Evaluation Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={submissionTrend}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(270,95%,65%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(270,95%,65%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="evalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142,76%,42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142,76%,42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartTooltip} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="submissions" stroke="hsl(270,95%,65%)" fill="url(#subGrad)" strokeWidth={2} name="Submissions" />
                  <Area type="monotone" dataKey="evaluations" stroke="hsl(142,76%,42%)" fill="url(#evalGrad)" strokeWidth={2} name="Evaluations" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status dist */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Submission Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    formatter={(value, entry: any) => `${value} (${entry.payload.value})`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Team score comparison */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Team Score Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreDistData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 40]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} width={90} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="score" fill="hsl(270,95%,65%)" radius={[0, 4, 4, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scoring dimensions radar */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Avg Scoring Dimensions (All Events)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Avg Score" dataKey="value" stroke="hsl(270,95%,65%)" fill="hsl(270,95%,65%)" fillOpacity={0.25} />
                  <Tooltip {...chartTooltip} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ── PER EVENT TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teams per event */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Total Participants per Event</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={perEventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartTooltip} formatter={(v, n, p) => [v, p.payload.fullName]} />
                  <Bar dataKey="teams" fill="hsl(270,95%,65%)" radius={[4,4,0,0]} name="Teams" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg scores per event */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading font-semibold text-foreground mb-4">Average Score per Event</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={perEventData.filter(e => e.avgScore > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis domain={[0, 40]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="avgScore" fill="hsl(38,92%,55%)" radius={[4,4,0,0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Category Distribution
            </h3>
            <div className="space-y-3">
              {catData.map(({ name, events, teams: t }) => {
                const cat = name as EventCategory;
                const pct = Math.round((events / mockEvents.length) * 100);
                return (
                  <div key={name} className="flex items-center gap-4">
                    <span className="text-lg w-6 flex-shrink-0">{CATEGORY_EMOJI[cat]}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        <span className="text-xs text-muted-foreground">{events} events · {t} teams</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most popular event table */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Most Popular Events</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {['Event', 'Category', 'Teams', 'Submissions', 'Judges', 'Avg Score'].map(h => (
                      <th key={h} className="pb-3 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[...perEventData].sort((a, b) => b.teams - a.teams).map((ev, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <span>{CATEGORY_EMOJI[ev.category as EventCategory]}</span>
                          <span className="text-sm font-semibold text-foreground">{ev.fullName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2"><Badge variant="outline" className="text-xs">{ev.category}</Badge></td>
                      <td className="py-2.5 px-2 text-sm text-foreground font-bold">{ev.teams}</td>
                      <td className="py-2.5 px-2 text-sm text-muted-foreground">{ev.submissions}</td>
                      <td className="py-2.5 px-2 text-sm text-muted-foreground">{ev.judges}</td>
                      <td className="py-2.5 px-2 text-sm font-bold text-primary">{ev.avgScore > 0 ? `${ev.avgScore}/40` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tech stack */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Most Used Technologies</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={techData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tech" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="count" fill="hsl(210,100%,56%)" radius={[4,4,0,0]} name="Teams" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── JUDGE STATS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'judges' && (
        <div className="space-y-6">
          {judgePerf.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Gavel className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No judging activity yet</p>
            </div>
          ) : (
            <>
              {/* Judge activity bar */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-primary" /> Judge Evaluation Activity
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={judgePerf}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip {...chartTooltip} formatter={(v, n, p) => [v, p.payload.fullName]} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="evaluated" fill="hsl(270,95%,65%)" radius={[4,4,0,0]} name="Evaluations Done" />
                    <Bar dataKey="avgScore"  fill="hsl(38,92%,55%)"  radius={[4,4,0,0]} name="Avg Score Given" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Judge leaderboard */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" /> Judge Performance Summary
                </h3>
                <div className="space-y-3">
                  {[...judgePerf].sort((a, b) => b.evaluated - a.evaluated).map((j, i) => (
                    <div key={j.fullName} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{i+1}</span>
                      <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {j.fullName.split(' ').filter((_,i,a) => i===0||i===a.length-1).map(n=>n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{j.fullName}</p>
                        <p className="text-xs text-muted-foreground">{j.events} event{j.events !== 1 ? 's' : ''} assigned</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary">{j.evaluated} evaluated</p>
                        <p className="text-xs text-muted-foreground">avg {j.avgScore}/40</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── EXPORT TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Export Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Team List (CSV)',         desc: 'All teams with members, events, submission status', icon: Users,    action: handleExportCSV },
                { label: 'Scores Export (CSV)',     desc: 'All judging scores with innovation, technical, etc.', icon: Trophy,  action: handleExportCSV },
                { label: 'Event Results (CSV)',     desc: 'Completed events with winners and final rankings', icon: Calendar,  action: handleExportCSV },
              ].map(({ label, desc, icon: Icon, action }) => (
                <div key={label} className="border border-border rounded-xl p-5 hover:border-primary/40 transition-all space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg gradient-primary">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">{label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  <Button size="sm" variant="outline" onClick={action} className="w-full gap-2 text-xs" id={`export-${label.replace(/\s/g,'-').toLowerCase()}`}>
                    <Download className="h-3.5 w-3.5" /> Download CSV
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Data preview table */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Data Preview</h3>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border/50">
                    {['Team', 'Event', 'Members', 'Status', 'Has Video', 'Score'].map(h => (
                      <th key={h} className="pb-3 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {mockTeams.map(t => {
                    const ev = mockEvents.find(e => t.eventIds.includes(e.id));
                    const s  = mockScores.find(sc => sc.teamId === t.id);
                    return (
                      <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-2 text-sm font-semibold text-foreground">{t.name}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground">{ev?.title ?? '—'}</td>
                        <td className="py-2 px-2 text-sm text-muted-foreground">{t.members.length}</td>
                        <td className="py-2 px-2 text-xs">{t.submission?.status ?? 'none'}</td>
                        <td className="py-2 px-2 text-xs">{t.submission?.videoUrl ? '✅' : '❌'}</td>
                        <td className="py-2 px-2 text-sm font-bold text-primary">{s?.evaluated ? `${s.total}/40` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
