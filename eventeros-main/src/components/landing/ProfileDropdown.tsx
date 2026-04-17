import { User } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Upload, Megaphone, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

export default function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const initials = user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent transition-all hover:ring-primary/50 focus:outline-none">
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/60 backdrop-blur-xl border-border/30 shadow-xl">
        <div className="px-2 py-1.5 mb-1 border-b border-border/30 text-sm opacity-80">
          Logged in as <b>{user.name}</b>
        </div>
        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer gap-2">
          <Calendar className="w-4 h-4" />
          <span>My Events</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-projects')} className="cursor-pointer gap-2">
          <Upload className="w-4 h-4" />
          <span>My Projects</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/announcements')} className="cursor-pointer gap-2">
          <Megaphone className="w-4 h-4" />
          <span>Announcements</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer gap-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
