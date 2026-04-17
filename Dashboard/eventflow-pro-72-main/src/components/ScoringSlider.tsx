import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ScoringSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

/**
 * ScoringSlider — interactive scoring control (0–10 by default).
 * Color-codes the score: red < 4, yellow 4–6, green > 6.
 */
export function ScoringSlider({ label, value, onChange, max = 10 }: ScoringSliderProps) {
  const percentage = (value / max) * 100;

  const scoreColor =
    value === 0 ? 'text-muted-foreground'
    : value < 4 ? 'text-destructive'
    : value < 7 ? 'text-warning'
    : 'text-success';

  const barColor =
    value === 0 ? 'bg-muted'
    : value < 4 ? 'bg-destructive'
    : value < 7 ? 'bg-warning'
    : 'gradient-primary';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex items-baseline gap-0.5">
          <span className={cn('text-xl font-bold font-heading transition-colors', scoreColor)}>{value}</span>
          <span className="text-xs text-muted-foreground">/{max}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={max}
        step={1}
        className="cursor-pointer"
        id={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
      {/* Visual fill bar */}
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
