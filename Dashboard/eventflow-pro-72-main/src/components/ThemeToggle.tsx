import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center h-9 w-9 rounded-xl
        transition-all duration-300 ease-in-out
        overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
        ${isDark
          ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 hover:shadow-glow'
          : 'bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20 hover:border-accent/40'}
      `}
      style={{ transition: 'all 0.3s ease' }}
    >
      {/* Sun icon — visible in light mode */}
      <Sun
        className={`
          h-4 w-4 absolute transition-all duration-300 ease-in-out
          ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'}
        `}
      />
      {/* Moon icon — visible in dark mode */}
      <Moon
        className={`
          h-4 w-4 absolute transition-all duration-300 ease-in-out
          ${isDark ? 'rotate-0 scale-100 opacity-100 text-primary' : '-rotate-90 scale-0 opacity-0'}
        `}
      />
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  );
}
