import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Upload, Trophy, Edit2, Trash2,
  Plus, Check, X, Award, Download, Printer, UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { mockEvents, mockScores as rawScores } from '@/data/mockData';
import jsPDF from 'jspdf';

// ── Small inline helpers ──────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const cls = size === 'sm'  ? 'h-7 w-7 text-[10px]'
            : size === 'lg' ? 'h-12 w-12 text-base'
            : 'h-9 w-9 text-xs';
  return (
    <div className={`${cls} rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground`}>
      {initials}
    </div>
  );
}

// ── Generate a mini PDF certificate ──────────────────────────────────────────
function downloadCertPDF(recipientName: string, eventName: string, certType: string, score?: number) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const W = 297, H = 210;
  const accent: [number,number,number] = certType === 'Winner' ? [234,179,8] : certType === 'Runner-up' ? [148,163,184] : [139,92,246];

  doc.setFillColor(10, 10, 20);
  doc.rect(0, 0, W, H, 'F');
  doc.setDrawColor(...accent);
  doc.setLineWidth(1.5);
  doc.roundedRect(8, 8, W-16, H-16, 6, 6, 'S');
  doc.setLineWidth(0.4);
  doc.roundedRect(12, 12, W-24, H-24, 4, 4, 'S');

  doc.setFillColor(...accent);
  doc.rect(30, 50, W-60, 0.8, 'F');
  doc.rect(30, H-50-0.8, W-60, 0.8, 'F');

  doc.setTextColor(...accent);
  doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('EVENTFLOW PRO', W/2, 25, { align: 'center' });

  doc.setTextColor(255,255,255);
  doc.setFontSize(22); doc.setFont('helvetica','bold');
  const hdr = certType === 'Winner' ? 'CERTIFICATE OF ACHIEVEMENT' : certType === 'Runner-up' ? 'CERTIFICATE OF EXCELLENCE' : 'CERTIFICATE OF PARTICIPATION';
  doc.text(hdr, W/2, 40, { align: 'center' });

  doc.setTextColor(180,180,180);
  doc.setFontSize(11); doc.setFont('helvetica','normal');
  doc.text('This is to certify that', W/2, 62, { align: 'center' });

  doc.setTextColor(255,255,255);
  doc.setFontSize(30); doc.setFont('helvetica','bold');
  doc.text(recipientName, W/2, 80, { align: 'center' });

  if (certType !== 'Participation') {
    doc.setTextColor(...accent);
    doc.setFontSize(14);
    doc.text(certType === 'Winner' ? '🏆 1st Place' : '🥈 2nd Place', W/2, 94, { align: 'center' });
  }

  doc.setTextColor(200,200,200);
  doc.setFontSize(11); doc.setFont('helvetica','normal');
  doc.text(`Event: `, W/2-60, 108);
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
  doc.text(eventName, W/2-60+16, 108);
  if (score) {
    doc.setTextColor(200,200,200); doc.setFont('helvetica','normal');
    doc.text(`Score: `, W/2-60, 116);
    doc.setTextColor(...accent); doc.setFont('helvetica','bold');
    doc.text(`${score}/40`, W/2-60+16, 116);
  }
  doc.setTextColor(200,200,200); doc.setFont('helvetica','normal');
  doc.text(`Issued: `, W/2-60, 124);
  doc.setTextColor(255,255,255);
  doc.text(new Date().toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'}), W/2-60+17, 124);

  doc.setDrawColor(120,120,120); doc.setLineWidth(0.4);
  doc.line(30, H-35, 100, H-35);
  doc.setFontSize(10); doc.setTextColor(180,180,180); doc.setFont('helvetica','normal');
  doc.text('Sarah Chen', 65, H-29, { align:'center' });
  doc.setFontSize(8);
  doc.text('Event Organizer', 65, H-24, { align:'center' });

  doc.line(W-100, H-35, W-30, H-35);
  doc.setFontSize(10);
  doc.text('EventFlow Pro', W-65, H-29, { align:'center' });
  doc.setFontSize(8);
  doc.text('Authorized Seal', W-65, H-24, { align:'center' });

  const verifyId = `EF-${recipientName.replace(/\s/g,'').slice(0,6).toUpperCase()}${Date.now().toString().slice(-4)}`;
  doc.setFontSize(7); doc.setTextColor(100,100,100);
  doc.text(`Verify: ${verifyId}`, W/2, H-14, { align:'center' });

  doc.save(`EventFlow_Cert_${recipientName.replace(/\s+/g,'_')}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TeamProfilePage() {
  const { user } = useAuth();
  const { teams, scores, addTeamMember, updateTeamMember, removeTeamMember } = useData();
  const navigate = useNavigate();

  const team       = teams.find(t => t.id === (user?.teamId ?? '1')) ?? teams[0];
  const teamScore  = scores.find(s => s.teamId === team?.id && s.evaluated);
  const teamEvents = mockEvents.filter(e => (team?.eventIds ?? [team?.eventId]).includes(e.id));
  const maxMembers = teamEvents[0]?.maxMembers ?? 6;
  const minMembers = teamEvents[0]?.minMembers ?? 1;

  // ── My Certificates derived from real data ───────────────────────────────
  const myCerts = (() => {
    const certs: { eventName: string; type: string; score?: number; memberId: string }[] = [];
    team?.members.forEach(m => {
      teamEvents.forEach(ev => {
        let type = 'Participation';
        if (ev.winnerTeamId === team.id)   type = 'Winner';
        else if (ev.runnerUpTeamId === team.id) type = 'Runner-up';
        if (team.submission) {
          certs.push({ eventName: ev.title, type, score: teamScore?.total, memberId: m.id });
        }
      });
    });
    return certs;
  })();

  // ── Add member form state ─────────────────────────────────────────────────
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newName,     setNewName]       = useState('');
  const [newEmail,    setNewEmail]      = useState('');
  const [newRole,     setNewRole]       = useState('');
  const [newContrib,  setNewContrib]    = useState('');

  // ── Edit member state ─────────────────────────────────────────────────────
  const [editingId,   setEditingId]    = useState<string | null>(null);
  const [editName,    setEditName]     = useState('');
  const [editEmail,   setEditEmail]    = useState('');
  const [editRole,    setEditRole]     = useState('');
  const [editContrib, setEditContrib]  = useState('');

  if (!team) return <p className="text-muted-foreground">Team not found.</p>;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddMember = () => {
    if (!newName.trim()) { toast.error('Name is required'); return; }
    if (team.members.length >= maxMembers) {
      toast.error(`Maximum ${maxMembers} members allowed`); return;
    }
    const dupEmail = newEmail.trim() && team.members.some(m => m.email === newEmail.trim());
    if (dupEmail) { toast.error('A member with this email already exists'); return; }

    addTeamMember(team.id, {
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      role: newRole.trim() || 'Member',
      contribution: newContrib.trim() || '',
    });
    toast.success(`✅ ${newName.trim()} added to team!`);
    setNewName(''); setNewEmail(''); setNewRole(''); setNewContrib('');
    setShowAddForm(false);
  };

  const startEdit = (m: typeof team.members[0]) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditEmail(m.email ?? '');
    setEditRole(m.role);
    setEditContrib(m.contribution);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) { toast.error('Name is required'); return; }
    updateTeamMember(team.id, editingId!, {
      name: editName.trim(),
      email: editEmail.trim() || undefined,
      role: editRole.trim() || 'Member',
      contribution: editContrib.trim(),
    });
    toast.success('✅ Profile updated!');
    setEditingId(null);
  };

  const handleRemove = (memberId: string, name: string) => {
    if (team.members.length <= minMembers) {
      toast.error(`Minimum ${minMembers} member required`); return;
    }
    removeTeamMember(team.id, memberId);
    toast.info(`🗑 ${name} removed from team`);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">

      {/* ── Team Header ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
              <span className="text-primary-foreground text-2xl font-bold font-heading">
                {team.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground">{team.name}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {team.members.length} / {maxMembers} members · {teamEvents.length} event{teamEvents.length !== 1 ? 's' : ''}
              </p>
              {team.rank && (
                <Badge className="mt-1.5 gap-1 bg-warning/20 text-warning border-warning/30">
                  <Trophy className="h-3 w-3" /> Rank #{team.rank}
                </Badge>
              )}
            </div>
          </div>
          {teamScore && (
            <div className="text-center bg-muted/30 rounded-xl px-5 py-3">
              <p className="text-3xl font-bold font-heading text-primary">{teamScore.total}</p>
              <p className="text-xs text-muted-foreground">/ 40 total score</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Submission ───────────────────────────────────────────────────── */}
      {team.submission ? (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Project Submission
            </h2>
            <StatusBadge status={team.submission.status} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{team.submission.projectTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{team.submission.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {team.submission.techStack.map(t => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
          {team.submission.videoUrl ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Demo Video</p>
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-border">
                <video controls className="w-full h-full object-contain" src={team.submission.videoUrl} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-warning/10 border border-warning/30">
              <div>
                <p className="text-sm font-medium text-foreground">No video uploaded</p>
                <p className="text-xs text-muted-foreground">Upload your demo video to complete your submission</p>
              </div>
              <Button size="sm" className="gap-1.5 gradient-primary text-primary-foreground" onClick={() => navigate('/submit')}>
                <Upload className="h-3.5 w-3.5" /> Upload
              </Button>
            </div>
          )}
          {teamScore?.comment && (
            <div className="p-4 rounded-xl bg-accent/30 border border-accent/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Judge Feedback</p>
              <p className="text-sm text-foreground italic">"{teamScore.comment}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
          <p className="font-medium text-foreground">No submission yet</p>
          <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => navigate('/submit')}>
            <Upload className="h-4 w-4" /> Submit Project
          </Button>
        </div>
      )}

      {/* ── 📜 My Certificates ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-primary" /> 📜 My Certificates
        </h2>
        {myCerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No certificates yet.</p>
            <p className="text-xs mt-1">Submit your project and get evaluated to earn certificates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(user ? myCerts.filter((_, i) => i < team.members.length) : myCerts).slice(0, team.members.length).map((cert, i) => {
              const member = team.members[i];
              if (!member) return null;
              const color = cert.type === 'Winner' ? 'border-yellow-500/50 bg-yellow-900/10'
                : cert.type === 'Runner-up' ? 'border-slate-400/50 bg-slate-700/10'
                : 'border-violet-500/50 bg-violet-900/10';
              const badge  = cert.type === 'Winner' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                : cert.type === 'Runner-up' ? 'text-slate-300 bg-slate-400/10 border-slate-400/30'
                : 'text-violet-400 bg-violet-400/10 border-violet-400/30';
              return (
                <div key={i} className={`p-4 rounded-xl border ${color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={member.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{cert.eventName}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] border ${badge} mb-3`}>
                    {cert.type === 'Winner' ? '🥇 Winner' : cert.type === 'Runner-up' ? '🥈 Runner-up' : '🎖 Participation'}
                  </Badge>
                  {cert.score && <p className="text-xs text-muted-foreground mb-3">Score: <span className="text-foreground font-semibold">{cert.score}/40</span></p>}
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      id={`print-cert-${i}`}
                      onClick={() => {
                        toast.info('Opening print dialog...');
                        // Reuse the print pop-up logic inline
                        const w = window.open('', '_blank', 'width=900,height=650');
                        if (!w) return;
                        w.document.write(`<!DOCTYPE html><html><head><title>Certificate</title>
                        <style>@page{size:A4 landscape;margin:0}body{margin:0;font-family:sans-serif;width:297mm;height:210mm;background:#0a0a14;display:flex;align-items:center;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
                        .cert{width:273mm;height:186mm;border:2px solid ${cert.type==='Winner'?'#eab308':cert.type==='Runner-up'?'#94a3b8':'#8b5cf6'};border-radius:12px;padding:12mm 16mm;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4mm}
                        .name{font-size:30pt;font-weight:900;color:#fff}.title{font-size:18pt;font-weight:700;color:${cert.type==='Winner'?'#eab308':cert.type==='Runner-up'?'#94a3b8':'#8b5cf6'}}.label{font-size:10pt;color:#aaa}.detail{font-size:10pt;color:#ccc}
                        </style></head><body><div class="cert">
                        <p class="label" style="letter-spacing:4px;font-weight:700;color:${cert.type==='Winner'?'#eab308':'#8b5cf6'}">EVENTFLOW PRO</p>
                        <p class="title">${cert.type==='Winner'?'CERTIFICATE OF ACHIEVEMENT':cert.type==='Runner-up'?'CERTIFICATE OF EXCELLENCE':'CERTIFICATE OF PARTICIPATION'}</p>
                        <p class="label">This is to certify that</p>
                        <p class="name">${member.name}</p>
                        ${cert.type!=='Participation'?`<p style="font-size:14pt;font-weight:700;color:${cert.type==='Winner'?'#eab308':'#94a3b8'}">${cert.type==='Winner'?'🏆 1st Place':'🥈 2nd Place'}</p>`:''}
                        <p class="detail">Event: <strong style="color:#fff">${cert.eventName}</strong></p>
                        ${cert.score?`<p class="detail">Score: <strong style="color:${cert.type==='Winner'?'#eab308':'#8b5cf6'}">${cert.score}/40</strong></p>`:''}
                        <p class="detail">Issued: <strong style="color:#fff">${new Date().toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})}</strong></p>
                        </div></body></html>`);
                        w.document.close(); w.focus(); setTimeout(()=>w.print(), 500);
                      }}
                    >
                      <Printer className="h-3 w-3" /> Print
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gradient-primary text-primary-foreground gap-1.5 text-xs"
                      id={`download-cert-${i}`}
                      onClick={() => {
                        downloadCertPDF(member.name, cert.eventName, cert.type, cert.score);
                        toast.success(`📄 Certificate downloaded for ${member.name}!`);
                      }}
                    >
                      <Download className="h-3 w-3" /> Download PDF
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Team Management ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Team Management
            <span className="ml-1 text-xs text-muted-foreground font-normal">
              ({team.members.length}/{maxMembers} members)
            </span>
          </h2>
          {team.members.length < maxMembers && (
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground gap-1.5 text-xs"
              onClick={() => { setShowAddForm(v => !v); setEditingId(null); }}
              id="add-member-btn"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {showAddForm ? 'Cancel' : 'Add Member'}
            </Button>
          )}
        </div>

        {/* ── Add member form ───────────────────────────────────────────── */}
        {showAddForm && (
          <div className="mb-4 p-4 rounded-xl bg-muted/30 border border-primary/30 space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" /> New Member
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Name *</label>
                <Input
                  id="new-member-name"
                  placeholder="Full name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email</label>
                <Input
                  id="new-member-email"
                  placeholder="email@example.com"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Role</label>
                <Input
                  id="new-member-role"
                  placeholder="e.g. Frontend Dev, Designer"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Contribution</label>
                <Input
                  id="new-member-contribution"
                  placeholder="What they contribute"
                  value={newContrib}
                  onChange={e => setNewContrib(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5" onClick={handleAddMember} id="confirm-add-member-btn">
                <Check className="h-3.5 w-3.5" /> Add Member
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── Member cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {team.members.map(member => (
            <div key={member.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
              {editingId === member.id ? (
                // Edit mode
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                    <Edit2 className="h-3 w-3" /> Editing
                  </p>
                  <Input value={editName}    onChange={e => setEditName(e.target.value)}    placeholder="Name *"    className="h-8 text-sm" id={`edit-name-${member.id}`} />
                  <Input value={editEmail}   onChange={e => setEditEmail(e.target.value)}   placeholder="Email"     className="h-8 text-sm" type="email" id={`edit-email-${member.id}`} />
                  <Input value={editRole}    onChange={e => setEditRole(e.target.value)}    placeholder="Role"      className="h-8 text-sm" id={`edit-role-${member.id}`} />
                  <Input value={editContrib} onChange={e => setEditContrib(e.target.value)} placeholder="Contribution" className="h-8 text-sm" id={`edit-contrib-${member.id}`} />
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1 gradient-primary text-primary-foreground gap-1" onClick={handleSaveEdit} id={`save-edit-${member.id}`}>
                      <Check className="h-3 w-3" /> Save
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => setEditingId(null)}>
                      <X className="h-3 w-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-tight">{member.name}</p>
                        <p className="text-xs text-primary font-medium">{member.role}</p>
                        {member.email && <p className="text-[10px] text-muted-foreground">{member.email}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => startEdit(member)}
                        id={`edit-member-${member.id}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(member.id, member.name)}
                        id={`remove-member-${member.id}`}
                        disabled={team.members.length <= minMembers}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {member.contribution && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">{member.contribution}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {team.members.length >= maxMembers && (
          <p className="text-xs text-warning mt-3 flex items-center gap-1">
            ⚠️ Team is full ({maxMembers}/{maxMembers} members)
          </p>
        )}
        {team.members.length <= minMembers && (
          <p className="text-xs text-muted-foreground mt-1">Minimum {minMembers} member required — cannot remove further.</p>
        )}
      </div>
    </div>
  );
}
