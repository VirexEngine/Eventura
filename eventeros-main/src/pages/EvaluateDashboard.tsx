import { useState, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScoringSlider } from '@/components/ScoringSlider';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, Users, Loader2,
  Sparkles, AlertTriangle, Brain,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EvaluatePage() {
  const { user } = useAuth();
  const { teams, scores, saveScore, addNotification } = useData();

  const evaluatableTeams = teams.filter(t => t.submission?.projectTitle);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const team = evaluatableTeams[currentIdx];
  const sub  = team?.submission;

  const currentScore = team ? scores.find(s => s.teamId === team.id && s.judgeId === (user?.id || '2')) : null;

  const [innovation,    setInnovation]    = useState(currentScore?.innovation ?? 0);
  const [technical,     setTechnical]     = useState(currentScore?.technicalComplexity ?? 0);
  const [presentation,  setPresentation]  = useState(currentScore?.presentation ?? 0);
  const [practical,     setPractical]     = useState(currentScore?.practicalUse ?? 0);
  const [comment,       setComment]       = useState(currentScore?.comment ?? '');
  const total = innovation + technical + presentation + practical;

  const navigate = (newIdx: number) => {
    setCurrentIdx(newIdx);
    const t = evaluatableTeams[newIdx];
    const s = scores.find(sc => sc.teamId === t.id && sc.judgeId === (user?.id || '2'));
    setInnovation(s?.innovation ?? 0);
    setTechnical(s?.technicalComplexity ?? 0);
    setPresentation(s?.presentation ?? 0);
    setPractical(s?.practicalUse ?? 0);
    setComment(s?.comment ?? '');
  };

  const handleSubmitScore = async () => {
    if (total === 0) { toast.error('Please score at least one category.'); return; }
    setSaving(true);
    await new Promise(res => setTimeout(res, 600));
    saveScore({
      teamId: team.id,
      judgeId: user?.id || '2',
      innovation,
      technicalComplexity: technical,
      presentation,
      practicalUse: practical,
      total,
      comment,
      evaluated: true,
    });
    addNotification({
      title: 'Score Saved',
      message: `${team.name} scored ${total}/40`,
      type: 'success',
    });
    toast.success('Score saved successfully!');
    setSaving(false);
  };

  if (evaluatableTeams.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Users className="h-10 w-10 text-muted-foreground" />
      <p className="text-lg font-semibold">No Submissions Yet</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Evaluate Teams</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(currentIdx - 1)} disabled={currentIdx === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(currentIdx + 1)} disabled={currentIdx === evaluatableTeams.length - 1}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold">{sub?.projectTitle}</h2>
            <p className="text-sm text-muted-foreground">{sub?.description}</p>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
               <video controls className="w-full h-full" src={sub?.videoUrl || ''} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="text-center">
             <p className="text-5xl font-bold text-primary">{total}/40</p>
          </div>
          <div className="space-y-4">
            <ScoringSlider label="Innovation" value={innovation} onChange={setInnovation} />
            <ScoringSlider label="Technical" value={technical} onChange={setTechnical} />
            <ScoringSlider label="Presentation" value={presentation} onChange={setPresentation} />
            <ScoringSlider label="Practical" value={practical} onChange={setPractical} />
          </div>
          <Textarea placeholder="Judge comments..." value={comment} onChange={e => setComment(e.target.value)} />
          <Button className="w-full gradient-primary" onClick={handleSubmitScore} disabled={saving}>
            {saving ? 'Saving...' : 'Submit Score'}
          </Button>
        </div>
      </div>
    </div>
  );
}
