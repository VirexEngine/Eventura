import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { NavbarDashboard } from '@/components/dashboard/NavbarDashboard';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-background min-h-screen w-full">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-[70] transition-transform duration-300 ease-in-out",
        !mobileMenuOpen && "-translate-x-full lg:translate-x-0"
      )}>
        <AppSidebar onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="sticky top-0 z-40 h-16 w-full flex items-center bg-card/85 backdrop-blur-xl border-b border-border/50">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden ml-4 text-muted-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 h-full flex items-center px-4 overflow-hidden">
            <NavbarDashboard />
          </div>
        </header>

        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full px-4 py-8 lg:px-10">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
