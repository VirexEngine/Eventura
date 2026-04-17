import { useState } from 'react';
import jsPDF from 'jspdf';
import { mockTeams, mockEvents, mockScores, mockJudges } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award, Download, Printer, Trophy, Users, Star,
  QrCode, CheckCircle, Medal,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
type CertType = 'winner' | 'runner_up' | 'participation' | 'judge';

interface Cert {
  id: string;
  type: CertType;
  recipientName: string;
  eventName: string;
  eventDate: string;
  rank?: string;
  score?: number;
  projectTitle?: string;
  specialty?: string;
}

// ── Derive certificates ────────────────────────────────────────────────────────
function buildCertificates(): Cert[] {
  const certs: Cert[] = [];

  mockEvents.forEach(event => {
    const evTeams  = mockTeams.filter(t => t.eventIds.includes(event.id));
    const winner   = event.winnerTeamId   ? mockTeams.find(t => t.id === event.winnerTeamId)   : evTeams[0];
    const runnerUp = event.runnerUpTeamId ? mockTeams.find(t => t.id === event.runnerUpTeamId)  : evTeams[1];

    if (winner) {
      const score = mockScores.find(s => s.teamId === winner.id);
      winner.members.forEach(m => {
        certs.push({ id: `${event.id}-winner-${m.id}`, type: 'winner', recipientName: m.name,
          eventName: event.title, eventDate: event.endDate, rank: '1st Place', score: score?.total,
          projectTitle: winner.submission?.projectTitle });
      });
    }
    if (runnerUp && runnerUp.id !== winner?.id) {
      runnerUp.members.forEach(m => {
        certs.push({ id: `${event.id}-runner-${m.id}`, type: 'runner_up', recipientName: m.name,
          eventName: event.title, eventDate: event.endDate, rank: '2nd Place',
          projectTitle: runnerUp.submission?.projectTitle });
      });
    }
    evTeams
      .filter(t => t.id !== winner?.id && t.id !== runnerUp?.id && t.submission)
      .forEach(team => {
        team.members.forEach(m => {
          certs.push({ id: `${event.id}-part-${m.id}`, type: 'participation', recipientName: m.name,
            eventName: event.title, eventDate: event.endDate,
            projectTitle: team.submission?.projectTitle });
        });
      });
  });

  mockJudges.forEach(j => {
    const assigned = mockEvents.filter(e => j.eventsAssigned.includes(e.id));
    if (assigned.length > 0)
      certs.push({ id: `judge-${j.id}`, type: 'judge', recipientName: j.name,
        eventName: assigned.map(e => e.title).join(' · '),
        eventDate: new Date().toISOString().split('T')[0], specialty: j.expertise });
  });

  return certs;
}

const ALL_CERTS = buildCertificates();

// ── Colour palette per cert type ───────────────────────────────────────────────
const TYPE_STYLE = {
  winner:        { bg: 'from-yellow-900/60 to-yellow-700/20', border: 'border-yellow-500/60', accent: 'text-yellow-400', hdr: 'Certificate of Achievement', badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30', pdf: { bg: [20,14,0] as [number,number,number], accent: [234,179,8] as [number,number,number], border: [234,179,8] as [number,number,number] } },
  runner_up:     { bg: 'from-slate-700/60 to-slate-600/20',   border: 'border-slate-400/60',  accent: 'text-slate-300',  hdr: 'Certificate of Excellence',    badge: 'bg-slate-400/20 text-slate-300 border-slate-400/30',   pdf: { bg: [12,16,22] as [number,number,number], accent: [148,163,184] as [number,number,number], border: [148,163,184] as [number,number,number] } },
  participation: { bg: 'from-violet-900/60 to-violet-700/20', border: 'border-violet-500/60', accent: 'text-violet-400', hdr: 'Certificate of Participation', badge: 'bg-violet-400/20 text-violet-300 border-violet-400/30', pdf: { bg: [15,10,30] as [number,number,number], accent: [139,92,246] as [number,number,number], border: [139,92,246] as [number,number,number] } },
  judge:         { bg: 'from-emerald-900/60 to-emerald-700/20',border:'border-emerald-500/60',accent:'text-emerald-400',  hdr: 'Certificate of Appreciation', badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30', pdf: { bg: [5,20,15] as [number,number,number], accent: [52,211,153] as [number,number,number], border: [52,211,153] as [number,number,number] } },
};

// ── PDF generator ──────────────────────────────────────────────────────────────
function generatePDF(cert: Cert): jsPDF {
  // A4 landscape: 297mm × 210mm
  const doc   = new jsPDF('landscape', 'mm', 'a4');
  const W     = 297;
  const H     = 210;
  const style = TYPE_STYLE[cert.type];
  const { bg, accent, border } = style.pdf;
  const issueDate = new Date(cert.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const verifyId  = `EF-${cert.id.slice(0, 8).toUpperCase()}`;

  // ── Background fill ──
  doc.setFillColor(...bg);
  doc.rect(0, 0, W, H, 'F');

  // ── Decorative outer border ──
  doc.setDrawColor(...border);
  doc.setLineWidth(1.5);
  doc.roundedRect(8, 8, W - 16, H - 16, 6, 6, 'S');

  // ── Inner thin border ──
  doc.setLineWidth(0.4);
  doc.roundedRect(12, 12, W - 24, H - 24, 4, 4, 'S');

  // ── Corner ornaments (small filled squares) ──
  doc.setFillColor(...border);
  [[14,14],[W-14-4,14],[14,H-14-4],[W-14-4,H-14-4]].forEach(([x,y]) => {
    doc.rect(x, y, 4, 4, 'F');
  });

  // ── Horizontal rule ──
  doc.setFillColor(...accent);
  doc.rect(30, 50, W - 60, 0.8, 'F');
  doc.rect(30, H - 50 - 0.8, W - 60, 0.8, 'F');

  // ── LOGO / ORG ──
  doc.setTextColor(...accent);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENTFLOW PRO', W / 2, 25, { align: 'center' });

  // ── Certificate header ──
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(style.hdr.toUpperCase(), W / 2, 40, { align: 'center' });

  // ── "This is to certify that" ──
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', W / 2, 62, { align: 'center' });

  // ── Recipient name ──
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(cert.recipientName, W / 2, 80, { align: 'center' });

  // ── Underline under name ──
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  const nameW = doc.getTextWidth(cert.recipientName);
  doc.line(W / 2 - nameW / 2, 83, W / 2 + nameW / 2, 83);

  // ── Rank badge ──
  if (cert.rank) {
    doc.setTextColor(...accent);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const rankText = cert.type === 'winner' ? `🏆 ${cert.rank}` : cert.rank;
    doc.text(rankText, W / 2, 95, { align: 'center' });
  }

  // ── Body details ──
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let yLine = cert.rank ? 108 : 100;
  const lineSpacing = 7;

  if (cert.projectTitle) {
    doc.text(`Project: `, W / 2 - 60, yLine);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(cert.projectTitle, W / 2 - 60 + 20, yLine);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    yLine += lineSpacing;
  }

  if (cert.specialty) {
    doc.text(`Expertise: `, W / 2 - 60, yLine);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(cert.specialty, W / 2 - 60 + 25, yLine);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    yLine += lineSpacing;
  }

  doc.text(`Event: `, W / 2 - 60, yLine);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  // Wrap long event names
  const eventLines = doc.splitTextToSize(cert.eventName, 120);
  doc.text(eventLines, W / 2 - 60 + 16, yLine);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  yLine += lineSpacing * eventLines.length;

  if (cert.score !== undefined && cert.score > 0) {
    doc.text(`Final Score: `, W / 2 - 60, yLine);
    doc.setTextColor(...accent);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cert.score} / 40`, W / 2 - 60 + 30, yLine);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    yLine += lineSpacing;
  }

  doc.text(`Date: `, W / 2 - 60, yLine);
  doc.setTextColor(255, 255, 255);
  doc.text(issueDate, W / 2 - 60 + 13, yLine);

  // ── Signature section ──
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Left signature
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.4);
  doc.line(30, H - 35, 100, H - 35);
  doc.text('Sarah Chen', 65, H - 29, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Event Organizer', 65, H - 24, { align: 'center' });

  // Right signature (seal placeholder)
  doc.setFontSize(10);
  doc.line(W - 100, H - 35, W - 30, H - 35);
  doc.text('EventFlow Pro', W - 65, H - 29, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Authorized Seal', W - 65, H - 24, { align: 'center' });

  // ── Watermark (GState API changed in jsPDF 4.x — guard with try/catch) ──
  try {
    doc.setTextColor(...accent);
    doc.setFontSize(55);
    doc.setFont('helvetica', 'bold');
    // jsPDF 2.x style; falls back gracefully if 4.x throws
    const GS = (doc as any).GState;
    doc.setGState(new GS({ opacity: 0.04 }));
    doc.text('EVENTFLOW', W / 2, H / 2, { align: 'center', angle: 330 });
    doc.setGState(new GS({ opacity: 1 }));
  } catch {
    // watermark skipped — PDF still generated cleanly
  }

  // ── Verify ID ──
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Verify: ${verifyId} · eventflow.pro/verify`, W / 2, H - 14, { align: 'center' });

  return doc;
}

// ── Certificate Preview Card (visual) ────────────────────────────────────────
function CertificatePreview({ cert }: { cert: Cert }) {
  const style = TYPE_STYLE[cert.type];
  const issueDate = new Date(cert.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const verifyId  = `EF-${cert.id.slice(0, 8).toUpperCase()}`;

  return (
    <div
      className={`relative rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.bg} backdrop-blur p-8 text-center space-y-4 overflow-hidden`}
      style={{ minHeight: '380px' }}
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full border border-white/5" />
        <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-white/[0.03]" />
      </div>

      <div className="relative">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mx-auto mb-3">
          {cert.type === 'winner'    ? <Trophy className={`h-7 w-7 ${style.accent}`} />
           : cert.type === 'runner_up' ? <Medal  className={`h-7 w-7 ${style.accent}`} />
           : cert.type === 'judge'     ? <Star   className={`h-7 w-7 ${style.accent}`} />
           :                             <Award  className={`h-7 w-7 ${style.accent}`} />}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">EventFlow Pro</p>
        <h3 className={`text-xl font-bold font-heading mt-1 ${style.accent}`}>{style.hdr}</h3>
      </div>

      <div className="relative space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">This is to certify that</p>
        <p className="text-2xl font-bold font-heading text-foreground">{cert.recipientName}</p>
        {cert.rank && <p className={`text-sm font-semibold ${style.accent}`}>{cert.rank === '1st Place' ? '🥇 1st Place' : cert.rank === '2nd Place' ? '🥈 2nd Place' : cert.rank}</p>}
        {cert.type === 'judge' && <p className="text-xs text-muted-foreground">Expert Judge · {cert.specialty}</p>}
        <div className="pt-2 space-y-0.5">
          {cert.projectTitle && <p className="text-xs text-muted-foreground">Project: <span className="text-foreground font-medium">{cert.projectTitle}</span></p>}
          <p className="text-xs text-muted-foreground">Event: <span className="text-foreground font-medium">{cert.eventName}</span></p>
          {cert.score !== undefined && cert.score > 0 && <p className="text-xs text-muted-foreground">Score: <span className={`font-bold ${style.accent}`}>{cert.score}/40</span></p>}
        </div>
        <p className="text-xs text-muted-foreground pt-1">Issued on {issueDate}</p>
      </div>

      <div className="relative flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-left">
          <div className="h-px w-20 bg-muted-foreground/40 mb-1" />
          <p className="text-[10px] text-muted-foreground">Sarah Chen</p>
          <p className="text-[10px] text-muted-foreground/60">Event Organizer</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/10">
            <QrCode className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] font-mono text-muted-foreground">{verifyId}</span>
          </div>
          <p className="text-[9px] text-muted-foreground/50 mt-0.5">eventflow.pro/verify</p>
        </div>
      </div>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
const FILTERS: { key: CertType | 'all'; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'winner',        label: '🥇 Winners' },
  { key: 'runner_up',     label: '🥈 Runners-up' },
  { key: 'participation', label: '🎖 Participation' },
  { key: 'judge',         label: '⭐ Judges' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CertificatesPage() {
  const [filter,   setFilter]   = useState<CertType | 'all'>('all');
  const [selected, setSelected] = useState<Cert | null>(ALL_CERTS[0] ?? null);

  const filtered = filter === 'all' ? ALL_CERTS : ALL_CERTS.filter(c => c.type === filter);

  // ── DOWNLOAD as PDF (jsPDF, no print dialog) ─────────────────
  const handleDownload = () => {
    if (!selected) return;
    try {
      const doc = generatePDF(selected);
      const safeName = selected.recipientName.replace(/\s+/g, '_');
      doc.save(`EventFlow_Certificate_${safeName}.pdf`);
      toast.success(`📄 Certificate downloaded for ${selected.recipientName}!`);
    } catch (err) {
      console.error(err);
      toast.error('Download failed. Please try again.');
    }
  };

  // ── PRINT (browser print dialog) ─────────────────────────────
  const handlePrint = () => {
    if (!selected) return;
    const style = TYPE_STYLE[selected.type];
    const issueDate = new Date(selected.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const verifyId  = `EF-${selected.id.slice(0, 8).toUpperCase()}`;

    const w = window.open('', '_blank', 'width=900,height=650');
    if (!w) { toast.error('Pop-up blocked. Please allow pop-ups for this site.'); return; }

    w.document.write(`<!DOCTYPE html>
<html><head>
<title>Certificate — ${selected.recipientName}</title>
<style>
  /* @import MUST be first rule — browsers silently ignore it otherwise */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Inter, sans-serif;
    width: 297mm; height: 210mm;
    background: rgb(${style.pdf.bg.join(',')});
    display: flex; align-items: center; justify-content: center;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  @media print {
    body { margin: 0; padding: 0; }
    html { margin: 0; }
  }
  .cert {
    width: 273mm; height: 186mm;
    border: 2px solid rgb(${style.pdf.border.join(',')});
    border-radius: 12px;
    padding: 12mm 16mm;
    text-align: center;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4mm;
    position: relative;
    overflow: hidden;
  }
  .watermark {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 60pt; font-weight: 900;
    color: rgb(${style.pdf.accent.join(',')});
    opacity: 0.04; white-space: nowrap; pointer-events: none; user-select: none;
  }
  .logo { font-size: 9pt; letter-spacing: 4px; color: rgb(${style.pdf.accent.join(',')}); text-transform: uppercase; font-weight: 700; }
  .rule { width: 80mm; height: 1px; background: rgb(${style.pdf.accent.join(',')}); margin: 2mm auto; }
  .header { font-size: 22pt; font-weight: 900; color: rgb(${style.pdf.accent.join(',')}); letter-spacing: 1px; }
  .label { font-size: 10pt; color: #aaa; letter-spacing: 2px; text-transform: uppercase; }
  .name { font-size: 30pt; font-weight: 900; color: #fff; border-bottom: 1px solid rgb(${style.pdf.accent.join(',')}); padding-bottom: 2mm; }
  .rank { font-size: 14pt; font-weight: 700; color: rgb(${style.pdf.accent.join(',')}); }
  .detail { font-size: 11pt; color: #bbb; margin: 1mm 0; }
  .detail span { color: #fff; font-weight: 600; }
  .sigs { display: flex; justify-content: space-between; width: 100%; margin-top: 6mm; padding-top: 4mm; border-top: 1px solid rgba(255,255,255,0.1); }
  .sig { text-align: center; min-width: 50mm; }
  .sig hr { border: none; border-top: 1px solid #555; margin-bottom: 2mm; }
  .sig p { font-size: 9pt; color: #999; }
  .verify { font-size: 7pt; color: #555; font-family: monospace; margin-top: 2mm; }
</style>
</head><body>
<div class="cert">
  <div class="watermark">EVENTFLOW</div>
  <p class="logo">EventFlow Pro</p>
  <div class="rule"></div>
  <h1 class="header">${style.hdr.toUpperCase()}</h1>
  <div class="rule"></div>
  <p class="label">This is to certify that</p>
  <p class="name">${selected.recipientName}</p>
  ${selected.rank ? `<p class="rank">${selected.rank === '1st Place' ? '🏆 1st Place' : selected.rank}</p>` : ''}
  ${selected.specialty ? `<p class="detail">Expertise: <span>${selected.specialty}</span></p>` : ''}
  ${selected.projectTitle ? `<p class="detail">Project: <span>${selected.projectTitle}</span></p>` : ''}
  <p class="detail">Event: <span>${selected.eventName}</span></p>
  ${selected.score ? `<p class="detail">Score: <span>${selected.score} / 40</span></p>` : ''}
  <p class="detail">Issued on: <span>${issueDate}</span></p>
  <div class="sigs">
    <div class="sig"><hr/><p>Sarah Chen</p><p style="font-size:8pt;color:#666">Event Organizer</p></div>
    <div class="sig"><hr/><p>EventFlow Pro</p><p style="font-size:8pt;color:#666">Authorized Seal</p></div>
  </div>
  <p class="verify">Verify ID: ${verifyId} · eventflow.pro/verify</p>
</div>
</body></html>`);

    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 600);
    toast.success('Print dialog opened!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Certificate Generation
          </h1>
          <p className="text-muted-foreground text-sm">Auto-generated A4 landscape certificates · {ALL_CERTS.length} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline" size="sm" className="gap-2"
            onClick={handlePrint} disabled={!selected}
            id="print-cert-btn"
          >
            <Printer className="h-4 w-4" /> Print Certificate
          </Button>
          <Button
            size="sm" className="gradient-primary text-primary-foreground gap-2"
            onClick={handleDownload} disabled={!selected}
            id="download-cert-btn"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',         val: ALL_CERTS.length,                                            icon: Award,  cls: 'text-primary' },
          { label: 'Winners',       val: ALL_CERTS.filter(c => c.type === 'winner').length,           icon: Trophy, cls: 'text-yellow-400' },
          { label: 'Participation', val: ALL_CERTS.filter(c => c.type === 'participation').length,    icon: Users,  cls: 'text-violet-400' },
          { label: 'Judges',        val: ALL_CERTS.filter(c => c.type === 'judge').length,            icon: Star,   cls: 'text-emerald-400' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${cls} opacity-80`} />
            <div>
              <p className="text-2xl font-bold font-heading text-foreground">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            id={`cert-filter-${f.key}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/40'
            }`}
          >
            {f.label}
            <span className="ml-1 opacity-60">
              ({f.key === 'all' ? ALL_CERTS.length : ALL_CERTS.filter(c => c.type === f.key).length})
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate list */}
        <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
          {filtered.map(cert => {
            const style = TYPE_STYLE[cert.type];
            return (
              <button
                key={cert.id}
                onClick={() => setSelected(cert)}
                id={`cert-select-${cert.id}`}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selected?.id === cert.id
                    ? `${style.border} bg-muted/50`
                    : 'border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                    {cert.type === 'winner'    ? <Trophy className={`h-3.5 w-3.5 ${style.accent}`} />
                     : cert.type === 'runner_up' ? <Medal  className={`h-3.5 w-3.5 ${style.accent}`} />
                     : cert.type === 'judge'     ? <Star   className={`h-3.5 w-3.5 ${style.accent}`} />
                     :                             <Award  className={`h-3.5 w-3.5 ${style.accent}`} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{cert.recipientName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{cert.eventName}</p>
                  </div>
                </div>
                <Badge className={`text-[9px] mt-1.5 border ${style.badge}`}>
                  {cert.type === 'winner' ? '🥇 Winner' : cert.type === 'runner_up' ? '🥈 Runner-up' : cert.type === 'judge' ? '⭐ Judge' : '🎖 Participation'}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {selected ? (
            <>
              <CertificatePreview cert={selected} />
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Download PDF</strong> — saves a high-quality A4 landscape PDF directly to your device (no print dialog).
                    <br />
                    <strong className="text-foreground">Print Certificate</strong> — opens browser print dialog (use "Save as PDF" for a copy).
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>
                  <Button size="sm" onClick={handleDownload} className="gradient-primary text-primary-foreground gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded-xl text-muted-foreground py-20">
              <div className="text-center">
                <Award className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a certificate to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
