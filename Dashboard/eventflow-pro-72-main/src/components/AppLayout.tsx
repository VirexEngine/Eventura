import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { Navbar } from '@/components/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background isolate">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
