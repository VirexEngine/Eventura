import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Trophy, FileText } from 'lucide-react';

export default function TeamsPage() {
  const { teams, scores } = useData();
  const [search, setSearch] = useState('');

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.submission?.projectTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Teams</h1>
          <p className="text-muted-foreground text-sm">All registered teams and their submissions</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1 text-sm px-3 py-1">
          <Users className="h-3.5 w-3.5" /> {teams.length} Teams
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams or projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          id="teams-search"
        />
      </div>

      {/* Teams grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(team => {
          const score = scores.find(s => s.teamId === team.id);
          return (
            <div key={team.id} className="bg-card border border-border rounded-xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{team.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Users className="h-3 w-3" /> {team.members.length} members
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {team.rank && (
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> Rank #{team.rank}
                    </span>
                  )}
                  {score && (
                    <span className="text-sm font-bold text-foreground">{score.total}/40</span>
                  )}
                </div>
              </div>

              {team.submission ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3 text-primary" />
                      {team.submission.projectTitle}
                    </p>
                    <StatusBadge status={team.submission.status} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.submission.techStack.slice(0, 4).map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                    {team.submission.techStack.length > 4 && (
                      <Badge variant="outline" className="text-[10px]">+{team.submission.techStack.length - 4}</Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No submission yet</p>
              )}

              {/* Members */}
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-1.5">
                {team.members.map(m => (
                  <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No teams found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
