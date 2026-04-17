import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Upload, Video, FileText, CheckCircle, AlertCircle,
  X, Film, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SubmitPage() {
  const { user } = useAuth();
  const { teams, updateSubmission, addNotification } = useData();

  const team = teams.find(t => t.id === (user?.teamId ?? '1')) ?? teams[0];
  const sub = team?.submission;

  const [projectTitle, setProjectTitle] = useState(sub?.projectTitle || '');
  const [description, setDescription] = useState(sub?.description || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    await new Promise(res => setTimeout(res, 1000));

    const newSubmission = {
      id: sub?.id || `s_${Date.now()}`,
      teamId: team.id,
      projectTitle,
      description,
      problemStatement: '',
      solution: '',
      challenges: '',
      techStack: [],
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      videoHash: 'mock',
      videoFileName: 'demo.mp4',
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
    };

    updateSubmission(team.id, newSubmission);
    addNotification({
      title: 'Project Submitted',
      message: `${team.name} submitted "${projectTitle}"`,
      type: 'success',
    });

    toast.success('Project submitted successfully!');
    setSubmitting(false);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Submit Project</h1>
          <p className="text-muted-foreground text-sm">Send your project for evaluation</p>
        </div>
        {sub && <StatusBadge status={sub.status} />}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input id="title" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Enter project title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Project description..." className="min-h-[120px]" />
        </div>
        <Button className="w-full gradient-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Project'}
        </Button>
      </form>
    </div>
  );
}
