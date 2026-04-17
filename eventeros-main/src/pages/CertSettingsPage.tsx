import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button }  from '@/components/ui/button';
import { Input }   from '@/components/ui/input';
import { Badge }   from '@/components/ui/badge';
import {
  Settings2, Save, Eye, Palette, Type, Trophy, Award,
  Check, RotateCcw, QrCode,
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

// ── Live Preview ──────────────────────────────────────────────────────────────
function CertPreview({ settings }: { settings: ReturnType<typeof useData>['certSettings'] }) {
  const fontClass = settings.fontStyle === 'classic' ? 'font-serif'
    : settings.fontStyle === 'bold' ? 'font-black'
    : 'font-heading';

  return (
    <div
      className="relative rounded-2xl border-2 overflow-hidden p-8 text-center space-y-4 transition-all duration-300"
      style={{
        background: settings.bgColor,
        borderColor: settings.accentColor,
        minHeight: '380px',
      }}
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full border border-white/5" />
        <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full border border-white/5" />
        {settings.showWatermark && (
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
            style={{ opacity: 0.04 }}
          >
            <span style={{ color: settings.accentColor, fontSize: '80px', fontWeight: 900, transform: 'rotate(-30deg)', whiteSpace: 'nowrap' }}>
              {settings.orgName.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {settings.showLogo && (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mx-auto mb-2" style={{ background: settings.accentColor + '22' }}>
            <Trophy className="h-6 w-6" style={{ color: settings.accentColor }} />
          </div>
        )}
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: settings.accentColor }}>
          {settings.title}
        </p>
        <h3 className={`text-xl font-bold mt-1 ${fontClass}`} style={{ color: settings.accentColor }}>
          {settings.subtitle}
        </h3>
      </div>

      <div className="relative space-y-1">
        <p className="text-xs uppercase tracking-wider" style={{ color: '#aaaaaa' }}>This is to certify that</p>
        <p className={`text-2xl font-bold ${fontClass}`} style={{ color: '#ffffff' }}>Alice Johnson</p>
        <p className="text-sm font-semibold" style={{ color: settings.accentColor }}>🥇 1st Place</p>
        <div className="pt-2 space-y-0.5">
          <p className="text-xs" style={{ color: '#aaa' }}>Project: <span style={{ color: '#fff' }}>EcoTrack AI</span></p>
          <p className="text-xs" style={{ color: '#aaa' }}>Event: <span style={{ color: '#fff' }}>HackTech 2026</span></p>
          {settings.showScore && <p className="text-xs" style={{ color: '#aaa' }}>Score: <span style={{ color: settings.accentColor, fontWeight: 700 }}>36/40</span></p>}
        </div>
        <p className="text-xs pt-1" style={{ color: '#aaa' }}>Issued on April 17, 2026</p>
      </div>

      <div className="relative flex items-center justify-between pt-4">
        <div className="text-left" style={{ borderTop: `1px solid ${settings.accentColor}44`, paddingTop: '8px', width: '80px' }}>
          <p className="text-[10px]" style={{ color: '#aaa' }}>{settings.authorName}</p>
          <p className="text-[9px]" style={{ color: '#666' }}>{settings.authorTitle}</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#ffffff15', border: '1px solid #ffffff15' }}>
            <QrCode className="h-3 w-3" style={{ color: '#888' }} />
            <span className="text-[9px] font-mono" style={{ color: '#888' }}>EF-PREVIEW</span>
          </div>
          <p className="text-[9px] mt-0.5" style={{ color: '#555' }}>{settings.footerText}</p>
        </div>
      </div>
    </div>
  );
}

// ── Swatch picker ─────────────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  '#8b5cf6', '#eab308', '#94a3b8', '#34d399',
  '#f43f5e', '#3b82f6', '#f97316', '#ec4899',
];
const BG_PRESETS = [
  '#0a0a0f', '#0f1a2e', '#0f1a10', '#1a0f0f',
  '#1a1a2e', '#0d0d0d', '#0f0a1e', '#1a1206',
];

// ─────────────────────────────────────────────────────────────────────────────
export default function CertSettingsPage() {
  const { certSettings, updateCertSettings } = useData();
  const [draft,    setDraft]    = useState({ ...certSettings });
  const [preview,  setPreview]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  const update = (key: keyof typeof draft, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateCertSettings(draft);
    setSaved(true);
    toast.success('✅ Certificate settings saved! All new certificates will use these settings.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaults = {
      title: 'EventFlow Pro', subtitle: 'Certificate of Achievement', orgName: 'EventFlow Pro',
      accentColor: '#8b5cf6', bgColor: '#0a0a0f', fontStyle: 'modern' as const,
      showWatermark: true, showLogo: true, showScore: true,
      authorName: 'Sarah Chen', authorTitle: 'Event Organizer', footerText: 'eventflow.pro/verify',
    };
    setDraft(defaults);
    updateCertSettings(defaults);
    toast.info('Settings reset to defaults');
  };

  // Generate a sample PDF with current draft settings
  const handlePreviewPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const W = 297, H = 210;
    const hex2rgb = (h: string): [number,number,number] => {
      const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
      return [r,g,b];
    };
    const accent = hex2rgb(draft.accentColor);
    const bg     = hex2rgb(draft.bgColor);

    doc.setFillColor(...bg); doc.rect(0,0,W,H,'F');
    doc.setDrawColor(...accent); doc.setLineWidth(1.5);
    doc.roundedRect(8,8,W-16,H-16,6,6,'S');
    doc.setFillColor(...accent);
    doc.rect(30,50,W-60,0.8,'F');
    doc.rect(30,H-50,W-60,0.8,'F');

    doc.setTextColor(...accent); doc.setFontSize(9);
    const fw = draft.fontStyle === 'bold' ? 'bold' : 'normal';
    doc.setFont('helvetica', 'bold');
    doc.text(draft.title.toUpperCase(), W/2, 25, { align:'center' });

    doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont('helvetica','bold');
    doc.text(draft.subtitle.toUpperCase(), W/2, 40, { align:'center' });

    doc.setTextColor(180,180,180); doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('This is to certify that', W/2, 62, { align:'center' });

    doc.setTextColor(255,255,255); doc.setFontSize(28); doc.setFont('helvetica','bold');
    doc.text('Alice Johnson', W/2, 80, { align:'center' });

    doc.setTextColor(...accent); doc.setFontSize(14);
    doc.text('🏆 1st Place', W/2, 95, { align:'center' });

    doc.setTextColor(200,200,200); doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Event: HackTech 2026', W/2, 109, { align:'center' });
    if (draft.showScore) {
      doc.setTextColor(...accent); doc.setFont('helvetica','bold');
      doc.text('Score: 36/40', W/2, 117, { align:'center' });
    }

    doc.setDrawColor(100,100,100); doc.setLineWidth(0.4);
    doc.line(30,H-35,100,H-35);
    doc.setFontSize(10); doc.setTextColor(180,180,180); doc.setFont('helvetica','normal');
    doc.text(draft.authorName, 65, H-29, {align:'center'});
    doc.setFontSize(8);
    doc.text(draft.authorTitle, 65, H-24, {align:'center'});

    doc.line(W-100,H-35,W-30,H-35);
    doc.setFontSize(10); doc.text(draft.orgName, W-65, H-29, {align:'center'});
    doc.setFontSize(8); doc.text('Authorized Seal', W-65, H-24, {align:'center'});

    doc.setFontSize(7); doc.setTextColor(100,100,100);
    doc.text(draft.footerText, W/2, H-14, {align:'center'});

    doc.save('certificate_preview_sample.pdf');
    toast.success('📄 Sample PDF downloaded!');
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" /> Certificate Settings
          </h1>
          <p className="text-muted-foreground text-sm">Customize the design applied to all generated certificates</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReset} id="reset-cert-settings">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePreviewPDF} id="preview-cert-pdf">
            <Eye className="h-3.5 w-3.5" /> Preview PDF
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5" onClick={handleSave} id="save-cert-settings">
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Settings panels ─────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Text settings */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Type className="h-4 w-4 text-primary" /> Text & Branding
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Organization Name', key: 'title' as const, placeholder: 'EventFlow Pro' },
                { label: 'Certificate Subtitle', key: 'subtitle' as const, placeholder: 'Certificate of Achievement' },
                { label: 'Organizer Name', key: 'authorName' as const, placeholder: 'Sarah Chen' },
                { label: 'Organizer Title', key: 'authorTitle' as const, placeholder: 'Event Organizer' },
                { label: 'Footer / Verify URL', key: 'footerText' as const, placeholder: 'eventflow.pro/verify' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">{label}</label>
                  <Input
                    id={`cert-setting-${key}`}
                    value={draft[key] as string}
                    onChange={e => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-primary" /> Colors
            </h3>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">Accent Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => update('accentColor', c)}
                    className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: draft.accentColor === c ? '#fff' : 'transparent' }}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={e => update('accentColor', e.target.value)}
                  className="h-7 w-7 rounded-lg cursor-pointer border-0 bg-transparent"
                  title="Custom color"
                />
                <code className="text-xs font-mono text-muted-foreground">{draft.accentColor}</code>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">Background Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {BG_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => update('bgColor', c)}
                    className="h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: draft.bgColor === c ? '#fff' : '#444' }}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={draft.bgColor}
                  onChange={e => update('bgColor', e.target.value)}
                  className="h-7 w-7 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <code className="text-xs font-mono text-muted-foreground">{draft.bgColor}</code>
              </div>
            </div>
          </div>

          {/* Font & Toggles */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-primary" /> Style & Toggles
            </h3>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">Font Style</label>
              <div className="flex gap-2">
                {(['classic', 'modern', 'bold'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => update('fontStyle', f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                      draft.fontStyle === f
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {([
                { key: 'showLogo',      label: 'Show logo / trophy icon' },
                { key: 'showWatermark', label: 'Show watermark' },
                { key: 'showScore',     label: 'Show score on certificate' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => update(key, !draft[key])}
                    className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
                      draft[key] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      draft[key] ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Live preview ──────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Updates in real-time</Badge>
          </div>
          <CertPreview settings={draft} />
          <p className="text-xs text-muted-foreground text-center">
            This preview shows how certificates will look with current settings.
            Click <strong>Save Settings</strong> to apply, then go to the Certificates page.
          </p>
        </div>
      </div>
    </div>
  );
}
