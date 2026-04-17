import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  createdAt: string;
  read: boolean;
  author: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  unreadCount: number;
  addAnnouncement: (a: Omit<Announcement, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  popupAnnouncement: Announcement | null;
  dismissPopup: () => void;
}

const Ctx = createContext<AnnouncementContextType | null>(null);

const SEED: Announcement[] = [
  {
    id: 'a1',
    title: '🏁 Final Round Starts at 5 PM',
    body: 'All teams must be present in the main hall by 4:45 PM for the final presentation round.',
    type: 'urgent',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    author: 'Sarah Chen (Organizer)',
  },
  {
    id: 'a2',
    title: '📢 Results Are Live!',
    body: 'The Green Code Challenge results have been declared. Check the Leaderboard for rankings.',
    type: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    author: 'Sarah Chen (Organizer)',
  },
  {
    id: 'a3',
    title: 'ℹ️ Evaluation Extended',
    body: 'Evaluation deadline for HackTech 2026 has been extended by 2 hours to allow all judges to complete their scoring.',
    type: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    read: true,
    author: 'Sarah Chen (Organizer)',
  },
];

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED);
  const [popupAnnouncement, setPopupAnnouncement] = useState<Announcement | null>(null);

  // Show latest unread as popup on mount
  useEffect(() => {
    const unread = SEED.find(a => !a.read);
    if (unread) setPopupAnnouncement(unread);
  }, []);

  const addAnnouncement = useCallback((a: Omit<Announcement, 'id' | 'createdAt' | 'read'>) => {
    const next: Announcement = {
      ...a,
      id: `a-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setAnnouncements(prev => [next, ...prev]);
    setPopupAnnouncement(next);
  }, []);

  const markRead = useCallback((id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllRead = useCallback(() => {
    setAnnouncements(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const dismissPopup = useCallback(() => {
    if (popupAnnouncement) markRead(popupAnnouncement.id);
    setPopupAnnouncement(null);
  }, [popupAnnouncement, markRead]);

  const unreadCount = announcements.filter(a => !a.read).length;

  return (
    <Ctx.Provider value={{ announcements, unreadCount, addAnnouncement, markAllRead, markRead, popupAnnouncement, dismissPopup }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAnnouncements must be used inside AnnouncementProvider');
  return ctx;
}
