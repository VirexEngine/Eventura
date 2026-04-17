import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'accent' | 'warm';
}

export function StatsCard({ title, value, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  const isGradient = variant !== 'default';

  if (isGradient) {
    return (
      <div className={cn(
        'rounded-xl border-transparent p-5 overflow-hidden relative',
        'transition-all duration-300 hover:-translate-y-0.5',
        variant === 'primary' ? 'gradient-primary' :
        variant === 'accent'  ? 'gradient-accent'  : 'gradient-warm',
      )}>
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.3),_transparent)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/75">{title}</p>
            <p className="text-3xl font-bold font-heading mt-1 text-white">{value}</p>
            {trend && <p className="text-xs mt-1 text-white/65">{trend}</p>}
          </div>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'glass-card rounded-xl p-5 overflow-hidden',
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-heading mt-1 text-foreground">{value}</p>
          {trend && <p className="text-xs mt-1 text-muted-foreground">{trend}</p>}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/10 border border-primary/15">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
