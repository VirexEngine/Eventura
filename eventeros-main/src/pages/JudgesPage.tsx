import { Gavel, Star, Trophy, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { mockTeams } from '@/data/mockData';

const judges = [
  { id: '2', name: 'Dr. Alex Rivera', email: 'alex@judge.com', expertise: 'AI & Machine Learning', avatar: 'AR', assignedEvents: ['HackTech 2026', 'AI Innovation Summit'] },
  { id: 'j2', name: 'Prof. Maria Santos', email: 'maria@judge.com', expertise: 'Full Stack & Cloud', avatar: 'MS', assignedEvents: ['HackTech 2026'] },
  { id: 'j3', name: 'Kevin Zhang', email: 'kevin@judge.com', expertise: 'Product & Design', avatar: 'KZ', assignedEvents: ['Green Code Challenge'] },
  { id: 'j4', name: 'Dr. Priya Nair', email: 'priya@judge.com', expertise: 'Data Science', avatar: 'PN', assignedEvents: ['HackTech 2026', 'FinTech Sprint'] },
];

export default function JudgesPage() {
  const { scores } = useData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Judges</h1>
          <p className="text-muted-foreground text-sm">Panel of expert evaluators</p>
        </div>
        <Badge variant="outline" className="gap-1 px-3 py-1 text-sm">
          <Gavel className="h-3.5 w-3.5" /> {judges.length} Judges
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {judges.map(judge => {
          const judgeScores = scores.filter(s => s.judgeId === judge.id && s.evaluated);
          const completion = Math.round((judgeScores.length / mockTeams.length) * 100);

          return (
            <div key={judge.id} className="bg-card border border-border rounded-xl p-5 card-hover">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{judge.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground">{judge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{judge.email}</p>
                  <Badge variant="secondary" className="mt-1.5 text-xs gap-1">
                    <Star className="h-2.5 w-2.5" /> {judge.expertise}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ClipboardCheck className="h-3 w-3" /> Evaluations
                  </span>
                  <span className="font-semibold text-foreground">{judgeScores.length}/{mockTeams.length}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="h-full rounded-full gradient-primary transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {judge.assignedEvents.map(ev => (
                    <Badge key={ev} variant="outline" className="text-[10px]">{ev}</Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
