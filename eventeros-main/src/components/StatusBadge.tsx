import { Badge } from '@/components/ui/badge';

type Status = 'upcoming' | 'live' | 'completed' | 'pending' | 'submitted' | 'approved' | 'rejected';

const statusStyles: Record<Status, string> = {
  upcoming: 'bg-info/15 text-info border-info/30',
  live: 'bg-success/15 text-success border-success/30 animate-pulse',
  completed: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-warning/15 text-warning border-warning/30',
  submitted: 'bg-primary/15 text-primary border-primary/30',
  approved: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={`font-medium capitalize ${statusStyles[status]}`}>
      {status}
    </Badge>
  );
}
