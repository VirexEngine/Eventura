import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { computeFileHash, findDuplicateVideoByHash, mockTeams } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, Video, FileText, CheckCircle, AlertCircle,
  X, Film, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SubmitPage() {
  const { user } = useAuth();
  const { teams, updateSubmission, addNotification } = useData();

  // Find team for current user (in real app, use user.teamId)
  const team = teams.find(t => t.id === (user?.teamId ?? '1')) ?? teams[0];
  const sub = team?.submission;

  // Form state seeded from existing submission
  const [projectTitle, setProjectTitle] = useState(sub?.projectTitle || '');
  const [description, setDescription] = useState(sub?.description || '');
  const [problem, setProblem] = useState(sub?.problemStatement || '');
  const [solution, setSolution] = useState(sub?.solution || '');
  const [challenges, setChallenges] = useState(sub?.challenges || '');
  const [techStack, setTechStack] = useState(sub?.techStack.join(', ') || '');

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>(sub?.videoUrl || '');
  const [videoHash, setVideoHash] = useState<string>(sub?.videoHash || '');
  const [videoFileName, setVideoFileName] = useState<string>(sub?.videoFileName || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 200;
  const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

  /**
   * Validates the selected video file:
   * - Correct type
   * - Max 200MB
   * - Not already uploaded by another team (hash check)
   */
  const processVideoFile = useCallback(async (file: File) => {
    setVideoError('');

    // Type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      setVideoError('Only MP4, WebM, or OGG video files are allowed.');
      return;
    }

    // Size check
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setVideoError(`File is too large (${sizeMB.toFixed(1)} MB). Maximum allowed is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    // Check if team already has a video
    if (sub?.videoHash && sub.videoHash !== '') {
      setVideoError('Your team has already uploaded a video. Remove it before uploading a new one.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Compute hash for duplicate detection
      const hash = await computeFileHash(file);

      // Check for duplicates across other teams
      const duplicateTeam = findDuplicateVideoByHash(hash, team.id);
      if (duplicateTeam) {
        setVideoError(`Duplicate video detected! This exact file was already uploaded by "${duplicateTeam}". Each team must upload a unique video.`);
        setUploading(false);
        return;
      }

      // Simulate upload progress (in production, use real API with XHR progress)
      const interval = setInterval(() => {
        setUploadProgress(p => {
          if (p >= 95) { clearInterval(interval); return p; }
          return p + Math.random() * 15;
        });
      }, 100);

      // Simulate network delay
      await new Promise(res => setTimeout(res, 1500));
      clearInterval(interval);
      setUploadProgress(100);

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoPreviewUrl(url);
      setVideoHash(hash);
      setVideoFileName(file.name);

      toast.success('Video uploaded successfully!');
    } catch (err) {
      setVideoError('Upload failed. Please try again.');
      toast.error('Video upload failed');
    } finally {
      setUploading(false);
    }
  }, [sub, team.id]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processVideoFile(file);
    // Reset input so same file can be reselected if removed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processVideoFile(file);
  };

  const removeVideo = () => {
    if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl('');
    setVideoHash('');
    setVideoFileName('');
    setVideoError('');
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!projectTitle.trim()) { toast.error('Project title is required.'); return; }
    if (!description.trim()) { toast.error('Description is required.'); return; }
    if (!problem.trim()) { toast.error('Problem statement is required.'); return; }
    if (!solution.trim()) { toast.error('Solution is required.'); return; }
    if (!videoPreviewUrl) {
      toast.error('Demo video is required. Your team will not appear on the leaderboard without a video.');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));

    const newSubmission = {
      id: sub?.id || `s_${Date.now()}`,
      teamId: team.id,
      projectTitle: projectTitle.trim(),
      description: description.trim(),
      problemStatement: problem.trim(),
      solution: solution.trim(),
      challenges: challenges.trim(),
      techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
      videoUrl: videoPreviewUrl,
      videoHash,
      videoFileName,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
    };

    updateSubmission(team.id, newSubmission);
    addNotification({
      title: 'Project Submitted',
      message: `${team.name} submitted "${projectTitle}"`,
      type: 'success',
    });

    toast.success('🎉 Project submitted successfully! Good luck!');
    setSubmitting(false);
  };

  const hasExistingVideo = videoPreviewUrl !== '';
  const alreadySubmitted = sub?.status === 'submitted' || sub?.status === 'approved';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Submit Project</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Submit your team's project for evaluation</p>
        </div>
        {sub && <StatusBadge status={sub.status} />}
      </div>

      {/* Already submitted banner */}
      {alreadySubmitted && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/30 text-success">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Submission Received</p>
            <p className="text-xs opacity-80 mt-0.5">
              Your project was submitted on{' '}
              {sub?.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}.
              You can update your details and resubmit.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Project Details
          </h3>

          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title <span className="text-destructive">*</span></Label>
            <Input
              id="projectTitle"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="e.g. EcoTrack AI"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your project in detail..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="problem">Problem Statement <span className="text-destructive">*</span></Label>
              <Textarea
                id="problem"
                value={problem}
                onChange={e => setProblem(e.target.value)}
                placeholder="What problem does your project solve?"
                className="min-h-[80px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solution">Solution <span className="text-destructive">*</span></Label>
              <Textarea
                id="solution"
                value={solution}
                onChange={e => setSolution(e.target.value)}
                placeholder="How does your project solve it?"
                className="min-h-[80px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges Faced</Label>
            <Textarea
              id="challenges"
              value={challenges}
              onChange={e => setChallenges(e.target.value)}
              placeholder="What challenges did your team overcome?"
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
            <Input
              id="techStack"
              value={techStack}
              onChange={e => setTechStack(e.target.value)}
              placeholder="React, Node.js, PostgreSQL, AWS"
            />
            {techStack && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {techStack.split(',').map(t => t.trim()).filter(Boolean).map(tech => (
                  <span key={tech} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Upload */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" /> Demo Video
              <span className="text-destructive text-base">*</span>
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              1 video per team · Max 200MB
            </span>
          </div>

          {/* Error message */}
          {videoError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{videoError}</p>
            </div>
          )}

          {/* Video preview (already uploaded) */}
          {hasExistingVideo && !videoError ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video">
                <video
                  controls
                  className="w-full h-full object-contain"
                  src={videoPreviewUrl}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{videoFileName || 'Demo video'}</p>
                    <p className="text-xs text-muted-foreground">
                      Hash: <code className="text-[10px] font-mono">{videoHash.slice(0, 16)}…</code>
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeVideo}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                >
                  <X className="h-3 w-3" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            /* Drop zone */
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
                isDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/20'
              )}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
                  <p className="text-sm font-medium text-foreground">Uploading & verifying video…</p>
                  <div className="max-w-xs mx-auto space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{Math.round(uploadProgress)}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    {isDragging ? 'Drop your video here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, WebM, OGG · Max 200MB · One video per team</p>
                  <Button type="button" variant="outline" size="sm" className="mt-4 gap-2">
                    <Upload className="h-3 w-3" /> Choose File
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}
        </div>

        {/* ✅ Video status banner — leaderboard eligibility */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          hasExistingVideo
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-warning/10 border-warning/30 text-warning'
        }`}>
          {hasExistingVideo ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {hasExistingVideo ? 'Video Uploaded ✅ — Eligible for Leaderboard' : 'No Demo Video ❌ — Not Eligible for Leaderboard'}
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {hasExistingVideo
                ? 'Your team will appear in the leaderboard rankings once evaluated.'
                : 'Upload a demo video below. Without it, your team will be excluded from the leaderboard.'}
            </p>
          </div>
        </div>

        {/* Submit button — disabled until video uploaded */}
        <Button
          type="submit"
          disabled={submitting || uploading || !hasExistingVideo}
          title={!hasExistingVideo ? 'Upload a demo video before submitting' : undefined}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
          id="submit-project-btn"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : !hasExistingVideo ? (
            <><AlertCircle className="h-4 w-4" /> Upload Video to Submit</>
          ) : alreadySubmitted ? (
            <><RefreshCw className="h-4 w-4" /> Resubmit Project</>
          ) : (
            <><CheckCircle className="h-4 w-4" /> Submit Project</>
          )}
        </Button>
      </form>
    </div>
  );
}
