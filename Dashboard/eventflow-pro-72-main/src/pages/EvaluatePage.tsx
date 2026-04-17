import { useState, useCallback, useRef, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScoringSlider } from '@/components/ScoringSlider';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, Users, Loader2,
  Sparkles, AlertTriangle, MessageSquarePlus, Clock, Trash2, Brain,
} from 'lucide-react';
import { toast } from 'sonner';

// ── AI Assist logic (rule-based) ──────────────────────────────────────────────
interface AISuggestion {
  type: 'warning' | 'tip' | 'praise';
  message: string;
}

function getAISuggestions(
  scores: { innovation: number; technical: number; presentation: number; practical: number },
  allTeamTotals: number[],
  currentTotal: number,
): AISuggestion[] {
  const hints: AISuggestion[] = [];
  const avgOthers = allTeamTotals.length > 0
    ? allTeamTotals.reduce((a, b) => a + b, 0) / allTeamTotals.length
    : 0;

  // Outlier detection
  if (currentTotal > avgOthers + 8 && avgOthers > 0) {
    hints.push({ type: 'warning', message: `This score (${currentTotal}) is notably higher than the average (${avgOthers.toFixed(0)}). Please double-check each category.` });
  }
  if (currentTotal < avgOthers - 8 && avgOthers > 0 && currentTotal > 0) {
    hints.push({ type: 'warning', message: `This score (${currentTotal}) is significantly lower than the average (${avgOthers.toFixed(0)}). Consider if all criteria are fairly evaluated.` });
  }

  // Category-specific hints
  const cats = [scores.innovation, scores.technical, scores.presentation, scores.practical];
  const nonZero = cats.filter(v => v > 0);
  if (nonZero.length > 1) {
    const max = Math.max(...cats);
    const min = Math.min(...cats.filter(v => v > 0));
    if (max - min >= 6) {
      hints.push({ type: 'tip', message: 'Large gap between category scores detected. Ensure each dimension is evaluated independently.' });
    }
  }

  if (scores.innovation >= 9) {
    hints.push({ type: 'praise', message: 'Excellent innovation score! This project shows strong original thinking.' });
  }
  if (scores.presentation === 10) {
    hints.push({ type: 'tip', message: 'Perfect presentation score — consider adding specific praise to your comments for reference.' });
  }
  if (cats.some(v => v === 0) && cats.some(v => v > 0)) {
    hints.push({ type: 'tip', message: 'Some categories are still at 0. Make sure to evaluate all 4 dimensions.' });
  }
  if (currentTotal > 35) {
    hints.push({ type: 'praise', message: 'Outstanding overall score! This team should be highlighted on the leaderboard.' });
  }

  return hints.slice(0, 3); // max 3 hints
}

// ── Video timestamp comment ───────────────────────────────────────────────────
interface TimestampComment {
  id: string;
  time: string; // "MM:SS"
  timeSeconds: number;
  text: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Main EvaluatePage ─────────────────────────────────────────────────────────
export default function EvaluatePage() {
  const { user } = useAuth();
  const { teams, scores, saveScore, addNotification } = useData();

  const evaluatableTeams = teams.filter(t => t.submission?.projectTitle);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(true);

  // Timestamp comments
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tsComments, setTsComments] = useState<TimestampComment[]>([]);
  const [tsInput, setTsInput] = useState('');

  const team = evaluatableTeams[currentIdx];
  const sub  = team?.submission;

  const getScore = (teamId: string) =>
    scores.find(s => s.teamId === teamId && s.judgeId === (user?.id || '2'));

  const existingScore = team ? getScore(team.id) : null;

  const [innovation,    setInnovation]    = useState(existingScore?.innovation ?? 0);
  const [technical,     setTechnical]     = useState(existingScore?.technicalComplexity ?? 0);
  const [presentation,  setPresentation]  = useState(existingScore?.presentation ?? 0);
  const [practical,     setPractical]     = useState(existingScore?.practicalUse ?? 0);
  const [comment,       setComment]       = useState(existingScore?.comment ?? '');
  const total = innovation + technical + presentation + practical;

  const loadScores = useCallback((idx: number) => {
    const t = evaluatableTeams[idx];
    if (!t) return;
    const s = scores.find(sc => sc.teamId === t.id && sc.judgeId === (user?.id || '2'));
    setInnovation(s?.innovation ?? 0);
    setTechnical(s?.technicalComplexity ?? 0);
    setPresentation(s?.presentation ?? 0);
    setPractical(s?.practicalUse ?? 0);
    setComment(s?.comment ?? '');
    setTsComments([]); // reset per team
  }, [evaluatableTeams, scores, user?.id]);

  const navigate = (newIdx: number) => {
    setCurrentIdx(newIdx);
    loadScores(newIdx);
  };

  // AI suggestions
  const allTotals = teams
    .filter(t => t.id !== team?.id)
    .map(t => getScore(t.id)?.total ?? 0)
    .filter(v => v > 0);
  const aiSuggestions = total > 0
    ? getAISuggestions({ innovation, technical, presentation, practical }, allTotals, total)
    : [];

  // AI auto-fill comment
  const handleAIFillComment = () => {
    const parts: string[] = [];
    if (innovation >= 8)    parts.push('The project demonstrates excellent innovative thinking.');
    if (technical >= 8)     parts.push('Technical implementation is strong and well-structured.');
    if (presentation >= 8)  parts.push('Presentation was clear, compelling, and well-prepared.');
    if (practical >= 8)     parts.push('Strong practical application with clear real-world impact.');
    if (innovation < 5 && innovation > 0) parts.push('The innovation aspect could be further developed.');
    if (technical < 5 && technical > 0)  parts.push('Technical depth needs improvement.');
    if (parts.length === 0) parts.push('Team delivered a solid project submission.');
    setComment(parts.join(' '));
    toast.success('AI-generated feedback applied!');
  };

  const handleAddTimestamp = () => {
    const vid = videoRef.current;
    if (!vid || !tsInput.trim()) return;
    const ts: TimestampComment = {
      id: Date.now().toString(),
      time: formatTime(vid.currentTime),
      timeSeconds: vid.currentTime,
      text: tsInput.trim(),
    };
    setTsComments(prev => [...prev, ts].sort((a, b) => a.timeSeconds - b.timeSeconds));
    setTsInput('');
    toast.success(`Timestamp comment added at ${ts.time}`);
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
      message: `${team.name} scored ${total}/40 by ${user?.name}`,
      type: 'success',
    });
    toast.success(`✅ Score saved for ${team.name}: ${total}/40`);
    setSaving(false);
  };

  if (evaluatableTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in">
        <div className="p-4 rounded-full bg-muted"><Users className="h-8 w-8 text-muted-foreground" /></div>
        <p className="text-lg font-semibold text-foreground">No Submissions Yet</p>
        <p className="text-sm text-muted-foreground">Teams haven't submitted their projects yet.</p>
      </div>
    );
  }
  if (!team || !sub) return null;

  const currentScore = getScore(team.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Evaluate Teams</h1>
          <p className="text-muted-foreground text-sm">Team {currentIdx + 1} of {evaluatableTeams.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(currentIdx - 1)} disabled={currentIdx === 0} id="prev-team-btn">
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(currentIdx + 1)} disabled={currentIdx === evaluatableTeams.length - 1} id="next-team-btn">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {evaluatableTeams.map((t, i) => {
          const s = getScore(t.id);
          return (
            <button key={t.id} onClick={() => navigate(i)} title={t.name}
              className={`h-2.5 flex-1 rounded-full transition-all hover:opacity-80 ${
                i === currentIdx ? 'gradient-primary scale-y-125' : s?.evaluated ? 'bg-success' : 'bg-muted'
              }`} />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video + Project + Members + Timestamp panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="aspect-video bg-black flex items-center justify-center relative">
              {sub.videoUrl ? (
                <video ref={videoRef} controls className="w-full h-full object-contain"
                  src={sub.videoUrl} onError={e => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground p-8">
                  <div className="p-4 rounded-full bg-muted/30"><Play className="h-10 w-10" /></div>
                  <p className="text-sm font-medium">No demo video uploaded</p>
                </div>
              )}
            </div>

            {/* Timestamp comment bar */}
            {sub.videoUrl && (
              <div className="p-3 border-t border-border/50 bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Timestamp Comments (click Add while video is playing)
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add feedback at current time..."
                    value={tsInput}
                    onChange={e => setTsInput(e.target.value)}
                    className="text-xs bg-muted/30 h-8"
                    onKeyDown={e => e.key === 'Enter' && handleAddTimestamp()}
                    id="timestamp-input"
                  />
                  <Button size="sm" className="h-8 gap-1 flex-shrink-0 gradient-primary text-primary-foreground"
                    onClick={handleAddTimestamp} id="add-timestamp-btn">
                    <MessageSquarePlus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                {tsComments.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {tsComments.map(tc => (
                      <div key={tc.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <button
                          className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded flex-shrink-0 hover:bg-primary/20 transition-colors"
                          onClick={() => { if (videoRef.current) videoRef.current.currentTime = tc.timeSeconds; }}
                          title="Jump to this timestamp"
                        >
                          {tc.time}
                        </button>
                        <p className="text-xs text-foreground flex-1 leading-relaxed">{tc.text}</p>
                        <button onClick={() => setTsComments(p => p.filter(c => c.id !== tc.id))}
                          className="text-muted-foreground/50 hover:text-destructive transition-colors flex-shrink-0">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">{sub.projectTitle}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">by {team.name}</p>
              </div>
              <StatusBadge status={sub.status} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{sub.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { label: 'Problem',    value: sub.problemStatement },
                { label: 'Solution',   value: sub.solution },
                { label: 'Challenges', value: sub.challenges },
              ].map(item => item.value && (
                <div key={item.label} className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</h4>
                  <p className="text-sm text-foreground leading-relaxed">{item.value}</p>
                </div>
              ))}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tech Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {sub.techStack.map(t => <Badge key={t} variant="secondary" className="text-xs font-medium">{t}</Badge>)}
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Team Members
              <Badge variant="outline" className="ml-1 text-xs">{team.members.length}</Badge>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.members.map(m => (
                <div key={m.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-primary-foreground">{m.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm leading-tight">{m.name}</p>
                      <p className="text-xs text-primary font-medium">{m.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.contribution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scoring Panel + AI Assist */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5 sticky top-20">
            {/* Score display */}
            <div className="text-center pb-4 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Evaluating</p>
              <h3 className="font-heading font-semibold text-foreground text-sm">{team.name}</h3>
              <div className="text-5xl font-bold font-heading text-primary mt-3">
                {total}<span className="text-xl text-muted-foreground font-normal">/40</span>
              </div>
              {currentScore?.evaluated && (
                <Badge className="mt-2 gap-1 bg-success/20 text-success border-success/30 text-xs">
                  <CheckCircle className="h-3 w-3" /> Already scored
                </Badge>
              )}
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <ScoringSlider label="Innovation"          value={innovation}   onChange={setInnovation} />
              <ScoringSlider label="Technical Complexity" value={technical}   onChange={setTechnical} />
              <ScoringSlider label="Presentation"        value={presentation} onChange={setPresentation} />
              <ScoringSlider label="Practical Use"       value={practical}    onChange={setPractical} />
            </div>

            {/* AI Judge Assist */}
            {showAI && aiSuggestions.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> AI Judge Assist
                  </p>
                  <button onClick={() => setShowAI(false)} className="text-[10px] text-muted-foreground hover:text-foreground">dismiss</button>
                </div>
                {aiSuggestions.map((s, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    s.type === 'warning' ? 'bg-warning/10 text-warning' :
                    s.type === 'praise'  ? 'bg-success/10 text-success' :
                                           'bg-blue-500/10 text-blue-400'
                  }`}>
                    {s.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> :
                     s.type === 'praise'  ? <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> :
                                            <Sparkles className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />}
                    {s.message}
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Judge Comments</label>
                <button
                  onClick={handleAIFillComment}
                  id="ai-fill-comment-btn"
                  className="text-[10px] text-primary hover:text-primary/80 font-semibold flex items-center gap-0.5 transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> AI Fill
                </button>
              </div>
              <Textarea
                id="judge-comment"
                placeholder="Add detailed feedback for this team..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="min-h-[80px] bg-muted/30 border-border/50 text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleSubmitScore}
              disabled={saving}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 gap-2"
              id="submit-score-btn"
            >
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : <><CheckCircle className="h-4 w-4" /> {currentScore?.evaluated ? 'Update Score' : 'Submit Score'}</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
