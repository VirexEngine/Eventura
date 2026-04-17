import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Contexts
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AnnouncementProvider } from "@/contexts/AnnouncementContext";

// Landing Pages
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Organisations from "./pages/Organisations.tsx";
import CreateEventPage from "./pages/CreateEventPage.tsx";
import NotFound from "./pages/NotFound.tsx";

// Dashboard Components
import AppLayout from "@/components/dashboard/AppLayout";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";

// Dashboard Pages
import PortalDashboard from "@/pages/PortalDashboard";
import EventsDashboard from "@/pages/EventsDashboard";
import LeaderboardDashboard from "@/pages/LeaderboardDashboard";
import SubmitDashboard from "@/pages/SubmitDashboard";
import EvaluateDashboard from "@/pages/EvaluateDashboard";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CertificatesPage from "@/pages/CertificatesPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import ProfilePage from "@/pages/ProfilePage";
import TeamProfilePage from "@/pages/TeamProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import PublicLeaderboard from "@/pages/PublicLeaderboard";
import CertSettingsPage from "@/pages/CertSettingsPage";
import TeamsPage from "@/pages/TeamsPage";
import JudgesPage from "@/pages/JudgesPage";
import SubmissionsPage from "@/pages/SubmissionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AnnouncementProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Landing Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/organisations" element={<Organisations />} />

                  {/* Protected Dashboard Routes */}
                  <Route element={
                    <ProtectedRoute allowedRoles={['organizer', 'judge', 'user']}>
                      <AppLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/dashboard" element={<PortalDashboard />} />
                    <Route path="/events" element={<EventsDashboard />} />
                    <Route path="/events/new" element={<CreateEventPage />} />
                    <Route path="/leaderboard" element={<LeaderboardDashboard />} />
                    <Route path="/submit" element={<SubmitDashboard />} />
                    <Route path="/submissions" element={<SubmissionsPage />} />
                    <Route path="/evaluate" element={<EvaluateDashboard />} />
                    
                    {/* Integrated Full Pages */}
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/judges" element={<JudgesPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/certificates" element={<CertificatesPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/team-profile" element={<TeamProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/public" element={<PublicLeaderboard />} />
                    <Route path="/cert-settings" element={<CertSettingsPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AnnouncementProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
