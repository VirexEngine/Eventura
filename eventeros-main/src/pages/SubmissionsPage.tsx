import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Search, Video, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

type FilterStatus = 'all' | 'submitted' | 'pending' | 'approved' | 'rejected';

export default function SubmissionsPage() {
  const { teams } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const allSubmissions = teams
    .filter(t => t.submission)
    .map(t => ({ team: t, submission: t.submission! }));

  const filtered = allSubmissions.filter(({ team, submission }) => {
    const matchSearch =
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      submission.projectTitle.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || submission.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: allSubmissions.length,
    submitted: allSubmissions.filter(s => s.submission.status === 'submitted').length,
    pending: allSubmissions.filter(s => s.submission.status === 'pending').length,
    approved: allSubmissions.filter(s => s.submission.status === 'approved').length,
    rejected: allSubmissions.filter(s => s.submission.status === 'rejected').length,
  };

  const filterButtons: { key: FilterStatus; label: string; icon: typeof FileText }[] = [
    { key: 'all', label: 'All', icon: FileText },
    { key: 'submitted', label: 'Submitted', icon: CheckCircle },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Submissions</h1>
        <p className="text-muted-foreground text-sm">All project submissions across events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            id="submissions-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
              className={filter === key ? 'gradient-primary text-primary-foreground' : ''}
            >
              {label}
              <Badge
                variant={filter === key ? 'secondary' : 'outline'}
                className="ml-1.5 h-4 text-[10px] min-w-[18px] px-1"
              >
                {counts[key]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Team', 'Project', 'Tech Stack', 'Video', 'Submitted', 'Status'].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ team, submission }) => (
                <tr key={submission.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-semibold text-foreground text-sm whitespace-nowrap">{team.name}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-foreground">{submission.projectTitle}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{submission.description}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {submission.techStack.slice(0, 3).map(t => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                      {submission.techStack.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{submission.techStack.length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {submission.videoUrl ? (
                      <Badge className="gap-1 bg-success/15 text-success border-success/30 text-xs">
                        <Video className="h-2.5 w-2.5" /> Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                        <Video className="h-2.5 w-2.5" /> None
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={submission.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No submissions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
