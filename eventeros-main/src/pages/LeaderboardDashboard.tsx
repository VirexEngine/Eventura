import { useState, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { mockEvents } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Trophy, Medal, Award, Bookmark, Search, TrendingUp,
  Users, Play, X, ChevronDown, ChevronUp, ExternalLink,
  Code2, Video, CheckCircle, AlertTriangle, VideoOff,
} from 'lucide-react';
import type { Team } from '@/data/mockData';

const RANK_CONFIG = [
  {
    icon: <Trophy className="h-6 w-6 text-yellow-400" />,
    emoji: '🥇',
    ringClass: 'ring-2 ring-yellow-400/70 shadow-[0_0_24px_4px_rgba(250,204,21,0.20)]',
    headerClass: 'bg-gradient-to-r from-yellow-500/20 to-amber-400/10',
    accentColor: 'text-yellow-400',
    badgeClass: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50',
    label: '#1 Gold',
  },
  {
    icon: <Medal className="h-6 w-6 text-slate-300" />,
    emoji: '🥈',
    ringClass: 'ring-2 ring-slate-400/60 shadow-[0_0_18px_2px_rgba(148,163,184,0.15)]',
    headerClass: 'bg-gradient-to-r from-slate-400/15 to-slate-300/5',
    accentColor: 'text-slate-300',
    badgeClass: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
    label: '#2 Silver',
  },
  {
    icon: <Award className="h-6 w-6 text-amber-500" />,
    emoji: '🥉',
    ringClass: 'ring-2 ring-amber-600/60 shadow-[0_0_18px_2px_rgba(180,83,9,0.15)]',
    headerClass: 'bg-gradient-to-r from-amber-700/15 to-amber-500/5',
    accentColor: 'text-amber-500',
    badgeClass: 'bg-amber-700/20 text-amber-400 border-amber-600/40',
    label: '#3 Bronze',
  },
  {
    icon: <Bookmark className="h-6 w-6 text-blue-400" />,
    emoji: '🎖',
    ringClass: 'ring-1 ring-blue-400/40 shadow-md',
    headerClass: 'bg-gradient-to-r from-blue-500/10 to-blue-400/5',
    accentColor: 'text-blue-400',
    badgeClass: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
    label: '#4',
  },
];

function TeamDetailModal({ team, rank, onClose }: { team: Team; rank: number; onClose: () => void }) {
  const cfg = RANK_CONFIG[rank] ?? RANK_CONFIG[3];
  const sub = team.submission;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[hsl(var(--card))] border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className={`flex items-start justify-between p-5 border-b border-border ${cfg.headerClass}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cfg.emoji}</span>
            <div>
              <h3 className="text-xl font-bold font-heading text-foreground">{team.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{sub?.projectTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-3xl font-bold font-heading ${cfg.accentColor}`}>{team.totalScore ?? 0}</p>
              <p className="text-xs text-muted-foreground">/ 40 pts</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div className="bg-muted/30 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
            <p className="text-sm text-foreground leading-relaxed">{sub?.description}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Team Members</h4>
            <div className="grid grid-cols-2 gap-2">
              {team.members.map(m => (
                <div key={m.id} className="p-2 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopTeamCard({ team, rank }: { team: Team; rank: number }) {
  const cfg = RANK_CONFIG[rank] ?? RANK_CONFIG[3];
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {modalOpen && <TeamDetailModal team={team} rank={rank} onClose={() => setModalOpen(false)} />}
      <div
        className={`
          relative flex flex-col rounded-2xl overflow-hidden
          bg-[hsl(var(--card))] border border-border/60
          ${cfg.ringClass}
          transition-all duration-300 hover:scale-[1.015]
        `}
      >
        <div className={`flex items-center justify-between px-4 py-3 ${cfg.headerClass}`}>
          <div className="flex items-center gap-2">
            {cfg.icon}
            <span className={`text-sm font-bold font-heading ${cfg.accentColor}`}>{cfg.label}</span>
          </div>
          <p className={`text-2xl font-bold font-heading ${cfg.accentColor}`}>{team.totalScore ?? 0}</p>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-heading font-bold text-foreground text-base truncate">{team.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{team.submission?.description}</p>
          <Button
            size="sm"
            className="w-full gradient-primary text-primary-foreground h-8 text-xs"
            onClick={() => setModalOpen(true)}
          >
            Full Details
          </Button>
        </div>
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  const { teams } = useData();
  const [search, setSearch] = useState('');

  const eligibleTeams = [...teams]
    .filter(t => t.submission?.videoUrl)
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

  const top4 = eligibleTeams.slice(0, 4);
  const rest = eligibleTeams.slice(4).filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Real-time rankings for all participating teams</p>
        </div>
        <Badge className="bg-success/20 text-success border-success/40 px-3 py-1">LIVE</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {top4.map((team, i) => (
          <TopTeamCard key={team.id} team={team} rank={i} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Other Rankings</h2>
          <Input 
            placeholder="Search teams..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="max-w-xs h-8 text-xs"
          />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Rank</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Team</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Project</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rest.map((team, i) => (
                <tr key={team.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-heading font-bold text-muted-foreground">#{i + 5}</td>
                  <td className="p-4 font-semibold text-foreground text-sm">{team.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{team.submission?.projectTitle}</td>
                  <td className="p-4 text-center font-bold text-primary">{team.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
