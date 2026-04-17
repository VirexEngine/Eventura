import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnnouncementProvider } from "@/contexts/AnnouncementContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnnouncementPopup } from "@/components/AnnouncementComponents";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import EventsPage from "@/pages/EventsPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import EvaluatePage from "@/pages/EvaluatePage";
import SubmitPage from "@/pages/SubmitPage";
import TeamsPage from "@/pages/TeamsPage";
import JudgesPage from "@/pages/JudgesPage";
import SubmissionsPage from "@/pages/SubmissionsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import TeamProfilePage from "@/pages/TeamProfilePage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import CertificatesPage from "@/pages/CertificatesPage";
import PublicLeaderboard from "@/pages/PublicLeaderboard";
import CertSettingsPage from "@/pages/CertSettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AuthGate() {
  const { isAuthenticated } = useAuth();

  // Public routes — accessible without login
  // Note: /public is handled in the outer Routes below

  if (!isAuthenticated) return <LoginPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* All roles */}
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/events"        element={<EventsPage />} />
        <Route path="/leaderboard"   element={<LeaderboardPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/certificates"  element={<CertificatesPage />} />
        <Route path="/profile"        element={<ProfilePage />} />
        {/* Public leaderboard also accessible inside the app shell */}
        <Route path="/public"        element={<PublicLeaderboard />} />

        {/* Organizer + Judge only */}
        <Route
          path="/evaluate"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'judge']}>
              <EvaluatePage />
            </ProtectedRoute>
          }
        />

        {/* Organizer only */}
        <Route path="/teams"          element={<ProtectedRoute allowedRoles={['organizer']}><TeamsPage /></ProtectedRoute>} />
        <Route path="/judges"         element={<ProtectedRoute allowedRoles={['organizer']}><JudgesPage /></ProtectedRoute>} />
        <Route path="/submissions"    element={<ProtectedRoute allowedRoles={['organizer']}><SubmissionsPage /></ProtectedRoute>} />
        <Route path="/analytics"      element={<ProtectedRoute allowedRoles={['organizer']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings"       element={<SettingsPage />} />
        <Route path="/cert-settings"  element={<ProtectedRoute allowedRoles={['organizer']}><CertSettingsPage /></ProtectedRoute>} />

        {/* Team only */}
        <Route path="/submit"       element={<ProtectedRoute allowedRoles={['team']}><SubmitPage /></ProtectedRoute>} />
        <Route path="/team-profile" element={<ProtectedRoute allowedRoles={['team']}><TeamProfilePage /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <AnnouncementProvider>
                <Routes>
                  {/* Fully public route — no auth shell */}
                  <Route path="/public-leaderboard" element={<PublicLeaderboard />} />
                  <Route path="/*" element={<AuthGate />} />
                </Routes>
                {/* Global announcement popup (renders over everything) */}
                <AnnouncementPopup />
              </AnnouncementProvider>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
