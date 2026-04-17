import { useState } from 'react';
import { mockTeams, mockEvents, mockScores, mockJudges } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Video, ExternalLink, Star, Shield } from 'lucide-react';

// Public route — no auth required
export default function PublicLeaderboard() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const completedEvents = mockEvents.filter(e => e.status === 'completed');

  const eligibleTeams = mockTeams
    .filter(t => t.submission?.videoUrl?.trim())
    .map(t => {
      const score = mockScores.find(s => s.teamId === t.id && s.evaluated);
      return { ...t, scoreData: score };
    })
    .filter(t => t.scoreData)
    .filter(t => selectedEvent === 'all' || t.eventIds.includes(selectedEvent))
    .sort((a, b) => (b.scoreData?.total ?? 0) - (a.scoreData?.total ?? 0));

  const RANK_COLORS = [
    'from-yellow-500/30 to-yellow-600/10 border-yellow-500/50 ring-yellow-500/20',
    'from-slate-400/30 to-slate-500/10 border-slate-400/50 ring-slate-400/20',
    'from-amber-600/30 to-amber-700/10 border-amber-600/50 ring-amber-600/20',
  ];
  const RANK_BADGES = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Public topbar */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold font-heading text-foreground">EventFlow Pro</span>
            <Badge variant="outline" className="text-[10px] ml-1 gap-1"><Shield className="h-2.5 w-2.5" />Public View</Badge>
          </div>
          <a href="/dashboard" className="text-xs text-primary hover:underline flex items-center gap-1">
            Sign in <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1.5 py-1 px-3">
            <Star className="h-3.5 w-3.5" /> Live Leaderboard
          </Badge>
          <h1 className="text-4xl font-black font-heading bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            EventFlow Rankings
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Official leaderboard for EventFlow Pro events, showcasing top-performing teams with verified project submissions.
          </p>
        </div>

        {/* Event filter */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => setSelectedEvent('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedEvent === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/40'
            }`}
          >
            All Events ({mockTeams.filter(t => t.submission?.videoUrl?.trim()).length} teams)
          </button>
          {completedEvents.map(ev => (
            <button
              key={ev.id}
              onClick={() => setSelectedEvent(ev.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedEvent === ev.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/40'
              }`}
            >
              {ev.title}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {eligibleTeams.length >= 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eligibleTeams.slice(0, 3).map((team, i) => {
              const event = mockEvents.find(e => team.eventIds.includes(e.id));
              return (
                <div
                  key={team.id}
                  className={`relative rounded-2xl border-2 bg-gradient-to-br ${RANK_COLORS[i] ?? RANK_COLORS[2]} ring-2 ring-inset p-6 text-center`}
                >
                  <div className="text-4xl mb-2">{RANK_BADGES[i] ?? '🎖'}</div>
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-primary-foreground">{team.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <h3 className="font-bold font-heading text-foreground text-lg">{team.name}</h3>
                  {team.submission?.projectTitle && (
                    <p className="text-xs text-primary font-medium mt-0.5">{team.submission.projectTitle}</p>
                  )}
                  <p className="text-3xl font-black text-foreground mt-3">{team.scoreData?.total}<span className="text-base font-normal text-muted-foreground">/40</span></p>
                  <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
                    {team.members.slice(0,4).map(m => (
                      <div key={m.id} className="h-6 w-6 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center" title={m.name}>
                        <span className="text-[8px] font-bold text-foreground">{m.name[0]}</span>
                      </div>
                    ))}
                    {team.members.length > 4 && <span className="text-[10px] text-muted-foreground self-center">+{team.members.length - 4}</span>}
                  </div>
                  {event && <p className="text-[10px] text-muted-foreground mt-2">{event.title}</p>}
                  {team.submission?.videoUrl && (
                    <a href={team.submission.videoUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline">
                      <Video className="h-3 w-3" /> Watch Demo
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        {eligibleTeams.length > 3 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground">Full Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {['Rank', 'Team', 'Project', 'Members', 'Score', 'Video'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {eligibleTeams.slice(3).map((team, i) => (
                    <tr key={team.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">#{i + 4}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-primary-foreground">{team.name.slice(0,2).toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-sm text-foreground">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{team.submission?.projectTitle ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{team.members.length}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">{team.scoreData?.total}/40</td>
                      <td className="px-4 py-3">
                        {team.submission?.videoUrl ? (
                          <a href={team.submission.videoUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Video className="h-3 w-3" /> Watch
                          </a>
                        ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {eligibleTeams.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No evaluated teams with demo videos yet</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary font-semibold">EventFlow Pro</span> · Only teams with verified demo videos are ranked ·{' '}
            <a href="/dashboard" className="text-primary hover:underline">Organizer Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
