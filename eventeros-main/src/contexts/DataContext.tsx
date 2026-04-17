import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  mockTeams, mockScores, mockNotifications,
  Team, Score, Notification, Submission, TeamMember,
} from '@/data/mockData';
import { apiGetTeam, apiUpdateTeam } from '@/lib/api';

export interface CertSettings {
  title: string;
  subtitle: string;
  orgName: string;
  accentColor: string;  // hex
  bgColor: string;      // hex
  fontStyle: 'classic' | 'modern' | 'bold';
  showWatermark: boolean;
  showLogo: boolean;
  showScore: boolean;
  authorName: string;
  authorTitle: string;
  footerText: string;
}

const defaultCertSettings: CertSettings = {
  title: 'EventFlow Pro',
  subtitle: 'Certificate of Achievement',
  orgName: 'EventFlow Pro',
  accentColor: '#8b5cf6',
  bgColor: '#0a0a0f',
  fontStyle: 'modern',
  showWatermark: true,
  showLogo: true,
  showScore: true,
  authorName: 'Sarah Chen',
  authorTitle: 'Event Organizer',
  footerText: 'eventflow.pro/verify',
};

interface DataContextType {
  teams: Team[];
  scores: Score[];
  notifications: Notification[];
  unreadCount: number;
  certSettings: CertSettings;
  updateSubmission: (teamId: string, submission: Submission) => void;
  addTeamMember:    (teamId: string, member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (teamId: string, memberId: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (teamId: string, memberId: string) => void;
  saveScore: (score: Score) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  updateCertSettings: (settings: Partial<CertSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [teams,         setTeams]        = useState<Team[]>(mockTeams);
  const [scores,        setScores]       = useState<Score[]>(mockScores);
  const [notifications, setNotifications]= useState<Notification[]>(mockNotifications);
  const [certSettings,  setCertSettings] = useState<CertSettings>(defaultCertSettings);

  useEffect(() => {
    mockTeams.forEach(t => {
      apiGetTeam(t.id).then(apiTeam => {
        if (apiTeam) {
          setTeams(prev => prev.map(pt =>
            pt.id === apiTeam.id ? { ...pt, name: apiTeam.name, members: apiTeam.members as Team['members'] } : pt
          ));
        }
      });
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateSubmission = useCallback((teamId: string, submission: Submission) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, submission } : t));
  }, []);

  const addTeamMember = useCallback((teamId: string, member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = { ...member, id: `m_${Date.now()}` };
    setTeams(prev => {
      const updated = prev.map(t =>
        t.id === teamId ? { ...t, members: [...t.members, newMember] } : t
      );
      const team = updated.find(t => t.id === teamId);
      if (team) apiUpdateTeam(teamId, { members: team.members });
      return updated;
    });
  }, []);

  const updateTeamMember = useCallback((teamId: string, memberId: string, updates: Partial<TeamMember>) => {
    setTeams(prev => {
      const updated = prev.map(t =>
        t.id === teamId
          ? { ...t, members: t.members.map(m => m.id === memberId ? { ...m, ...updates } : m) }
          : t
      );
      const team = updated.find(t => t.id === teamId);
      if (team) apiUpdateTeam(teamId, { members: team.members });
      return updated;
    });
  }, []);

  const removeTeamMember = useCallback((teamId: string, memberId: string) => {
    setTeams(prev => {
      const updated = prev.map(t =>
        t.id === teamId
          ? { ...t, members: t.members.filter(m => m.id !== memberId) }
          : t
      );
      const team = updated.find(t => t.id === teamId);
      if (team) apiUpdateTeam(teamId, { members: team.members });
      return updated;
    });
  }, []);

  const saveScore = useCallback((score: Score) => {
    setScores(prev => {
      const idx = prev.findIndex(s => s.teamId === score.teamId && s.judgeId === score.judgeId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = score;
        return updated;
      }
      return [...prev, score];
    });
    setTeams(prev => prev.map(t =>
      t.id === score.teamId ? { ...t, totalScore: score.total } : t
    ));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...n, id: `n_${Date.now()}`, read: false, createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const updateCertSettings = useCallback((settings: Partial<CertSettings>) => {
    setCertSettings(prev => ({ ...prev, ...settings }));
  }, []);

  return (
    <DataContext.Provider value={{
      teams, scores, notifications, unreadCount, certSettings,
      updateSubmission,
      addTeamMember, updateTeamMember, removeTeamMember,
      saveScore,
      markNotificationRead, markAllRead, addNotification,
      updateCertSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
