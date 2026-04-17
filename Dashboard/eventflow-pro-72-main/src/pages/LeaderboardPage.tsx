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

// ─── rank config — solid dark card + subtle accent border, no heavy gradients ──
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

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[hsl(var(--card))] border border-border rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" /> {title}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} id="close-video-modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="aspect-video bg-black">
          <video
            controls
            autoPlay
            preload="metadata"
            className="w-full h-full object-contain"
            src={url}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Team Detail Modal ────────────────────────────────────────────────────────
function TeamDetailModal({ team, rank, onClose }: { team: Team; rank: number; onClose: () => void }) {
  const cfg = RANK_CONFIG[rank] ?? RANK_CONFIG[3];
  const sub = team.submission;
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      {videoOpen && sub?.videoUrl && (
        <VideoModal url={sub.videoUrl} title={`${sub.projectTitle} — Demo`} onClose={() => setVideoOpen(false)} />
      )}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl bg-[hsl(var(--card))] border border-border rounded-2xl shadow-2xl"
          onClick={e => e.stopPropagation()}
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Modal header */}
          <div className={`flex items-start justify-between p-5 border-b border-border ${cfg.headerClass}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cfg.emoji}</span>
              <div>
                <h3 className="text-xl font-bold font-heading text-foreground">{team.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{sub?.projectTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="text-right">
                <p className={`text-3xl font-bold font-heading ${cfg.accentColor}`}>{team.totalScore ?? 0}</p>
                <p className="text-xs text-muted-foreground">/ 40 pts</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="ml-2 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Eligible badge */}
            <div className="flex items-center gap-2">
              <Badge className="gap-1.5 bg-success/15 text-success border-success/30 text-xs">
                <CheckCircle className="h-3 w-3" /> Eligible for Ranking
              </Badge>
              <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/30 text-xs">
                <Video className="h-3 w-3" /> Video Uploaded ✅
              </Badge>
            </div>

            {/* Description */}
            {sub?.description && (
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About the Project</h4>
                <p className="text-sm text-foreground leading-relaxed">{sub.description}</p>
              </div>
            )}

            {/* Problem / Solution */}
            {(sub?.problemStatement || sub?.solution) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sub?.problemStatement && (
                  <div className="bg-muted/20 rounded-xl p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Problem</p>
                    <p className="text-sm text-foreground leading-relaxed">{sub.problemStatement}</p>
                  </div>
                )}
                {sub?.solution && (
                  <div className="bg-muted/20 rounded-xl p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Solution</p>
                    <p className="text-sm text-foreground leading-relaxed">{sub.solution}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tech Stack */}
            {(sub?.techStack?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" /> Tech Stack
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sub!.techStack.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Team Members ({team.members.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {team.members.map(m => (
                  <div key={m.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-[10px] font-bold">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">{m.name}</p>
                      <p className={`text-xs font-medium ${cfg.accentColor}`}>{m.role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{m.contribution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" /> Demo Video
              </h4>
              {sub?.videoUrl ? (
                <button
                  onClick={() => setVideoOpen(true)}
                  className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group border border-border/50 block"
                  id={`play-video-modal-${team.id}`}
                >
                  <video
                    className="w-full h-full object-cover opacity-40"
                    src={sub.videoUrl}
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-white fill-white ml-1" />
                    </div>
                  </div>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Top-N Premium Card — redesigned for readability ─────────────────────────
function TopTeamCard({ team, rank }: { team: Team; rank: number }) {
  const cfg = RANK_CONFIG[rank] ?? RANK_CONFIG[3];
  const sub = team.submission;
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const desc = sub?.description ?? '';
  const shortDesc = desc.length > 110 ? desc.slice(0, 110) + '…' : desc;

  return (
    <>
      {modalOpen && <TeamDetailModal team={team} rank={rank} onClose={() => setModalOpen(false)} />}
      {videoOpen && sub?.videoUrl && (
        <VideoModal url={sub.videoUrl} title={`${sub.projectTitle} — Demo`} onClose={() => setVideoOpen(false)} />
      )}

      {/* Solid dark card with ring accent — readable background */}
      <div
        className={`
          relative flex flex-col rounded-2xl overflow-hidden
          bg-[hsl(var(--card))] border border-border/60
          ${cfg.ringClass}
          transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5
        `}
      >
        {/* Coloured header strip — rank + score */}
        <div className={`flex items-center justify-between px-4 py-3 ${cfg.headerClass} border-b border-white/5`}>
          <div className="flex items-center gap-2">
            {cfg.icon}
            <span className={`text-sm font-bold font-heading ${cfg.accentColor}`}>{cfg.label}</span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold font-heading ${cfg.accentColor} leading-none`}>{team.totalScore ?? 0}</span>
            <span className="text-xs text-muted-foreground ml-1">/ 40</span>
          </div>
        </div>

        {/* Card body — solid background for maximum readability */}
        <div className="flex flex-col flex-1 p-4 space-y-3">
          {/* Team + project */}
          <div>
            <h3 className="font-heading font-bold text-foreground text-base leading-tight">{team.name}</h3>
            {sub?.projectTitle && (
              <p className={`text-sm font-semibold ${cfg.accentColor} mt-0.5`}>{sub.projectTitle}</p>
            )}
          </div>

          {/* Eligible for ranking badge */}
          <Badge className="w-fit gap-1 bg-success/15 text-success border-success/40 text-[10px] py-0.5">
            <CheckCircle className="h-2.5 w-2.5" /> Eligible for Ranking · Video Uploaded ✅
          </Badge>

          {/* Description */}
          {desc && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {expanded ? desc : shortDesc}
              {desc.length > 110 && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className={`ml-1 font-semibold hover:underline inline-flex items-center gap-0.5 ${cfg.accentColor}`}
                >
                  {expanded
                    ? <><ChevronUp className="h-3 w-3" />Less</>
                    : <><ChevronDown className="h-3 w-3" />More</>}
                </button>
              )}
            </p>
          )}

          {/* Member avatars */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {team.members.slice(0, 5).map(m => (
              <div
                key={m.id}
                title={`${m.name} — ${m.role}`}
                className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 ring-2 ring-background"
              >
                <span className="text-[9px] font-bold text-primary-foreground">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            ))}
            {team.members.length > 5 && (
              <span className="text-[10px] text-muted-foreground font-medium">+{team.members.length - 5}</span>
            )}
            <span className="text-[10px] text-muted-foreground ml-0.5">
              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Tech stack */}
          {(sub?.techStack?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {sub!.techStack.slice(0, 4).map(t => (
                <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">{t}</Badge>
              ))}
              {sub!.techStack.length > 4 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{sub!.techStack.length - 4}</Badge>
              )}
            </div>
          )}

          {/* Action buttons — always at bottom */}
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              size="sm"
              variant="outline"
              className={`flex-1 gap-1.5 h-8 text-xs border-border/60 hover:bg-muted/40`}
              onClick={() => setVideoOpen(true)}
              id={`watch-demo-${team.id}`}
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Watch Demo
            </Button>
            <Button
              size="sm"
              className="flex-1 gradient-primary text-primary-foreground gap-1.5 h-8 text-xs hover:opacity-90"
              onClick={() => setModalOpen(true)}
              id={`view-details-${team.id}`}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Full Details
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-12 bg-muted/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-3 w-36 bg-muted rounded" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="h-7 w-7 bg-muted rounded-lg" />)}
        </div>
        <div className="h-8 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

// ─── Ineligible warning row ──────────────────────────────────────────────────
function IneligibleWarning({ teams }: { teams: Team[] }) {
  if (teams.length === 0) return null;
  return (
    <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-warning">Video Required for Ranking</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The following team{teams.length > 1 ? 's are' : ' is'} not ranked because no demo video was uploaded:
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {teams.map(t => (
              <Badge key={t.id} variant="outline" className="text-xs text-warning border-warning/40 gap-1">
                <VideoOff className="h-3 w-3" /> {t.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { teams, scores } = useData();
  const [search, setSearch] = useState('');
  const [loading] = useState(false);

  const activeEvent = mockEvents.find(e => e.status === 'live');

  // ✅ ISSUE 1 FIX: Only teams WITH a videoUrl are eligible for ranking
  const eligibleTeams = [...teams]
    .filter(t => t.submission?.videoUrl && t.submission.videoUrl.trim() !== '')
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

  // Teams that are ineligible (no video) — shown in warning section
  const ineligibleTeams = teams.filter(
    t => !t.submission?.videoUrl || t.submission.videoUrl.trim() === ''
  );

  const top4 = eligibleTeams.slice(0, 4);
  const rest = eligibleTeams.slice(4);

  const getScore = useCallback(
    (teamId: string) => scores.find(s => s.teamId === teamId),
    [scores],
  );

  const filteredRest = rest.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.submission?.projectTitle ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Live rankings for{' '}
            <span className="text-primary font-medium">{activeEvent?.title ?? 'HackTech 2026'}</span>
            {' '}·{' '}
            <span className="text-xs text-muted-foreground">Only teams with demo video are ranked</span>
          </p>
        </div>
        <Badge className="gap-1.5 animate-pulse bg-success/20 text-success border-success/40 px-3 py-1 w-fit">
          <span className="h-2 w-2 rounded-full bg-success inline-block" />
          Live
        </Badge>
      </div>

      {/* ✅ ISSUE 1: Ineligible teams warning */}
      <IneligibleWarning teams={ineligibleTeams} />

      {/* Top eligible teams */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          Top {Math.min(4, top4.length)} Eligible Teams
          <Badge variant="outline" className="text-[10px] ml-1 text-success border-success/30 gap-1">
            <Video className="h-2.5 w-2.5" /> Video Verified
          </Badge>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : top4.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
            <VideoOff className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No eligible teams yet</p>
            <p className="text-sm mt-1">Teams must upload a demo video to appear in rankings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {top4.map((team, i) => (
              <TopTeamCard key={team.id} team={team} rank={i} />
            ))}
          </div>
        )}
      </div>

      {/* Rest of eligible teams in table */}
      {rest.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Other Ranked Teams
            </h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="leaderboard-search"
                placeholder="Search teams or projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Rank', 'Team', 'Project', 'Innovation', 'Technical', 'Presentation', 'Practical', 'Total'].map(h => (
                      <th
                        key={h}
                        className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-left last:text-center"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredRest.map((team) => {
                    const score = getScore(team.id);
                    const globalRank = eligibleTeams.indexOf(team) + 1;
                    return (
                      <tr key={team.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <span className="font-heading font-bold text-muted-foreground">#{globalRank}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-foreground text-[10px] font-bold">
                                {team.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-semibold text-foreground text-sm whitespace-nowrap">{team.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground max-w-[180px]">
                          <span className="truncate block">{team.submission?.projectTitle ?? '—'}</span>
                        </td>
                        {[score?.innovation, score?.technicalComplexity, score?.presentation, score?.practicalUse].map((val, colIdx) => (
                          <td key={colIdx} className="p-4 text-sm text-center">
                            {val !== undefined && val > 0
                              ? <span className="font-semibold text-foreground">{val}</span>
                              : <span className="text-muted-foreground/40">—</span>}
                          </td>
                        ))}
                        <td className="p-4 text-center">
                          {(team.totalScore ?? 0) > 0
                            ? <span className="font-bold font-heading text-primary text-base">{team.totalScore}</span>
                            : <Badge variant="outline" className="text-xs text-warning border-warning/30">Pending</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRest.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-muted-foreground">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No other teams found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full team list — all teams (including ineligible) in collapsed table */}
      {ineligibleTeams.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <VideoOff className="h-4 w-4 text-warning" /> Pending Video Upload
          </h2>
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members</th>
                    <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ranking Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {ineligibleTeams.map(team => (
                    <tr key={team.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-muted-foreground">
                              {team.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{team.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground/70">
                        {team.submission?.projectTitle ?? '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-xs text-warning border-warning/40 gap-1">
                          <VideoOff className="h-3 w-3" /> Upload Video to Rank
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
